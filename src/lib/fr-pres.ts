// Helpers pour le desk présidentiel France (fr_pres_2027).
// Le modèle France est PAR SCÉNARIOS (castings hypothétiques → projection
// 1er tour mean±sd par candidat + duels 2d tour), pas une projection par
// sièges. Les couleurs de blocs suivent la convention politique française et
// sont définies en variables CSS (--bloc-*) dans la page pour rester
// thème-aware (clair/sombre). Palette validée dataviz (six-checks, 2 modes).

export type Locale = 'fr' | 'en' | 'es';

export type Bloc =
  | 'far_left'
  | 'left'
  | 'left_radical'
  | 'left_populist'
  | 'left_social_dem'
  | 'greens'
  | 'centre'
  | 'centre_right'
  | 'right'
  | 'sovereignist'
  | 'far_right'
  | 'other';

// Ordre gauche → droite (axe politique), utilisé pour trier légende et registre.
export const BLOC_ORDER: Bloc[] = [
  'far_left',
  'left',
  'left_radical',
  'left_populist',
  'left_social_dem',
  'greens',
  'centre',
  'centre_right',
  'right',
  'sovereignist',
  'far_right',
  'other',
];

export const BLOC_LABELS: Record<Bloc, { fr: string; en: string; es: string }> = {
  far_left: { fr: 'Extrême gauche', en: 'Far left', es: 'Extrema izquierda' },
  left: { fr: 'Gauche (PCF)', en: 'Left (PCF)', es: 'Izquierda (PCF)' },
  left_radical: { fr: 'Gauche radicale (LFI)', en: 'Radical left (LFI)', es: 'Izquierda radical (LFI)' },
  left_populist: { fr: 'Gauche populaire', en: 'Populist left', es: 'Izquierda popular' },
  left_social_dem: { fr: 'Sociaux-démocrates (PS)', en: 'Social democrats (PS)', es: 'Socialdemócratas (PS)' },
  greens: { fr: 'Écologistes', en: 'Greens', es: 'Ecologistas' },
  centre: { fr: 'Centre', en: 'Centre', es: 'Centro' },
  centre_right: { fr: 'Centre droit (Horizons)', en: 'Centre-right (Horizons)', es: 'Centroderecha (Horizons)' },
  right: { fr: 'Droite (LR)', en: 'Right (LR)', es: 'Derecha (LR)' },
  sovereignist: { fr: 'Souverainistes', en: 'Sovereignist', es: 'Soberanistas' },
  far_right: { fr: 'Extrême droite (RN)', en: 'Far right (RN)', es: 'Extrema derecha (RN)' },
  other: { fr: 'Autres', en: 'Other', es: 'Otros' },
};

/** Variable CSS thème-aware pour un bloc (définie dans la page). */
export function blocVar(bloc: string): string {
  const b = (BLOC_ORDER as string[]).includes(bloc) ? bloc : 'other';
  return `var(--bloc-${b})`;
}

/** Hexa des blocs pour les rendus hors-DOM (cartes og satori) — à garder en
 * phase avec les variables --bloc-* du <style> de FranceDesk.astro. */
const BLOC_HEX: Record<string, string> = {
  far_left: '#6b1f2e',
  left: '#b0202a',
  left_radical: '#c1272d',
  left_populist: '#d4602e',
  left_social_dem: '#e5567f',
  greens: '#4a9d5b',
  centre: '#b7860f',
  centre_right: '#bf6d1f',
  right: '#3f82d6',
  sovereignist: '#6d4c8a',
  far_right: '#2b4f8c',
  other: '#6a635a',
};

export function blocHex(bloc: string): string {
  return BLOC_HEX[bloc] ?? BLOC_HEX.other;
}

export function blocLabel(bloc: string, locale: Locale): string {
  const b = (BLOC_ORDER as string[]).includes(bloc) ? (bloc as Bloc) : 'other';
  return BLOC_LABELS[b][locale];
}

export const STATUS_LABELS: Record<string, { fr: string; en: string; es: string }> = {
  declared: { fr: 'Candidature déclarée', en: 'Declared', es: 'Candidatura declarada' },
  probable: { fr: 'Probable', en: 'Probable', es: 'Probable' },
  testing: { fr: 'Testé·e', en: 'Tested', es: 'En sondeos' },
  withdrawn: { fr: 'Retiré·e', en: 'Withdrawn', es: 'Retirado·a' },
};

export function statusLabel(status: string, locale: Locale): string {
  return STATUS_LABELS[status]?.[locale] ?? status;
}

// ── Types du web_data (france-presidential/latest.json) ──────────────────────

export interface FrQualification {
  candidate_id: string;
  candidate_name: string;
  bloc: string;
  first_round_mean: number;
  first_round_sd: number;
  poll_count: number;
  p_top2: number;
}

export interface FrTopDuel {
  duel_left_id: string;
  duel_right_id: string;
  p_duel: number;
  left_share_expressed_mean: number;
  right_share_expressed_mean: number;
  winner_mean: string;
}

export interface FrDiagnostics {
  n_polls_used: number;
  effective_sample_size: number;
  median_days_old: number;
}

export interface FrScenario {
  scenario: {
    scenario_id: string;
    scenario_name: string;
    public_label?: string;
    description?: string;
    active_candidate_ids: string[];
    featured?: boolean;
    category?: string;
  };
  mode_fit: string;
  diagnostics: FrDiagnostics;
  qualification: FrQualification[];
  top_duel: FrTopDuel | null;
}

/** Trim d'un scénario pour l'island (retire les champs non affichés). */
export interface ScenarioCard {
  id: string;
  label: string;
  category: string;
  nPolls: number;
  qualification: {
    id: string;
    name: string;
    bloc: string;
    mean: number;
    sd: number;
    pTop2: number;
  }[];
  duel: {
    leftId: string;
    rightId: string;
    leftName: string;
    rightName: string;
    leftShare: number;
    rightShare: number;
    winnerId: string;
    pDuel: number;
  } | null;
}

export function toScenarioCard(s: FrScenario, locale: Locale): ScenarioCard {
  const nameById = new Map(s.qualification.map((q) => [q.candidate_id, q.candidate_name]));
  const d = s.top_duel;
  return {
    id: s.scenario.scenario_id,
    label: s.scenario.public_label || s.scenario.scenario_name,
    category: s.scenario.category || 'other',
    nPolls: s.diagnostics?.n_polls_used ?? 0,
    qualification: [...s.qualification]
      .sort((a, b) => b.first_round_mean - a.first_round_mean)
      .map((q) => ({
        id: q.candidate_id,
        name: q.candidate_name,
        bloc: q.bloc,
        mean: q.first_round_mean,
        sd: q.first_round_sd,
        pTop2: q.p_top2,
      })),
    duel: d
      ? {
          leftId: d.duel_left_id,
          rightId: d.duel_right_id,
          leftName: nameById.get(d.duel_left_id) ?? d.duel_left_id,
          rightName: nameById.get(d.duel_right_id) ?? d.duel_right_id,
          leftShare: d.left_share_expressed_mean,
          rightShare: d.right_share_expressed_mean,
          winnerId: d.winner_mean,
          pDuel: d.p_duel,
        }
      : null,
  };
}

export const fmtPct1 = (v: number, locale: Locale) =>
  `${v.toFixed(1).replace('.', locale === 'en' ? '.' : ',')}%`;

// ── Chemins d'URL par langue (slugs traduits comme le reste du site :
// « distritos », « sondeos » côté es) ────────────────────────────────────────
export const franceBase = (locale: Locale): string => `/${locale}/france`;

export const franceCandBase = (locale: Locale): string =>
  locale === 'fr'
    ? '/fr/france/candidats'
    : locale === 'es'
      ? '/es/france/candidatos'
      : '/en/france/candidates';

export const methodHref = (locale: Locale): string =>
  locale === 'en' ? '/en/methodology/' : `/${locale}/methodologie/`;
