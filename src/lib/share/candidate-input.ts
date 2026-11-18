/** Fiche candidat (présidentielle française) → entrée de la carte de partage. */
import type { CandidateProfile } from '../fr-candidates';
import { blocHex, blocLabel, statusLabel } from '../fr-pres';
import type { CandidateCardInput } from './cards';
import type { Lang } from './elections';

/**
 * Duels du candidat dans les hypothèses publiées : pour chaque adversaire, le
 * duel le plus probable (p_duel), tous scénarios vedettes confondus. Plus riche
 * que `CandidateProfile.duels`, qui ne garde que le duel de tête de chaque scénario.
 */
function duelsOf(id: string, scenarios: any[], names: Map<string, string>) {
  const best = new Map<string, { opponent: string; own: number; opp: number; p: number }>();
  for (const s of scenarios) {
    if (!s.scenario?.featured) continue;
    for (const d of s.duels ?? []) {
      const left = d.duel_left_id === id;
      if (!left && d.duel_right_id !== id) continue;
      const oppId = left ? d.duel_right_id : d.duel_left_id;
      const own = left ? d.left_share_expressed_mean : d.right_share_expressed_mean;
      const opp = left ? d.right_share_expressed_mean : d.left_share_expressed_mean;
      if (own == null || opp == null) continue;
      const prev = best.get(oppId);
      if (!prev || (d.p_duel ?? 0) > prev.p) best.set(oppId, { opponent: names.get(oppId) ?? oppId, own, opp, p: d.p_duel ?? 0 });
    }
  }
  return [...best.values()].sort((a, b) => b.p - a.p);
}

export function candidateCardInput(c: CandidateProfile, lang: Lang, latest: any, all: CandidateProfile[]): CandidateCardInput {
  const names = new Map(all.map((x) => [x.id, x.name]));
  for (const s of latest.scenarios ?? []) for (const q of s.qualification ?? []) if (!names.has(q.candidate_id)) names.set(q.candidate_id, q.candidate_name);
  return {
    name: c.name,
    party: blocLabel(c.bloc, lang, c.partyFamily),
    status: statusLabel(c.status, lang),
    color: blocHex(c.bloc),
    bestMean: c.bestMean,
    nScenarios: c.activeScenarios,
    pTop2: c.bestPTop2,
    duels: c.archived ? [] : duelsOf(c.id, latest.scenarios ?? [], names),
    runDate: latest.meta.run_date,
  };
}
