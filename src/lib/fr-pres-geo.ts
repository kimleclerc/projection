/**
 * France présidentielle 2022 — résultats officiels par circonscription
 * (566, hors 11 circonscriptions des Français de l'étranger sans territoire
 * cartographiable). Source : web_data/france-presidential/geo_2022.json
 * (ministère de l'Intérieur, cf. meta.source_url).
 *
 * Ce module transforme les données brutes en trois jeux de RidingFull
 * (format attendu par l'îlot RidingsMap) : T1 par bloc, T1 par candidat
 * (destiné au mode 'heat'), et T2 (duel Macron/Le Pen). Ce ne sont pas des
 * projections : ce sont les résultats réels de 2022, réutilisés comme carte
 * de référence.
 */
import type { MapParty, RidingFull } from '../islands/RidingsMap';
import { FR_LEG_PARTIES } from './riding-adapters/parties';
import geoSource from '../../web_data/france-presidential/geo_2022.json';

type RawCirco = {
  constituency_name: string;
  registered: number;
  expressed_r1: number;
  expressed_r2: number;
  turnout_r1_pct: number;
  turnout_r2_pct: number;
  r1_candidates: Record<string, number>;
  r1_blocs: Record<string, number>;
  r1_winner_candidate: string;
  r1_winner_bloc: string;
  r2: { macron: number; le_pen: number };
  r2_winner: 'macron' | 'le_pen' | 'tie';
};

type GeoSource = {
  meta: { n_circ: number; rounds: number[]; source_url: Record<string, string> };
  circonscriptions: Record<string, RawCirco>;
};

const SOURCE = geoSource as GeoSource;

export const FR_PRES_2022_META = SOURCE.meta;

/** Candidat → { label, bloc }. `bloc` réutilise les 8 blocs FR_LEG_PARTIES ;
 *  la couleur affichée pour un candidat est donc toujours celle de son bloc. */
export const CANDIDATE_META: Record<string, { label: string; bloc: string }> = {
  centre_macron: { label: 'Macron', bloc: 'centre' },
  rn_le_pen: { label: 'Le Pen', bloc: 'far_right' },
  left_melenchon: { label: 'Mélenchon', bloc: 'left' },
  far_right_zemmour: { label: 'Zemmour', bloc: 'far_right' },
  lr_pecresse: { label: 'Pécresse', bloc: 'right' },
  greens_jadot: { label: 'Jadot', bloc: 'greens' },
  centrist_lassalle: { label: 'Lassalle', bloc: 'other' },
  sovereignist_dupont_aignan: { label: 'Dupont-Aignan', bloc: 'sovereignist' },
  left_roussel: { label: 'Roussel', bloc: 'left' },
  left_hidalgo: { label: 'Hidalgo', bloc: 'left' },
  far_left_arthaud: { label: 'Arthaud', bloc: 'far_left' },
  far_left_poutou: { label: 'Poutou', bloc: 'far_left' },
};

/** Ordre d'affichage du 1er tour, du meilleur score national au plus faible
 *  (fixe : ce sont des résultats 2022, pas un tri dynamique). */
export const CANDIDATE_ORDER: string[] = [
  'centre_macron',
  'rn_le_pen',
  'left_melenchon',
  'far_right_zemmour',
  'lr_pecresse',
  'greens_jadot',
  'centrist_lassalle',
  'sovereignist_dupont_aignan',
  'left_roussel',
  'left_hidalgo',
  'far_left_arthaud',
  'far_left_poutou',
];

const BLOC_ORDER: string[] = [
  'far_right',
  'left',
  'centre',
  'right',
  'greens',
  'sovereignist',
  'far_left',
  'other',
];

function blocColor(bloc: string): string {
  return FR_LEG_PARTIES[bloc]?.color ?? '#999999';
}

/** MapParty pour la vue T1 par bloc (8 blocs, mêmes couleurs que le desk législatif). */
export const BLOC_PARTIES: MapParty[] = BLOC_ORDER.filter((k) => FR_LEG_PARTIES[k]).map((k) => ({
  key: k,
  label_en: FR_LEG_PARTIES[k].label_en,
  label_fr: FR_LEG_PARTIES[k].label_fr,
  color: FR_LEG_PARTIES[k].color,
}));

/** MapParty pour la vue T1 par candidat (12 candidats, couleur = bloc du candidat). */
export const CANDIDATE_PARTIES: MapParty[] = CANDIDATE_ORDER.map((key) => {
  const meta = CANDIDATE_META[key];
  return {
    key,
    label_en: meta.label,
    label_fr: meta.label,
    color: blocColor(meta.bloc),
  };
});

/** MapParty pour la vue T2 (duel Macron/Le Pen, couleurs bloc centre/far_right). */
export const ROUND2_PARTIES: MapParty[] = [
  { key: 'centre', label_en: 'Macron', label_fr: 'Macron', color: blocColor('centre') },
  { key: 'far_right', label_en: 'Le Pen', label_fr: 'Le Pen', color: blocColor('far_right') },
];

function top2Margin(shares: Record<string, number>): number {
  const sorted = Object.values(shares)
    .filter((v) => typeof v === 'number')
    .sort((a, b) => b - a);
  if (sorted.length < 2) return sorted[0] ?? 0;
  return Math.abs(sorted[0] - sorted[1]);
}

function closeRace(margin: number): number {
  return margin < 5 ? 1 : 0;
}

/** T1 par bloc : vainqueur = bloc en tête, vote_mean = les 8 blocs. */
export function buildRound1BlocRidings(): RidingFull[] {
  return Object.entries(SOURCE.circonscriptions).map(([riding_id, c]) => {
    const margin = top2Margin(c.r1_blocs);
    const winner = c.r1_winner_bloc;
    const pWinner = (c.r1_blocs[winner] ?? 0) / 100;
    return {
      riding_id,
      name_en: c.constituency_name,
      name_fr: c.constituency_name,
      province: null,
      projection: {
        winner,
        p_winner: pWinner,
        mean_margin: margin,
        p_close_race: closeRace(margin),
        vote_mean: c.r1_blocs,
        win_prob: {},
      },
      baseline: null,
    };
  });
}

/** T1 par candidat : vainqueur = candidat en tête, vote_mean = les 12 candidats.
 *  Sert au mode 'heat' (heatKey = identifiant du candidat sélectionné). */
export function buildRound1CandidateRidings(): RidingFull[] {
  return Object.entries(SOURCE.circonscriptions).map(([riding_id, c]) => {
    const margin = top2Margin(c.r1_candidates);
    const winner = c.r1_winner_candidate;
    const pWinner = (c.r1_candidates[winner] ?? 0) / 100;
    return {
      riding_id,
      name_en: c.constituency_name,
      name_fr: c.constituency_name,
      province: null,
      projection: {
        winner,
        p_winner: pWinner,
        mean_margin: margin,
        p_close_race: closeRace(margin),
        vote_mean: c.r1_candidates,
        win_prob: {},
      },
      baseline: null,
    };
  });
}

/** T2 : duel Macron/Le Pen. Vainqueur remappé vers les blocs centre/far_right
 *  (couleur cohérente avec le reste du site) ; 'tie' → 'tossup'. */
export function buildRound2Ridings(): RidingFull[] {
  return Object.entries(SOURCE.circonscriptions).map(([riding_id, c]) => {
    const macron = c.r2?.macron ?? 0;
    const lePen = c.r2?.le_pen ?? 0;
    const margin = Math.abs(macron - lePen);
    const winner = c.r2_winner === 'macron' ? 'centre' : c.r2_winner === 'le_pen' ? 'far_right' : 'tossup';
    const pWinner = Math.max(macron, lePen) / 100;
    return {
      riding_id,
      name_en: c.constituency_name,
      name_fr: c.constituency_name,
      province: null,
      projection: {
        winner,
        p_winner: pWinner,
        mean_margin: margin,
        p_close_race: closeRace(margin),
        vote_mean: { centre: macron, far_right: lePen },
        win_prob: {},
      },
      baseline: null,
    };
  });
}
