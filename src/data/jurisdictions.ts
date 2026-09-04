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
      fr: 'Prévision <em>fédérale</em>',
      en: 'Federal <em>Forecast</em>',
      es: 'Pronóstico <em>federal</em>',
    },
    institution: {
      fr: 'Composition actuelle de la Chambre',
      en: 'Current House Composition',
      es: 'Composición actual de la Cámara',
    },
    source: {
      fr: 'Sources : Élections Canada, firmes de sondage publiques',
      en: 'Sources: Elections Canada, public polling firms',
      es: 'Fuentes: Elecciones Canadá, sondeadoras públicas',
    },
    mapSubtitle: {
      fr: "Projection par circonscription basée sur les résultats 2025, les sondages nationaux et les ajustements régionaux.",
      en: 'Riding projection based on 2025 results, national polling and regional adjustments.',
      es: 'Proyección por distrito basada en los resultados de 2025, los sondeos nacionales y los ajustes regionales.',
    },
    pageTitle: {
      fr: 'Qui va gagner les élections fédérales au Canada ? — Vote-Scope',
      en: 'Who Will Win the Canadian Federal Election? — Vote-Scope',
      es: '¿Quién ganará las elecciones federales de Canadá? — Vote-Scope',
    },
    metaDescription: {
      fr: 'Qui va gagner les élections fédérales au Canada? Agrégation de plus de 240 sondages, 50 000 simulations, projection des 343 sièges circonscription par circonscription. Mise à jour quotidienne.',
      en: 'Who wins the next Canadian federal election? 240+ polls aggregated, 50,000 simulations, all 343 ridings projected seat by seat. Updated daily with every new poll.',
      es: '¿Quién gana las elecciones federales de Canadá? Más de 240 encuestas agregadas, 50.000 simulaciones, los 343 escaños proyectados distrito por distrito. Actualizado a diario.',
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
      fr: 'Prévision <em>ontarienne</em>',
      en: 'Ontario <em>Forecast</em>',
      es: 'Pronóstico <em>de Ontario</em>',
    },
    institution: {
      fr: 'Composition actuelle de l\'Assemblée législative',
      en: 'Current Legislative Assembly Composition',
      es: 'Composición actual de la Asamblea Legislativa',
    },
    source: {
      fr: 'Sources : Élections Ontario, firmes de sondage publiques',
      en: 'Sources: Elections Ontario, public polling firms',
      es: 'Fuentes: Elecciones Ontario, sondeadoras públicas',
    },
    mapSubtitle: {
      fr: 'Projection par circonscription basée sur les résultats 2022, les sondages provinciaux et les ajustements régionaux.',
      en: 'Riding projection based on 2022 results, provincial polling and regional adjustments.',
      es: 'Proyección por distrito basada en los resultados de 2022, los sondeos provinciales y los ajustes regionales.',
    },
    pageTitle: {
      fr: 'Qui va gagner les prochaines élections en Ontario ? — Vote-Scope',
      en: 'Who Will Win the Next Ontario Election? — Vote-Scope',
      es: '¿Quién ganará las próximas elecciones de Ontario? — Vote-Scope',
    },
    metaDescription: {
      fr: 'Qui va gagner les prochaines élections en Ontario? Sondages provinciaux agrégés, projection des 124 circonscriptions de Queen\'s Park, circonscriptions pivots et probabilités de majorité. Mise à jour continue.',
      en: 'Who wins the next Ontario election? Provincial polls aggregated, all 124 Queen\'s Park ridings projected, tipping-point ridings and majority odds. Updated with every new poll.',
      es: '¿Quién gana las próximas elecciones de Ontario? Encuestas provinciales agregadas, 124 distritos proyectados, distritos clave y probabilidades de mayoría. Actualizado continuamente.',
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
      fr: 'Prévision <em>québécoise</em>',
      en: 'Quebec <em>Forecast</em>',
      es: 'Pronóstico <em>de Quebec</em>',
    },
    institution: {
      fr: "Composition actuelle de l'Assemblée nationale",
      en: 'Current National Assembly Composition',
      es: 'Composición actual de la Asamblea Nacional',
    },
    source: {
      fr: 'Sources : Élections Québec, firmes de sondage publiques',
      en: 'Sources: Élections Québec, public polling firms',
      es: 'Fuentes: Élections Québec, sondeadoras públicas',
    },
    mapSubtitle: {
      fr: 'Projection par circonscription basée sur les résultats 2022, les sondages provinciaux et les tendances régionales.',
      en: 'Riding projection based on 2022 results, provincial polling and regional trends.',
      es: 'Proyección por distrito basada en los resultados de 2022, los sondeos provinciales y las tendencias regionales.',
    },
    pageTitle: {
      fr: 'Qui va gagner les élections du Québec 2026 ? — Vote-Scope',
      en: 'Who Will Win the 2026 Quebec Election? — Vote-Scope',
      es: '¿Quién ganará las elecciones de Quebec 2026? — Vote-Scope',
    },
    metaDescription: {
      fr: 'Qui va gagner les élections du Québec le 5 octobre 2026? Sondages Léger, Pallas et plus agrégés, projection des 127 circonscriptions de l\'Assemblée nationale, probabilités de majorité. Mise à jour continue.',
      en: 'Who wins the Quebec election on October 5, 2026? Léger, Pallas and more polls aggregated, all 127 National Assembly ridings projected, majority odds. Updated with every poll.',
      es: '¿Quién gana las elecciones de Quebec del 5 de octubre de 2026? Encuestas Léger, Pallas y más agregadas, 127 distritos de la Asamblea Nacional proyectados. Actualizado continuamente.',
    },
    baselineYear: 2022,
    seatsTotal: 127,
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
      fr: 'Qui contrôlera la Chambre des représentants en 2026 ? — Vote-Scope',
      en: 'Who Will Control the House After the 2026 Midterms? — Vote-Scope',
      es: '¿Quién controlará la Cámara tras las intermedias de 2026? — Vote-Scope',
    },
    metaDescription: {
      fr: 'Qui contrôlera la Chambre après les mi-mandats 2026? Projection des 435 districts, sondages génériques agrégés, districts qui basculent et probabilités de contrôle. Mise à jour continue.',
      en: 'Who controls the House after the 2026 midterms? All 435 districts projected, generic-ballot polls aggregated, flip districts and chamber-control odds. Updated continuously.',
      es: '¿Quién controla la Cámara tras las intermedias de 2026? 435 distritos proyectados, encuestas agregadas, distritos que cambian y probabilidades de control. Actualizado continuamente.',
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
      fr: 'Qui contrôlera le Sénat américain en 2026 ? — Vote-Scope',
      en: 'Who Will Control the Senate After the 2026 Midterms? — Vote-Scope',
      es: '¿Quién controlará el Senado tras las intermedias de 2026? — Vote-Scope',
    },
    metaDescription: {
      fr: 'Qui contrôlera le Sénat après les mi-mandats 2026? Projection des sièges en jeu État par État, sondages agrégés, États pivots et probabilités de contrôle. Mise à jour continue.',
      en: 'Who controls the Senate after the 2026 midterms? Every seat up projected state by state, polls aggregated, tipping-point states and chamber-control odds. Updated continuously.',
      es: '¿Quién controla el Senado tras las intermedias de 2026? Escaños en disputa proyectados estado por estado, encuestas agregadas y probabilidades de control. Actualizado continuamente.',
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

  usGovernor: {
    id: 'us-governor',
    dataPath: 'us-governor',
    geoPath: 'us-governor',
    heroTitle: {
      fr: 'Gouverneurs <em>am\u00e9ricains</em>',
      en: 'U.S. <em>Governors</em>',
      es: 'Gobernadores <em>de EE. UU.</em>',
    },
    institution: {
      fr: 'R\u00e9partition actuelle des 50 gouverneurs',
      en: 'Current Split of the 50 Governorships',
      es: 'Reparto actual de las 50 gobernaciones',
    },
    source: {
      fr: 'Sources : sondages publics agr\u00e9g\u00e9s par le NYT, PVI de Cook, r\u00e9sultats 2018-2024',
      en: 'Sources: public polling via the NYT tracker, Cook PVI, 2018-2024 results',
      es: 'Fuentes: sondeos p\u00fablicos v\u00eda el NYT, PVI de Cook, resultados 2018-2024',
    },
    mapSubtitle: {
      fr: 'Projection des 36 courses de 2026. Les 14 \u00c9tats qui ne votent pas cette ann\u00e9e gardent leur gouverneur et restent en gris.',
      en: 'Projection for the 36 races on the 2026 ballot. The 14 states not voting this year keep their governor and stay greyed out.',
      es: 'Proyecci\u00f3n de las 36 contiendas de 2026. Los 14 estados que no votan este a\u00f1o conservan su gobernador y quedan en gris.',
    },
    pageTitle: {
      fr: 'Qui gagnera les postes de gouverneur en 2026 ? \u2014 Vote-Scope',
      en: 'Who Wins the 2026 Governor Races? \u2014 Vote-Scope',
      es: '\u00bfQui\u00e9n ganar\u00e1 las gobernaciones en 2026? \u2014 Vote-Scope',
    },
    metaDescription: {
      fr: 'Projection des 36 \u00e9lections de gouverneur de 2026, \u00c9tat par \u00c9tat : sondages agr\u00e9g\u00e9s, si\u00e8ges ouverts, courses serr\u00e9es et r\u00e9partition des 50 postes. Mise \u00e0 jour continue.',
      en: 'All 36 governor races on the 2026 ballot, projected state by state: aggregated polls, open seats, toss-ups and the split of all 50 governorships. Updated continuously.',
      es: 'Las 36 elecciones de gobernador de 2026, proyectadas estado por estado: sondeos agregados, puestos abiertos y el reparto de las 50 gobernaciones. Actualizado continuamente.',
    },
    baselineYear: 2022,
    seatsTotal: 50,
    byelections: false,
    mapCenter: [39, -98],
    mapZoom: 4,
    idProp: 'riding_id',
    parties: ['us_dem', 'us_rep'],
    slug: { en: 'governors', fr: 'gouverneurs' },
    currentPage: 'us',
  },

  uk: {
    id: 'uk',
    dataPath: 'uk',
    geoPath: 'uk',
    heroTitle: {
      fr: 'Prévision <em>britannique</em>',
      en: 'U.K. <em>General Election</em>',
      es: 'Pronóstico <em>británico</em>',
    },
    institution: {
      fr: 'Composition actuelle de la Chambre des communes',
      en: 'Current House of Commons Composition',
      es: 'Composición actual de la Cámara de los Comunes',
    },
    source: {
      fr: 'Sources : Electoral Commission, firmes de sondage publiques',
      en: 'Sources: Electoral Commission, public polling firms',
      es: 'Fuentes: Electoral Commission, sondeadoras públicas',
    },
    mapSubtitle: {
      fr: 'Projection par circonscription basée sur les résultats 2024, les sondages nationaux et les tendances régionales.',
      en: 'Constituency projection based on 2024 results, national polling and regional trends.',
      es: 'Proyección por circunscripción basada en los resultados de 2024, los sondeos nacionales y las tendencias regionales.',
    },
    pageTitle: {
      fr: 'Qui va gagner la prochaine élection au Royaume-Uni ? — Vote-Scope',
      en: 'Who Will Win the Next UK General Election? — Vote-Scope',
      es: '¿Quién ganará las próximas elecciones del Reino Unido? — Vote-Scope',
    },
    metaDescription: {
      fr: 'Qui va gagner la prochaine élection générale au Royaume-Uni? Sondages nationaux agrégés, projection des 650 sièges des Communes, sièges marginaux et probabilités de majorité. Mise à jour continue.',
      en: 'Who wins the next UK general election? National polls aggregated, all 650 House of Commons seats projected, marginal seats and majority odds. Updated with every new poll.',
      es: '¿Quién gana las próximas elecciones generales del Reino Unido? Encuestas agregadas, 650 escaños de los Comunes proyectados, escaños marginales y probabilidades de mayoría. Actualizado continuamente.',
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
