// Couche partagée du module tournoi mondial 2026.
// Dérive pays / groupes / calendrier depuis web_data/sports/worldcup2026_latest.json.
// Langage générique (pays, « tournoi »), aucune marque officielle — voir disclaimer
// sur chaque page hôte.
import wcData from '../../web_data/sports/worldcup2026_latest.json';

export type Lang = 'en' | 'fr' | 'es';

export interface BoardTeam {
  team: string;
  labels: Record<string, string>;
  group: string;
  confederation: string;
  is_host: boolean;
  p_champion: number;
  p_final: number;
  p_semifinal: number;
  p_quarterfinal: number;
  p_round16: number;
  p_knockout_stage: number;
  strength_mean: number;
  trend_direction?: string;
  blend_alpha?: number;
  market_books?: number;
}

export interface GroupStanding {
  team: string;
  labels: Record<string, string>;
  p_advance: number | null;
  p_1st: number | null;
  p_2nd?: number | null;
  p_champion?: number | null;
  is_host?: boolean;
  is_tbd?: boolean;
}

export interface Match {
  stage: string;
  group?: string;
  date?: string;
  time_et?: string;
  home_team?: string;
  away_team?: string;
  home_label?: Record<string, string>;
  away_label?: Record<string, string>;
}

export const board = wcData.board as BoardTeam[];
export const groups = wcData.groups as Record<string, { teams: string[]; standings: GroupStanding[] }>;
export const schedule = wcData.match_schedule as Match[];
export const boardMeta = wcData.board_meta as Record<string, any>;
export const generatedAt = wcData.generated_at as string;

export const groupKeys = Object.keys(groups).sort();

// Slug pays = code FIFA 3 lettres (neutre, stable, identique dans les 3 langues).
export const teamSlugs = board.map((t) => t.team);

export function getTeam(slug: string): BoardTeam | undefined {
  return board.find((t) => t.team === slug);
}

export function label(obj: Record<string, string> | undefined, lang: Lang, fallbackCode?: string): string {
  return obj?.[lang] ?? obj?.en ?? (fallbackCode ? fallbackCode.toUpperCase() : '?');
}

export function teamLabel(slug: string, lang: Lang): string {
  const t = getTeam(slug);
  return label(t?.labels, lang, slug);
}

// Matchs de phase de groupes impliquant une équipe donnée.
export function teamFixtures(slug: string): Match[] {
  return schedule.filter(
    (m) => m.stage === 'group_stage' && (m.home_team === slug || m.away_team === slug),
  );
}

// Matchs de phase de groupes d'un groupe donné.
export function groupFixtures(groupKey: string): Match[] {
  return schedule.filter((m) => m.stage === 'group_stage' && m.group === groupKey);
}

// Étapes du « chemin » d'une équipe (du plus probable au titre).
export function pathSteps(t: BoardTeam, lang: Lang): Array<{ label: string; pct: number }> {
  const L: Record<Lang, string[]> = {
    en: ['Advance', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final', 'Champion'],
    fr: ['Passage', '8es', 'Quart', 'Demi', 'Finale', 'Champion'],
    es: ['Avance', 'Octavos', 'Cuartos', 'Semis', 'Final', 'Campeón'],
  };
  const names = L[lang];
  return [
    { label: names[0], pct: t.p_knockout_stage },
    { label: names[1], pct: t.p_round16 },
    { label: names[2], pct: t.p_quarterfinal },
    { label: names[3], pct: t.p_semifinal },
    { label: names[4], pct: t.p_final },
    { label: names[5], pct: t.p_champion },
  ];
}

// Confédération → pays (triés par p_champion).
export function teamsByConfederation(): Record<string, BoardTeam[]> {
  const out: Record<string, BoardTeam[]> = {};
  for (const t of [...board].sort((a, b) => b.p_champion - a.p_champion)) {
    (out[t.confederation] ??= []).push(t);
  }
  return out;
}

export const CONF_ORDER = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];

// Segment de chemin localisé pour les routes (cohérent avec les répertoires de pages).
export const PATH_SEG: Record<Lang, { groups: string; teams: string }> = {
  en: { groups: 'groups', teams: 'teams' },
  fr: { groups: 'groupes', teams: 'equipes' },
  es: { groups: 'grupos', teams: 'equipos' },
};

export function wcBase(lang: Lang): string {
  return `/${lang}/sports/wc2026`;
}

// Alternates hreflang pour une sous-page (toutes langues partagent le même tail).
export function wcAlternates(tail: string): Record<Lang, string> {
  const base = 'https://vote-scope.com';
  return {
    en: `${base}/en/sports/wc2026${tail}/`,
    fr: `${base}/fr/sports/wc2026${tail}/`,
    es: `${base}/es/sports/wc2026${tail}/`,
  };
}

// Alternates pour les pages de groupe (segment parent localisé : groups/groupes/grupos).
export function wcGroupAlternates(groupKey: string): Record<Lang, string> {
  const base = 'https://vote-scope.com';
  const g = groupKey.toLowerCase();
  return {
    en: `${base}/en/sports/wc2026/${PATH_SEG.en.groups}/${g}/`,
    fr: `${base}/fr/sports/wc2026/${PATH_SEG.fr.groups}/${g}/`,
    es: `${base}/es/sports/wc2026/${PATH_SEG.es.groups}/${g}/`,
  };
}

// Alternates pour l'index des équipes (segment localisé : teams/equipes/equipos).
export function wcTeamsAlternates(): Record<Lang, string> {
  const base = 'https://vote-scope.com';
  return {
    en: `${base}/en/sports/wc2026/${PATH_SEG.en.teams}/`,
    fr: `${base}/fr/sports/wc2026/${PATH_SEG.fr.teams}/`,
    es: `${base}/es/sports/wc2026/${PATH_SEG.es.teams}/`,
  };
}
