/**
 * Quebec adapter: reads web_data/quebec/ JSON and produces normalized
 * RidingData objects consumed by RidingPage, plus a separate origin map
 * surfaced by the QC-specific RidingOrigin component.
 *
 * Quebec specificity: 2022 -> 2026 riding redistricting. members.json,
 * candidates_2022.json and origin.json are all keyed by the 2026 riding_id
 * (matching ridings.json) and resolve the mapping upstream in
 * export_quebec_web.py (20/80 rule).
 */
import type {
  RidingData, RidingMember, RidingCandidate,
  RidingNeighbor, RidingDemographics,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import ridingsSource from '../../../web_data/quebec/ridings.json';
import membersSource from '../../../web_data/quebec/members.json';
import candidatesSource from '../../../web_data/quebec/candidates_2022.json';
import originSource from '../../../web_data/quebec/origin.json';
import shapesSource from '../../../web_data/quebec/shapes.json';
import historyIndex from '../../../web_data/quebec/history/index.json';

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
  };
  baseline_result?: {
    winner?: string;
    margin?: number;
    turnout_pct?: number;
    [key: string]: number | string | undefined;
  };
  baseline_cycle?: string;
};

export interface RidingOriginEntry {
  old_id: string;
  old_name_fr: string;
  old_name_en: string;
  overlap_pct: number;
  overlap_type: string;
}

const ridings = (ridingsSource as { ridings: RawRiding[]; meta: { run_date: string } }).ridings;
const META = (ridingsSource as { meta: { run_date: string } }).meta;
const members = membersSource as Record<string, RidingMember | undefined>;
const candidatesByRiding = candidatesSource as Record<string, RidingCandidate[] | undefined>;
const ORIGIN = originSource as Record<string, RidingOriginEntry[] | undefined>;
const SHAPES = shapesSource as Record<string, { path: string; viewBox: string } | undefined>;
const RIDINGS_WITH_HISTORY = new Set((historyIndex as { ridings_with_history: string[] }).ridings_with_history);

const PROVINCE_VOTE_MEAN: Record<string, number> = (() => {
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

function buildNeighbors(rid: string): RidingNeighbor[] {
  const self = ridings.find((r) => r.riding_id === rid);
  if (!self) return [];
  const sameRegion = ridings.filter((r) => r.riding_id !== rid && r.region === self.region);
  return sameRegion.slice(0, 6).map((r) => {
    const slug = ridingSlug(r.riding_id, r.name_fr || r.name_en);
    return {
      id: r.riding_id,
      slug,
      name_en: r.name_en,
      name_fr: r.name_fr,
      href_en: `/en/canada/quebec/ridings/${slug}/`,
      href_fr: `/fr/canada/quebec/circonscriptions/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

function buildDemographics(): RidingDemographics | undefined {
  // No riding-level demographics file for QC yet; leave undefined so the
  // Demographics section stays hidden until ISQ data is wired in.
  return undefined;
}

function adaptOne(raw: RawRiding): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_fr || raw.name_en);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('quebec', code);
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
        turnout_pct: typeof raw.baseline_result.turnout_pct === 'number'
          ? raw.baseline_result.turnout_pct : undefined,
        party_pcts: baselinePcts,
      }
    : undefined;

  return {
    id: raw.riding_id,
    slug,
    jurisdiction: 'quebec',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr },
    province: 'QC',
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
    demographics: buildDemographics(),
    member: members[raw.riding_id],
    candidates: candidatesByRiding[raw.riding_id],
    runDate: META.run_date,
    hasProjectionHistory: RIDINGS_WITH_HISTORY.has(raw.riding_id),
    neighbors: buildNeighbors(raw.riding_id),
    regionalContext: {
      province: PROVINCE_VOTE_MEAN,
      national: {},
    },
    shapePath: SHAPES[raw.riding_id]?.path,
    shapeViewBox: SHAPES[raw.riding_id]?.viewBox,
  };
}

export function getAllQuebecRidings(): RidingData[] {
  return ridings.map(adaptOne);
}

export function getQuebecRiding(id: string): RidingData | undefined {
  const raw = ridings.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}

/** Origin (2022 -> 2026 redistricting) for a given new riding. >=20% only,
 *  sorted by overlap_pct desc. Returns [] when no entry. */
export function getQuebecOrigin(id: string): RidingOriginEntry[] {
  return ORIGIN[id] ?? [];
}
