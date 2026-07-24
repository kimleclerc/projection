// Helpers pour le desk présidentiel US 2028 (us_pres_2028).
// Le produit actuel (mi-2026) est la « primaire invisible » : agrégat pondéré
// qualité des sondages nationaux de primaire par parti (DEM / REP), premiers
// États, scénarios de champ. Plus une carte du collège électoral (référence
// 2024) — la projection d'affrontement 2028 viendra quand les sondages
// s'accumuleront (Phase C). Couleurs de parti en variables CSS thème-aware
// (--dem / --rep), définies dans UsPresidentDesk.astro.

export type Locale = 'fr' | 'en' | 'es';
export type Party = 'us_dem' | 'us_rep';

export const PARTY_LABEL: Record<Party, Record<Locale, string>> = {
  us_dem: { fr: 'Démocrates', en: 'Democrats', es: 'Demócratas' },
  us_rep: { fr: 'Républicains', en: 'Republicans', es: 'Republicanos' },
};

/** Variable CSS thème-aware pour un parti. */
export function partyVar(party: string): string {
  return party === 'us_dem' ? 'var(--dem)' : 'var(--rep)';
}
/** Hexa de repli (rendus hors-DOM). À garder en phase avec le <style> du desk. */
export function partyHex(party: string): string {
  return party === 'us_dem' ? '#1f77d0' : '#c62828';
}

// Couloirs intra-parti (lanes) — étiquettes trilingues.
export const LANE_LABEL: Record<string, Record<Locale, string>> = {
  establishment: { fr: 'Establishment', en: 'Establishment', es: 'Establishment' },
  moderate: { fr: 'Modéré·e', en: 'Moderate', es: 'Moderado·a' },
  progressive: { fr: 'Progressiste', en: 'Progressive', es: 'Progresista' },
  maga: { fr: 'MAGA', en: 'MAGA', es: 'MAGA' },
  unaligned: { fr: 'Non aligné·e', en: 'Unaligned', es: 'No alineado·a' },
};
export function laneLabel(lane: string, locale: Locale): string {
  return LANE_LABEL[lane]?.[locale] ?? lane;
}

// Statuts de candidature — trilingues.
export const STATUS_LABEL: Record<string, Record<Locale, string>> = {
  declared: { fr: 'Candidature déclarée', en: 'Declared', es: 'Candidatura declarada' },
  probable: { fr: 'Probable', en: 'Probable', es: 'Probable' },
  testing: { fr: 'Testé·e', en: 'Tested', es: 'En sondeos' },
  withdrawn: { fr: 'Retiré·e', en: 'Withdrawn', es: 'Retirado·a' },
  ineligible: { fr: 'Inéligible', en: 'Ineligible', es: 'Inelegible' },
};
export function statusLabel(status: string, locale: Locale): string {
  return STATUS_LABEL[status]?.[locale] ?? status;
}

export const fmtPct1 = (v: number, locale: Locale) =>
  `${v.toFixed(1).replace('.', locale === 'en' ? '.' : ',')}%`;

// ── Types du web_data (us-president/latest.json) ─────────────────────────────

export interface Standing {
  rank: number;
  candidate_id: string;
  name: string;
  short_label: string;
  lane: string;
  status: string;
  is_incumbent_family: boolean;
  share: number;
  poll_count: number;
  trend: number | null;
  floor: number;
  ceiling: number;
  notes: { fr: string; en: string; es: string };
}
export interface PartyBlock {
  party: Party;
  label_en: string;
  label_fr: string;
  label_es: string;
  color: string;
  n_candidates: number;
  n_polls: number;
  undecided_other: number | null;
  standings: Standing[];
}
export interface ScenarioField {
  candidate_id: string;
  short_label: string;
  name: string;
  lane: string;
  raw_share: number;
  renorm_share: number;
}
export interface ScenarioBlock {
  scenario_id: string;
  party: Party;
  featured: boolean;
  display_order: number;
  label: { en: string; fr: string; es: string };
  description: string;
  leader: string | null;
  field: ScenarioField[];
}
export interface EcUnit {
  unit_id: string;
  state: string;
  name_en: string;
  name_fr: string;
  kind: string;
  ec_votes: number;
  allocation: string;
  baseline_2024_winner: string | null;
}
export interface EcFrame {
  status: string;
  total: number;
  majority: number;
  n_units: number;
  units: EcUnit[];
  baseline_2024: {
    year: number;
    kind: string;
    totals: Record<string, number>;
    winner: string;
    note_fr: string;
    note_en: string;
    note_es: string;
  } | null;
  projection: unknown | null;
}
export interface UsPresPayload {
  meta: any;
  primary: {
    dem: PartyBlock;
    rep: PartyBlock;
    early_states: Record<string, Record<string, { n_polls: number; top: any[] }>>;
    scenarios: ScenarioBlock[];
  };
  electoral_college: EcFrame;
}

export function partyBlockLabel(block: PartyBlock, locale: Locale): string {
  return locale === 'fr' ? block.label_fr : locale === 'es' ? block.label_es : block.label_en;
}

// ── Carte en tuiles du collège électoral (cartogramme) ───────────────────────
// Grille [ligne, colonne] (0-indexée) — chaque État = une tuile, disposition
// géographique approximative façon 538/NPR. 50 États + DC = 51 tuiles, cellules
// uniques (vérifié par les gardiens front dans l'island).
export const US_TILE_GRID: Record<string, [number, number]> = {
  AK: [0, 0], ME: [0, 11],
  VT: [1, 10], NH: [1, 11],
  WA: [2, 0], ID: [2, 1], MT: [2, 2], ND: [2, 3], MN: [2, 4], IL: [2, 5],
  WI: [2, 6], MI: [2, 7], NY: [2, 9], RI: [2, 10], MA: [2, 11],
  OR: [3, 0], NV: [3, 1], WY: [3, 2], SD: [3, 3], IA: [3, 4], IN: [3, 5],
  OH: [3, 6], PA: [3, 7], NJ: [3, 8], CT: [3, 9],
  CA: [4, 0], UT: [4, 1], CO: [4, 2], NE: [4, 3], MO: [4, 4], KY: [4, 5],
  WV: [4, 6], VA: [4, 7], MD: [4, 8], DE: [4, 9],
  AZ: [5, 1], NM: [5, 2], KS: [5, 3], AR: [5, 4], TN: [5, 5], NC: [5, 6],
  SC: [5, 7], DC: [5, 8],
  OK: [6, 3], LA: [6, 4], MS: [6, 5], AL: [6, 6], GA: [6, 7],
  HI: [7, 0], TX: [7, 3], FL: [7, 8],
};
export const TILE_ROWS = 8;
export const TILE_COLS = 12;

// ── Chemins d'URL par langue (slugs traduits comme le reste du site) ─────────
export const usPresBase = (locale: Locale): string =>
  locale === 'fr' ? '/fr/us/presidentielle'
    : locale === 'es' ? '/es/us/presidencial'
    : '/en/us/president';

export const methodHref = (locale: Locale): string =>
  locale === 'en' ? '/en/methodology/' : `/${locale}/${locale === 'es' ? 'metodologia' : 'methodologie'}/`;
