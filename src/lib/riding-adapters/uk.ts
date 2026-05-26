/**
 * UK adapter: feeds the unified RidingPage component with Westminster
 * constituency data. Reads web_data/uk/ridings.json (built by
 * export_uk_web.py from outputs/uk_2029/riding_projection.csv +
 * data/uk_results.csv + latest.json).
 *
 * Northern Ireland note: the projection bucket for NI is `uk_oth`. The
 * export script remaps party_current_raw / party_name_raw on members and
 * candidates to ni_* slugs so the sitting-MP and 2024-candidates sections
 * stay individualised (DUP, Sinn Féin, SDLP, Alliance, UUP, TUV, Aontú).
 */
import type {
  RidingData, RidingMember, RidingCandidate,
  RidingDemographics, RidingNeighbor,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import ridingsSource from '../../../web_data/uk/ridings.json';
import membersSource from '../../../web_data/uk/members.json';
import candidatesSource from '../../../web_data/uk/candidates_2024.json';
import demographicsSource from '../../../web_data/uk/demographics.json';
import shapesSource from '../../../web_data/uk/shapes.json';
import centroidsSource from '../../../web_data/uk/centroids.json';
import historyIndex from '../../../web_data/uk/history/index.json';

type RawRiding = {
  riding_id: string;
  name_en: string;
  name_fr: string;
  nation: string;
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
    [key: string]: number | string | undefined;
  };
  baseline_cycle?: string;
};

const ridings = (ridingsSource as { ridings: RawRiding[]; meta: { run_date: string } }).ridings;
const META = (ridingsSource as { meta: { run_date: string } }).meta;
const members = membersSource as Record<string, RidingMember | undefined>;
const candidatesByRiding = candidatesSource as Record<string, RidingCandidate[] | undefined>;
const demographicsByRiding = demographicsSource as Record<string, RidingDemographics | undefined>;
const SHAPES = shapesSource as Record<string, { path: string; viewBox: string } | undefined>;
const CENTROIDS = centroidsSource as Record<string, { lon: number; lat: number } | undefined>;
const RIDINGS_WITH_HISTORY = new Set((historyIndex as { ridings_with_history: string[] }).ridings_with_history);

/** UK-wide vote_mean by party (unweighted mean across all 650 constituencies). */
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

function buildNeighbors(rid: string): RidingNeighbor[] {
  const selfCent = CENTROIDS[rid];
  if (!selfCent) return [];
  const scored = ridings
    .filter((r) => r.riding_id !== rid && CENTROIDS[r.riding_id])
    .map((r) => {
      const c = CENTROIDS[r.riding_id]!;
      const dx = c.lon - selfCent.lon;
      const dy = c.lat - selfCent.lat;
      return { r, d2: dx * dx + dy * dy };
    })
    .sort((a, b) => a.d2 - b.d2)
    .slice(0, 6);
  return scored.map(({ r }) => {
    const slug = ridingSlug(r.riding_id, r.name_en || r.name_fr);
    return {
      id: r.riding_id,
      slug,
      name_en: r.name_en,
      name_fr: r.name_fr,
      href_en: `/en/uk/constituencies/${slug}/`,
      href_fr: `/fr/uk/circonscriptions/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

function adaptOne(raw: RawRiding): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_en || raw.name_fr);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('uk', code);
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

  // For UK, province slot doubles as nation (England/Scotland/Wales/NI),
  // since EditorialBlurb keys mappings off `province`. region is the ONS
  // region (south_east, east_midlands, …) for England, or 'northern_ireland'/
  // 'scotland'/'wales' as nation passthroughs upstream.
  return {
    id: raw.riding_id,
    slug,
    jurisdiction: 'uk',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr || raw.name_en },
    province: raw.nation,
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
    demographics: demographicsByRiding[raw.riding_id],
    member: members[raw.riding_id],
    candidates: candidatesByRiding[raw.riding_id],
    runDate: META.run_date,
    // UK history snapshots (web_data/uk/runs/<date>.json) only carry winner
    // + p_leading + mean_margin per riding — no per-party vote_mean — so the
    // ProjectionHistory chart can't render lines. Hide until the pipeline
    // archives riding_projection.csv per date.
    hasProjectionHistory: false,
    neighbors: buildNeighbors(raw.riding_id),
    regionalContext: {
      province: {},
      national: NATIONAL_VOTE_MEAN,
      totalSeats: 650,
    },
    shapePath: SHAPES[raw.riding_id]?.path,
    shapeViewBox: SHAPES[raw.riding_id]?.viewBox,
  };
}

export function getAllUKRidings(): RidingData[] {
  return ridings.map(adaptOne);
}

export function getUKRiding(id: string): RidingData | undefined {
  const raw = ridings.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}
