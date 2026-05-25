/**
 * Federal Canada adapter: reads web_data/federal/ridings.json + geo.json
 * and produces normalized RidingData objects consumed by RidingPage.
 */
import type {
  RidingData, RidingDemographics, RidingMember, RidingCandidate,
  RidingNeighbor, RegionalContext,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import ridingsSource from '../../../web_data/federal/ridings.json';
import geoSource from '../../../web_data/federal/geo.json';
import membersSource from '../../../web_data/federal/members.json';
import candidatesSource from '../../../web_data/federal/candidates_2025.json';
import historyIndex from '../../../web_data/federal/history/index.json';
import latestSource from '../../../web_data/federal/latest.json';
import shapesSource from '../../../web_data/federal/shapes.json';

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
  baseline_result: {
    winner: string;
    margin: number;
    turnout_pct: number;
    [key: string]: number | string;
  };
  baseline_cycle: string;
};

type RawGeo = Record<string, {
  urban_rural: string | null;
  region: string | null;
  subregion: string | null;
  francophone_pct: number | null;
  anglophone_pct: number | null;
  nonfrancophone_pct: number | null;
  demographics_source: string | null;
  qc125_url: string | null;
}>;

const ridings = (ridingsSource as { ridings: RawRiding[]; meta: { run_date: string } }).ridings;
const META = (ridingsSource as { meta: { run_date: string } }).meta;
const geo = geoSource as RawGeo;
const members = membersSource as Record<string, RidingMember | undefined>;
const candidatesByRiding = candidatesSource as Record<string, RidingCandidate[] | undefined>;
const RIDINGS_WITH_HISTORY = new Set((historyIndex as { ridings_with_history: string[] }).ridings_with_history);
const SHAPES = shapesSource as Record<string, { path: string; viewBox: string } | undefined>;

/** National vote_mean by party code, read from latest.json -> parties[]. */
const NATIONAL_VOTE_MEAN: Record<string, number> = {};
for (const p of (latestSource as { parties: Array<{ party: string; vote_mean: number }> }).parties ?? []) {
  if (p?.party && typeof p.vote_mean === 'number') NATIONAL_VOTE_MEAN[p.party] = p.vote_mean;
}

/** Province → {party_code → mean vote_mean across all ridings of that province}.
 *  Simple unweighted mean across riding-level projections — useful as editorial
 *  context, not as a forecast figure. */
const PROVINCE_VOTE_MEAN: Record<string, Record<string, number>> = (() => {
  const buckets: Record<string, Record<string, { sum: number; n: number }>> = {};
  for (const r of ridings) {
    const prov = r.province;
    if (!prov) continue;
    buckets[prov] ??= {};
    for (const [code, v] of Object.entries(r.projection?.vote_mean ?? {})) {
      if (typeof v !== 'number' || v <= 0) continue;
      buckets[prov][code] ??= { sum: 0, n: 0 };
      buckets[prov][code].sum += v;
      buckets[prov][code].n += 1;
    }
  }
  const out: Record<string, Record<string, number>> = {};
  for (const [prov, b] of Object.entries(buckets)) {
    out[prov] = {};
    for (const [code, { sum, n }] of Object.entries(b)) {
      out[prov][code] = sum / n;
    }
  }
  return out;
})();

/** Editorial "tone" of a riding's projection — no raw numbers, by design.
 *  Used in neighbor cards to invite click-through. */
function projectionTone(p: { p_winner: number; p_close_race: number }): RidingNeighbor['tone'] {
  if (p.p_close_race >= 0.35) return 'tossup';
  if (p.p_close_race >= 0.15) return 'competitive';
  if (p.p_winner >= 0.85) return 'safe';
  return 'leaning';
}

/** Build neighbor list for a riding — same subregion preferred, fall back to
 *  same region. Capped at 6. Excludes self. */
function buildNeighbors(rid: string): RidingNeighbor[] {
  const self = ridings.find((r) => r.riding_id === rid);
  if (!self) return [];
  const sameSub = ridings.filter(
    (r) => r.riding_id !== rid && r.region === self.region && (self as any).subregion && (r as any).subregion === (self as any).subregion,
  );
  const sameRegion = ridings.filter(
    (r) => r.riding_id !== rid && r.region === self.region && !sameSub.includes(r),
  );
  const pool = [...sameSub, ...sameRegion].slice(0, 6);
  return pool.map((r) => {
    const slug = ridingSlug(r.riding_id, r.name_en);
    return {
      id: r.riding_id,
      slug,
      name_en: r.name_en,
      name_fr: r.name_fr,
      href_en: `/en/canada/federal/ridings/${slug}/`,
      href_fr: `/fr/canada/federal/circonscriptions/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

/** Historical / former names for SEO alternateName.
 *  Keep small and curated — expand as we audit other ridings. */
const ALTERNATE_NAMES: Record<string, string[]> = {
  '35077': ['Ottawa-Orléans'], // renamed to "Orléans" in 2013
};

function buildDemographics(rid: string): RidingDemographics | undefined {
  const g = geo[rid];
  if (!g) return undefined;
  const hasLinguistic =
    g.francophone_pct !== null || g.anglophone_pct !== null || g.nonfrancophone_pct !== null;
  if (!hasLinguistic && !g.qc125_url) return undefined;
  return {
    francophone_pct: g.francophone_pct ?? undefined,
    anglophone_pct: g.anglophone_pct ?? undefined,
    nonfrancophone_pct: g.nonfrancophone_pct ?? undefined,
    source: g.demographics_source ?? undefined,
    external_profile_url: g.qc125_url ?? undefined,
  };
}

function adaptOne(raw: RawRiding): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_en);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('federal-ca', code);
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
  for (const [k, v] of Object.entries(raw.baseline_result)) {
    const m = /^(.+)_pct$/.exec(k);
    if (m && typeof v === 'number' && v > 0) baselinePcts[m[1]] = v;
  }

  return {
    id: raw.riding_id,
    slug,
    jurisdiction: 'federal-ca',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr },
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
    baseline: {
      cycle: raw.baseline_cycle,
      winner: raw.baseline_result.winner,
      margin: raw.baseline_result.margin,
      turnout_pct: raw.baseline_result.turnout_pct,
      party_pcts: baselinePcts,
    },
    demographics: buildDemographics(raw.riding_id),
    member: members[raw.riding_id],
    candidates: candidatesByRiding[raw.riding_id],
    runDate: META.run_date,
    alternateNames: ALTERNATE_NAMES[raw.riding_id],
    hasProjectionHistory: RIDINGS_WITH_HISTORY.has(raw.riding_id),
    neighbors: buildNeighbors(raw.riding_id),
    regionalContext: {
      province: PROVINCE_VOTE_MEAN[raw.province] ?? {},
      national: NATIONAL_VOTE_MEAN,
    },
    shapePath: SHAPES[raw.riding_id]?.path,
    shapeViewBox: SHAPES[raw.riding_id]?.viewBox,
  };
}

/** All federal ridings, normalized. */
export function getAllFederalRidings(): RidingData[] {
  return ridings.map(adaptOne);
}

/** Single riding by ID — returns undefined if not found. */
export function getFederalRiding(id: string): RidingData | undefined {
  const raw = ridings.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}

/** Subset used during MVP rollout — Orléans + Ottawa-region neighbors so
 *  cross-linking demo actually navigates. Drop the filter (or expand the list)
 *  when ready to scale to all 343 federal ridings. */
export const FEDERAL_MVP_IDS = ['35077', '35020', '35043', '35051', '35052', '35067', '35079'];
