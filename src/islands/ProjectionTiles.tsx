import { useMemo, useState } from 'preact/hooks';
import TileMap from './TileMap';
import type { TileBloc } from './TileMap';
import RidingsMap from './RidingsMap';
import type { RidingFull, MapParty } from './RidingsMap';
import { partyName } from '../lib/party-names';
import MapSeatBar from './MapSeatBar';
import GeoMap from './GeoMap';
import ShareModule from './lib/ShareModule';

/** Les deux cartes d'une page de projection, et la bascule entre elles.
 *
 *  Par défaut les tuiles : c'est la seule vue où toutes les circonscriptions
 *  sont visibles à la fois, à taille égale, sans zoom. La géographique reste
 *  d'un clic, avec sa géométrie complète — le lecteur choisit, comme entre
 *  « Proportional map » et « District map » au NYT.
 */
interface Props {
  blocs: TileBloc[];
  canvas?: { w: number; h: number };
  ridings: RidingFull[];
  parties: MapParty[];
  locale: 'fr' | 'en' | 'es';
  geoUrl: string;
  center: [number, number];
  zoom: number;
  idProp?: string;
  baselineYear: number;
  winnerThreshold?: number;
  /** Sièges pour la majorité : la barre au-dessus de la carte la marque. */
  majority?: number;
  /** Date du calcul, écrite dans le cadre (la carte se partage avec elle). */
  asOf?: string;
  /** Vraie carte + médaillons (geomap.json) : vue principale quand elle existe. */
  geomapUrl?: string;
  /** Sièges de la chambre. La barre n'apparaît que si la carte couvre toute la
   *  chambre (pas au Sénat, où 35 courses ne font pas 100 sièges). */
  seatsTotal?: number;
  /** Ce qu'on touche sur la carte : un État, un district, une circonscription. */
  unit?: 'state' | 'district' | 'riding';
  /** Clé de partage (SHARE_ELECTIONS) : bouton « Partager cette carte » dans le cadre. */
  shareKey?: string;
}

const COPY = {
  fr: { carte: 'Carte', tiles: 'Carte proportionnelle', map: 'Carte géographique', flip: 'gain sur', search: 'Chercher sur la carte', changes: (y: number) => `Change de camp depuis ${y}`, asOf: 'Projection du', noRace: 'Pas d’élection' },
  en: { carte: 'Map', tiles: 'Proportional map', map: 'Geographic map', flip: 'gain from', search: 'Search the map', changes: (y: number) => `Changes hands since ${y}`, asOf: 'Forecast of', noRace: 'No race' },
  es: { carte: 'Mapa', tiles: 'Mapa proporcional', map: 'Mapa geográfico', flip: 'gana a', search: 'Buscar en el mapa', changes: (y: number) => `Cambia de manos desde ${y}`, asOf: 'Proyección del', noRace: 'Sin elección' },
} as const;

export default function ProjectionTiles({
  blocs, canvas, ridings, parties, locale, geoUrl, center, zoom, idProp, baselineYear,
  winnerThreshold = 0.5, majority, asOf, geomapUrl, seatsTotal, unit = 'riding', shareKey,
}: Props) {
  // Vue principale : la vraie carte avec ses médaillons quand le moteur l'a
  // produite (on la reconnaît d'un coup d'œil) ; sinon les tuiles ; sinon la
  // carte zoomable.
  const [vue, setVue] = useState<'carte' | 'tiles' | 'geo'>(geomapUrl ? 'carte' : blocs.length ? 'tiles' : 'geo');
  const [q, setQ] = useState('');
  const t = COPY[locale] ?? COPY.fr;

  const tuiles = useMemo(() => ridings.map((r) => {
    const indecis = r.projection.winner === 'tossup' || r.projection.p_winner < winnerThreshold;
    const gagnant = indecis ? null : r.projection.winner;
    const socle = r.baseline?.winner ?? null;
    return {
      id: String(r.riding_id),
      name: locale === 'en' ? (r.name_en || r.name_fr) : (r.name_fr || r.name_en),
      winner: gagnant,
      from: socle,
      // En projection, « bascule » veut dire : change de camp par rapport au
      // dernier scrutin. C'est l'information que le lecteur cherche.
      changed: !!(gagnant && socle && gagnant !== socle),
      margin: r.projection.mean_margin ?? 0,
      p: r.projection.p_winner,
      href: r.href,
    };
  }), [ridings, locale, winnerThreshold]);

  const colors = useMemo(() => Object.fromEntries(parties.map((p) => [p.key, p.color])), [parties]);
  const labels = useMemo(
    () => Object.fromEntries(parties.map((p) => [p.key, partyName(p, locale)])),
    [parties, locale],
  );

  return (
    <div class="ptiles">
      {(blocs.length > 0 || geomapUrl) && (
        <div class="ptiles-bar">
          {[geomapUrl, blocs.length > 0, !geomapUrl].filter(Boolean).length > 1 && <div class="msim-mapview" role="group">
            {geomapUrl && <button type="button" aria-pressed={vue === 'carte'} onClick={() => setVue('carte')}>{t.carte}</button>}
            {blocs.length > 0 && <button type="button" aria-pressed={vue === 'tiles'} onClick={() => setVue('tiles')}>{t.tiles}</button>}
            {!geomapUrl && <button type="button" aria-pressed={vue === 'geo'} onClick={() => setVue('geo')}>{t.map}</button>}
          </div>}
          {vue !== 'geo' && (
            <input
              class="ptiles-search" type="search" value={q} aria-label={t.search}
              placeholder={t.search} onInput={(e) => setQ((e.target as HTMLInputElement).value)}
            />
          )}
        </div>
      )}

      {vue !== 'geo' && majority && (
        <MapSeatBar
          ridings={tuiles} colors={colors} labels={labels} majority={majority} locale={locale}
          flipLabel={t.changes(baselineYear)}
          barre={!seatsTotal || tuiles.length === seatsTotal}
          emptyLabel={unit === 'state' ? t.noRace : undefined}
        />
      )}

      {vue === 'carte' && geomapUrl ? (
        <GeoMap url={geomapUrl} ridings={tuiles} colors={colors} labels={labels} locale={locale} query={q} flipWord={`${t.flip} ${baselineYear}`} unit={unit} />
      ) : vue === 'tiles' && blocs.length > 0 ? (
        <TileMap
          blocs={blocs} canvas={canvas} ridings={tuiles} locale={locale}
          colors={colors} labels={labels} query={q} flipWord={`${t.flip} ${baselineYear}`}
        />
      ) : (
        <RidingsMap
          geoUrl={geoUrl} ridings={ridings} parties={parties}
          locale={locale}
          center={center} zoom={zoom} idProp={idProp} baselineYear={baselineYear}
        />
      )}

      {/* Signature dans le cadre : la carte se partage avec sa source et sa date. */}
      <div class="ptiles-foot">
      {shareKey && asOf && <ShareModule lang={locale} kind="map" election={shareKey} runDate={asOf} />}
      <p class="ptiles-sign">
        <svg width="16" height="16" viewBox="0 0 44 44" aria-hidden="true"><path d="M22 2 A20 20 0 0 0 22 42 Z" fill="#1f77d0" /><path d="M22 2 A20 20 0 0 1 22 42 Z" fill="#c62828" /><path d="M13 13 L31 31 M31 13 L13 31" stroke="#fff" stroke-width="4.5" stroke-linecap="round" /></svg>
        <span>Vote-Scope</span>
        {asOf && <span class="ptiles-date">{t.asOf} {new Date(`${asOf}T12:00:00Z`).toLocaleDateString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>}
      </p>
      </div>
    </div>
  );
}
