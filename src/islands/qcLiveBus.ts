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
  /** Appels d'ensemble faits à la main (gouvernement, majorité, minorité), datés. */
  national_calls?: NationalCall[];
};
export type NationalCall = { kind: 'government' | 'majority' | 'minority'; party?: string | null; called_at: string };

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
export type RidingInfo = { id: string; name: string; href: string; region: string; winner2022: string | null; projected: string | null;
  /** Parti qui détient la circonscription à la dissolution (sortant ; indépendant → 2022). */
  holder?: string | null;
  /** Député sortant : nom et genre (f/m). */
  mna?: { name?: string | null; last?: string | null; first?: string | null; g?: 'f' | 'm' | null } | null;
  /** Genre des candidats 2026 par parti. */
  gender?: Record<string, 'f' | 'm'>;
};

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim();

/** Le gagnant appelé est-il le député sortant ? Nom de famille et prénom présents dans le nom publié. */
export function isIncumbent(call: Call | null, info?: RidingInfo): boolean {
  const m = info?.mna;
  if (!call || !m?.last) return false;
  const words = new Set(fold(call.candidate_name ?? '').split(' '));
  const last = fold(m.last).split(' ').filter(Boolean);
  const first = fold(m.first ?? '').split(' ')[0];
  return last.length > 0 && last.every((w) => words.has(w)) && (!first || words.has(first));
}

export type Outcome = { kind: 'reelected' | 'elected' | 'gain'; g: 'f' | 'm' | null; from?: string | null };

/** Réélu·e (le sortant), élu·e (même parti, nouveau visage) ou gain (la circonscription change de parti). */
export function outcomeOf(call: Call | null, info?: RidingInfo): Outcome | null {
  if (!call) return null;
  if (isIncumbent(call, info)) return { kind: 'reelected', g: info?.mna?.g ?? null };
  const g = info?.gender?.[call.party_code] ?? null;
  const holder = info?.holder ?? info?.winner2022 ?? null;
  if (holder && holder !== call.party_code) return { kind: 'gain', g, from: holder };
  return { kind: 'elected', g };
}

const OUTCOME_LABELS: Record<Locale, Record<Outcome['kind'], [string, string, string]>> = {
  fr: { reelected: ['Réélu', 'Réélue', 'Réélu·e'], elected: ['Élu', 'Élue', 'Élu'], gain: ['Gain', 'Gain', 'Gain'] },
  en: { reelected: ['Re-elected', 'Re-elected', 'Re-elected'], elected: ['Elected', 'Elected', 'Elected'], gain: ['Gain', 'Gain', 'Gain'] },
  es: { reelected: ['Reelecto', 'Reelecta', 'Reelecto/a'], elected: ['Electo', 'Electa', 'Electo/a'], gain: ['Ganancia', 'Ganancia', 'Ganancia'] },
};
export function outcomeLabel(o: Outcome, locale: Locale): string {
  const v = OUTCOME_LABELS[locale][o.kind];
  return o.g === 'm' ? v[0] : o.g === 'f' ? v[1] : v[2];
}

export const MAJORITY = 64;
export const TOTAL_SEATS = 127;
export type GovStatus = { kind: 'government' | 'majority' | 'minority'; party: string | null; at: string; manual: boolean };

/**
 * Appels d'ensemble, DÉDUITS des circonscriptions appelées et datés à l'appel
 * qui les a rendus certains : on rejoue les appels dans l'ordre et on note le
 * premier instant où
 *   - un parti ne peut plus être rattrapé pour le plus grand nombre de sièges
 *     → il formera le gouvernement ;
 *   - un parti a 64 sièges appelés → gouvernement majoritaire ;
 *   - plus aucun parti ne peut atteindre 64 → gouvernement minoritaire.
 * Les appels faits à la main (national_calls), plus précoces, s'ajoutent.
 */
export function governmentStatus(data: LivePayload | null): GovStatus[] {
  const out: GovStatus[] = [];
  const calls = [...(data?.calls ?? [])].filter((c) => c.called_at).sort((a, b) => (a.called_at ?? '').localeCompare(b.called_at ?? ''));
  const seats = new Map<string, number>();
  let decided = 0;
  let gov: string | null = null, maj = false, minority = false;
  for (const c of calls) {
    seats.set(c.party_code, (seats.get(c.party_code) ?? 0) + 1);
    decided += 1;
    const open = TOTAL_SEATS - decided;
    const ranked = [...seats.entries()].sort((a, b) => b[1] - a[1]);
    const [top, n] = ranked[0];
    const second = ranked[1]?.[1] ?? 0;
    if (!gov && n > second + open) { gov = top; out.push({ kind: 'government', party: top, at: c.called_at!, manual: false }); }
    if (!maj && n >= MAJORITY) { maj = true; out.push({ kind: 'majority', party: top, at: c.called_at!, manual: false }); }
    if (!maj && !minority && ranked.every(([, k]) => k + open < MAJORITY)) {
      minority = true; out.push({ kind: 'minority', party: gov, at: c.called_at!, manual: false });
    }
  }
  for (const m of data?.national_calls ?? []) out.push({ kind: m.kind, party: m.party ?? null, at: m.called_at, manual: true });
  // Un même appel, manuel puis déduit : on garde le plus tôt.
  const best = new Map<string, GovStatus>();
  for (const s of out) {
    const k = s.kind;
    const prev = best.get(k);
    if (!prev || s.at < prev.at || (!prev.party && s.party)) best.set(k, prev && !s.party ? { ...s, party: prev.party } : s);
  }
  return [...best.values()].sort((a, b) => a.at.localeCompare(b.at));
}
