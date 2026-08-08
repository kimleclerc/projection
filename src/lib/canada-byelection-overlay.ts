/**
 * Canada by-election overlay — joins the pending federal by-election
 * projections onto the general-election map, by riding.
 *
 * Why. The federal projection answers "if a general election were held today";
 * a by-election is a different question with a different electorate, and for
 * the handful of seats that actually vote next, the by-election projection is
 * the operative local forecast. The gap between the two is expected, not a
 * bug: differential turnout in by-elections punishes whoever's side is
 * demobilised — Liberal-held seats took that hit in 2024, Conservative-held
 * ones take it now. So the riding page and the map show the by-election
 * number for those seats, with the general projection kept beside it.
 *
 * Source of truth is `web_data/canada-byelections/latest.json` plus one file
 * per race, both produced by `export_fed_byelections_web.py`. That script runs
 * independently of the full federal pipeline, so a newly announced by-election
 * shows up here without waiting for a BSTS run — which is why this overlay
 * does NOT read `federal/latest.json`'s own `byelections` block (regenerated
 * only by run_pipeline, and therefore routinely staler).
 */
import indexSource from '../../web_data/canada-byelections/latest.json';

export type ByelectionStatus = 'scheduled' | 'vacant_pending_writ' | 'expected';

export interface ByelectionOverlayParty {
  party: string;
  voteMean: number;
  winProbability: number;
}

export interface ByelectionOverlay {
  slug: string;
  ridingId: string;
  status: ByelectionStatus;
  electionDate: string | null;
  vacancyDate: string | null;
  departingMember: string | null;
  incumbentParty: string | null;
  favorite: string;
  favoriteProbability: number;
  closeRaceProbability: number | null;
  meanMargin: number | null;
  hasLocalPoll: boolean;
  /** Sorted by projected share, descending. */
  parties: ByelectionOverlayParty[];
  /** True when the by-election favourite differs from the general-map winner. */
  href: Record<'en' | 'fr' | 'es', string>;
}

type RawIndexEntry = {
  slug: string;
  riding_id: string;
  status: string;
  election_date: string | null;
  vacancy_date: string | null;
  departing_member: string | null;
  incumbent_party: string | null;
  favorite: string;
  favorite_probability: number;
  has_local_poll: boolean;
  data_path: string;
};

type RawRace = {
  candidates?: Array<{
    party_code?: string;
    projected_vote_mean?: number;
    first_place_probability?: number;
  }>;
  summary?: {
    favorite_id?: string;
    favorite_probability?: number;
    close_race_probability?: number;
    mean_margin?: number;
  };
};

// Eager glob: every race file ships with the build, keyed by its data_path.
const RACE_MODULES = import.meta.glob<{ default: RawRace }>(
  '../../web_data/canada-byelection-*/latest.json',
  { eager: true },
);

/** '../../web_data/canada-byelection-foo/latest.json' → 'canada-byelection-foo' */
function dataPathOf(modulePath: string): string {
  return modulePath.split('/').slice(-2, -1)[0] ?? '';
}

const RACES: Record<string, RawRace> = {};
for (const [path, mod] of Object.entries(RACE_MODULES)) {
  RACES[dataPathOf(path)] = mod.default;
}

const pending = ((indexSource as { pending?: RawIndexEntry[] }).pending ?? []);

const BY_RIDING: Record<string, ByelectionOverlay> = {};

for (const entry of pending) {
  const race = RACES[entry.data_path];

  const parties: ByelectionOverlayParty[] = (race?.candidates ?? [])
    .filter((c) => c.party_code && typeof c.projected_vote_mean === 'number')
    .map((c) => ({
      party: c.party_code as string,
      voteMean: c.projected_vote_mean as number,
      winProbability: c.first_place_probability ?? 0,
    }))
    .sort((a, b) => b.voteMean - a.voteMean);

  BY_RIDING[entry.riding_id] = {
    slug: entry.slug,
    ridingId: entry.riding_id,
    status: (entry.status as ByelectionStatus) ?? 'expected',
    electionDate: entry.election_date ?? null,
    vacancyDate: entry.vacancy_date ?? null,
    departingMember: entry.departing_member ?? null,
    incumbentParty: entry.incumbent_party ?? null,
    favorite: race?.summary?.favorite_id ?? entry.favorite,
    favoriteProbability: race?.summary?.favorite_probability ?? entry.favorite_probability,
    closeRaceProbability: race?.summary?.close_race_probability ?? null,
    meanMargin: race?.summary?.mean_margin ?? null,
    hasLocalPoll: !!entry.has_local_poll,
    parties,
    href: {
      en: `/en/canada/byelections/${entry.slug}/`,
      fr: `/fr/canada/byelections/${entry.slug}/`,
      es: `/es/canada/byelections/${entry.slug}/`,
    },
  };
}

export const BYELECTION_BY_RIDING: Readonly<Record<string, ByelectionOverlay>> = BY_RIDING;

export function byelectionFor(ridingId: string): ByelectionOverlay | undefined {
  return BY_RIDING[ridingId];
}

/** Riding ids with a pending by-election — handy for map layers. */
export const BYELECTION_RIDING_IDS: readonly string[] = Object.keys(BY_RIDING);
