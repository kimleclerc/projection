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
  | 'us-senate'
  | 'uk'
  | 'france';

/** Languages supported across all riding components. Adding a new locale
 *  here surfaces a TS error in every T-block that doesn't translate yet —
 *  intentional. */
export type Lang = 'en' | 'fr' | 'es';

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

/** A declared / on-ballot candidate for the UPCOMING election (no votes yet).
 *  Rendered by CandidateSlate — the "who's running" electoral slate, distinct
 *  from RidingCandidate (past results shown by CandidatesTable). */
export interface DeclaredCandidate {
  name: string;
  party_code: string;
  party_raw?: string;
  /** incumbent = sitting member re-running · challenger · open (no incumbent). */
  status?: 'incumbent' | 'challenger' | 'open';
  /** Legacy French biography field. Prefer the localized bio_* fields below. */
  portrait?: string;
  /** Candidate headshot supplied by the party or another named source. */
  image_url?: string;
  bio_fr?: string;
  bio_en?: string;
  bio_es?: string;
  source_url?: string;
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
  /** Optional Spanish href. Adapters populate when /es/ pages exist for the
   *  jurisdiction; NeighborRidings falls back to href_en otherwise. */
  href_es?: string;
  /** Editorial "tone" of the projection — no raw numbers, by design. Invites click. */
  tone?: 'safe' | 'leaning' | 'competitive' | 'tossup' | 'vacant';
  /** Winner party code for color cue. */
  tone_party?: string;
}

/**
 * One district-level poll, rendered as a ROW inside the LocalPolls section
 * (NYT/Upshot model). Topline-only by design — district polls ship no
 * breakdowns, so they never earn their own page. Mirrors the engine's PollRow
 * (cf. polls-adapter) trimmed to what the row needs.
 */
export interface RidingPoll {
  poll_id: string;
  firm_name: string;
  field_start?: string | null;
  field_end?: string | null;
  display_date?: string | null;
  release_date: string;
  sample_size?: number | null;
  population?: string | null;   // 'lv' | 'rv' | 'a' …
  client?: string | null;       // sponsor, when disclosed
  source_url?: string | null;   // raw; the section's cleanSource() guards aggregator links
  topline: Record<string, number>;
}

export interface RegionalContext {
  /** Vote-mean averaged across all ridings in the riding's province. */
  province: Record<string, number>;
  /** National vote_mean from `latest.json` -> `parties[].vote_mean`.
   *  Leave empty {} when not applicable (e.g. provincial-only jurisdictions). */
  national: Record<string, number>;
  /** Total seats used for the comparison (343 federal, 127 QC, …). Drives
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
  declaredCandidates?: DeclaredCandidate[];  // declared / on-ballot candidates for the UPCOMING election
  polls?: RidingPoll[];      // district-level polls → rows in the LocalPolls section (NYT model)
  neighbors?: RidingNeighbor[];
  regionalContext?: RegionalContext;

  // Byelection enrichments (riding becomes a partial)
  isByelection?: boolean;
  byelectionDate?: string;
  marketSlug?: string;

  /** US House primary status — Dem and/or Rep primary leader from latest poll. */
  primaries?: {
    dem?: { leader_name: string; leader_pct: number; field_end: string; firm: string; n_candidates_polled: number; source_url?: string };
    rep?: { leader_name: string; leader_pct: number; field_end: string; firm: string; n_candidates_polled: number; source_url?: string };
  };

  /** US House redistricting impact — old districts that contribute ≥5% of the
   *  new map. Editorial threshold: surface only when fragmented (multiple
   *  contributors or non-identity single contributor). */
  redistrictingImpact?: Array<{
    old_riding_id: string;
    old_name_en: string;
    old_name_fr: string;
    overlap_pct: number;
  }>;

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
