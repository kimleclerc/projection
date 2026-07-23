// Types + helpers du desk MLB 2026 (web_data/sports/mlb2026_latest.json).
// Le JSON n'a que label_fr/label_en : l'espagnol reprend label_en (convention
// MLB hispanophone — « Los Angeles Dodgers », pas de traduction des noms).

export type MlbLocale = 'en' | 'fr' | 'es';
export type MlbLeague = 'AL' | 'NL';
/** Divisions telles que nommées dans le JSON (clés françaises). */
export type MlbDivision = 'Est' | 'Centrale' | 'Ouest';

export interface MlbTeam {
  code: string;
  label_fr: string;
  label_en: string;
  league: MlbLeague;
  division: MlbDivision;
  color: string;
  emoji: string;
  wins: number;
  losses: number;
  streak: string;
  exp_wins: number;
  p_series: number;
  p_division: number;
  p_bye: number;
  p_pennant: number;
  p_ws: number;
}

export interface MlbBoardMeta {
  sims: number;
  model: string;
  remaining_games: number;
  data_fetched_at: string;
  source: string;
}

export interface MlbData {
  generated_at: string;
  season: string;
  sport: string;
  board_meta: MlbBoardMeta;
  hero: {
    favorite: { code: string; p_ws: number };
    canadian_focus: { code: string; p_series: number; p_division: number; p_ws: number };
  };
  board: MlbTeam[];
  standings: Record<MlbLeague, Record<MlbDivision, string[]>>;
}

/** Nom d'équipe localisé — es reprend label_en (usage MLB hispanophone). */
export const teamLabel = (t: Pick<MlbTeam, 'label_fr' | 'label_en'>, locale: MlbLocale): string =>
  locale === 'fr' ? t.label_fr : t.label_en;

/** Divisions localisées (le JSON est en français). */
export const DIVISION_LABELS: Record<MlbDivision, Record<MlbLocale, string>> = {
  Est: { fr: 'Est', en: 'East', es: 'Este' },
  Centrale: { fr: 'Centrale', en: 'Central', es: 'Central' },
  Ouest: { fr: 'Ouest', en: 'West', es: 'Oeste' },
};

export const LEAGUE_LABELS: Record<MlbLeague, Record<MlbLocale, string>> = {
  AL: { fr: 'Ligue américaine', en: 'American League', es: 'Liga Americana' },
  NL: { fr: 'Ligue nationale', en: 'National League', es: 'Liga Nacional' },
};

export const DIVISION_ORDER: MlbDivision[] = ['Est', 'Centrale', 'Ouest'];

/** Probabilité 0-1 → « 22.7% » / « 22,7 % » (une décimale, séparateur locale). */
export const fmtProb = (p: number, locale: MlbLocale): string => {
  const s = (p * 100).toFixed(1);
  return locale === 'en' ? `${s}%` : `${s.replace('.', ',')} %`;
};

/** Nombre décimal localisé (victoires attendues, etc.). */
export const fmtNum1 = (v: number, locale: MlbLocale): string =>
  locale === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',');

/** Séquence « W3 » / « L2 » localisée (V/D en fr, G/P en es). */
export const fmtStreak = (streak: string, locale: MlbLocale): string => {
  const n = streak.slice(1);
  const win = streak.startsWith('W');
  if (locale === 'fr') return `${win ? 'V' : 'D'}${n}`;
  if (locale === 'es') return `${win ? 'G' : 'P'}${n}`;
  return streak;
};

/** Horodatage du run pour la ligne méta (date + heure UTC, locale). */
export function fmtRunTimestamp(iso: string, locale: MlbLocale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const loc = { en: 'en-US', fr: 'fr-CA', es: 'es-ES' }[locale];
  const date = d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const time = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
  return `${date} · ${time} UTC`;
}
