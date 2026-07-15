/**
 * France législatives adapter: feeds the unified RidingPage with the 577
 * circonscriptions. Reads web_data/france-legislative/ridings.json (built by
 * models/export_fr_leg_web.py from the nowcast run — central scenario
 * front_2024, uniform-swing expected shares, simulated win probabilities,
 * 2024 ministry baseline, elected deputy and 2024 candidates).
 *
 * Projection units are BLOCS (far_right, left, centre, …), not parties —
 * individual ministry nuances remain visible through party_raw in the
 * candidates table. Neighbors are same-département constituencies (no
 * centroid data needed; départements are the natural browsing unit).
 */
import type { RidingData, RidingNeighbor } from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import ridingsSource from '../../../web_data/france-legislative/ridings.json';
import shapesSource from '../../../web_data/france-legislative/shapes.json';
import centroidsSource from '../../../web_data/france-legislative/centroids.json';

const SHAPES = shapesSource as Record<string, { path: string; viewBox: string } | undefined>;
const CENTROIDS = centroidsSource as Record<string, { lon: number; lat: number } | undefined>;

type RawRiding = {
  riding_id: string;
  name_fr: string;
  name_en: string;
  province: string;
  projection: {
    winner: string;
    p_winner: number;
    mean_margin: number;
    p_close_race: number;
    vote_mean: Record<string, number>;
    win_prob: Record<string, number>;
    projection_cycle: string;
  };
  baseline_cycle: string;
  baseline_result: { winner: string; margin: number } & Record<string, number | string>;
  member: { mp_name: string; party_current: string; seat_status: string; source: string };
  candidates: Array<{
    name: string; party_code: string; party_raw: string;
    is_elected: boolean; votes: number; vote_pct: number;
  }>;
};

const SOURCE = ridingsSource as { meta: { run_date: string; projection_cycle: string }; ridings: RawRiding[] };
const RIDINGS = SOURCE.ridings;

/** National expected vote share by bloc (unweighted mean across the 577). */
const NATIONAL_VOTE_MEAN: Record<string, number> = (() => {
  const buckets: Record<string, { sum: number; n: number }> = {};
  for (const r of RIDINGS) {
    for (const [code, v] of Object.entries(r.projection.vote_mean)) {
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

const PROVINCE_VOTE_MEAN: Record<string, Record<string, number>> = (() => {
  const byProv: Record<string, Record<string, { sum: number; n: number }>> = {};
  for (const r of RIDINGS) {
    const prov = (byProv[r.province] ??= {});
    for (const [code, v] of Object.entries(r.projection.vote_mean)) {
      if (typeof v !== 'number' || v <= 0) continue;
      prov[code] ??= { sum: 0, n: 0 };
      prov[code].sum += v;
      prov[code].n += 1;
    }
  }
  const out: Record<string, Record<string, number>> = {};
  for (const [prov, buckets] of Object.entries(byProv)) {
    out[prov] = {};
    for (const [code, { sum, n }] of Object.entries(buckets)) out[prov][code] = sum / n;
  }
  return out;
})();

function projectionTone(p: { p_winner: number; p_close_race: number }): RidingNeighbor['tone'] {
  if (p.p_close_race >= 0.5) return 'tossup';
  if (p.p_close_race >= 0.25) return 'competitive';
  if (p.p_winner >= 0.85) return 'safe';
  return 'leaning';
}

function frSlug(raw: RawRiding): string {
  return ridingSlug(raw.riding_id, raw.name_fr);
}

function neighborOf(r: RawRiding): RidingNeighbor {
  const slug = frSlug(r);
  return {
    id: r.riding_id,
    slug,
    name_en: r.name_en,
    name_fr: r.name_fr,
    href_en: `/en/france/legislative-election/constituencies/${slug}/`,
    href_fr: `/fr/france/legislatives/circonscriptions/${slug}/`,
    href_es: `/es/france/legislativas/circunscripciones/${slug}/`,
    tone: projectionTone(r.projection),
    tone_party: r.projection.winner,
  };
}

function buildNeighbors(raw: RawRiding): RidingNeighbor[] {
  // Voisins réels par distance de centroïde (pattern uk.ts) ; repli sur le
  // même département quand la géométrie manque (11 circos des Français de
  // l'étranger, sans territoire).
  const selfCent = CENTROIDS[raw.riding_id];
  if (selfCent) {
    return RIDINGS
      .filter((r) => r.riding_id !== raw.riding_id && CENTROIDS[r.riding_id])
      .map((r) => {
        const c = CENTROIDS[r.riding_id]!;
        const dx = c.lon - selfCent.lon;
        const dy = c.lat - selfCent.lat;
        return { r, d2: dx * dx + dy * dy };
      })
      .sort((a, b) => a.d2 - b.d2)
      .slice(0, 6)
      .map(({ r }) => neighborOf(r));
  }
  return RIDINGS
    .filter((r) => r.province === raw.province && r.riding_id !== raw.riding_id)
    .slice(0, 8)
    .map(neighborOf);
}

function adaptOne(raw: RawRiding): RidingData {
  const slug = frSlug(raw);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('france', code);
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
    jurisdiction: 'france',
    navWebKey: 'france-legislative',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr },
    province: raw.province,
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
      winner: raw.baseline_result.winner as string,
      margin: Number(raw.baseline_result.margin ?? 0),
      party_pcts: baselinePcts,
    },
    member: raw.member,
    candidates: raw.candidates,
    runDate: SOURCE.meta.run_date,
    hasProjectionHistory: false,
    shapePath: SHAPES[raw.riding_id]?.path,
    shapeViewBox: SHAPES[raw.riding_id]?.viewBox,
    neighbors: buildNeighbors(raw),
    regionalContext: {
      province: PROVINCE_VOTE_MEAN[raw.province] ?? {},
      national: NATIONAL_VOTE_MEAN,
      totalSeats: 577,
    },
  };
}

export function getAllFranceLegRidings(): RidingData[] {
  return RIDINGS.map(adaptOne);
}

export function getFranceLegRiding(id: string): RidingData | undefined {
  const raw = RIDINGS.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}
