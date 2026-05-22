// Jurisdiction descriptors driving <ProjectionEngine />.
// Extracted from the legacy APP_CONFIG hash in canada.html.

export type Locale = 'en' | 'fr' | 'es';

export interface JurisdictionLocalized {
  fr: string;
  en: string;
  es?: string;
}

export interface Jurisdiction {
  /** Internal id, stable. */
  id: string;
  /** Path under web_data/, e.g. "federal" → /web_data/federal/latest.json. */
  dataPath: string;
  /** GeoJSON path for the riding map. */
  geoPath: string;
  /** Hero h1, may contain inline <em>. */
  heroTitle: JurisdictionLocalized;
  /** Composition section heading. */
  institution: JurisdictionLocalized;
  /** Source attribution line. */
  source: JurisdictionLocalized;
  /** Subtitle under the map. */
  mapSubtitle: JurisdictionLocalized;
  /** Page title (HTML <title>). */
  pageTitle: JurisdictionLocalized;
  /** Meta description for SEO. */
  metaDescription: JurisdictionLocalized;
  /** Year used as a baseline reference (last election). */
  baselineYear: number;
  /** Total seats in the chamber. */
  seatsTotal: number;
  /** Whether to show the by-elections section. */
  byelections: boolean;
  /** Map default center [lat, lon]. */
  mapCenter: [number, number];
  /** Map default zoom level. */
  mapZoom: number;
  /** GeoJSON property name that matches `latest.json#ridings[].riding_id`.
   *  Defaults to 'FEDNUM' if omitted. */
  idProp?: string;
  /** Party keys in display order (matches party.party in latest.json). */
  parties: string[];
  /** Locale-specific URL slugs for this jurisdiction. */
  slug: { en: string; fr: string };
  /** Locale-specific currentPage key for the nav. */
  currentPage: string;
  /** Optional election day for live countdown islands, ISO date. */
  electionDate?: string;
}

export const jurisdictions: Record<string, Jurisdiction> = {
  federal: {
    id: 'federal',
    dataPath: 'federal',
    geoPath: 'federal',
    heroTitle: {
      fr: 'Projection <em>fédérale</em>',
      en: 'Federal <em>Projection</em>',
    },
    institution: {
      fr: 'Composition actuelle de la Chambre',
      en: 'Current House Composition',
    },
    source: {
      fr: 'Sources : Élections Canada, firmes de sondage publiques',
      en: 'Sources: Elections Canada, public polling firms',
    },
    mapSubtitle: {
      fr: "Projection par circonscription basée sur les résultats 2025, les sondages nationaux et les ajustements régionaux.",
      en: 'Riding projection based on 2025 results, national polling and regional adjustments.',
    },
    pageTitle: {
      fr: 'Projection fédérale Canada 2025 — Vote-Scope',
      en: 'Canada Federal 2025 Projection — Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des 343 sièges fédéraux canadiens — parti en tête, signaux de fragilité et écart avec les marchés de prédiction. Mis à jour en continu.',
      en: 'Live projection of 343 Canadian federal seats — top party, fragility signals, and what the market sees that the model doesn\'t. Updated continuously.',
    },
    baselineYear: 2025,
    seatsTotal: 343,
    byelections: true,
    mapCenter: [56, -96],
    mapZoom: 4,
    parties: ['lib', 'con', 'bq', 'ndp', 'grn', 'ppc', 'fed_oth'],
    slug: { en: 'federal', fr: 'federal' },
    currentPage: 'canada',
  },

  ontario: {
    id: 'ontario',
    dataPath: 'ontario',
    geoPath: 'ontario',
    heroTitle: {
      fr: 'Projection <em>ontarienne</em>',
      en: 'Ontario <em>Projection</em>',
    },
    institution: {
      fr: 'Composition actuelle de l\'Assemblée législative',
      en: 'Current Legislative Assembly Composition',
    },
    source: {
      fr: 'Sources : Élections Ontario, firmes de sondage publiques',
      en: 'Sources: Elections Ontario, public polling firms',
    },
    mapSubtitle: {
      fr: 'Projection par circonscription basée sur les résultats 2022, les sondages provinciaux et les ajustements régionaux.',
      en: 'Riding projection based on 2022 results, provincial polling and regional adjustments.',
    },
    pageTitle: {
      fr: 'Projection Ontario 2026 — Vote-Scope',
      en: 'Ontario 2026 Projection — Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des 124 sièges de l\'Assemblée législative ontarienne — parti en tête, circonscriptions pivots et signal de fragilité. Mis à jour en continu.',
      en: 'Live projection of 124 Ontario legislative seats — top party, tipping-point ridings, and fragility signals. Updated continuously.',
    },
    baselineYear: 2022,
    seatsTotal: 124,
    byelections: false,
    mapCenter: [50, -85],
    mapZoom: 5,
    idProp: 'FEDNUM',
    parties: ['on_pc', 'on_lib', 'on_ndp', 'on_grn', 'on_oth'],
    slug: { en: 'ontario', fr: 'ontario' },
    currentPage: 'canada',
  },

  quebec: {
    id: 'quebec',
    dataPath: 'quebec',
    geoPath: 'quebec',
    heroTitle: {
      fr: 'Projection <em>québécoise</em>',
      en: 'Quebec <em>Projection</em>',
    },
    institution: {
      fr: "Composition actuelle de l'Assemblée nationale",
      en: 'Current National Assembly Composition',
    },
    source: {
      fr: 'Sources : Élections Québec, firmes de sondage publiques',
      en: 'Sources: Élections Québec, public polling firms',
    },
    mapSubtitle: {
      fr: 'Projection par circonscription basée sur les résultats 2022, les sondages provinciaux et les tendances régionales.',
      en: 'Riding projection based on 2022 results, provincial polling and regional trends.',
    },
    pageTitle: {
      fr: 'Projection Québec 2026 — Vote-Scope',
      en: 'Quebec 2026 Projection — Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des 125 sièges de l\'Assemblée nationale du Québec — parti en tête, fragile ou solide, et ce que le marché ne voit pas encore. Mis à jour en continu.',
      en: 'Live projection of 125 Quebec National Assembly seats — top party, fragility signals, and what the market is missing. Updated continuously.',
    },
    baselineYear: 2022,
    seatsTotal: 125,
    byelections: false,
    mapCenter: [52, -71],
    mapZoom: 5,
    idProp: 'CO_CEP',
    parties: ['pq', 'plq', 'pcq', 'qs', 'caq', 'qc_oth', 'qc_ind'],
    slug: { en: 'quebec', fr: 'quebec' },
    currentPage: 'canada',
    electionDate: '2026-10-05',
  },

  usHouse: {
    id: 'us-house',
    dataPath: 'us-house',
    geoPath: 'us-house',
    heroTitle: {
      fr: 'Chambre des <em>représentants</em>',
      en: 'U.S. <em>House</em>',
      es: 'Cámara de <em>Representantes</em>',
    },
    institution: {
      fr: 'Composition actuelle de la Chambre',
      en: 'Current House Composition',
      es: 'Composición actual de la Cámara',
    },
    source: {
      fr: 'Sources : Cook Political Report, Inside Elections, sondages publics',
      en: 'Sources: Cook Political Report, Inside Elections, public polling',
      es: 'Fuentes: Cook Political Report, Inside Elections, encuestas públicas',
    },
    mapSubtitle: {
      fr: 'Projection par district basée sur les résultats 2024, le climat national et les évaluations de course.',
      en: 'District projection based on 2024 results, national environment and race ratings.',
      es: 'Proyección por distrito basada en resultados 2024, entorno nacional y clasificaciones de carrera.',
    },
    pageTitle: {
      fr: 'Projection — Chambre des représentants 2026 — Vote-Scope',
      en: 'U.S. House 2026 Projection — Vote-Scope',
      es: 'Proyección — Cámara de Representantes 2026 — Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des 435 sièges de la Chambre américaine — qui contrôle, quels districts basculent, et où le marché se trompe. Mis à jour en continu.',
      en: 'Live projection of all 435 U.S. House seats — who controls the chamber, which districts flip, and where the market is wrong. Updated continuously.',
      es: 'Proyección de los 435 escaños de la Cámara de EE. UU. — quién controla, qué distritos cambian y dónde se equivoca el mercado. Actualizado continuamente.',
    },
    baselineYear: 2024,
    seatsTotal: 435,
    byelections: false,
    mapCenter: [39, -98],
    mapZoom: 4,
    idProp: 'FEDNUM',
    parties: ['us_dem', 'us_rep', 'us_oth'],
    slug: { en: 'house', fr: 'chambre' },
    currentPage: 'us',
  },

  usSenate: {
    id: 'us-senate',
    dataPath: 'us-senate',
    geoPath: 'us-senate',
    heroTitle: {
      fr: 'Sénat <em>américain</em>',
      en: 'U.S. <em>Senate</em>',
      es: 'Senado <em>de EE. UU.</em>',
    },
    institution: {
      fr: 'Composition actuelle du Sénat',
      en: 'Current Senate Composition',
      es: 'Composición actual del Senado',
    },
    source: {
      fr: 'Sources : Cook Political Report, Inside Elections, sondages publics',
      en: 'Sources: Cook Political Report, Inside Elections, public polling',
      es: 'Fuentes: Cook Political Report, Inside Elections, encuestas públicas',
    },
    mapSubtitle: {
      fr: 'Projection des sièges en jeu en 2026 (classe II). Les États sans course cette année restent en gris.',
      en: 'Projection for seats up in 2026 (Class II). States with no race this cycle stay greyed out.',
      es: 'Proyección de escaños en disputa en 2026 (Clase II). Los estados sin carrera este ciclo permanecen en gris.',
    },
    pageTitle: {
      fr: 'Projection — Sénat américain 2026 — Vote-Scope',
      en: 'U.S. Senate 2026 Projection — Vote-Scope',
      es: 'Proyección — Senado de EE. UU. 2026 — Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des sièges du Sénat américain en jeu en 2026 — qui contrôle, quels États basculent, et ce que le marché rate. Mis à jour en continu.',
      en: 'Live projection for U.S. Senate seats up in 2026 — who controls the chamber, which states flip, and what the market is missing. Updated continuously.',
      es: 'Proyección de los escaños del Senado de EE. UU. en disputa en 2026 — quién controla, qué estados cambian y qué pierde el mercado. Actualizado continuamente.',
    },
    baselineYear: 2024,
    seatsTotal: 100,
    byelections: false,
    mapCenter: [39, -98],
    mapZoom: 4,
    idProp: 'riding_id',
    parties: ['us_dem', 'us_rep'],
    slug: { en: 'senate', fr: 'senat' },
    currentPage: 'us',
  },

  uk: {
    id: 'uk',
    dataPath: 'uk',
    geoPath: 'uk',
    heroTitle: {
      fr: 'Projection <em>britannique</em>',
      en: 'U.K. <em>General Election</em>',
    },
    institution: {
      fr: 'Composition actuelle de la Chambre des communes',
      en: 'Current House of Commons Composition',
    },
    source: {
      fr: 'Sources : Electoral Commission, firmes de sondage publiques',
      en: 'Sources: Electoral Commission, public polling firms',
    },
    mapSubtitle: {
      fr: 'Projection par circonscription basée sur les résultats 2024, les sondages nationaux et les tendances régionales.',
      en: 'Constituency projection based on 2024 results, national polling and regional trends.',
    },
    pageTitle: {
      fr: 'Projection — Élection générale R.-U. — Vote-Scope',
      en: 'U.K. General Election Projection — Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des 650 sièges de la Chambre des communes britannique — parti en tête, sièges marginaux et signaux que le marché ne voit pas. Mis à jour en continu.',
      en: 'Live projection of all 650 U.K. House of Commons seats — top party, marginal seats, and signals the market is missing. Updated continuously.',
    },
    baselineYear: 2024,
    seatsTotal: 650,
    byelections: false,
    mapCenter: [54, -2.5],
    mapZoom: 5,
    idProp: 'FEDNUM',
    parties: ['uk_lab', 'uk_con', 'uk_ld', 'uk_snp', 'uk_grn', 'uk_pc', 'uk_ref', 'uk_oth'],
    slug: { en: 'uk', fr: 'uk' },
    currentPage: 'uk',
  },
};

/** Type describing the runtime shape of `web_data/<jurisdiction>/latest.json`. */
export interface ProjectionParty {
  party: string;
  label_en: string;
  label_fr: string;
  color: string;
  vote_mean: number;
  vote_sd: number;
  vote_ci_low_80: number;
  vote_ci_high_80: number;
  trend_7d: number;
  trend_direction: 'up' | 'down' | 'flat';
  seats_projected: number;
  seats_mean: number;
  seats_median: number;
  seats_ci_low_80: number;
  seats_ci_high_80: number;
  p_majority: number;
  p_largest: number;
}

export interface ProjectionMeta {
  run_date: string;
  election_cycle: string;
  n_polls: number;
  mode: string;
  majority_threshold: number;
  total_seats: number;
  n_simulations: number;
  pipeline_version: string;
}

export interface ProjectionData {
  meta: ProjectionMeta;
  parties: ProjectionParty[];
  current_composition: Record<string, number>;
  ridings: unknown[];
  race_ratings?: unknown;
  polls_history?: unknown;
  tipping_points?: unknown;
  previous_runs?: unknown;
  byelections?: unknown;
}
