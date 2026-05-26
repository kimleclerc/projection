/**
 * Ontario adapter: reads web_data/ontario/ JSON and produces normalized
 * RidingData objects consumed by RidingPage. No redistricting overlay —
 * the 2025 -> 2029 map is identity (Codex confirmed riding_id_2025 ==
 * riding_id_2029 for every seat).
 */
import type {
  RidingData, RidingMember, RidingCandidate,
  RidingNeighbor,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import ridingsSource from '../../../web_data/ontario/ridings.json';
import membersSource from '../../../web_data/ontario/members.json';
import candidatesSource from '../../../web_data/ontario/candidates_2025.json';
import shapesSource from '../../../web_data/ontario/shapes.json';
import centroidsSource from '../../../web_data/ontario/centroids.json';
import historyIndex from '../../../web_data/ontario/history/index.json';

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

const ridings = (ridingsSource as { ridings: RawRiding[]; meta: { run_date: string } }).ridings;
const META = (ridingsSource as { meta: { run_date: string } }).meta;
const members = membersSource as Record<string, RidingMember | undefined>;
const candidatesByRiding = candidatesSource as Record<string, RidingCandidate[] | undefined>;
const SHAPES = shapesSource as Record<string, { path: string; viewBox: string } | undefined>;
const CENTROIDS = centroidsSource as Record<string, { lon: number; lat: number } | undefined>;
const RIDINGS_WITH_HISTORY = new Set((historyIndex as { ridings_with_history: string[] }).ridings_with_history);

/** Province-wide vote_mean by party (unweighted mean across all 124 ridings).
 *  Used as editorial context, not as a forecast figure. */
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
      href_en: `/en/canada/ontario/ridings/${slug}/`,
      href_fr: `/fr/canada/ontario/circonscriptions/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

function adaptOne(raw: RawRiding): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_en || raw.name_fr);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('ontario', code);
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
    jurisdiction: 'ontario',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr || raw.name_en },
    province: 'ON',
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
    member: members[raw.riding_id],
    candidates: candidatesByRiding[raw.riding_id],
    runDate: META.run_date,
    hasProjectionHistory: RIDINGS_WITH_HISTORY.has(raw.riding_id),
    neighbors: buildNeighbors(raw.riding_id),
    regionalContext: {
      province: PROVINCE_VOTE_MEAN,
      national: {},
      totalSeats: 124,
    },
    shapePath: SHAPES[raw.riding_id]?.path,
    shapeViewBox: SHAPES[raw.riding_id]?.viewBox,
  };
}

export function getAllOntarioRidings(): RidingData[] {
  return ridings.map(adaptOne);
}

export function getOntarioRiding(id: string): RidingData | undefined {
  const raw = ridings.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}
