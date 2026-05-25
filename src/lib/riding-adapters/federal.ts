/**
 * Federal Canada adapter: reads web_data/federal/ridings.json + geo.json
 * and produces normalized RidingData objects consumed by RidingPage.
 */
import type { RidingData, RidingDemographics, RidingMember, RidingCandidate } from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import ridingsSource from '../../../web_data/federal/ridings.json';
import geoSource from '../../../web_data/federal/geo.json';
import membersSource from '../../../web_data/federal/members.json';
import candidatesSource from '../../../web_data/federal/candidates_2025.json';

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

/** Subset used during MVP rollout — currently only Orléans. */
export const FEDERAL_MVP_IDS = ['35077'];
