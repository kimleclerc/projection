/**
 * Polls adapter — feeds the unified PollsHub / PollPage components for every
 * jurisdiction that ships a `web_data/<web_key>/polls/` bundle from the engine.
 *
 * Reads (eagerly, at build):
 *   web_data/<web_key>/polls/index.json   { meta, polls[] }  — every poll, topline-level
 *   web_data/<web_key>/polls/firms.json   firm roster (counts, latest field date)
 *   web_data/<web_key>/polls/<poll_id>.json  detail file (ONLY polls with breakdowns)
 *
 * Engine contract (cf. project memory votescope-polls-vertical):
 * - `poll.geography` present  → LOCAL poll → belongs as a ROW inside a district
 *   forecast page (NYT/Upshot model), never its own page.
 * - `poll.geography` absent    → NATIONAL / big-regional poll → eligible for the hub.
 * - `poll.has_detail === true` → a detail file exists (poll has breakdowns) → it
 *   can earn a dedicated rich page. Topline-only polls stay as hub rows (keeps
 *   us out of AdSense thin-content territory).
 *
 * The engine stays exhaustive and dumb (pure JSON export); all page-vs-row
 * routing lives here on the site, in one place, for every jurisdiction.
 */

export type PollTopline = Record<string, number>;

export interface PollGeography {
  level?: string;
  province?: string;
  region?: string;
  riding_id?: string;
  district?: string;
  seat_name?: string;
  stage?: string;
}

export interface PollRow {
  poll_id: string;
  firm: string;
  firm_name: string;
  release_date: string;
  field_start?: string | null;
  field_end?: string | null;
  display_date?: string | null;
  sample_size?: number | null;
  population?: string | null;
  method?: string | null;
  client?: string | null;
  source_url?: string | null;
  topline: PollTopline;
  has_breakdowns: boolean;
  dimensions: string[];
  geography?: PollGeography;
  has_detail: boolean;
}

export interface PollsMeta {
  election_cycle: string;
  web_key: string;
  run_date: string;
  n_polls: number;
  n_with_breakdowns: number;
  parties: string[];
  latest_field_end?: string;
}

export interface PollsIndex {
  meta: PollsMeta;
  polls: PollRow[];
}

export interface PollFirm {
  firm: string;
  firm_name: string;
  n_polls?: number;
  latest_field_end?: string;
  poll_ids?: string[];
  profile?: Record<string, unknown>;
  [k: string]: unknown;
}

/** One poll point in the trend series (matches VoteTrendChart's PollSnapshot). */
export interface PollSnapshot {
  date: string;
  firm?: string;
  n?: number;
  weight?: number | null;
  [partyKey: string]: string | number | null | undefined;
}

export interface TrendParty {
  party: string;
  label_en: string;
  label_fr: string;
  color: string;
  vote_mean: number;
  vote_ci_low_95: number;
  vote_ci_high_95: number;
}

export interface TrendBundle {
  pollsHistory: PollSnapshot[];
  trendParties: TrendParty[];
  trendOrder: string[];
}

/** Optional breakdown detail — shape mirrors the engine's per-dimension export. */
export interface PollDetail extends PollRow {
  breakdowns?: Record<
    string,
    Array<{ group: string; sample_size?: number | null; topline: PollTopline }>
  >;
}

// --- eager glob loads (build-time, no runtime fetch) ----------------------

const INDEXES = import.meta.glob<{ default: PollsIndex }>(
  '../../web_data/*/polls/index.json',
  { eager: true },
);
const FIRMS = import.meta.glob<{ default: PollFirm[] | Record<string, PollFirm> }>(
  '../../web_data/*/polls/firms.json',
  { eager: true },
);
const DETAILS = import.meta.glob<{ default: PollDetail }>(
  '../../web_data/*/polls/!(index|firms).json',
  { eager: true },
);
const LATEST = import.meta.glob<{ default: Record<string, unknown> }>(
  '../../web_data/*/latest.json',
  { eager: true },
);

/** Extract `<web_key>` from any `.../web_data/<web_key>/…` path. */
function webKeyFromPath(path: string): string {
  const m = /web_data\/([^/]+)\//.exec(path);
  return m ? m[1] : '';
}

const INDEX_BY_KEY: Record<string, PollsIndex> = {};
for (const [path, mod] of Object.entries(INDEXES)) {
  INDEX_BY_KEY[webKeyFromPath(path)] = mod.default;
}

const FIRMS_BY_KEY: Record<string, PollFirm[]> = {};
for (const [path, mod] of Object.entries(FIRMS)) {
  const raw = mod.default as PollFirm[] | { firms?: PollFirm[] };
  // Engine ships `{ "firms": [...] }`; tolerate a bare array or a keyed map too.
  FIRMS_BY_KEY[webKeyFromPath(path)] = Array.isArray(raw)
    ? raw
    : (raw.firms ?? (Object.values(raw) as PollFirm[]));
}

const LATEST_BY_KEY: Record<string, Record<string, unknown>> = {};
for (const [path, mod] of Object.entries(LATEST)) {
  LATEST_BY_KEY[webKeyFromPath(path)] = mod.default;
}

const DETAIL_BY_KEY: Record<string, Record<string, PollDetail>> = {};
for (const [path, mod] of Object.entries(DETAILS)) {
  const key = webKeyFromPath(path);
  (DETAIL_BY_KEY[key] ??= {})[mod.default.poll_id] = mod.default;
}

// --- public API -----------------------------------------------------------

/** Web keys that actually ship a polls bundle. */
export function getPollsJurisdictions(): string[] {
  return Object.keys(INDEX_BY_KEY).sort();
}

export function getPollsIndex(webKey: string): PollsIndex | undefined {
  return INDEX_BY_KEY[webKey];
}

export function getPollsMeta(webKey: string): PollsMeta | undefined {
  return INDEX_BY_KEY[webKey]?.meta;
}

export function getFirms(webKey: string): PollFirm[] {
  return FIRMS_BY_KEY[webKey] ?? [];
}

/** National / big-regional polls (no geography) — the hub's content. */
export function getNationalPolls(webKey: string): PollRow[] {
  const idx = INDEX_BY_KEY[webKey];
  if (!idx) return [];
  return idx.polls
    .filter((p) => !p.geography)
    .slice()
    .sort(byFieldEndDesc);
}

/** Local / district polls (have geography) — feed district forecast pages. */
export function getLocalPolls(webKey: string): PollRow[] {
  const idx = INDEX_BY_KEY[webKey];
  if (!idx) return [];
  return idx.polls.filter((p) => !!p.geography).slice().sort(byFieldEndDesc);
}

/** Local polls keyed by district riding_id — for joining into district pages. */
export function getLocalPollsByRiding(webKey: string): Record<string, PollRow[]> {
  const out: Record<string, PollRow[]> = {};
  for (const p of getLocalPolls(webKey)) {
    const rid = p.geography?.riding_id;
    if (!rid) continue;
    (out[rid] ??= []).push(p);
  }
  return out;
}

/** Polls that earned a dedicated detail page (breakdowns present, no geography). */
export function getDetailablePolls(webKey: string): PollRow[] {
  return getNationalPolls(webKey).filter((p) => p.has_detail);
}

export function getPollDetail(webKey: string, pollId: string): PollDetail | undefined {
  return DETAIL_BY_KEY[webKey]?.[pollId];
}

/**
 * Trend bundle for the polls chart — reuses the same `parties` (model estimate
 * + 95% CI) and `polls_history` series that the jurisdiction projection page
 * already feeds to VoteTrendChart, so the hub chart matches the projection one.
 */
export function getPollsTrend(webKey: string): TrendBundle | undefined {
  const d = LATEST_BY_KEY[webKey];
  if (!d) return undefined;
  const parties = (d.parties as Array<Record<string, unknown>>) ?? [];
  const trendParties: TrendParty[] = parties.map((p) => ({
    party: String(p.party),
    label_en: String(p.label_en ?? p.party),
    label_fr: String(p.label_fr ?? p.party),
    color: String(p.color ?? '#999'),
    vote_mean: Number(p.vote_mean ?? 0),
    vote_ci_low_95: Number(p.vote_ci_low_95 ?? p.vote_mean ?? 0),
    vote_ci_high_95: Number(p.vote_ci_high_95 ?? p.vote_mean ?? 0),
  }));
  const trendOrder = trendParties
    .map((p) => p.party)
    .filter((k) => !/_oth$/.test(k))
    .slice(0, 5);
  const pollsHistory: PollSnapshot[] = (
    (d.polls_history as Array<Record<string, unknown>>) ?? []
  ).map((poll) => ({
    ...(poll as PollSnapshot),
    date: String(poll.date ?? poll.field_end ?? poll.release_date ?? ''),
    n: (poll.n ?? poll.sample_size) as number | undefined,
  }));
  return { pollsHistory, trendParties, trendOrder };
}

function byFieldEndDesc(a: PollRow, b: PollRow): number {
  const da = a.field_end || a.display_date || a.release_date || '';
  const db = b.field_end || b.display_date || b.release_date || '';
  return db.localeCompare(da);
}
