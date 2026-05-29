/**
 * US House adapter — feeds the unified RidingPage with district-level data.
 *
 * Reads:
 *   web_data/us-house/ridings.json       (BSTS projection: vote_mean, win_prob, rating)
 *   web_data/us-house/members.json       (FEC incumbent flag — sitting reps)
 *   web_data/us-house/candidates_2026.json  (all 2026 House filings — 1990 candidates)
 *   web_data/us-house/primaries.json     (NYT primary polls — 48 districts)
 *   web_data/us-house/redistricting.json (105 fragmented new districts)
 *   web_data/us-house/centroids.json     (per-district centroid for neighbors)
 *   web_data/us-house/shapes.json        (per-district SVG path for hero map)
 *
 * Notes:
 * - Projection uses 3 party buckets (us_dem / us_rep / us_oth) but candidates
 *   keep their FEC party_raw (GRE, LIB, IND…) for editorial display.
 * - History snapshots not yet archived per-date by the US pipeline; same
 *   limitation as UK — ProjectionHistory hidden until pipeline upgrade.
 * - Centroids/shapes optional: if absent we degrade to no-map, no-neighbors
 *   (slot pattern).
 */
import type {
  RidingData, RidingMember, RidingCandidate, RidingNeighbor, RidingPoll,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import { getLocalPollsByRiding, type PollRow } from '../polls-adapter';
import ridingsSource from '../../../web_data/us-house/ridings.json';
import membersSource from '../../../web_data/us-house/members.json';
import candidatesSource from '../../../web_data/us-house/candidates_2026.json';
import primariesSource from '../../../web_data/us-house/primaries.json';
import redistrictingSource from '../../../web_data/us-house/redistricting.json';
import historyIndex from '../../../web_data/us-house/history/index.json';

type RawRiding = {
  riding_id: string;
  name_en: string;
  name_fr: string;
  province: string;
  region: string;
  urban_rural: string;
  projection: {
    winner: string;
    p_winner: number;
    mean_margin: number;
    p_close_race: number;
    vote_mean: Record<string, number>;
    win_prob: Record<string, number>;
    projection_cycle: string;
    rating?: { code: string; label_en: string; label_fr: string };
  };
  baseline_result?: {
    winner?: string;
    margin?: number;
    [key: string]: number | string | undefined;
  };
  baseline_cycle?: string;
};

const ridings = (ridingsSource as { ridings: RawRiding[]; meta: { run_date: string } }).ridings;
const META = (ridingsSource as { meta: { run_date: string } }).meta;
const members = membersSource as Record<string, RidingMember | undefined>;
const candidatesByRiding = candidatesSource as Record<string, Array<{ name: string; party_code: string; party_raw: string; ici_status: string; filing_status: string; fec_id: string }>>;
const primariesByRiding = primariesSource as Record<string, RidingData['primaries']>;
const redistrictingByRiding = redistrictingSource as Record<string, RidingData['redistrictingImpact']>;
const RIDINGS_WITH_HISTORY = new Set((historyIndex as { ridings_with_history: string[] }).ridings_with_history);

/**
 * District-level polls, keyed by the engine's de-padded riding_id. The polls
 * export strips leading zeros from state FIPS ("06011" → "6011", "31001" stays),
 * so we look up by `String(Number(riding_id))`. At-large seats (AK "02000" vs
 * poll geography "2001") don't reconcile and stay unmatched — a known quirk,
 * not worth special-casing for one district.
 */
const LOCAL_POLLS_BY_RIDING = getLocalPollsByRiding('us-house');

/** Map an engine PollRow to the trimmed RidingPoll the LocalPolls row needs. */
function adaptPoll(p: PollRow): RidingPoll {
  return {
    poll_id: p.poll_id,
    firm_name: p.firm_name,
    field_start: p.field_start,
    field_end: p.field_end,
    display_date: p.display_date,
    release_date: p.release_date,
    sample_size: p.sample_size,
    population: p.population,
    client: p.client,
    source_url: p.source_url,
    topline: p.topline,
  };
}

/** District polls for a riding (already sorted field_end desc by the adapter). */
function adaptPolls(rid: string): RidingPoll[] | undefined {
  const rows = LOCAL_POLLS_BY_RIDING[String(Number(rid))];
  if (!rows || rows.length === 0) return undefined;
  return rows.map(adaptPoll);
}

/** National vote_mean by party (unweighted mean across 435 districts). */
const NATIONAL_VOTE_MEAN: Record<string, number> = (() => {
  const buckets: Record<string, { sum: number; n: number }> = {};
  for (const r of ridings) {
    for (const [code, v] of Object.entries(r.projection?.vote_mean ?? {})) {
      if (typeof v !== 'number' || v <= 0) continue;
      buckets[code] ??= { sum: 0, n: 0 };
      buckets[code].sum += v;
      buckets[code].n += 1;
    }
  }
  const out: Record<string, number> = {};
  for (const [code, { sum, n }] of Object.entries(buckets)) out[code] = sum / n;
  return out;
})();

function projectionTone(p: { p_winner: number; p_close_race: number }): RidingNeighbor['tone'] {
  if (p.p_close_race >= 0.35) return 'tossup';
  if (p.p_close_race >= 0.15) return 'competitive';
  if (p.p_winner >= 0.85) return 'safe';
  return 'leaning';
}

/** US House doesn't ship centroids yet; neighbors degrade to same-state list. */
function buildNeighbors(rid: string, state: string): RidingNeighbor[] {
  const sameState = ridings
    .filter((r) => r.riding_id !== rid && r.province === state)
    .slice(0, 6);
  return sameState.map((r) => {
    const slug = ridingSlug(r.riding_id, r.name_en || r.name_fr);
    return {
      id: r.riding_id,
      slug,
      name_en: r.name_en,
      name_fr: r.name_fr,
      href_en: `/en/us/house/districts/${slug}/`,
      href_fr: `/fr/us/chambre/districts/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

/** Build a RidingMember from FEC import data, mapping our minimal fields. */
function adaptMember(rid: string): RidingMember | undefined {
  const raw = members[rid];
  if (!raw) return undefined;
  return {
    mp_name: raw.mp_name,
    party_current: raw.party_current,
    party_elected: raw.party_current,  // FEC ICI='I' implies elected with current party
    seat_status: raw.seat_status ?? 'current',
    source: raw.source,
  };
}

/** Map FEC-format candidates to the unified RidingCandidate shape. */
function adaptCandidates(rid: string): RidingCandidate[] | undefined {
  const list = candidatesByRiding[rid];
  if (!list || list.length === 0) return undefined;
  return list.map((c) => ({
    name: c.name,
    party_code: c.party_code,
    party_raw: c.party_raw,
    // FEC ICI='I' marks the candidate as the sitting incumbent in this seat —
    // not "elected in the upcoming race", but closest editorial proxy until
    // the race is run. Surfaced as a badge by CandidatesTable.
    is_elected: c.ici_status === 'I',
  }));
}

function adaptOne(raw: RawRiding): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_en || raw.name_fr);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('us-house', code);
      return {
        code,
        label_en: meta.label_en,
        label_fr: meta.label_fr,
        color: meta.color,
        vote_mean_pct: raw.projection.vote_mean[code] ?? 0,
        win_prob: raw.projection.win_prob[code] ?? 0,
      };
    })
    .filter((p) => p.vote_mean_pct > 0)
    .sort((a, b) => b.vote_mean_pct - a.vote_mean_pct);

  const baselinePcts: Record<string, number> = {};
  if (raw.baseline_result) {
    for (const [k, v] of Object.entries(raw.baseline_result)) {
      const m = /^(.+)_pct$/.exec(k);
      if (m && typeof v === 'number' && v > 0) baselinePcts[m[1]] = v;
    }
  }
  const baseline = raw.baseline_cycle && raw.baseline_result
    ? {
        cycle: raw.baseline_cycle,
        winner: String(raw.baseline_result.winner ?? ''),
        margin: Number(raw.baseline_result.margin ?? 0),
        party_pcts: baselinePcts,
      }
    : undefined;

  return {
    id: raw.riding_id,
    slug,
    jurisdiction: 'us-house',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr || raw.name_en },
    province: raw.province,
    region: raw.region,
    urban_rural: raw.urban_rural,
    parties,
    projection: {
      winner: raw.projection.winner,
      p_winner: raw.projection.p_winner,
      mean_margin: raw.projection.mean_margin,
      p_close_race: raw.projection.p_close_race,
      cycle: raw.projection.projection_cycle,
    },
    baseline,
    member: adaptMember(raw.riding_id),
    candidates: adaptCandidates(raw.riding_id),
    polls: adaptPolls(raw.riding_id),
    primaries: primariesByRiding[raw.riding_id],
    redistrictingImpact: redistrictingByRiding[raw.riding_id],
    runDate: META.run_date,
    hasProjectionHistory: RIDINGS_WITH_HISTORY.has(raw.riding_id),
    neighbors: buildNeighbors(raw.riding_id, raw.province),
    regionalContext: {
      province: {},   // state-level rollup TBD
      national: NATIONAL_VOTE_MEAN,
      totalSeats: 435,
    },
  };
}

export function getAllUSHouseRidings(): RidingData[] {
  return ridings.map(adaptOne);
}

export function getUSHouseRiding(id: string): RidingData | undefined {
  const raw = ridings.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}
