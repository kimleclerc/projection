export type SpecialElectionLocale = 'en' | 'fr' | 'es';

export interface SpecialElectionConfig {
  slug: string;
  dataPath: string;
  currentPage: string;
  modelBadge: string;
  title: string;
  description: string;
  kicker: string;
  headline: string;
  dek: string;
  /** Spanish overrides for hero copy. Falls back to EN fields when absent. */
  kicker_es?: string;
  headline_es?: string;
  dek_es?: string;
  paths: Partial<Record<SpecialElectionLocale, string>>;
  translated: Partial<Record<SpecialElectionLocale, boolean>>;
  /** Polymarket market slug/URL for optional iframe embed. Omit if no market. */
  polymarketMarket?: string;
  /** Override title shown in ElectionCountdown. Falls back to neutral generic when absent. */
  countdownTitle?: string;
}

export const specialElections = {
  ca1: {
    slug: 'ca1',
    dataPath: 'ca1-special',
    currentPage: 'usa-hub',
    modelBadge: 'Fundamentals-only',
    title: 'CA-1 Special Primary Result — Resolved Archive — Vote-Scope',
    description:
      "Archived result: in the June 2, 2026 CA-1 top-two special primary, Republican James Gallagher led (~47%) with Democrat Mike McGuire second (~38%); both advance to the special general. VoteScope's fundamentals-only model projected the field before election day.",
    kicker: 'Resolved special primary · June 2, 2026',
    headline: 'CA-1 primary archive.',
    dek:
      "Resolved archive of the June 2, 2026 top-two special primary. Republican James Gallagher finished first (~47%) and Democrat Mike McGuire second (~38%) — the two advance to the special general in this safely Republican district. VoteScope's fundamentals-only model projected the field before election day.",
    kicker_es: 'Primaria especial resuelta · 2 de junio de 2026',
    headline_es: 'Archivo de la primaria CA-1.',
    dek_es:
      'Archivo resuelto de la primaria especial top-2 del 2 de junio de 2026. El republicano James Gallagher quedó primero (~47%) y el demócrata Mike McGuire segundo (~38%) — ambos avanzan a la general especial en este distrito seguro republicano. El modelo solo de fundamentos de VoteScope proyectó la contienda antes del día de la elección.',
    paths: {
      en: '/en/us/specials/ca1/',
      fr: '/fr/us/specials/ca1/',
      es: '/es/us/specials/ca1/',
    },
    translated: {
      en: true,
      fr: false,
      es: true,
    },
    // ca1: no durable Polymarket market per Grok review
  },
  ca14: {
    slug: 'ca14',
    dataPath: 'ca14-special',
    currentPage: 'usa-hub',
    modelBadge: 'Fundamentals-only',
    title: 'CA-14 Special Election Forecast — Vote-Scope',
    description:
      "Projects the June 16, 2026 CA-14 special top-two primary: top-two odds, August runoff risk, and the most likely general pairing. 50,000 simulations — Vote-Scope.",
    kicker: 'U.S. House special · June 16',
    headline: 'CA-14 special primary forecast.',
    dek:
      "California's 14th Congressional District has a certified special-election field. This desk models the June 16 top-two special primary first, then the August 18 special general if no candidate clears 50% outright.",
    kicker_es: 'Especial Cámara EE. UU. · 16 de junio',
    headline_es: 'Pronóstico de la primaria especial CA-14.',
    dek_es:
      'El 14.° Distrito Congresional de California ya tiene una lista certificada de candidatos. Este desk modela primero la primaria especial top-2 del 16 de junio y después la general especial del 18 de agosto si ningún candidato supera el 50 % directamente.',
    paths: {
      en: '/en/us/specials/ca14/',
      fr: '/fr/us/specials/ca14/',
      es: '/es/us/specials/ca14/',
    },
    translated: {
      en: true,
      fr: false,
      es: true,
    },
    polymarketMarket: 'ca-14-special-election-winner',
  },
  ga14: {
    slug: 'ga14',
    dataPath: 'ga14-runoff',
    currentPage: 'usa-hub',
    modelBadge: 'Fundamentals-only',
    title: 'GA-14 Special Runoff — Called Correctly — Vote-Scope',
    description:
      "Vote-Scope called GA-14 correctly: 95.8% pre-election win probability for Clay Fuller, validated by $3.79M in market volume. Archive of the model that got it right.",
    kicker: 'Result locked · April 8, 2026 · Georgia 14',
    headline: "Fuller won.\nWe called it.",
    dek:
      "VoteScope built this special-election page for a no-polls runoff environment, leaning on first-round structure, district partisanship and 50,000 Monte Carlo simulations. The call held: Clay Fuller won, validating the model's first public special-election projection.",
    kicker_es: 'Resultado confirmado · 8 de abril de 2026 · Georgia 14',
    headline_es: 'Fuller ganó.\nLo pronosticamos.',
    dek_es:
      'VoteScope construyó esta página para un entorno de segunda vuelta sin encuestas, apoyándose en la estructura de la primera ronda, el partidismo del distrito y 50 000 simulaciones Monte Carlo. El pronóstico se confirmó: Clay Fuller ganó, validando la primera proyección pública de elección especial del modelo.',
    paths: {
      en: '/en/us/specials/ga14/',
      fr: '/fr/us/specials/ga14/',
      es: '/es/us/specials/ga14/',
    },
    translated: {
      en: true,
      fr: false,
      es: true,
    },
    // GA-14 special is resolved; no active Polymarket market per Grok review
  },
  nj11: {
    slug: 'nj11',
    dataPath: 'nj11-special',
    currentPage: 'usa-hub',
    modelBadge: 'Fundamentals-only',
    title: 'NJ-11 Special Election Result — Vote-Scope',
    description:
      "Archived result: Vote-Scope projected Analilia Mejia as the clear favorite before the April 16, 2026 NJ-11 special election — confirmed on election day. Decisive Democratic hold.",
    kicker: 'Resolved special election · April 16',
    headline: 'NJ-11 result archive.',
    dek:
      "This page is now a resolved archive. VoteScope projected Analilia Mejia as the clear favorite before election day, and the district finished in a decisive Democratic hold.",
    kicker_es: 'Elección especial resuelta · 16 de abril',
    headline_es: 'Archivo de resultados NJ-11.',
    dek_es:
      'Esta página es ahora un archivo resuelto. VoteScope proyectó a Analilia Mejia como la clara favorita antes del día de la elección, y el distrito terminó con una contundente retención demócrata.',
    paths: {
      en: '/en/us/specials/nj11/',
      fr: '/fr/us/specials/nj11/',
      es: '/es/us/specials/nj11/',
    },
    translated: {
      en: true,
      fr: false,
      es: true,
    },
    polymarketMarket: 'nj-11-special-election-margin-of-victory',
  },
} satisfies Record<string, SpecialElectionConfig>;

export type SpecialElectionKey = keyof typeof specialElections;

export function getSpecialElectionAlternates(config: SpecialElectionConfig) {
  return Object.fromEntries(
    Object.entries(config.paths).map(([locale, path]) => [
      locale,
      `https://vote-scope.com${path}`,
    ]),
  ) as { en: string; fr: string; es?: string };
}
