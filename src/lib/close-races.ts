/**
 * Courses les plus serrées d'une juridiction — source unique du bloc
 * `CloseRaces.astro`, côté desk comme côté page de circonscription.
 *
 * Pourquoi un seul endroit : les sept juridictions ne publient pas le même
 * schéma. Le R.-U. porte `winner`/`p_leading`/`mean_margin` à la racine de la
 * circonscription ; le Québec, l'Ontario, le fédéral et les trois desks
 * américains les imbriquent sous `projection`. Toute lecture directe de
 * `latest.json` doit absorber les deux — le faire une fois ici évite de le
 * refaire dans chaque adaptateur.
 *
 * Le classement est la MARGE CROISSANTE. C'est le seul champ renseigné à
 * 100 % des rangées sur les sept juridictions ; `p_close_race` est nul ou
 * absent sur une bonne moitié d'entre elles et produirait des palmarès
 * incomparables d'un desk à l'autre.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getNavEntry,
  sectionLabel,
  sectionUrl,
  type NavLang,
} from './jurisdiction-nav';
import { partyMeta } from './riding-adapters/parties';
import { ridingSlug } from './riding-adapters/types';

export interface CloseRace {
  href?: string;
  name: string;
  partyLabel: string;
  partyColor: string;
  pWinner: number;
  margin: number;
}

interface NormalizedRow {
  id: string;
  name_en: string;
  name_fr: string;
  winner: string;
  pWinner: number;
  margin: number;
}

/**
 * Un `latest.json` par juridiction, lu une seule fois par build. Sans ce cache,
 * les ~2 500 pages de circonscription reliraient et reparseraient le même
 * fichier de 650 rangées à chaque rendu.
 */
const CACHE = new Map<string, NormalizedRow[]>();

function loadRows(webKey: string): NormalizedRow[] {
  const cached = CACHE.get(webKey);
  if (cached) return cached;

  let rows: NormalizedRow[] = [];
  try {
    const raw = JSON.parse(
      readFileSync(
        resolve(process.cwd(), 'web_data', webKey, 'latest.json'),
        'utf-8',
      ),
    );
    rows = (raw?.ridings ?? [])
      .map((r: any): NormalizedRow => {
        const p = r.projection ?? {};
        return {
          id: String(r.riding_id),
          name_en: r.name_en ?? r.name_fr ?? '',
          name_fr: r.name_fr ?? r.name_en ?? '',
          winner: p.winner ?? r.winner ?? '',
          pWinner: Number(p.p_winner ?? r.p_leading ?? 0),
          margin: Number(p.mean_margin ?? r.mean_margin ?? 0),
        };
      })
      // Une marge nulle signale une rangée sans projection (siège vacant,
      // course non contestée), pas une course serrée : elle passerait en tête.
      .filter((r: NormalizedRow) => r.margin > 0 && r.pWinner > 0)
      // Les fourre-tout `*_oth` sortent de la liste — pas des données, de la
      // LISTE. Le bloc promet « ouvrez-en une pour voir les chiffres » ; une
      // rangée « Autre, 51 % » ne tient pas cette promesse, et sa couleur de
      // repli grise fait lire la ligne comme un défaut d'affichage. Quinze
      // rangées sur les sept juridictions sont concernées, dont quatorze au
      // R.-U. où le seau porte aussi l'Irlande du Nord : ses sièges serrés
      // n'apparaîtront donc jamais ici. La table complète, elle, les garde.
      .filter((r: NormalizedRow) => !r.winner.endsWith('_oth'))
      .sort(
        (a: NormalizedRow, b: NormalizedRow) =>
          a.margin - b.margin || a.pWinner - b.pWinner,
      );
  } catch {
    // Une juridiction sans `ridings` (présidentielle française, scénarios
    // seulement) n'a pas de course à classer : le bloc ne s'affiche pas.
    rows = [];
  }
  CACHE.set(webKey, rows);
  return rows;
}

export interface CloseRacesResult {
  races: CloseRace[];
  /** Réservoir du tirage au sort, plus large que les rangées affichées. */
  dicePool: string[];
  allHref?: string;
  allLabel?: string;
}

export function closeRacesFor(options: {
  /** Clé `web_data/` de la juridiction (= `webKey` du registre de nav). */
  webKey: string;
  /** Palette de partis — la clé d'adaptateur (`federal-ca`, `quebec`, `uk`…). */
  palette: string;
  lang: NavLang;
  /** Circonscription courante, à retirer de sa propre liste. */
  excludeId?: string;
  limit?: number;
}): CloseRacesResult {
  const { webKey, palette, lang, excludeId, limit = 3 } = options;
  const rows = loadRows(webKey).filter((r) => r.id !== excludeId);
  if (rows.length === 0) return { races: [], dicePool: [] };

  const entry = getNavEntry(webKey);
  const indexUrl = entry?.sections.districts
    ? sectionUrl(entry, 'districts', lang)
    : null;
  // Le Québec nomme ses circonscriptions en français dans les deux langues du
  // site ; partout ailleurs le slug part du nom anglais (cf. ProjectionEngine).
  const slugName = (r: NormalizedRow) =>
    webKey === 'quebec' ? r.name_fr || r.name_en : r.name_en || r.name_fr;
  const hrefFor = (r: NormalizedRow) =>
    indexUrl ? `${indexUrl}${ridingSlug(r.id, slugName(r))}/` : undefined;

  const races = rows.slice(0, limit).map((r): CloseRace => {
    const meta = partyMeta(palette, r.winner);
    return {
      href: hrefFor(r),
      name: lang === 'fr' ? r.name_fr : r.name_en,
      partyLabel: lang === 'fr' ? meta.label_fr : meta.label_en,
      partyColor: meta.color,
      pWinner: r.pWinner,
      margin: r.margin,
    };
  });

  // Le dé tire dans les courses réellement disputées. Le plancher de 12 garde
  // un tirage vivant là où peu de courses passent sous cinq points (huit au
  // Sénat américain, sept chez les gouverneurs).
  const dicePool = rows
    .filter((r, i) => r.margin < 5 || i < 12)
    .slice(0, 40)
    .map(hrefFor)
    .filter((h): h is string => Boolean(h));

  return {
    races,
    dicePool,
    allHref: indexUrl ?? undefined,
    allLabel: entry ? sectionLabel(entry, 'districts', lang) : undefined,
  };
}
