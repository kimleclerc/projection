/**
 * US Senate adapter — 35 contested 2026 seats (out of 100 total).
 *
 * Reads:
 *   web_data/us-senate/latest.json       BSTS projection per state seat:
 *                                        vote_mean, win_prob, rating, baseline
 *   web_data/us-senate/members.json      sitting senators (W2 follow-up)
 *   web_data/us-senate/candidates_2026.json   FEC 2026 filers (W2 follow-up)
 *   web_data/us-senate/history/index.json     per-state history (W5a)
 *
 * Senate model has no district-redistricting layer (states don't redraw)
 * and no primary polls layer wired in yet — slot pattern keeps those
 * sections hidden cleanly. Phase 1 is projection-only; FEC people layer
 * comes in a follow-up.
 */
import type {
  RidingData, RidingMember, RidingCandidate, RidingNeighbor,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import latestSource from '../../../web_data/us-senate/latest.json';
import membersSource from '../../../web_data/us-senate/members.json';
import candidatesSource from '../../../web_data/us-senate/candidates_2026.json';
import historyIndex from '../../../web_data/us-senate/history/index.json';

type RawRace = {
  riding_id: string;
  name_en: string;
  name_fr: string;
  province: string;
  region: string;
  incumbent_party?: string;
  is_special?: boolean;
  poll_count?: number;
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

const races = (latestSource as { ridings: RawRace[]; meta: { run_date: string } }).ridings;
const META = (latestSource as { meta: { run_date: string } }).meta;
const members = membersSource as Record<string, RidingMember | undefined>;
const candidatesByRace = candidatesSource as Record<string, Array<{ name: string; party_code: string; party_raw: string; ici_status: string; filing_status: string; fec_id: string }> | undefined>;
const RACES_WITH_HISTORY = new Set((historyIndex as { ridings_with_history: string[] }).ridings_with_history);

/** Senate-wide vote_mean by party (unweighted mean across the 35
 *  contested races). */
const NATIONAL_VOTE_MEAN: Record<string, number> = (() => {
  const buckets: Record<string, { sum: number; n: number }> = {};
  for (const r of races) {
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

function buildNeighbors(raceId: string, region: string): RidingNeighbor[] {
  const sameRegion = races.filter((r) => r.riding_id !== raceId && r.region === region);
  const others = races.filter((r) => r.riding_id !== raceId && r.region !== region);
  const pool = [...sameRegion, ...others].slice(0, 6);
  return pool.map((r) => {
    const slug = ridingSlug(r.riding_id, r.name_en || r.name_fr);
    return {
      id: r.riding_id,
      slug,
      name_en: r.name_en,
      name_fr: r.name_fr,
      href_en: `/en/us/senate/seats/${slug}/`,
      href_fr: `/fr/us/senat/sieges/${slug}/`,
      href_es: `/es/us/senate/escanos/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

function adaptCandidates(raceId: string): RidingCandidate[] | undefined {
  const list = candidatesByRace[raceId];
  if (!list || list.length === 0) return undefined;
  return list.map((c) => ({
    name: c.name,
    party_code: c.party_code,
    party_raw: c.party_raw,
    is_elected: c.ici_status === 'I',
  }));
}

function adaptOne(raw: RawRace): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_en || raw.name_fr);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('us-senate', code);
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
    jurisdiction: 'us-senate',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr || raw.name_en },
    province: raw.province,
    region: raw.region,
    parties,
    projection: {
      winner: raw.projection.winner,
      p_winner: raw.projection.p_winner,
      mean_margin: raw.projection.mean_margin,
      p_close_race: raw.projection.p_close_race,
      cycle: raw.projection.projection_cycle,
    },
    baseline,
    member: members[raw.riding_id],
    candidates: adaptCandidates(raw.riding_id),
    runDate: META.run_date,
    hasProjectionHistory: RACES_WITH_HISTORY.has(raw.riding_id),
    neighbors: buildNeighbors(raw.riding_id, raw.region),
    isByelection: !!raw.is_special,
    regionalContext: {
      province: {},
      national: NATIONAL_VOTE_MEAN,
      totalSeats: 100,
    },
  };
}

export function getAllUSSenateRaces(): RidingData[] {
  return races.map(adaptOne);
}

export function getUSSenateRace(id: string): RidingData | undefined {
  const raw = races.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}
