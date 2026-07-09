// Adaptateur données pour les pages par candidat (France 2027).
// getStaticPaths génère une page par candidat déclaré/probable depuis
// web_data — profil (stats de sondage), duels, scénarios. Même esprit que
// lib/riding-adapters pour les circonscriptions QC.
import latest from '../../web_data/france-presidential/latest.json';
import dataSheets from '../../web_data/france-presidential/data_sheets.json';
import { CANDIDATE_BIOS } from '../data/fr-candidate-bios';
import { blocLabel, type Locale } from './fr-pres';

export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface RawCandidate {
  candidate_id: string;
  candidate_name: string;
  short_label: string;
  bloc: string;
  party_family: string;
  status: string;
  first_round_floor: number;
  first_round_ceiling: number;
  active_scenarios: number;
  featured_scenarios: number;
  best_first_round_mean: number | null;
  best_p_top2: number | null;
}

export interface CandidateDuel {
  opponentId: string;
  opponentName: string;
  scenarioId: string;
  scenarioLabel: string;
  ownShare: number;
  opponentShare: number;
  wins: boolean;
}

export interface CandidateProfile {
  id: string;
  slug: string;
  name: string;
  shortLabel: string;
  bloc: string;
  partyFamily: string;
  status: string;
  floor: number;
  ceiling: number;
  bestMean: number | null;
  bestPTop2: number | null;
  activeScenarios: number;
  featuredScenarios: number;
  bio: { fr: string; en: string; es: string } | null;
  duels: CandidateDuel[];
}

const RANK: Record<string, number> = { declared: 0, probable: 1, testing: 2 };

function buildProfiles(): CandidateProfile[] {
  const cands = ((dataSheets as any).candidates ?? []) as RawCandidate[];
  const scenarios = (latest as any).scenarios as any[];

  // Duels par candidat, dérivés des top_duels des scénarios vedettes (parts
  // toujours présentes, contrairement aux duels sans sondage).
  const duelsByCandidate = new Map<string, CandidateDuel[]>();
  const nameById = new Map<string, string>();
  for (const c of cands) nameById.set(c.candidate_id, c.candidate_name);

  for (const s of scenarios) {
    if (!s.scenario.featured || !s.top_duel) continue;
    const d = s.top_duel;
    const label = s.scenario.public_label || s.scenario.scenario_name;
    const add = (ownId: string, ownShare: number, oppId: string, oppShare: number) => {
      const list = duelsByCandidate.get(ownId) ?? [];
      if (list.some((x) => x.opponentId === oppId)) return; // 1 duel par adversaire
      list.push({
        opponentId: oppId,
        opponentName: nameById.get(oppId) ?? oppId,
        scenarioId: s.scenario.scenario_id,
        scenarioLabel: label,
        ownShare,
        opponentShare: oppShare,
        wins: ownShare >= oppShare,
      });
      duelsByCandidate.set(ownId, list);
    };
    add(d.duel_left_id, d.left_share_expressed_mean, d.duel_right_id, d.right_share_expressed_mean);
    add(d.duel_right_id, d.right_share_expressed_mean, d.duel_left_id, d.left_share_expressed_mean);
  }

  return cands
    .filter((c) => ['declared', 'probable'].includes(c.status))
    .map((c) => ({
      id: c.candidate_id,
      slug: slugify(c.candidate_name),
      name: c.candidate_name,
      shortLabel: c.short_label,
      bloc: c.bloc,
      partyFamily: c.party_family,
      status: c.status,
      floor: c.first_round_floor,
      ceiling: c.first_round_ceiling,
      bestMean: c.best_first_round_mean,
      bestPTop2: c.best_p_top2,
      activeScenarios: c.active_scenarios,
      featuredScenarios: c.featured_scenarios,
      bio: CANDIDATE_BIOS[c.candidate_id] ?? null,
      duels: (duelsByCandidate.get(c.candidate_id) ?? []).sort(
        (a, b) => b.ownShare - a.ownShare,
      ),
    }))
    .sort((a, b) => {
      const r = (RANK[a.status] ?? 9) - (RANK[b.status] ?? 9);
      if (r !== 0) return r;
      return (b.bestMean ?? 0) - (a.bestMean ?? 0);
    });
}

let _cache: CandidateProfile[] | null = null;
export function getAllCandidates(): CandidateProfile[] {
  if (!_cache) _cache = buildProfiles();
  return _cache;
}

export function getCandidateBySlug(slug: string): CandidateProfile | undefined {
  return getAllCandidates().find((c) => c.slug === slug);
}

// Prose SEO data-driven (change à chaque run). Faits vérifiables : parti,
// bloc, statut, fourchette de sondage, nombre de scénarios, meilleur duel.
const STATUS_PHRASE: Record<string, { fr: string; en: string; es: string }> = {
  declared: { fr: 'officiellement candidat·e', en: 'an officially declared candidate', es: 'candidato·a oficialmente declarado·a' },
  probable: { fr: 'candidat·e probable', en: 'a probable candidate', es: 'candidato·a probable' },
  testing: { fr: 'testé·e dans les sondages', en: 'a candidate tested in polls', es: 'candidato·a en sondeos' },
};

export function candidateProse(c: CandidateProfile, locale: Locale): string[] {
  const party = blocLabel(c.bloc, locale);
  const phrase =
    STATUS_PHRASE[c.status]?.[locale] ??
    (locale === 'fr' ? 'candidat·e' : locale === 'es' ? 'candidato·a' : 'a candidate');
  const range =
    locale === 'fr'
      ? `entre ${c.floor.toFixed(0)} et ${c.ceiling.toFixed(0)} %`
      : locale === 'es'
        ? `entre ${c.floor.toFixed(0)} y ${c.ceiling.toFixed(0)} %`
        : `between ${c.floor.toFixed(0)} and ${c.ceiling.toFixed(0)}%`;
  const bestDuel = c.duels.find((d) => d.wins) ?? c.duels[0];

  if (locale === 'es') {
    const p1 = `${c.name} (${party}) es ${phrase} en la elección presidencial francesa de 2027. Nuestras agregaciones lo/la prueban en ${c.activeScenarios} configuraciones de candidaturas, con una intención de voto en primera vuelta ${range} según la combinación.`;
    const p2 = bestDuel
      ? `En segunda vuelta, en la combinación «${bestDuel.scenarioLabel}», nuestro modelo lo/la da ${bestDuel.wins ? 'ganador·a' : 'perdedor·a'} frente a ${bestDuel.opponentName} (${bestDuel.ownShare.toFixed(1).replace('.', ',')} % contra ${bestDuel.opponentShare.toFixed(1).replace('.', ',')} %). Son promedios de simulación por escenario, no predicciones.`
      : '';
    return [p1, p2].filter(Boolean);
  }

  if (locale === 'fr') {
    const p1 = `${c.name} (${party}) est ${phrase} à l'élection présidentielle française de 2027. Nos agrégations le/la testent dans ${c.activeScenarios} configurations de candidatures, avec une intention de vote au premier tour ${range} selon le casting.`;
    const p2 = bestDuel
      ? `Au second tour, dans le casting « ${bestDuel.scenarioLabel} », notre modèle ${bestDuel.wins ? 'le/la donne vainqueur' : 'le/la donne battu·e'} face à ${bestDuel.opponentName} (${bestDuel.ownShare.toFixed(1).replace('.', ',')} % contre ${bestDuel.opponentShare.toFixed(1).replace('.', ',')} %). Ces chiffres sont des moyennes de simulation par scénario, pas des prédictions.`
      : '';
    return [p1, p2].filter(Boolean);
  }
  const p1 = `${c.name} (${party}) is ${phrase} in the 2027 French presidential election. Our aggregations test them across ${c.activeScenarios} candidate configurations, with a first-round voting intention ${range} depending on the lineup.`;
  const p2 = bestDuel
    ? `In the runoff, in the "${bestDuel.scenarioLabel}" lineup, our model has them ${bestDuel.wins ? 'winning' : 'losing'} against ${bestDuel.opponentName} (${bestDuel.ownShare.toFixed(1)}% to ${bestDuel.opponentShare.toFixed(1)}%). These are per-lineup simulation averages, not predictions.`
    : '';
  return [p1, p2].filter(Boolean);
}
