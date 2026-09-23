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

// Famille politique SANS parti : le parti vient de la candidature, pas du bloc.
// BLOC_LABELS collait « (RN) » à tout le bloc d'extrême droite — Zemmour
// devenait RN, Glucksmann (Place publique) PS, Villepin et Lecornu Horizons.
const BLOC_GENERIC: Record<Bloc, { fr: string; en: string; es: string }> = {
  far_left: { fr: 'Extrême gauche', en: 'Far left', es: 'Extrema izquierda' },
  left: { fr: 'Gauche', en: 'Left', es: 'Izquierda' },
  left_radical: { fr: 'Gauche radicale', en: 'Radical left', es: 'Izquierda radical' },
  left_populist: { fr: 'Gauche populaire', en: 'Populist left', es: 'Izquierda popular' },
  left_social_dem: { fr: 'Sociaux-démocrates', en: 'Social democrats', es: 'Socialdemócratas' },
  greens: { fr: 'Écologistes', en: 'Greens', es: 'Ecologistas' },
  centre: { fr: 'Centre', en: 'Centre', es: 'Centro' },
  centre_right: { fr: 'Centre droit', en: 'Centre-right', es: 'Centroderecha' },
  right: { fr: 'Droite', en: 'Right', es: 'Derecha' },
  sovereignist: { fr: 'Souverainistes', en: 'Sovereignist', es: 'Soberanistas' },
  far_right: { fr: 'Extrême droite', en: 'Far right', es: 'Extrema derecha' },
  other: { fr: 'Autres', en: 'Other', es: 'Otros' },
};

/** Sigle du parti par `party_family` du registre. Absent = pas de sigle
 * (indépendants, et les écologistes, dont le nom de parti répète le bloc). */
const PARTY_ABBR: Record<string, string> = {
  rn: 'RN', reconquete: 'Reconquête', renaissance: 'Renaissance', modem: 'MoDem',
  horizons: 'Horizons', lr: 'LR', nous_france: 'Nous France', humanist_france: 'La France humaniste',
  lfi: 'LFI', ps: 'PS', ps_place_publique: 'Place publique', la_convention: 'La Convention',
  pcf: 'PCF', picardie_debout: 'Picardie debout', lo: 'LO', npa: 'NPA', dlf: 'DLF', upr: 'UPR',
};

export function blocLabel(bloc: string, locale: Locale, partyFamily?: string): string {
  const b = (BLOC_ORDER as string[]).includes(bloc) ? (bloc as Bloc) : 'other';
  const abbr = partyFamily ? PARTY_ABBR[partyFamily] : undefined;
  return abbr ? `${BLOC_GENERIC[b][locale]} (${abbr})` : BLOC_GENERIC[b][locale];
}

export const STATUS_LABELS: Record<string, { fr: string; en: string; es: string }> = {
  declared: { fr: 'Candidature déclarée', en: 'Declared', es: 'Candidatura declarada' },
  probable: { fr: 'Probable', en: 'Probable', es: 'Probable' },
  testing: { fr: 'Testé·e', en: 'Tested', es: 'En encuestas' },
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
    /** robust · usable · thin · stale · scaffold — voir curate_fr_pres_scenarios.py */
    data_quality?: string;
    /** Sondages portant CETTE configuration exacte (hors emprunts par proxy). */
    n_polls?: number;
    last_poll_date?: string | null;
    days_since_last_poll?: number | null;
    /** Sondages de cette configuration encore dans la fenêtre de fraîcheur. */
    n_polls_recent?: number;
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
  /** Sondages RETENUS, emprunts aux configurations voisines compris. */
  nPolls: number;
  /** Sondages portant cette configuration exacte — 0 pour les scénarios
   *  éditoriaux, dont le jeu de candidats n'a jamais été mis sur le terrain. */
  ownPolls: number;
  /** Âge du dernier sondage propre, en jours. null s'il n'y en a aucun. */
  daysSinceLastPoll: number | null;
  dataQuality: string;
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
    ownPolls: s.scenario.n_polls ?? 0,
    daysSinceLastPoll: s.scenario.days_since_last_poll ?? null,
    dataQuality: s.scenario.data_quality || 'scaffold',
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

/**
 * Provenance d'un scénario, en une phrase.
 *
 * Le desk affichait les configurations côte à côte sans rien dire de leur
 * fraîcheur : le 2026-09-14, un scénario dont le dernier sondage datait de
 * 644 jours et un sondé quatre jours plus tôt étaient indiscernables à
 * l'écran. La sélection et l'ordre ne changent pas — seule la provenance
 * devient visible.
 */
export interface ScenarioProvenance {
  text: string;
  /** Le moteur a jugé la configuration périmée (plus de six mois). */
  stale: boolean;
  /** Aucun sondage propre : l'estimation vient des configurations voisines. */
  borrowed: boolean;
}

function ageText(days: number, locale: Locale): string {
  // Au-delà d'un mois et demi, un compte en jours ne se lit plus : « il y a
  // 644 jours » demande une division mentale que « il y a 21 mois » évite.
  const months = Math.round(days / 30.4);
  if (locale === 'fr') {
    if (days <= 0) return "aujourd'hui";
    if (days < 45) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    return `il y a ${months} mois`;
  }
  if (locale === 'es') {
    if (days <= 0) return 'hoy';
    if (days < 45) return `hace ${days} día${days > 1 ? 's' : ''}`;
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  }
  if (days <= 0) return 'today';
  if (days < 45) return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

export function scenarioProvenance(
  card: Pick<ScenarioCard, 'ownPolls' | 'daysSinceLastPoll' | 'dataQuality'>,
  locale: Locale,
): ScenarioProvenance {
  const borrowed = (card.ownPolls ?? 0) <= 0;
  const stale = card.dataQuality === 'stale';

  if (borrowed) {
    return {
      borrowed: true,
      stale,
      text: locale === 'fr'
        ? "Aucun sondage sur cette configuration — estimée à partir des configurations voisines."
        : locale === 'es'
          ? 'Ningún encuesta sobre esta configuración — estimada a partir de configuraciones vecinas.'
          : 'No poll on this configuration — estimated from neighbouring configurations.',
    };
  }

  const n = card.ownPolls;
  const d = card.daysSinceLastPoll;
  const age = typeof d === 'number' ? ageText(d, locale) : null;

  const text = locale === 'fr'
    ? `${n} sondage${n > 1 ? 's' : ''} sur cette configuration${age ? ` · le dernier ${age}` : ''}`
    : locale === 'es'
      ? `${n} encuesta${n > 1 ? 's' : ''} sobre esta configuración${age ? ` · el último ${age}` : ''}`
      : `${n} poll${n > 1 ? 's' : ''} on this configuration${age ? ` · latest ${age}` : ''}`;

  return { borrowed: false, stale, text };
}

export const fmtPct1 = (v: number, locale: Locale) =>
  `${v.toFixed(1).replace('.', locale === 'en' ? '.' : ',')}%`;

// ── Chemins d'URL par langue (slugs traduits comme le reste du site :
// « distritos », « encuestas » côté es) ────────────────────────────────────────
export const franceBase = (locale: Locale): string => `/${locale}/france`;

export const franceCandBase = (locale: Locale): string =>
  locale === 'fr'
    ? '/fr/france/candidats'
    : locale === 'es'
      ? '/es/france/candidatos'
      : '/en/france/candidates';

export const methodHref = (locale: Locale): string =>
  locale === 'en' ? '/en/methodology/' : `/${locale}/methodologie/`;
