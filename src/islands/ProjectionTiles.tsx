import { useMemo, useState } from 'preact/hooks';
import TileMap from './TileMap';
import type { TileBloc } from './TileMap';
import RidingsMap from './RidingsMap';
import type { RidingFull, MapParty } from './RidingsMap';

/** Les deux cartes d'une page de projection, et la bascule entre elles.
 *
 *  Par défaut les tuiles : c'est la seule vue où toutes les circonscriptions
 *  sont visibles à la fois, à taille égale, sans zoom. La géographique reste
 *  d'un clic, avec sa géométrie complète — le lecteur choisit, comme entre
 *  « Proportional map » et « District map » au NYT.
 */
interface Props {
  blocs: TileBloc[];
  ridings: RidingFull[];
  parties: MapParty[];
  locale: 'fr' | 'en' | 'es';
  geoUrl: string;
  center: [number, number];
  zoom: number;
  idProp?: string;
  baselineYear: number;
  winnerThreshold?: number;
}

const COPY = {
  fr: { tiles: 'Tuiles', map: 'Carte', flip: 'gain sur', search: 'Chercher une circonscription' },
  en: { tiles: 'Tiles', map: 'Map', flip: 'gain from', search: 'Search a riding' },
  es: { tiles: 'Mosaico', map: 'Mapa', flip: 'gana a', search: 'Buscar un distrito' },
} as const;

export default function ProjectionTiles({
  blocs, ridings, parties, locale, geoUrl, center, zoom, idProp, baselineYear,
  winnerThreshold = 0.5,
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
      href: r.href,
    };
  }), [ridings, locale, winnerThreshold]);

  const colors = useMemo(() => Object.fromEntries(parties.map((p) => [p.key, p.color])), [parties]);
  const labels = useMemo(
    () => Object.fromEntries(parties.map((p) => [p.key, locale === 'fr' ? p.label_fr : p.label_en])),
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

      {vue === 'tiles' && blocs.length > 0 ? (
        <TileMap
          blocs={blocs} ridings={tuiles} locale={locale}
          colors={colors} labels={labels} query={q} flipWord={`${t.flip} ${baselineYear}`}
        />
      ) : (
        <RidingsMap
          geoUrl={geoUrl} ridings={ridings} parties={parties}
          locale={locale === 'fr' ? 'fr' : 'en'}
          center={center} zoom={zoom} idProp={idProp} baselineYear={baselineYear}
        />
      )}
    </div>
  );
}
