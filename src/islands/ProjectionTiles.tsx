import { useMemo, useState } from 'preact/hooks';
import TileMap from './TileMap';
import type { TileBloc } from './TileMap';
import RidingsMap from './RidingsMap';
import type { RidingFull, MapParty } from './RidingsMap';
import { partyName } from '../lib/party-names';
import MapSeatBar from './MapSeatBar';

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
}

const COPY = {
  fr: { tiles: 'Carte proportionnelle', map: 'Carte géographique', flip: 'gain sur', search: 'Chercher sur la carte', changes: (y: number) => `Change de camp depuis ${y}`, asOf: 'Projection du' },
  en: { tiles: 'Proportional map', map: 'Geographic map', flip: 'gain from', search: 'Search the map', changes: (y: number) => `Changes hands since ${y}`, asOf: 'Forecast of' },
  es: { tiles: 'Mapa proporcional', map: 'Mapa geográfico', flip: 'gana a', search: 'Buscar en el mapa', changes: (y: number) => `Cambia de manos desde ${y}`, asOf: 'Proyección del' },
} as const;

export default function ProjectionTiles({
  blocs, canvas, ridings, parties, locale, geoUrl, center, zoom, idProp, baselineYear,
  winnerThreshold = 0.5, majority, asOf,
}: Props) {
  const [vue, setVue] = useState<'tiles' | 'geo'>(blocs.length ? 'tiles' : 'geo');
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
      {blocs.length > 0 && (
        <div class="ptiles-bar">
          <div class="msim-mapview" role="group">
            <button type="button" aria-pressed={vue === 'tiles'} onClick={() => setVue('tiles')}>{t.tiles}</button>
            <button type="button" aria-pressed={vue === 'geo'} onClick={() => setVue('geo')}>{t.map}</button>
          </div>
          {vue === 'tiles' && (
            <input
              class="ptiles-search" type="search" value={q} aria-label={t.search}
              placeholder={t.search} onInput={(e) => setQ((e.target as HTMLInputElement).value)}
            />
          )}
        </div>
      )}

      {vue === 'tiles' && blocs.length > 0 && majority && (
        <MapSeatBar ridings={tuiles} colors={colors} labels={labels} majority={majority} locale={locale} flipLabel={t.changes(baselineYear)} />
      )}

      {vue === 'tiles' && blocs.length > 0 ? (
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
      <p class="ptiles-sign">
        <svg width="16" height="16" viewBox="0 0 44 44" aria-hidden="true"><path d="M22 2 A20 20 0 0 0 22 42 Z" fill="#1f77d0" /><path d="M22 2 A20 20 0 0 1 22 42 Z" fill="#c62828" /><path d="M13 13 L31 31 M31 13 L13 31" stroke="#fff" stroke-width="4.5" stroke-linecap="round" /></svg>
        <span>Vote-Scope</span>
        {asOf && <span class="ptiles-date">{t.asOf} {new Date(`${asOf}T12:00:00Z`).toLocaleDateString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>}
      </p>
    </div>
  );
}
