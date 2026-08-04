export type SpecialElectionLocale = 'en' | 'fr' | 'es';

export interface SpecialElectionConfig {
  slug: string;
  dataPath: string;
  currentPage: string;
  modelBadge: string;
  title: string;
  description: string;
  /** Localized meta overrides — Bing flags identical cross-locale titles/descriptions. */
  title_fr?: string;
  description_fr?: string;
  title_es?: string;
  description_es?: string;
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
    title: 'CA-1 Special Election Result — Vote-Scope',
    title_fr: 'Élection spéciale CA-1 — résultat — Vote-Scope',
    title_es: 'Elección especial CA-1 — resultado — Vote-Scope',
    description_fr: 'Résultat certifié du 2 juin 2026 : James Gallagher a gagné CA-1 avec 62,1 % et évité la générale provisoire d’août.',
    description_es: 'Resultado certificado del 2 de junio de 2026: James Gallagher ganó CA-1 con 62,1 % y evitó la general provisional de agosto.',
    description: 'Certified June 2, 2026 result: James Gallagher won CA-1 with 62.1% and avoided the provisional August general election.',
    kicker: 'Resolved special election · June 2, 2026',
    headline: 'Gallagher cleared 50%. No runoff.',
    dek: 'James Gallagher won 62.1% in the certified June 2 result, filling the CA-1 vacancy outright. Because he crossed 50%, California will not hold the provisional August 4 special general.',
    kicker_es: 'Elección especial resuelta · 2 de junio de 2026',
    headline_es: 'Gallagher superó el 50 %. No habrá segunda vuelta.',
    dek_es: 'James Gallagher obtuvo 62,1 % en el resultado certificado del 2 de junio y cubrió directamente la vacante de CA-1. Al superar el 50 %, California no celebrará la elección especial provisional del 4 de agosto.',
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
    title: 'CA-14 Special Election 2026: Wahab vs Hernandez — Polls, Forecast & Polymarket Odds — Vote-Scope',
    title_fr: 'Spéciale CA-14 2026 : Wahab contre Hernandez — sondages, projection et cotes — Vote-Scope',
    title_es: 'Especial CA-14 2026: Wahab contra Hernandez — encuestas, proyección y cuotas — Vote-Scope',
    description_fr: 'Suit la générale spéciale du 18 août 2026 dans CA-14 entre Aisha Wahab et Melissa Hernandez après la primaire certifiée de juin.',
    description_es: 'Sigue la general especial del 18 de agosto de 2026 en CA-14 entre Aisha Wahab y Melissa Hernandez tras la primaria certificada de junio.',
    description: 'Tracks the August 18, 2026 CA-14 special general between Aisha Wahab and Melissa Hernandez after the certified June primary.',
    kicker: 'U.S. House special · August 18',
    headline: 'CA-14 moves to an all-Democratic final.',
    dek: 'Aisha Wahab led the certified June 16 primary with 42.8%, followed by Melissa Hernandez at 16.8%. Neither cleared 50%, so the two Democrats advance to the August 18 special general.',
    kicker_es: 'Especial Cámara EE. UU. · 18 de agosto',
    headline_es: 'CA-14 avanza a una final entre demócratas.',
    dek_es: 'Aisha Wahab lideró la primaria certificada del 16 de junio con 42,8 %, seguida de Melissa Hernandez con 16,8 %. Como ninguna superó el 50 %, las dos demócratas avanzan a la elección especial del 18 de agosto.',
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
    title_fr: 'Second tour spécial GA-14 — appel réussi — Vote-Scope',
    title_es: 'Segunda vuelta especial GA-14 — acierto del modelo — Vote-Scope',
    description_fr: "Vote-Scope avait vu juste sur GA-14 : 95,8 % de probabilité de victoire pour Clay Fuller avant le vote, validée par 3,79 M$ de volume de marché. Archive du modèle qui a eu raison.",
    description_es: "Vote-Scope acertó en GA-14: 95,8 % de probabilidad de victoria para Clay Fuller antes del voto, validada por 3,79 M$ de volumen de mercado. Archivo del modelo que acertó.",
    description:
      "Vote-Scope called GA-14 correctly: 95.8% pre-election win probability for Clay Fuller, validated by $3.79M in market volume. Archive of the model that got it right.",
    kicker: 'Result locked · April 8, 2026 · Georgia 14',
    headline: "Fuller won.\nWe called it.",
    dek:
      "Vote-Scope built this special-election page for a no-polls runoff environment, leaning on first-round structure, district partisanship and 50,000 Monte Carlo simulations. The call held: Clay Fuller won, validating the model's first public special-election projection.",
    kicker_es: 'Resultado confirmado · 8 de abril de 2026 · Georgia 14',
    headline_es: 'Fuller ganó.\nLo pronosticamos.',
    dek_es:
      'Vote-Scope construyó esta página para un entorno de segunda vuelta sin encuestas, apoyándose en la estructura de la primera ronda, el partidismo del distrito y 50 000 simulaciones Monte Carlo. El pronóstico se confirmó: Clay Fuller ganó, validando la primera proyección pública de elección especial del modelo.',
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
    title_fr: 'Élection spéciale NJ-11 — résultat — Vote-Scope',
    title_es: 'Elección especial NJ-11 — resultado — Vote-Scope',
    description_fr: "Résultat archivé : Vote-Scope projetait Analilia Mejia grande favorite avant l'élection spéciale NJ-11 du 16 avril 2026 — confirmé le soir du vote. Maintien démocrate décisif.",
    description_es: "Resultado archivado: Vote-Scope proyectaba a Analilia Mejia como clara favorita antes de la elección especial NJ-11 del 16 de abril de 2026 — confirmado el día del voto. Retención demócrata decisiva.",
    description:
      "Archived result: Vote-Scope projected Analilia Mejia as the clear favorite before the April 16, 2026 NJ-11 special election — confirmed on election day. Decisive Democratic hold.",
    kicker: 'Resolved special election · April 16',
    headline: 'NJ-11 result archive.',
    dek:
      "This page is now a resolved archive. Vote-Scope projected Analilia Mejia as the clear favorite before election day, and the district finished in a decisive Democratic hold.",
    kicker_es: 'Elección especial resuelta · 16 de abril',
    headline_es: 'Archivo de resultados NJ-11.',
    dek_es:
      'Esta página es ahora un archivo resuelto. Vote-Scope proyectó a Analilia Mejia como la clara favorita antes del día de la elección, y el distrito terminó con una contundente retención demócrata.',
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
