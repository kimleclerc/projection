/**
 * Universal RidingData interface — feeds the unified RidingPage component
 * across all jurisdictions (CA federal, QC, ON, US House, UK, future FR législatives).
 * Each adapter (federal.ts, quebec.ts, etc.) maps its source data to this shape.
 *
 * Optional fields are slots: if absent, the corresponding RidingPage section
 * stays hidden. New data → section lights up automatically across all ridings.
 */

export type JurisdictionKey =
  | 'federal-ca'
  | 'quebec'
  | 'ontario'
  | 'us-house'
  | 'uk'
  | 'france';

export interface RidingParty {
  code: string;          // 'lib', 'con', 'ndp', 'bq', 'grn', 'ppc', 'dem', 'rep', ...
  label_en: string;
  label_fr: string;
  color: string;         // CSS color (hex or var)
  vote_mean_pct: number; // projected vote share
  win_prob: number;      // 0-1
}

export interface RidingProjection {
  winner: string;        // party code
  p_winner: number;
  mean_margin: number;
  p_close_race: number;
  cycle: string;
}

export interface RidingBaseline {
  cycle: string;
  winner: string;
  margin: number;
  turnout_pct?: number;
  party_pcts: Record<string, number>;
}

export interface RidingDemographics {
  // Linguistic (CA/QC focus)
  francophone_pct?: number;
  anglophone_pct?: number;
  nonfrancophone_pct?: number;
  // UK / generic
  population_total?: number;
  median_age?: number;
  employment_rate?: number;
  unemployment_rate?: number;
  // Source + external link
  source?: string;
  external_profile_url?: string;
}

export interface RidingCandidate {
  name: string;
  party_code: string;
  party_raw?: string;
  is_elected?: boolean;
  votes?: number;
  vote_pct?: number;
  majority?: number;
  residence?: string;
  occupation?: string;
}

export interface RidingMember {
  /** Current sitting member of the legislative body. */
  parliament?: number;
  mp_name: string;
  first_name?: string;
  last_name?: string;
  honorific_title?: string;
  party_current: string;       // current caucus
  party_elected?: string;      // party they were elected under (may differ if floor-crossing)
  member_start_date?: string;
  seat_status?: string;        // 'current', 'vacant', ...
  change_type?: string;        // 'floor_cross', 'byelection_win', ...
  change_date?: string;
  source?: string;
}

export interface RidingNeighbor {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  href_en: string;
  href_fr: string;
  /** Editorial "tone" of the projection — no raw numbers, by design. Invites click. */
  tone?: 'safe' | 'leaning' | 'competitive' | 'tossup' | 'vacant';
  /** Winner party code for color cue. */
  tone_party?: string;
}

export interface RegionalContext {
  /** Vote-mean averaged across all ridings in the riding's province. */
  province: Record<string, number>;
  /** National vote_mean from `latest.json` -> `parties[].vote_mean`.
   *  Leave empty {} when not applicable (e.g. provincial-only jurisdictions). */
  national: Record<string, number>;
  /** Total seats used for the comparison (343 federal, 125 QC, …). Drives
   *  the foot-of-table note copy. */
  totalSeats?: number;
}

export interface RidingData {
  id: string;                // numeric or alphanumeric ID, e.g. '35077'
  slug: string;              // URL-safe, e.g. '35077-orleans'
  jurisdiction: JurisdictionKey;
  cycle: string;             // e.g. 'fed_46'
  name: { en: string; fr: string };
  province?: string;
  region?: string;
  subregion?: string;
  urban_rural?: string;

  parties: RidingParty[];    // sorted by vote_mean_pct desc
  projection: RidingProjection;
  baseline?: RidingBaseline;

  // Optional slots — hidden when absent
  demographics?: RidingDemographics;
  member?: RidingMember;     // current sitting member
  candidates?: RidingCandidate[];  // candidates from the most recent general election (baseline cycle)
  polls?: unknown[];         // shape TBD when riding-level polls become available
  neighbors?: RidingNeighbor[];
  regionalContext?: RegionalContext;

  // Byelection enrichments (riding becomes a partial)
  isByelection?: boolean;
  byelectionDate?: string;
  marketSlug?: string;

  /** Redistricting provenance — when the map was redrawn since the last
   *  election cycle, this lists the >=20% predecessor ridings. Surfaced
   *  in editorial prose. */
  redistrictingOrigin?: Array<{
    old_name_fr: string;
    old_name_en: string;
    overlap_pct: number;
  }>;

  // Provenance + SEO
  runDate?: string;             // ISO date of the projection run that produced this snapshot
  alternateNames?: string[];    // historical / former names — fed into SEO schema.org

  // Historical projection track — when true, the page fetches per-riding history
  // JSON at /web_data/<jurisdiction>/history/<id>.json and renders a chart island.
  hasProjectionHistory?: boolean;

  // Riding silhouette — SVG path string in a 1000×1000 viewBox. Inlined in the
  // page HTML (only the current riding's path; ~500–2000 chars typically).
  shapePath?: string;
  shapeViewBox?: string;
}

/** Build a URL-safe slug from id + name. */
export function ridingSlug(id: string, name: string): string {
  const norm = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${id}-${norm}`;
}
