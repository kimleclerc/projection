// Adaptateur données pour les pages par candidat (France 2027).
// getStaticPaths génère une page par candidat déclaré/probable depuis
// web_data — profil (stats de sondage), duels, scénarios. Même esprit que
// lib/riding-adapters pour les circonscriptions QC.
import latest from '../../web_data/france-presidential/latest.json';
import dataSheets from '../../web_data/france-presidential/data_sheets.json';
import polls from '../../web_data/france-presidential/polls.json';
import { observedPolling, type PollRow } from './fr-candidate-metrics';
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
  profile_visible?: boolean;
  status_reviewed_on?: string | null;
  status_source_url?: string | null;
  status_note?: string;
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
  probability: number;
}

export interface CandidateProfile {
  id: string;
  slug: string;
  name: string;
  shortLabel: string;
  bloc: string;
  partyFamily: string;
  status: string;
  polling: ReturnType<typeof observedPolling>;
  runDate: string;
  statusReviewedOn: string | null;
  statusSource: string | null;
  statusNote: string;
  archived: boolean;
  bestMean: number | null;
  bestPTop2: number | null;
  activeScenarios: number;
  featuredScenarios: number;
  bio: { fr: string; en: string; es: string } | null;
  duels: CandidateDuel[];
}

const RANK: Record<string, number> = { declared: 0, probable: 1, primary: 2, testing: 3 };
const INACTIVE = new Set(['withdrawn', 'primary_lost', 'declined']);

function buildProfiles(): CandidateProfile[] {
  const cands = ((dataSheets as any).candidates ?? []) as RawCandidate[];
  const scenarios = (latest as any).scenarios as any[];

  // Duels par candidat, dérivés des top_duels des scénarios vedettes (parts
  // toujours présentes, contrairement aux duels sans sondage).
  const duelsByCandidate = new Map<string, CandidateDuel[]>();
  const nameById = new Map<string, string>();
  for (const c of cands) nameById.set(c.candidate_id, c.candidate_name);

  for (const s of scenarios) {
    if (!s.scenario.featured) continue;
    for (const d of s.duels ?? []) {
      if (!Number.isFinite(d.left_share_expressed_mean) || !Number.isFinite(d.right_share_expressed_mean)) continue;
      const label = s.scenario.public_label || s.scenario.scenario_name;
      const add = (ownId: string, ownShare: number, oppId: string, oppShare: number) => {
        const list = duelsByCandidate.get(ownId) ?? [];
        const previous = list.findIndex(x => x.opponentId === oppId);
        if (previous >= 0 && list[previous].probability >= (d.p_duel ?? 0)) return;
        const item = {opponentId: oppId, opponentName: nameById.get(oppId) ?? oppId,
          scenarioId: s.scenario.scenario_id, scenarioLabel: label, ownShare,
          opponentShare: oppShare, wins: ownShare >= oppShare, probability: d.p_duel ?? 0};
        if (previous >= 0) list[previous] = item; else list.push(item);
        duelsByCandidate.set(ownId, list);
      };
      add(d.duel_left_id, d.left_share_expressed_mean, d.duel_right_id, d.right_share_expressed_mean);
      add(d.duel_right_id, d.right_share_expressed_mean, d.duel_left_id, d.left_share_expressed_mean);
    }
  }
  return cands.map(c => {
    const polling = observedPolling(c.candidate_id, (polls as any).first_round as PollRow[], (latest as any).meta.run_date);
    const archived = INACTIVE.has(c.status);
    const qualification = archived ? [] : scenarios.filter(s => s.scenario.featured)
      .flatMap(s => s.qualification ?? []).filter(q => q.candidate_id === c.candidate_id);
    const best = [...qualification].sort((a, b) => b.p_top2 - a.p_top2 || b.first_round_mean - a.first_round_mean)[0];
    return {
      id: c.candidate_id, slug: slugify(c.candidate_name), name: c.candidate_name,
      shortLabel: c.short_label, bloc: c.bloc, partyFamily: c.party_family, status: c.status,
      polling, runDate: (latest as any).meta.run_date,
      statusReviewedOn: c.status_reviewed_on || null, statusSource: c.status_source_url || null,
      statusNote: c.status_note || '', archived,
      bestMean: best?.first_round_mean ?? null, bestPTop2: best?.p_top2 ?? null,
      activeScenarios: qualification.length, featuredScenarios: qualification.length,
      bio: CANDIDATE_BIOS[c.candidate_id] ?? null,
      duels: archived ? [] : (duelsByCandidate.get(c.candidate_id) ?? []).sort((a, b) => b.probability - a.probability),
      visible: c.profile_visible ?? ['declared', 'probable', 'primary', 'primary_lost'].includes(c.status),
    };
  }).filter(c => c.visible || (c.status === 'testing' && c.polling.hypotheses > 0))
    .sort((a, b) => (RANK[a.status] ?? 9) - (RANK[b.status] ?? 9) || (b.bestMean ?? 0) - (a.bestMean ?? 0));
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
const STATUS_PHRASE: Record<string, Record<Locale, string>> = {
  declared: {fr: 'a déclaré sa candidature', en: 'has declared a candidacy', es: 'ha declarado su candidatura'},
  probable: {fr: 'figure parmi les candidatures pressenties', en: 'is a potential candidate', es: 'figura entre las posibles candidaturas'},
  primary: {fr: 'participe à une primaire', en: 'is running in a primary', es: 'participa en unas primarias'},
  primary_lost: {fr: 'n’a pas remporté la primaire sociale-démocrate du 11 octobre 2026', en: 'did not win the social-democratic primary of 11 October 2026', es: 'no ganó las primarias socialdemócratas del 11 de octubre de 2026'},
  withdrawn: {fr: 'ne poursuit plus cette candidature', en: 'is no longer pursuing this candidacy', es: 'ya no mantiene esta candidatura'},
  declined: {fr: 'a exclu de se présenter', en: 'has ruled out running', es: 'ha descartado presentarse'},
  testing: {fr: 'est une hypothèse testée par les sondeurs; cela ne constitue pas une déclaration de candidature', en: 'is a hypothetical candidate tested by pollsters; this does not establish a declared candidacy', es: 'es una candidatura hipotética probada por encuestadores; esto no constituye una candidatura declarada'},
};
export function candidateProse(c: CandidateProfile, locale: Locale): string[] {
  const party = blocLabel(c.bloc, locale, c.partyFamily);
  const statement = `${c.name} (${party}) ${STATUS_PHRASE[c.status]?.[locale] || ''}.`;
  if (c.archived) return [statement, {fr: 'Cette fiche est conservée dans les archives de la campagne. Elle ne représente pas une candidature active.', en: 'This profile remains in the campaign archive and does not represent an active candidacy.', es: 'Esta ficha se conserva en el archivo de campaña y no representa una candidatura activa.'}[locale]];
  return [statement];
}
