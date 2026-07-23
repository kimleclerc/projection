/**
 * Baromètre des candidatures — Québec 2026.
 * Charge les sorties de `qc_equity_index.py` (models) publiées dans
 * web_data/quebec/equity/qc_{cycle}.json et expose une structure typée +
 * chaînes trilingues pour le composant QuebecEquityDesk.
 *
 * Deux mesures : parité comptable (part de femmes vs cible ISQ) et écart de
 * placement (accès aux comtés gagnables du parti). Voir docs/EQUITY_INDEX.md.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type EquityLocale = 'en' | 'fr' | 'es';
export type PartyCode = 'caq' | 'plq' | 'pq' | 'qs' | 'pcq';
export const EQUITY_PARTIES: PartyCode[] = ['caq', 'plq', 'pq', 'qs', 'pcq'];

export interface PariteComptable {
  pct_femmes: number;
  n: number;
  sous_score: number;
  cible: number;
}

export interface Placement {
  n_femmes: number;
  n_hommes: number;
  ecart_pts: number;
  ic95: [number, number];
  p_permutation: number;
  p_wilcoxon: number;
  prob_superiorite: number;
  q5_femmes_obs: number;
  q5_femmes_attendu: number;
  p_fisher_q5: number;
}

export interface Nomination {
  n: number;
  restant: number;
  pct_complet: number;
  femmes: number;
  hommes: number;
  non_binaire: number;
  inconnu: number;
}

export interface EquityCycle {
  cycle: string;
  n_total: number;
  n_inconnu: number;
  n_non_binaire: number;
  provisoire: boolean;
  objectif_sieges: number;
  meta?: { generated_at?: string; target_women?: number; target_source?: string };
  partis: Record<string, { parite_comptable?: PariteComptable; placement?: Placement }>;
  nominations: Record<string, Nomination>;
  pooled: { ecart_pts: number; p_permutation_stratifiee: number; n: number };
}

export interface EquityData {
  current: EquityCycle; // qc_2026
  backtests: EquityCycle[]; // [qc_2018, qc_2022]
  asOfLabel: string;
  targetPct: number;
}

function load(cycle: string): EquityCycle {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), `web_data/quebec/equity/${cycle}.json`), 'utf-8'),
  ) as EquityCycle;
}

function asDateLabel(dateString?: string, locale: EquityLocale = 'fr'): string {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  const bcp47 = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale];
  return date.toLocaleDateString(bcp47, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function getQuebecEquityData(locale: EquityLocale = 'fr'): EquityData {
  const current = load('qc_2026');
  const backtests = [load('qc_2018'), load('qc_2022')];
  return {
    current,
    backtests,
    asOfLabel: asDateLabel(current.meta?.generated_at, locale),
    targetPct: current.meta?.target_women ? current.meta.target_women * 100 : 50.2,
  };
}

/** Signe d'un écart de placement pour le classement (négatif = défavorable). */
export function placementVerdict(
  p: Placement | undefined,
  locale: EquityLocale,
): { tone: 'bad' | 'good' | 'neutral' | 'thin'; label: string } {
  const T = {
    fr: { bad: 'Défavorable', good: 'Favorable', neutral: 'Sans écart net', thin: 'Trop peu de candidatures' },
    en: { bad: 'Unfavourable', good: 'Favourable', neutral: 'No clear gap', thin: 'Too few candidacies' },
    es: { bad: 'Desfavorable', good: 'Favorable', neutral: 'Sin brecha clara', thin: 'Muy pocas candidaturas' },
  }[locale];
  if (!p || p.n_femmes < 5 || p.n_hommes < 5) return { tone: 'thin', label: T.thin };
  if (p.ecart_pts <= -8 && p.p_permutation < 0.1) return { tone: 'bad', label: T.bad };
  if (p.ecart_pts >= 8 && p.p_permutation > 0.9) return { tone: 'good', label: T.good };
  return { tone: 'neutral', label: T.neutral };
}

/** Chaînes d'interface localisées. Les valeurs viennent de la couche data. */
export const EQUITY_STRINGS = {
  fr: {
    kicker: 'Baromètre des candidatures — Québec 2026',
    title: 'Genre et accès aux comtés gagnables',
    lede:
      "Deux questions distinctes, par parti : les partis présentent-ils autant de femmes que d'hommes, et leurs candidates obtiennent-elles les circonscriptions où le parti est réellement compétitif ? Une liste paritaire peut cacher un placement inéquitable.",
    asOf: 'En date du',
    provisoire: 'Résultat provisoire',
    provisoireWhy: 'plus de 10 % des candidatures ont un genre encore non sourcé',
    trackTitle: 'Course aux 127 candidatures',
    trackLede: 'Progression des nominations vers une équipe complète, par parti.',
    trackComplete: 'complète',
    trackRemaining: 'restantes',
    women: 'femmes',
    men: 'hommes',
    parityTitle: 'Parité comptable',
    parityLede:
      "Part de femmes parmi toutes les candidatures actives d'un parti, comparée à la cible démographique (femmes de 20 ans et plus au Québec, ISQ).",
    parityScore: 'Sous-score parité',
    target: 'Cible',
    placementTitle: 'Écart de placement',
    placementLede:
      "Rang moyen des comtés confiés aux nouvelles candidates, moins celui des hommes, sur l'échelle des 127 circonscriptions ordonnées par force projetée du parti (0 = plus faible, 100 = bastion). Négatif = femmes dans de moins bons comtés. Sortant·e·s exclu·e·s. IC à 95 % par ré-échantillonnage ; p par test de permutation.",
    placementGap: 'Écart',
    placementCI: 'IC 95 %',
    placementP: 'p',
    verdict: 'Lecture',
    backtestTitle: 'Ce que le baromètre montre sur le passé',
    backtestLede:
      "L'outil est calibré sur deux scrutins connus. Il détecte un vrai déséquilibre quand il existe (2018) et conclut « rien à signaler » quand c'est le cas (2022) — un garde-fou contre les conclusions choisies d'avance.",
    backtest2018:
      "2018 — La CAQ présentait le plus de femmes (52 %) mais les plaçait dans ses comtés les plus faibles : écart de −18 points (p < 0,001). Ses nouvelles candidates ont été élues à 37 %, contre 70 % pour ses nouveaux candidats. La vague caquiste a masqué le phénomène.",
    backtest2022:
      "2022 — Aucun écart significatif dans aucun parti : les cinq ont placé leurs candidates de façon équitable. La CAQ a même rempli 79 % de ses nouvelles ouvertures avec des femmes.",
    methoTitle: 'Méthode et sources',
    methoBody:
      "Le genre est sourcé (titre officiel de député·e, communiqués de parti en français genré, presse locale), jamais déduit du seul prénom ; une femme trans compte comme femme, un homme trans comme homme, les personnes non binaires sont affichées à part. La cible démographique vient des estimations de population de l'ISQ (2025). L'écart de placement mesure une distribution observable d'occasions électorales, pas une intention. Les candidatures retirées (ex. Gouin) sortent du calcul.",
    academicTitle: 'Fondement scientifique',
    academicBody:
      "Le phénomène des « candidates poteaux » (sacrificial lambs) et du « précipice de verre » (glass cliff) est documenté au Canada et ailleurs : les partis nomment parfois davantage de femmes dans les sièges perdus d'avance, gonflant la parité de façade sans partager l'accès au pouvoir.",
    refs: 'Références',
    poolTitle: "Ensemble des partis",
    poolBody: (gap: string, p: string, n: string) =>
      `Tous partis confondus, l'écart de placement des nouvelles candidatures est de ${gap} point (n = ${n}, p = ${p}) — aucun signe d'un placement globalement défavorable aux femmes à ce stade des nominations.`,
    ridingsCta: 'Voir les candidatures par circonscription →',
    ridingsHref: '/fr/canada/quebec/circonscriptions/',
  },
  en: {
    kicker: 'Candidate Barometer — Quebec 2026',
    title: 'Gender and access to winnable ridings',
    lede:
      'Two separate questions, party by party: do parties field as many women as men, and do their women candidates get the ridings where the party is actually competitive? A gender-balanced slate can hide unequal placement.',
    asOf: 'As of',
    provisoire: 'Provisional result',
    provisoireWhy: 'more than 10% of candidacies have a gender not yet sourced',
    trackTitle: 'Race to 127 candidacies',
    trackLede: 'Progress toward a full slate, by party.',
    trackComplete: 'complete',
    trackRemaining: 'remaining',
    women: 'women',
    men: 'men',
    parityTitle: 'Headcount parity',
    parityLede:
      "Share of women among a party's active candidacies, against the demographic target (women aged 20+ in Quebec, ISQ).",
    parityScore: 'Parity subscore',
    target: 'Target',
    placementTitle: 'Placement gap',
    placementLede:
      "Average rank of the ridings given to new women candidates minus that of men, on the scale of 127 ridings ordered by projected party strength (0 = weakest, 100 = stronghold). Negative = women in weaker ridings. Incumbents excluded. 95% CI by resampling; p by permutation test.",
    placementGap: 'Gap',
    placementCI: '95% CI',
    placementP: 'p',
    verdict: 'Reading',
    backtestTitle: 'What the barometer shows about the past',
    backtestLede:
      'The tool is calibrated on two known elections. It flags a real imbalance when there is one (2018) and reports "nothing to see" when there is not (2022) — a guard against cherry-picked conclusions.',
    backtest2018:
      '2018 — The CAQ fielded the most women (52%) but placed them in its weakest ridings: a −18-point gap (p < 0.001). Its new women candidates were elected 37% of the time, versus 70% for its new men. The CAQ wave masked the pattern.',
    backtest2022:
      '2022 — No significant gap in any party: all five placed their women candidates equitably. The CAQ even filled 79% of its new openings with women.',
    methoTitle: 'Method and sources',
    methoBody:
      "Gender is sourced (official MNA title, party press releases in gendered French, local press), never inferred from a first name alone; a trans woman counts as a woman, a trans man as a man, non-binary people are shown separately. The demographic target comes from ISQ population estimates (2025). The placement gap measures an observable distribution of electoral opportunities, not intent. Withdrawn candidacies (e.g. Gouin) drop out of the calculation.",
    academicTitle: 'Scientific basis',
    academicBody:
      'The "sacrificial lambs" and "glass cliff" phenomena are documented in Canada and elsewhere: parties sometimes nominate more women in unwinnable seats, inflating surface parity without sharing access to power.',
    refs: 'References',
    poolTitle: 'All parties combined',
    poolBody: (gap: string, p: string, n: string) =>
      `Across all parties, the placement gap for new candidacies is ${gap} points (n = ${n}, p = ${p}) — no sign of a broadly unfavourable placement for women at this stage of nominations.`,
    ridingsCta: 'See candidacies by riding →',
    ridingsHref: '/en/canada/quebec/ridings/',
  },
  es: {
    kicker: 'Barómetro de candidaturas — Quebec 2026',
    title: 'Género y acceso a distritos ganables',
    lede:
      'Dos preguntas distintas, partido por partido: ¿presentan tantas mujeres como hombres, y sus candidatas obtienen los distritos donde el partido es realmente competitivo? Una lista paritaria puede ocultar una colocación desigual.',
    asOf: 'A fecha de',
    provisoire: 'Resultado provisional',
    provisoireWhy: 'más del 10 % de las candidaturas tienen un género aún sin fuente',
    trackTitle: 'Carrera hacia 127 candidaturas',
    trackLede: 'Avance hacia una lista completa, por partido.',
    trackComplete: 'completa',
    trackRemaining: 'restantes',
    women: 'mujeres',
    men: 'hombres',
    parityTitle: 'Paridad numérica',
    parityLede:
      'Proporción de mujeres entre las candidaturas activas de un partido, frente al objetivo demográfico (mujeres de 20 años o más en Quebec, ISQ).',
    parityScore: 'Subpuntuación paridad',
    target: 'Objetivo',
    placementTitle: 'Brecha de colocación',
    placementLede:
      'Rango medio de los distritos dados a las nuevas candidatas menos el de los hombres, en la escala de los 127 distritos ordenados por fuerza proyectada del partido (0 = más débil, 100 = bastión). Negativo = mujeres en distritos más débiles. Titulares excluidos. IC del 95 % por remuestreo; p por prueba de permutación.',
    placementGap: 'Brecha',
    placementCI: 'IC 95 %',
    placementP: 'p',
    verdict: 'Lectura',
    backtestTitle: 'Lo que el barómetro muestra sobre el pasado',
    backtestLede:
      'La herramienta está calibrada con dos elecciones conocidas. Señala un desequilibrio real cuando existe (2018) y concluye «nada que señalar» cuando no (2022): una salvaguarda contra las conclusiones elegidas de antemano.',
    backtest2018:
      '2018 — La CAQ presentó más mujeres (52 %) pero las colocó en sus distritos más débiles: una brecha de −18 puntos (p < 0,001). Sus nuevas candidatas fueron electas el 37 % de las veces, frente al 70 % de sus nuevos candidatos. La ola de la CAQ ocultó el patrón.',
    backtest2022:
      '2022 — Ninguna brecha significativa en ningún partido: los cinco colocaron a sus candidatas de forma equitativa. La CAQ incluso llenó el 79 % de sus nuevas vacantes con mujeres.',
    methoTitle: 'Método y fuentes',
    methoBody:
      'El género se documenta (título oficial de diputada/o, comunicados de partido en francés con marca de género, prensa local), nunca se deduce solo del nombre; una mujer trans cuenta como mujer, un hombre trans como hombre, las personas no binarias se muestran aparte. El objetivo demográfico procede de las estimaciones de población del ISQ (2025). La brecha de colocación mide una distribución observable de oportunidades electorales, no una intención. Las candidaturas retiradas (p. ej. Gouin) salen del cálculo.',
    academicTitle: 'Base científica',
    academicBody:
      'Los fenómenos de las «candidatas de sacrificio» (sacrificial lambs) y del «precipicio de cristal» (glass cliff) están documentados en Canadá y otros lugares: los partidos a veces nominan más mujeres en escaños perdidos, inflando la paridad de fachada sin compartir el acceso al poder.',
    refs: 'Referencias',
    poolTitle: 'Todos los partidos juntos',
    poolBody: (gap: string, p: string, n: string) =>
      `En conjunto, la brecha de colocación de las nuevas candidaturas es de ${gap} puntos (n = ${n}, p = ${p}): ninguna señal de una colocación globalmente desfavorable para las mujeres en esta etapa.`,
    ridingsCta: 'Ver candidaturas por distrito →',
    ridingsHref: '/es/canada/quebec/distritos/',
  },
} as const;

export const EQUITY_REFS = [
  'Thomas, M. & Bodet, M.A. (2013). Sacrificial lambs, women candidates, and district competitiveness in Canada. Electoral Studies.',
  'Tolley, E. et al. (2023). Still sacrificial lambs? Yes! Minority groups in Canadian federal elections, 2015–2021. Electoral Studies.',
  'Ryan, M.K., Haslam, S.A. & Kulich, C. (2010). Politics and the glass cliff. Psychology of Women Quarterly.',
];
