/**
 * Soirée québécoise : état partagé entre les blocs de la page de résultats.
 *
 * Un seul îlot lit le direct (QuebecElectionNightLive) ; il publie ici chaque
 * instantané. La carte, les annonces et la liste s'abonnent sans jamais faire
 * de requête : la page coûte le même nombre de lectures qu'avant, quel que soit
 * le nombre de blocs. Les îlots partagent ce module (même morceau JS), donc le
 * même état.
 */
import { useEffect, useState } from 'preact/hooks';

export type Locale = 'en' | 'fr' | 'es';
export type Candidate = { candidate_name: string; party_code: string; votes: number; vote_pct: number };
export type Result = {
  riding_id: string; slug?: string; name?: string;
  polls?: { reported?: number | null; total?: number | null; pct?: number | null };
  ballots_counted?: number; registered_electors?: number; candidates: Candidate[];
};
export type Call = { riding_id: string; party_code: string; candidate_name: string; called_at?: string;
  source_anomalies_overridden?: boolean };
export type ProjCandidate = { party_code: string; candidate_name?: string | null; color?: string; party_label?: Partial<Record<Locale, string>> };
export type Projection = { riding_id: string; candidates: ProjCandidate[] };
export type LivePayload = {
  sequence?: number; generated_at?: string;
  event?: { id?: string; mode?: string; election_date?: string };
  source?: { source_updated_at?: string | null; healthy?: boolean; anomaly_count?: number; url?: string };
  results: Result[]; calls?: Call[]; projections?: Projection[];
};

export type LiveState = { data: LivePayload | null; beforeOpen: boolean; failed: boolean };

let state: LiveState = { data: null, beforeOpen: true, failed: false };
const listeners = new Set<(s: LiveState) => void>();

export function publishLive(next: LiveState) {
  state = next;
  for (const l of listeners) l(state);
}

export function useLive(): LiveState {
  const [s, set] = useState<LiveState>(state);
  useEffect(() => {
    listeners.add(set);
    set(state);
    return () => { listeners.delete(set); };
  }, []);
  return s;
}

export type Row = {
  id: string; name: string; leader: Candidate | null; runnerUp: Candidate | null; call: Call | null;
  party: string | null; polls?: Result['polls']; margin: number | null;
};

/** Une ligne par circonscription : meneur (tri explicite), appel, écart. */
export function deriveRows(data: LivePayload | null): Row[] {
  const calls = new Map((data?.calls ?? []).map((c) => [c.riding_id, c]));
  return (data?.results ?? []).map((r) => {
    const sorted = [...(r.candidates ?? [])].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    const leader = sorted[0] && (sorted[0].votes ?? 0) > 0 ? sorted[0] : null;
    const runnerUp = leader && sorted[1] ? sorted[1] : null;
    const call = calls.get(r.riding_id) ?? null;
    const party = call?.party_code ?? leader?.party_code ?? null;
    return { id: r.riding_id, name: r.name ?? r.riding_id, leader, runnerUp, call, party, polls: r.polls,
      margin: leader && runnerUp ? (leader.vote_pct ?? 0) - (runnerUp.vote_pct ?? 0) : null };
  });
}

export function numFmt(v: number, locale: Locale, digits = 1): string {
  return v.toLocaleString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA',
    { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function timeFmt(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA',
    { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' });
}

/** Informations statiques par parti, passées au build (couleurs, noms). */
export type PartyInfo = { code: string; color: string; label: string };
/** Informations statiques par circonscription, jointes au build. */
export type RidingInfo = { id: string; name: string; href: string; region: string; winner2022: string | null; projected: string | null };
