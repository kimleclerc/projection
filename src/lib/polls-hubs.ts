/**
 * Polls-hub registry — one config per jurisdiction drives BOTH the hub routes
 * and the aggregate og:image, so adding a jurisdiction is a single entry, not
 * 15 bespoke files (uniformity principle, cf. memory feedback_uniformity).
 *
 * `base[lang]` is the path prefix (mirrors each jurisdiction's existing
 * projection/riding routes) and `seg[lang]` the localized "polls" segment.
 * Full hub URL = `${base[lang]}/${seg[lang]}/`.
 */
export type HubLang = 'en' | 'fr' | 'es';

export interface HubCopy {
  eyebrow: string;
  h1: string;
  lede1: string;
  lede2: string;
  ogEyebrow: string;
  ogTitle: string;
  ogSub: string;
}

export interface PollsHubConfig {
  webKey: string;
  currentPage: string;            // EditorialLayout nav key
  langs: HubLang[];
  base: Record<HubLang, string>;  // path prefix per language
  seg: Record<HubLang, string>;   // localized "polls" segment
  copy: Record<HubLang, HubCopy>;
  hasCards?: boolean;             // emit per-poll share PNGs for this hub (us-house, federal, uk, quebec)
}

const SEG: Record<HubLang, string> = { en: 'polls', fr: 'sondages', es: 'sondeos' };
const SITE = 'https://vote-scope.com';

export const POLLS_HUBS: Record<string, PollsHubConfig> = {
  'us-house': {
    webKey: 'us-house', currentPage: 'us', langs: ['en', 'fr', 'es'], seg: SEG, hasCards: true,
    base: { en: '/en/us/house', fr: '/fr/us/chambre', es: '/es/us/house' },
    copy: {
      en: { eyebrow: 'Polls · U.S. House of Representatives · 2026 cycle', h1: 'The generic ballot.',
        lede1: 'Which party will control the House after the 2026 midterms? The <em>generic ballot</em> —asking voters whether they’d back the Democrat or the Republican in their district— is the single best national read on the race.',
        lede2: 'Vote-Scope gathers every published national poll and runs it through its model to project seats. Below: the trend against the model estimate, then the full poll-by-poll table.',
        ogEyebrow: 'POLLS · U.S. HOUSE', ogTitle: 'Generic Ballot — U.S. House', ogSub: 'Vote-Scope average · 2026 cycle' },
      fr: { eyebrow: 'Sondages · Chambre des représentants des États-Unis · cycle 2026', h1: 'Le vote générique.',
        lede1: 'Quel parti contrôlera la Chambre après les élections de mi-mandat de 2026 ? Le <em>vote générique</em> —demander aux électeurs s’ils appuieraient le candidat démocrate ou républicain dans leur circonscription— reste le meilleur baromètre national de la course.',
        lede2: 'Vote-Scope réunit chaque sondage national publié et le traduit, par son modèle, en projection de sièges. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet, sondage par sondage.',
        ogEyebrow: 'SONDAGES · CHAMBRE US', ogTitle: 'Vote générique — Chambre US', ogSub: 'Moyenne Vote-Scope · cycle 2026' },
      es: { eyebrow: 'Sondeos · Cámara de Representantes de EE. UU. · ciclo 2026', h1: 'El voto genérico para la Cámara.',
        lede1: '¿Qué partido controlará la Cámara tras las legislativas de 2026? El <em>voto genérico</em> —preguntar a los votantes si apoyarían al candidato demócrata o republicano en su distrito— es el mejor termómetro nacional de la contienda.',
        lede2: 'Vote-Scope reúne todos los sondeos nacionales publicados y, con su modelo, los convierte en una proyección de escaños. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa sondeo por sondeo.',
        ogEyebrow: 'SONDEOS · CÁMARA US', ogTitle: 'Voto genérico — Cámara US', ogSub: 'Promedio Vote-Scope · ciclo 2026' },
    },
  },
  'us-senate': {
    webKey: 'us-senate', currentPage: 'us', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/us/senate', fr: '/fr/us/senat', es: '/es/us/senate' },
    copy: {
      en: { eyebrow: 'Polls · U.S. Senate · 2026 cycle', h1: 'Senate polling.',
        lede1: 'The 2026 map decides whether the Senate flips. These are the published polls for the seats in play, race by race.',
        lede2: 'Vote-Scope aggregates them and projects the chamber. Below: the trend against the model estimate, then the full poll-by-poll table.',
        ogEyebrow: 'POLLS · U.S. SENATE', ogTitle: 'U.S. Senate polling', ogSub: 'Vote-Scope · 2026 cycle' },
      fr: { eyebrow: 'Sondages · Sénat des États-Unis · cycle 2026', h1: 'Sondages pour le Sénat.',
        lede1: 'La carte de 2026 décidera si le Sénat bascule. Voici les sondages publiés pour les sièges en jeu, course par course.',
        lede2: 'Vote-Scope les agrège et projette la chambre. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · SÉNAT US', ogTitle: 'Sondages pour le Sénat US', ogSub: 'Vote-Scope · cycle 2026' },
      es: { eyebrow: 'Sondeos · Senado de EE. UU. · ciclo 2026', h1: 'Sondeos para el Senado.',
        lede1: 'El mapa de 2026 decidirá si el Senado cambia de manos. Estos son los sondeos publicados de los escaños en juego, contienda por contienda.',
        lede2: 'Vote-Scope los agrega y proyecta la cámara. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'SONDEOS · SENADO US', ogTitle: 'Sondeos para el Senado US', ogSub: 'Vote-Scope · ciclo 2026' },
    },
  },
  'us-governor': {
    webKey: 'us-governor', currentPage: 'us', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/us/governors', fr: '/fr/us/gouverneurs', es: '/es/us/gobernadores' },
    copy: {
      en: { eyebrow: 'Polls · U.S. governors · 2026 cycle', h1: 'Governor polling.',
        lede1: 'Thirty-six states elect a governor in November, and half of those seats are open — the sitting governor is term-limited or retiring. These are the published polls, race by race.',
        lede2: 'Vote-Scope aggregates them and projects all fifty governorships. Below: the trend against the model estimate, then the full poll-by-poll table.',
        ogEyebrow: 'POLLS · U.S. GOVERNORS', ogTitle: 'U.S. governor polling', ogSub: 'Vote-Scope · 2026 cycle' },
      fr: { eyebrow: 'Sondages · Gouverneurs américains · cycle 2026', h1: 'Sondages pour les gouverneurs.',
        lede1: 'Trente-six États élisent un gouverneur en novembre, et la moitié de ces postes sont ouverts : le sortant est limité par les mandats ou se retire. Voici les sondages publiés, course par course.',
        lede2: 'Vote-Scope les agrège et projette les cinquante postes. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · GOUVERNEURS US', ogTitle: 'Sondages pour les gouverneurs US', ogSub: 'Vote-Scope · cycle 2026' },
      es: { eyebrow: 'Sondeos · Gobernadores de EE. UU. · ciclo 2026', h1: 'Sondeos para gobernador.',
        lede1: 'Treinta y seis estados eligen gobernador en noviembre, y la mitad de esos puestos quedan abiertos: el titular no puede repetir o se retira. Estos son los sondeos publicados, contienda por contienda.',
        lede2: 'Vote-Scope los agrega y proyecta las cincuenta gobernaciones. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'SONDEOS · GOBERNADORES US', ogTitle: 'Sondeos para gobernador US', ogSub: 'Vote-Scope · ciclo 2026' },
    },
  },
  federal: {
    webKey: 'federal', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG, hasCards: true,
    base: { en: '/en/canada/federal', fr: '/fr/canada/federal', es: '/es/canada/federal' },
    copy: {
      en: { eyebrow: 'Polls · Canada · House of Commons', h1: 'Federal voting intention.',
        lede1: 'Who forms the next government? Every published national poll on federal voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects seats in the Commons. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · CANADA FEDERAL', ogTitle: 'Federal voting intention', ogSub: 'Vote-Scope · House of Commons' },
      fr: { eyebrow: 'Sondages · Canada · Chambre des communes', h1: 'Intentions de vote fédérales.',
        lede1: 'Qui formera le prochain gouvernement ? Chaque sondage national publié sur les intentions de vote fédérales, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette les sièges aux Communes. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · CANADA FÉDÉRAL', ogTitle: 'Intentions de vote fédérales', ogSub: 'Vote-Scope · Chambre des communes' },
      es: { eyebrow: 'Sondeos · Canadá · Cámara de los Comunes', h1: 'Intención de voto federal.',
        lede1: '¿Quién formará el próximo gobierno? Cada sondeo nacional publicado sobre la intención de voto federal, encuestadora por encuestadora.',
        lede2: 'Vote-Scope los agrega y proyecta los escaños en los Comunes. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'SONDEOS · CANADÁ FEDERAL', ogTitle: 'Intención de voto federal', ogSub: 'Vote-Scope · Cámara de los Comunes' },
    },
  },
  quebec: {
    webKey: 'quebec', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG, hasCards: true,
    base: { en: '/en/canada/quebec', fr: '/fr/canada/quebec', es: '/es/canada/quebec' },
    copy: {
      en: { eyebrow: 'Polls · Quebec · National Assembly', h1: 'Quebec voting intention.',
        lede1: 'CAQ, PLQ, PQ, QS: every published provincial poll on Quebec voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects the National Assembly. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · QUEBEC', ogTitle: 'Quebec voting intention', ogSub: 'Vote-Scope · National Assembly' },
      fr: { eyebrow: 'Sondages · Québec · Assemblée nationale', h1: 'Intentions de vote au Québec.',
        lede1: 'CAQ, PLQ, PQ, QS : chaque sondage provincial publié sur les intentions de vote au Québec, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette l’Assemblée nationale. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · QUÉBEC', ogTitle: 'Intentions de vote au Québec', ogSub: 'Vote-Scope · Assemblée nationale' },
      es: { eyebrow: 'Sondeos · Quebec · Asamblea Nacional', h1: 'Intención de voto en Quebec.',
        lede1: 'CAQ, PLQ, PQ, QS: cada sondeo provincial publicado sobre la intención de voto en Quebec, encuestadora por encuestadora.',
        lede2: 'Vote-Scope los agrega y proyecta la Asamblea Nacional. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'SONDEOS · QUEBEC', ogTitle: 'Intención de voto en Quebec', ogSub: 'Vote-Scope · Asamblea Nacional' },
    },
  },
  ontario: {
    webKey: 'ontario', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/canada/ontario', fr: '/fr/canada/ontario', es: '/es/canada/ontario' },
    copy: {
      en: { eyebrow: 'Polls · Ontario · Legislative Assembly', h1: 'Ontario voting intention.',
        lede1: 'PC, OLP, NDP, Greens: every published provincial poll on Ontario voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects Queen’s Park. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · ONTARIO', ogTitle: 'Ontario voting intention', ogSub: 'Vote-Scope · Legislative Assembly' },
      fr: { eyebrow: 'Sondages · Ontario · Assemblée législative', h1: 'Intentions de vote en Ontario.',
        lede1: 'PC, PLO, NPD, Verts : chaque sondage provincial publié sur les intentions de vote en Ontario, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette l’Assemblée législative. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · ONTARIO', ogTitle: 'Intentions de vote en Ontario', ogSub: 'Vote-Scope · Assemblée législative' },
      es: { eyebrow: 'Sondeos · Ontario · Asamblea Legislativa', h1: 'Intención de voto en Ontario.',
        lede1: 'PC, OLP, NDP, Verdes: cada sondeo provincial publicado sobre la intención de voto en Ontario, encuestadora por encuestadora.',
        lede2: 'Vote-Scope los agrega y proyecta Queen’s Park. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'SONDEOS · ONTARIO', ogTitle: 'Intención de voto en Ontario', ogSub: 'Vote-Scope · Asamblea Legislativa' },
    },
  },
  uk: {
    webKey: 'uk', currentPage: 'uk', langs: ['en', 'fr', 'es'], seg: SEG, hasCards: true,
    base: { en: '/en/uk', fr: '/fr/uk', es: '/es/uk' },
    copy: {
      en: { eyebrow: 'Polls · United Kingdom · Westminster', h1: 'UK voting intention.',
        lede1: 'Labour, Conservatives, Reform, Lib Dems and the rest: every published national poll for the next UK general election, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects seats at Westminster. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · UNITED KINGDOM', ogTitle: 'UK voting intention', ogSub: 'Vote-Scope · Westminster' },
      fr: { eyebrow: 'Sondages · Royaume-Uni · Westminster', h1: 'Intentions de vote au Royaume-Uni.',
        lede1: 'Travaillistes, Conservateurs, Reform, Lib Dems et les autres : chaque sondage national publié pour les prochaines législatives britanniques, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette les sièges à Westminster. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · ROYAUME-UNI', ogTitle: 'Intentions de vote au Royaume-Uni', ogSub: 'Vote-Scope · Westminster' },
      es: { eyebrow: 'Sondeos · Reino Unido · Westminster', h1: 'Intención de voto en el Reino Unido.',
        lede1: 'Laboristas, Conservadores, Reform, Liberaldemócratas y el resto: cada sondeo nacional publicado para las próximas legislativas británicas, encuestadora por encuestadora.',
        lede2: 'Vote-Scope los agrega y proyecta los escaños en Westminster. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'SONDEOS · REINO UNIDO', ogTitle: 'Intención de voto en el Reino Unido', ogSub: 'Vote-Scope · Westminster' },
    },
  },
};

/** Full hub URL for a jurisdiction + language (trailing slash). */
export function hubUrl(cfg: PollsHubConfig, lang: HubLang): string {
  return `${cfg.base[lang]}/${cfg.seg[lang]}/`;
}

/** Absolute canonical + alternates map for a hub. */
export function hubLinks(cfg: PollsHubConfig, lang: HubLang): {
  canonical: string;
  alternates: Partial<Record<HubLang, string>>;
} {
  const canonical = `${SITE}${hubUrl(cfg, lang)}`;
  const alternates: Partial<Record<HubLang, string>> = {};
  for (const l of cfg.langs) alternates[l] = `${SITE}${hubUrl(cfg, l)}`;
  return { canonical, alternates };
}
