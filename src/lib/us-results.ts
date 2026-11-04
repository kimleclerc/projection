/**
 * Résultats du 3 novembre 2026, lus dans live.json (ou sa copie de repli,
 * src/data/us-results-snapshot.json) : la fiche d'une course, le décompte des
 * sièges appelés par chambre, les bascules. Rien n'est recalculé du côté du
 * moteur : on lit `results`, `calls`, `projections` et `national_calls`.
 */
import { useEffect, useState } from 'preact/hooks';
import { deriveUsRows, raceStatus, showsNumbers, votesCounted, CHAMBER_PREFIX, type Chamber, type RaceStatus, type UsLivePayload, type UsResult } from '../islands/usLive';
import { majorityCalls } from './us-majority';

export type Lang = 'fr' | 'en' | 'es';
export const CHAMBERS: Chamber[] = ['house', 'senate', 'governor'];

// ─── Lecture ────────────────────────────────────────────────────────────────

function isPayload(v: unknown): v is UsLivePayload {
  const p = v as Partial<UsLivePayload> | null;
  return !!p && Array.isArray(p.results) && p.results.every((r) => typeof r?.riding_id === 'string');
}

/** Le premier live.json lisible parmi les adresses données, sinon null. */
export async function fetchLive(urls: string[]): Promise<UsLivePayload | null> {
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) continue;
      const p = await r.json();
      if (isPayload(p) && !p.source?.is_test_page) return p;
    } catch { /* adresse suivante */ }
  }
  return null;
}

/**
 * La vue `derive(payload)`, rendue d'abord depuis la copie de repli (`initial`),
 * puis remplacée à chaque lecture réussie du direct. Si le direct ne répond
 * pas, la copie reste affichée.
 */
export function useLiveView<T>(urls: string[], initial: T, derive: (p: UsLivePayload) => T, everyMs = 120_000): T {
  const [view, setView] = useState<T>(initial);
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const tick = async () => {
      const p = await fetchLive(urls);
      if (alive && p) { try { setView(derive(p)); } catch { /* on garde la vue précédente */ } }
      if (alive) timer = window.setTimeout(tick, everyMs);
    };
    tick();
    return () => { alive = false; window.clearTimeout(timer); };
  }, [urls.join('|')]);
  return view;
}

export const liveJsonUrl = (base: string, eventId = 'us-2026-11-03') => `${base.replace(/\/$/, '')}/api/v1/elections/${eventId}/live.json`;

// ─── Une course ─────────────────────────────────────────────────────────────

export type RaceCandidate = { name: string; party: string; votes: number; pct: number };
export type RaceView = {
  id: string;
  status: RaceStatus;
  call: { party: string; candidate: string; at: string | null } | null;
  /** Candidats par voix décroissantes ; vide quand les chiffres ne sont pas affichables. */
  candidates: RaceCandidate[];
  reportedPct: number | null;
  votes: number;
  sourceUrl: string | null;
  /** Écart démocrates moins républicains, en points : décompte, et notre projection. */
  liveDR: number | null;
  projDR: number | null;
};

const pctOf = (list: { party_code: string; vote_pct?: number; mean?: number }[], party: string, key: 'vote_pct' | 'mean') => {
  const v = list.find((c) => c.party_code === party)?.[key];
  return typeof v === 'number' ? v : null;
};

export function raceView(p: UsLivePayload | null, id: string): RaceView | null {
  const r = p?.results.find((x) => x.riding_id === id) as UsResult | undefined;
  if (!r) return null;
  const c = p?.calls?.find((x) => x.riding_id === id) ?? null;
  const status = raceStatus(r, p, c);
  const numbers = showsNumbers(status);
  const candidates = numbers
    ? [...(r.candidates ?? [])].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
      .map((x) => ({ name: x.candidate_name, party: x.party_code, votes: x.votes ?? 0, pct: x.vote_pct ?? 0 }))
    : [];
  const counted = numbers && votesCounted(r) > 0;
  const d = counted ? pctOf(r.candidates ?? [], 'us_dem', 'vote_pct') : null;
  const rep = counted ? pctOf(r.candidates ?? [], 'us_rep', 'vote_pct') : null;
  const proj = (p?.projections ?? []).find((x) => x.riding_id === id)?.candidates as { party_code: string; mean?: number }[] | undefined;
  const pd = proj ? pctOf(proj, 'us_dem', 'mean') : null;
  const pr = proj ? pctOf(proj, 'us_rep', 'mean') : null;
  const both = d !== null && rep !== null && pd !== null && pr !== null;
  return {
    id, status,
    call: c ? { party: c.party_code, candidate: c.candidate_name, at: c.called_at ?? null } : null,
    candidates: counted ? candidates : [],
    reportedPct: numbers ? (r.polls?.pct ?? null) : null,
    votes: counted ? votesCounted(r) : 0,
    sourceUrl: (r as { source_url?: string | null }).source_url ?? null,
    liveDR: both ? d! - rep! : null,
    projDR: both ? pd! - pr! : null,
  };
}

/** Le seul morceau du live.json dont une page de course a besoin (pour la copie de repli). */
export function raceSlice(p: UsLivePayload, id: string): UsLivePayload {
  const r = p.results.find((x) => x.riding_id === id) as UsResult | undefined;
  const st = r?.state ?? null;
  const states = p.source?.states;
  return {
    ...p,
    results: r ? [r] : [],
    calls: (p.calls ?? []).filter((c) => c.riding_id === id),
    projections: (p.projections ?? []).filter((x) => x.riding_id === id),
    national_calls: [],
    source: { ...(p.source ?? {}), states: states && st && states[st] ? { [st]: states[st] } : states ? {} : undefined },
  } as UsLivePayload;
}

/** Lien de la source, sans la mention entre parenthèses que le moteur y ajoute. */
export function sourceLink(url: string | null): { href: string; host: string } | null {
  if (!url) return null;
  const href = url.replace(/\s*\(.*\)\s*$/, '').trim();
  try { return { href, host: new URL(href).hostname.replace(/^www\./, '') }; } catch { return null; }
}

// ─── L'ensemble ─────────────────────────────────────────────────────────────

export type ChamberCount = {
  /** Courses appelées par parti, cette année. */
  called: Record<string, number>;
  /** Sièges non renouvelés cette année (Sénat, gouverneurs). */
  holdover: Record<string, number>;
  calledRaces: number;
  races: number;
};

export type Flip = { id: string; from: string; to: string; candidate: string };

export type HomeView = {
  counts: Record<Chamber, ChamberCount>;
  flips: Flip[];
  majorities: { chamber: 'house' | 'senate'; side: 'dem' | 'rep'; at: string }[];
  generatedAt: string | null;
};

export type HomeContext = {
  holdovers: Record<Chamber, Record<string, number>>;
  /** Parti sortant par course (`H-01001` : `us_rep`). */
  prior: Record<string, string>;
};

export function homeView(p: UsLivePayload, ctx: HomeContext): HomeView {
  const counts = {} as Record<Chamber, ChamberCount>;
  const flips: Flip[] = [];
  for (const ch of CHAMBERS) {
    const rows = deriveUsRows(p, ch);
    const called: Record<string, number> = {};
    let n = 0;
    for (const row of rows) {
      if (!row.call) continue;
      n += 1;
      called[row.call.party_code] = (called[row.call.party_code] ?? 0) + 1;
      const was = ctx.prior[row.id];
      if (was && was !== row.call.party_code) flips.push({ id: row.id, from: was, to: row.call.party_code, candidate: row.call.candidate_name });
    }
    counts[ch] = { called, holdover: ctx.holdovers[ch] ?? {}, calledRaces: n, races: rows.length };
  }
  const order = (id: string) => CHAMBERS.indexOf(CHAMBERS.find((c) => id.startsWith(CHAMBER_PREFIX[c]))!);
  flips.sort((a, b) => order(a.id) - order(b.id) || a.id.localeCompare(b.id));
  return { counts, flips, majorities: majorityCalls(p.national_calls), generatedAt: p.generated_at ?? null };
}

export const seatsOf = (c: ChamberCount, party: string, withHoldover: boolean) => (c.called[party] ?? 0) + (withHoldover ? c.holdover[party] ?? 0 : 0);

// ─── Mise en forme ──────────────────────────────────────────────────────────

const LOC: Record<Lang, string> = { fr: 'fr-CA', en: 'en-US', es: 'es-ES' };
export const num = (n: number, lang: Lang, digits = 0) => n.toLocaleString(LOC[lang], { maximumFractionDigits: digits, minimumFractionDigits: digits });
export const pct = (n: number, lang: Lang) => (lang === 'en' ? `${num(n, lang, 1)}%` : `${num(n, lang, 1)} %`);
export const drLabel = (v: number, lang: Lang) => `${v >= 0 ? 'D' : 'R'} +${num(Math.abs(v), lang, 1)}`;

/** Heure de l'Est : « 21 h 14 », « 9:14 p.m. », « 21:14 ». */
export function etTime(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const h = Number(parts.find((x) => x.type === 'hour')?.value ?? 0);
  const m = parts.find((x) => x.type === 'minute')?.value ?? '00';
  if (lang === 'en') return `${h % 12 || 12}:${m} ${h < 12 ? 'a.m.' : 'p.m.'}`;
  return lang === 'fr' ? `${h} h ${m}` : `${String(h).padStart(2, '0')}:${m}`;
}

/** Jour et heure de l'Est, pour la mention « chiffres à » : « 4 novembre, 8 h 58 ». */
export function etStamp(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = d.toLocaleDateString(LOC[lang], { day: 'numeric', month: 'long', timeZone: 'America/New_York' });
  return `${day}, ${etTime(iso, lang)}`;
}
