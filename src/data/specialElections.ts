export type SpecialElectionLocale = 'en' | 'fr' | 'es';

export interface SpecialElectionConfig {
  slug: string;
  /**
   * Jour du scrutin, ISO — `null` tant qu'une vacance attend son bref.
   * Le desk s'en sert pour séparer les courses vives des archives : sans lui,
   * un résultat d'avril s'affichait avec le même poids visuel qu'une course
   * en attente, et rien ne signalait qu'un desk avait dépassé sa date.
   */
  electionDate: string | null;
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
  /**
   * Overrides localisés du bandeau. Repli sur les champs EN quand absents —
   * ce repli laissait une accroche anglaise au présent sur les pages FR d'une
   * course déjà tranchée, d'où les variantes `_fr`.
   */
  kicker_fr?: string;
  headline_fr?: string;
  dek_fr?: string;
  kicker_es?: string;
  headline_es?: string;
  dek_es?: string;
  paths: Partial<Record<SpecialElectionLocale, string>>;
  translated: Partial<Record<SpecialElectionLocale, boolean>>;
  /** Polymarket market slug/URL for optional iframe embed. Omit if no market. */
  polymarketMarket?: string;
  /** Override title shown in ElectionCountdown. Falls back to neutral generic when absent. */
  countdownTitle?: string;
  /** Editorially curated Amazon shelf, shown only when a race-specific context exists. */
  bookContext?: 'ga13' | 'fl20' | 'tx23';
}

export const specialElections = {
  ga13: {
    slug: 'ga13',
    electionDate: '2026-08-25',
    dataPath: 'ga13-special',
    currentPage: 'usa-hub',
    modelBadge: 'Fundamentals-only · 50,000 simulations',
    title: 'GA-13 Special Runoff Result — Vote-Scope',
    title_fr: 'Second tour spécial GA-13 — résultat — Vote-Scope',
    title_es: 'Segunda vuelta especial GA-13 — resultado — Vote-Scope',
    description:
      "Official August 25, 2026 result: Everton Blair beat Marcye Scott 53.95% to 46.05% in the GA-13 special runoff. Vote-Scope had Scott at 85.9% — the archive of a missed call.",
    description_fr:
      "Résultat officiel du 25 août 2026 : Everton Blair bat Marcye Scott 53,95 % contre 46,05 % au second tour spécial de GA-13. Vote-Scope donnait Scott à 85,9 % — l'archive d'un appel manqué.",
    description_es:
      'Resultado oficial del 25 de agosto de 2026: Everton Blair venció a Marcye Scott 53,95 % a 46,05 % en la segunda vuelta especial de GA-13. Vote-Scope daba a Scott un 85,9 % — el archivo de un pronóstico fallido.',
    kicker: 'Resolved special runoff · August 25, 2026 · Georgia 13',
    headline: 'Blair won.\nWe had Scott.',
    dek:
      "Everton Blair took the August 25 runoff with 9,895 votes to Marcye Scott's 8,447 — 53.95% to 46.05% on the Georgia Secretary of State's official count. Vote-Scope made Scott an 85.9% favorite by a mean margin of 7.9 points; she lost by 7.9 points, below the model's 5th percentile. The forecast is kept here unchanged, as the record of a miss.",
    kicker_fr: 'Second tour spécial tranché · 25 août 2026 · Géorgie 13',
    headline_fr: 'Blair a gagné.\nNous avions Scott.',
    dek_fr:
      "Everton Blair a emporté le second tour du 25 août par 9 895 voix contre 8 447 à Marcye Scott — 53,95 % contre 46,05 % au décompte officiel du secrétaire d'État de Géorgie. Vote-Scope donnait Scott favorite à 85,9 %, avec une marge moyenne de 7,9 points ; elle a perdu par 7,9 points, sous le 5e centile du modèle. La projection est conservée telle quelle : c'est l'archive d'un raté.",
    kicker_es: 'Segunda vuelta especial resuelta · 25 de agosto de 2026 · Georgia 13',
    headline_es: 'Blair ganó.\nNosotros teníamos a Scott.',
    dek_es:
      'Everton Blair ganó la segunda vuelta del 25 de agosto por 9 895 votos frente a los 8 447 de Marcye Scott — 53,95 % contra 46,05 % en el recuento oficial de la Secretaría de Estado de Georgia. Vote-Scope daba a Scott como favorita con un 85,9 % y una ventaja media de 7,9 puntos; perdió por 7,9 puntos, por debajo del percentil 5 del modelo. La proyección se conserva sin cambios: es el archivo de un fallo.',
    paths: {
      en: '/en/us/specials/ga13/',
      fr: '/fr/us/specials/ga13/',
      es: '/es/us/specials/ga13/',
    },
    translated: { en: true, fr: false, es: true },
    bookContext: 'ga13',
  },
  fl20: {
    slug: 'fl20',
    electionDate: null,
    dataPath: 'fl20-special',
    currentPage: 'usa-hub',
    modelBadge: 'Provisional party-control model',
    title: 'FL-20 Special Election Projection — Vote-Scope',
    title_fr: 'Partielle FL-20 : projection provisoire — Vote-Scope',
    title_es: 'Especial FL-20: proyección provisional — Vote-Scope',
    description: 'A provisional party-control forecast for the vacant FL-20 U.S. House seat while Florida has not yet set the special-election date.',
    description_fr: 'Projection provisoire du contrôle partisan du siège fédéral vacant FL-20, en attendant que la Floride fixe la date de la partielle.',
    description_es: 'Pronóstico provisional del control partidista del escaño federal vacante FL-20, a la espera de una fecha oficial.',
    kicker: 'Pending U.S. House special · Date TBD',
    headline: 'FL‑20 is vacant. The projection is live.',
    dek: 'Florida has not yet called the special election. Until the date and nominees are official, Vote-Scope publishes a deliberately wide party-level forecast anchored to the 119th Congress district.',
    kicker_es: 'Especial pendiente · Fecha por definir',
    headline_es: 'FL‑20 está vacante. La proyección está activa.',
    dek_es: 'Florida aún no ha convocado la elección. Hasta que se confirmen fecha y candidatos, Vote-Scope publica un pronóstico partidista amplio anclado al distrito del 119.º Congreso.',
    paths: { en: '/en/us/specials/fl20/', fr: '/fr/us/specials/fl20/', es: '/es/us/specials/fl20/' },
    translated: { en: true, fr: false, es: true },
    bookContext: 'fl20',
  },
  tx23: {
    slug: 'tx23',
    electionDate: null,
    dataPath: 'tx23-special',
    currentPage: 'usa-hub',
    modelBadge: 'Provisional party-control model',
    title: 'TX-23 Special Election Projection — Vote-Scope',
    title_fr: 'Partielle TX-23 : projection provisoire — Vote-Scope',
    title_es: 'Especial TX-23: proyección provisional — Vote-Scope',
    description: 'A provisional party-control forecast for the vacant TX-23 U.S. House seat while Texas has not yet set the special-election date.',
    description_fr: 'Projection provisoire du contrôle partisan du siège fédéral vacant TX-23, en attendant que le Texas fixe la date de la partielle.',
    description_es: 'Pronóstico provisional del control partidista del escaño federal vacante TX-23, a la espera de una fecha oficial.',
    kicker: 'Pending U.S. House special · Date TBD',
    headline: 'TX‑23 is vacant. The projection is live.',
    dek: 'Texas has not yet called the special election. The initial desk projects eventual party control on the 119th Congress boundaries, with extra uncertainty for turnout and an unknown field.',
    kicker_es: 'Especial pendiente · Fecha por definir',
    headline_es: 'TX‑23 está vacante. La proyección está activa.',
    dek_es: 'Texas aún no ha convocado la elección. El desk inicial proyecta el control partidista en los límites del 119.º Congreso, con incertidumbre adicional por participación y candidatos desconocidos.',
    paths: { en: '/en/us/specials/tx23/', fr: '/fr/us/specials/tx23/', es: '/es/us/specials/tx23/' },
    translated: { en: true, fr: false, es: true },
    bookContext: 'tx23',
  },
  ca1: {
    slug: 'ca1',
    electionDate: '2026-06-02',
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
    electionDate: '2026-08-18',
    dataPath: 'ca14-special',
    currentPage: 'usa-hub',
    modelBadge: 'Fundamentals-only',
    title: 'CA-14 Special Election Result — Vote-Scope',
    title_fr: 'Élection spéciale CA-14 — résultat — Vote-Scope',
    title_es: 'Elección especial CA-14 — resultado — Vote-Scope',
    description:
      'August 18, 2026 result: Aisha Wahab won the all-Democratic CA-14 special general 53.1% to 46.9% over Melissa Hernandez, and was sworn in on September 2.',
    description_fr:
      "Résultat du 18 août 2026 : Aisha Wahab remporte la générale spéciale de CA-14, entièrement démocrate, par 53,1 % contre 46,9 % à Melissa Hernandez, et prête serment le 2 septembre.",
    description_es:
      'Resultado del 18 de agosto de 2026: Aisha Wahab ganó la general especial de CA-14, entre dos demócratas, por 53,1 % frente al 46,9 % de Melissa Hernandez, y juró el cargo el 2 de septiembre.',
    kicker: 'Resolved special election · August 18, 2026 · California 14',
    headline: 'Wahab won CA‑14.',
    dek:
      "Aisha Wahab beat Melissa Hernandez 51,692 votes to 45,670 — 53.1% to 46.9% — in the August 18 all-Democratic special general, and was sworn in on September 2. The forecast on this page is the June 16 primary round only: it put Wahab first, which held, but understated her share and expected a different runner-up. Vote-Scope never published a projection for the August final. Counts are the Secretary of State's unofficial totals, due to be certified by September 25.",
    kicker_fr: 'Élection spéciale tranchée · 18 août 2026 · Californie 14',
    headline_fr: 'Wahab a gagné CA‑14.',
    dek_fr:
      "Aisha Wahab a battu Melissa Hernandez par 51 692 voix contre 45 670 — 53,1 % contre 46,9 % — à la générale spéciale du 18 août, entièrement démocrate, et a prêté serment le 2 septembre. La projection affichée ici ne porte que sur le premier tour du 16 juin : elle plaçait bien Wahab en tête, mais sous-estimait sa part et attendait une autre deuxième. Vote-Scope n'a jamais publié de prévision pour la finale d'août. Les décomptes sont les totaux non officiels du secrétaire d'État, à certifier d'ici le 25 septembre.",
    kicker_es: 'Elección especial resuelta · 18 de agosto de 2026 · California 14',
    headline_es: 'Wahab ganó CA‑14.',
    dek_es:
      'Aisha Wahab venció a Melissa Hernandez por 51 692 votos frente a 45 670 — 53,1 % contra 46,9 % — en la general especial del 18 de agosto, entre dos demócratas, y juró el cargo el 2 de septiembre. La proyección de esta página cubre solo la primaria del 16 de junio: situaba a Wahab en cabeza, lo que se cumplió, pero subestimaba su porcentaje y esperaba a otra segunda. Vote-Scope nunca publicó un pronóstico para la final de agosto. Las cifras son los totales no oficiales de la Secretaría de Estado, con certificación prevista para el 25 de septiembre.',
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
    electionDate: '2026-04-07',
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
    electionDate: '2026-04-16',
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
