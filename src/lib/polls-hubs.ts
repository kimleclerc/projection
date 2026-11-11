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
  /** Titre de PAGE quand le mot cherché diffère du nôtre.
   *  « intentions de vote » ne fait AUCUNE impression de recherche,
   *  dans aucun pays ; « sondage » en fait 39 600 pour la France et
   *  1 100 pour le Québec (Bing, 2026-09-19). `ogTitle` reste intact :
   *  il alimente les cartes sociales, pas la recherche. */
  seoTitle?: string;
  ogSub: string;
}

export interface PollsHubConfig {
  webKey: string;
  currentPage: string;            // EditorialLayout nav key
  langs: HubLang[];
  base: Record<HubLang, string>;  // path prefix per language
  seg: Record<HubLang, string>;   // localized "polls" segment
  copy: Record<HubLang, HubCopy>;
  /** Barre de navigation à afficher quand la clé n'est pas une juridiction
   *  (archive d'un cycle clos : « quebec-2026 » → nav du Québec). */
  navKey?: string;
}

const SEG: Record<HubLang, string> = { en: 'polls', fr: 'sondages', es: 'sondeos' };
const SITE = 'https://vote-scope.com';

export const POLLS_HUBS: Record<string, PollsHubConfig> = {
  spain: {
    webKey: 'spain', currentPage: 'spain', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/spain', fr: '/fr/spain', es: '/es/spain' },
    copy: {
      en: { eyebrow: 'Polls · Spain · Congress of Deputies', h1: 'Spanish election polls',
        lede1: 'PP, PSOE, Vox, Sumar, Podemos and the regional parties: every published national poll on voting intention for the Congress, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them, corrects each pollster for its measured lean, and projects all 350 seats province by province. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · SPAIN', ogTitle: 'Spanish election polls', seoTitle: 'Spain Election Polls', ogSub: 'Vote-Scope · Congress of Deputies' },
      fr: { eyebrow: 'Sondages · Espagne · Congrès des députés', h1: 'Les sondages des élections espagnoles',
        lede1: 'PP, PSOE, Vox, Sumar, Podemos et les partis régionaux : chaque sondage national publié sur les intentions de vote au Congrès, institut par institut.',
        lede2: 'Vote-Scope les agrège, corrige chaque institut de son biais mesuré et projette les 350 sièges province par province. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · ESPAGNE', ogTitle: 'Sondages des élections espagnoles', seoTitle: 'Sondages élections Espagne', ogSub: 'Vote-Scope · Congrès des députés' },
      es: { eyebrow: 'Encuestas · España · Congreso de los Diputados', h1: 'Encuestas electorales de España',
        lede1: 'PP, PSOE, Vox, Sumar, Podemos y los partidos regionales: todas las encuestas nacionales publicadas sobre intención de voto al Congreso, empresa por empresa.',
        lede2: 'Vote-Scope las agrega, corrige el sesgo medido de cada empresa y proyecta los 350 escaños provincia por provincia. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa.',
        ogEyebrow: 'ENCUESTAS · ESPAÑA', ogTitle: 'Encuestas electorales de España', seoTitle: 'Encuestas electorales España', ogSub: 'Vote-Scope · Congreso de los Diputados' },
    },
  },
  'us-house': {
    webKey: 'us-house', currentPage: 'us', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/us/house', fr: '/fr/us/chambre', es: '/es/us/house' },
    copy: {
      en: { eyebrow: 'Polls · U.S. House of Representatives · 2026 cycle', h1: 'U.S. House generic-ballot polls',
        lede1: 'Which party will control the House after the 2026 midterms? The <em>generic ballot</em> asks voters whether they would back the Democrat or the Republican in their district. It is the best national read on the race.',
        lede2: 'Vote-Scope gathers every published national poll and runs it through its model to project seats. Below: the trend against the model estimate, then the full poll-by-poll table.',
        ogEyebrow: 'POLLS · U.S. HOUSE', ogTitle: 'Generic Ballot — U.S. House', ogSub: 'Vote-Scope average · 2026 cycle' },
      fr: { eyebrow: 'Sondages · Chambre des représentants des États-Unis · cycle 2026', h1: 'Sondages sur le vote à la Chambre des États-Unis',
        lede1: 'Quel parti contrôlera la Chambre après les élections de mi-mandat de 2026 ? Le <em>vote générique</em> demande aux électeurs s’ils voteraient pour le démocrate ou le républicain dans leur district. C’est le meilleur indicateur national de la course.',
        lede2: 'Vote-Scope réunit chaque sondage national publié et le traduit, par son modèle, en projection de sièges. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet, sondage par sondage.',
        ogEyebrow: 'SONDAGES · CHAMBRE US', ogTitle: 'Vote générique — Chambre US', ogSub: 'Moyenne Vote-Scope · cycle 2026' },
      es: { eyebrow: 'Encuestas · Cámara de Representantes de EE. UU. · ciclo 2026', h1: 'Encuestas del voto genérico para la Cámara de EE. UU.',
        lede1: '¿Qué partido controlará la Cámara tras las legislativas de 2026? El <em>voto genérico</em> pregunta a los votantes si apoyarían al demócrata o al republicano en su distrito. Es el mejor indicador nacional de la contienda.',
        lede2: 'Vote-Scope reúne todas las encuestas nacionales publicadas y, con su modelo, las convierte en una proyección de escaños. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa encuesta por encuesta.',
        ogEyebrow: 'SONDEOS · CÁMARA US', ogTitle: 'Voto genérico — Cámara US', ogSub: 'Promedio Vote-Scope · ciclo 2026' },
    },
  },
  'us-senate': {
    webKey: 'us-senate', currentPage: 'us', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/us/senate', fr: '/fr/us/senat', es: '/es/us/senate' },
    copy: {
      en: { eyebrow: 'Polls · U.S. Senate · 2026 cycle', h1: 'Senate polling',
        lede1: 'The 2026 map decides whether the Senate flips. These are the published polls for the seats in play, race by race.',
        lede2: 'Vote-Scope aggregates them and projects the chamber. Below: the trend against the model estimate, then the full poll-by-poll table.',
        ogEyebrow: 'POLLS · U.S. SENATE', ogTitle: 'U.S. Senate polling', ogSub: 'Vote-Scope · 2026 cycle' },
      fr: { eyebrow: 'Sondages · Sénat des États-Unis · cycle 2026', h1: 'Sondages pour le Sénat',
        lede1: 'La carte de 2026 décidera si le Sénat bascule. Voici les sondages publiés pour les sièges en jeu, course par course.',
        lede2: 'Vote-Scope les agrège et projette la chambre. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · SÉNAT US', ogTitle: 'Sondages pour le Sénat US', ogSub: 'Vote-Scope · cycle 2026' },
      es: { eyebrow: 'Encuestas · Senado de EE. UU. · ciclo 2026', h1: 'Encuestas para el Senado',
        lede1: 'El mapa de 2026 decidirá si el Senado cambia de manos. Estas son las encuestas publicadas de los escaños en juego, contienda por contienda.',
        lede2: 'Vote-Scope las agrega y proyecta la cámara. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo.',
        ogEyebrow: 'SONDEOS · SENADO US', ogTitle: 'Encuestas para el Senado US', ogSub: 'Vote-Scope · ciclo 2026' },
    },
  },
  'us-governor': {
    webKey: 'us-governor', currentPage: 'us', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/us/governors', fr: '/fr/us/gouverneurs', es: '/es/us/gobernadores' },
    copy: {
      en: { eyebrow: 'Polls · U.S. governors · 2026 cycle', h1: 'Governor polling',
        lede1: 'Thirty-six states elect a governor in November, and half of those seats are open — the sitting governor is term-limited or retiring. These are the published polls, race by race.',
        lede2: 'Vote-Scope aggregates them and projects all fifty governorships. Below: the trend against the model estimate, then the full poll-by-poll table.',
        ogEyebrow: 'POLLS · U.S. GOVERNORS', ogTitle: 'U.S. governor polling', ogSub: 'Vote-Scope · 2026 cycle' },
      fr: { eyebrow: 'Sondages · Gouverneurs américains · cycle 2026', h1: 'Sondages pour les gouverneurs',
        lede1: 'Trente-six États élisent un gouverneur en novembre, et la moitié de ces postes sont ouverts : le sortant est limité par les mandats ou se retire. Voici les sondages publiés, course par course.',
        lede2: 'Vote-Scope les agrège et projette les cinquante postes. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · GOUVERNEURS US', ogTitle: 'Sondages pour les gouverneurs US', ogSub: 'Vote-Scope · cycle 2026' },
      es: { eyebrow: 'Encuestas · Gobernadores de EE. UU. · ciclo 2026', h1: 'Encuestas para gobernador',
        lede1: 'Treinta y seis estados eligen gobernador en noviembre, y la mitad de esos puestos quedan abiertos: el titular no puede repetir o se retira. Estas son las encuestas publicadas, contienda por contienda.',
        lede2: 'Vote-Scope las agrega y proyecta las cincuenta gobernaciones. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo.',
        ogEyebrow: 'SONDEOS · GOBERNADORES US', ogTitle: 'Encuestas para gobernador US', ogSub: 'Vote-Scope · ciclo 2026' },
    },
  },
  federal: {
    webKey: 'federal', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/canada/federal', fr: '/fr/canada/federal', es: '/es/canada/federal' },
    copy: {
      en: { eyebrow: 'Polls · Canada · House of Commons', h1: 'Federal voting intention',
        lede1: 'Who forms the next government? Every published national poll on federal voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects seats in the Commons. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · CANADA FEDERAL', ogTitle: 'Federal voting intention', ogSub: 'Vote-Scope · House of Commons' },
      fr: { eyebrow: 'Sondages · Canada · Chambre des communes', h1: 'Intentions de vote fédérales',
        lede1: 'Qui formera le prochain gouvernement ? Chaque sondage national publié sur les intentions de vote fédérales, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette les sièges aux Communes. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · CANADA FÉDÉRAL', ogTitle: 'Intentions de vote fédérales', seoTitle: 'Sondages fédéraux au Canada', ogSub: 'Vote-Scope · Chambre des communes' },
      es: { eyebrow: 'Encuestas · Canadá · Cámara de los Comunes', h1: 'Intención de voto federal',
        lede1: '¿Quién formará el próximo gobierno? Cada encuesta nacional publicada sobre la intención de voto federal, encuestadora por encuestadora.',
        lede2: 'Vote-Scope las agrega y proyecta los escaños en los Comunes. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo.',
        ogEyebrow: 'SONDEOS · CANADÁ FEDERAL', ogTitle: 'Intención de voto federal', ogSub: 'Vote-Scope · Cámara de los Comunes' },
    },
  },
  quebec: {
    webKey: 'quebec', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/canada/quebec', fr: '/fr/canada/quebec', es: '/es/canada/quebec' },
    copy: {
      en: { eyebrow: 'Polls · Quebec · National Assembly', h1: 'Quebec voting intention',
        lede1: 'CAQ, PLQ, PQ, QS: every published provincial poll on Quebec voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects the National Assembly. Below: the trend against the model estimate, then the full table. The polls of the 2026 election are <a href="/en/canada/quebec/polls/2026/">archived here</a>.',
        ogEyebrow: 'POLLS · QUEBEC', ogTitle: 'Quebec voting intention', seoTitle: 'Quebec Election Polls', ogSub: 'Vote-Scope · National Assembly' },
      fr: { eyebrow: 'Sondages · Québec · Assemblée nationale', h1: 'Intentions de vote au Québec',
        lede1: 'CAQ, PLQ, PQ, QS : chaque sondage provincial publié sur les intentions de vote au Québec, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette l’Assemblée nationale. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet. Les sondages de l’élection de 2026 sont <a href="/fr/canada/quebec/sondages/2026/">archivés ici</a>.',
        ogEyebrow: 'SONDAGES · QUÉBEC', ogTitle: 'Intentions de vote au Québec', seoTitle: 'Sondages élections Québec', ogSub: 'Vote-Scope · Assemblée nationale' },
      es: { eyebrow: 'Encuestas · Quebec · Asamblea Nacional', h1: 'Intención de voto en Quebec',
        lede1: 'CAQ, PLQ, PQ, QS: cada encuesta provincial publicada sobre la intención de voto en Quebec, encuestadora por encuestadora.',
        lede2: 'Vote-Scope las agrega y proyecta la Asamblea Nacional. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo. Las encuestas de la elección de 2026 están <a href="/es/canada/quebec/sondeos/2026/">archivadas aquí</a>.',
        ogEyebrow: 'SONDEOS · QUEBEC', ogTitle: 'Intención de voto en Quebec', seoTitle: 'Encuestas elecciones Quebec', ogSub: 'Vote-Scope · Asamblea Nacional' },
    },
  },
  // Archive du cycle 2026 (bascule du desk vers qc_2030, 11 nov. 2026) : les
  // sondages publiés de l'élection de 2022 à la veille du 5 octobre 2026, avec
  // l'estimation du modèle de la veille. Données figées dans src/data/qc-2026-eve/.
  'quebec-2026': {
    webKey: 'quebec-2026', navKey: 'quebec', currentPage: 'canada', langs: ['en', 'fr', 'es'],
    seg: { en: 'polls/2026', fr: 'sondages/2026', es: 'sondeos/2026' },
    base: { en: '/en/canada/quebec', fr: '/fr/canada/quebec', es: '/es/canada/quebec' },
    copy: {
      en: { eyebrow: 'Polls · Quebec · October 5, 2026 election', h1: 'The polls of the 2026 Quebec election',
        lede1: 'Every provincial poll published between the 2022 election and the eve of the October 5, 2026 vote, pollster by pollster, with our model’s estimate on the eve.',
        lede2: 'The <a href="/en/canada/quebec/results/">results</a> and <a href="/en/track-record/quebec-2026/">our review</a> compare them with the vote. The polls since the election are on the <a href="/en/canada/quebec/polls/">current polls page</a>.',
        ogEyebrow: 'POLLS · QUEBEC 2026', ogTitle: 'The polls of the 2026 Quebec election', seoTitle: 'Quebec 2026 Election Polls', ogSub: 'Vote-Scope · National Assembly' },
      fr: { eyebrow: 'Sondages · Québec · Élection du 5 octobre 2026', h1: 'Les sondages de l’élection québécoise de 2026',
        lede1: 'Chaque sondage provincial publié entre l’élection de 2022 et la veille du vote du 5 octobre 2026, maison par maison, avec l’estimation de notre modèle la veille du scrutin.',
        lede2: 'Les <a href="/fr/canada/quebec/resultats/">résultats</a> et <a href="/fr/track-record/quebec-2026/">notre bilan</a> les comparent au vote. Les sondages publiés depuis l’élection sont sur la <a href="/fr/canada/quebec/sondages/">page Sondages</a>.',
        ogEyebrow: 'SONDAGES · QUÉBEC 2026', ogTitle: 'Les sondages de l’élection québécoise de 2026', seoTitle: 'Sondages élections Québec 2026', ogSub: 'Vote-Scope · Assemblée nationale' },
      es: { eyebrow: 'Encuestas · Quebec · Elección del 5 de octubre de 2026', h1: 'Las encuestas de la elección de Quebec de 2026',
        lede1: 'Cada encuesta provincial publicada entre la elección de 2022 y la víspera de la votación del 5 de octubre de 2026, encuestadora por encuestadora, con la estimación de nuestro modelo la víspera.',
        lede2: 'Los <a href="/es/canada/quebec/resultados/">resultados</a> y <a href="/es/track-record/quebec-2026/">nuestro balance</a> las comparan con el voto. Las encuestas publicadas desde la elección están en la <a href="/es/canada/quebec/sondeos/">página de encuestas</a>.',
        ogEyebrow: 'ENCUESTAS · QUEBEC 2026', ogTitle: 'Las encuestas de la elección de Quebec de 2026', seoTitle: 'Encuestas elecciones Quebec 2026', ogSub: 'Vote-Scope · Asamblea Nacional' },
    },
  },
  ontario: {
    webKey: 'ontario', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/canada/ontario', fr: '/fr/canada/ontario', es: '/es/canada/ontario' },
    copy: {
      en: { eyebrow: 'Polls · Ontario · Legislative Assembly', h1: 'Ontario voting intention',
        lede1: 'PC, OLP, NDP, Greens: every published provincial poll on Ontario voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects Queen’s Park. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · ONTARIO', ogTitle: 'Ontario voting intention', ogSub: 'Vote-Scope · Legislative Assembly' },
      fr: { eyebrow: 'Sondages · Ontario · Assemblée législative', h1: 'Intentions de vote en Ontario',
        lede1: 'PC, PLO, NPD, Verts : chaque sondage provincial publié sur les intentions de vote en Ontario, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette l’Assemblée législative. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · ONTARIO', ogTitle: 'Intentions de vote en Ontario', seoTitle: 'Sondages élections Ontario', ogSub: 'Vote-Scope · Assemblée législative' },
      es: { eyebrow: 'Encuestas · Ontario · Asamblea Legislativa', h1: 'Intención de voto en Ontario',
        lede1: 'PC, OLP, NDP, Verdes: cada encuesta provincial publicada sobre la intención de voto en Ontario, encuestadora por encuestadora.',
        lede2: 'Vote-Scope las agrega y proyecta Queen’s Park. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo.',
        ogEyebrow: 'SONDEOS · ONTARIO', ogTitle: 'Intención de voto en Ontario', ogSub: 'Vote-Scope · Asamblea Legislativa' },
    },
  },
  'british-columbia': {
    webKey: 'british-columbia', currentPage: 'canada', langs: ['en', 'fr', 'es'], seg: SEG,
    base: {
      en: '/en/canada/british-columbia',
      fr: '/fr/canada/colombie-britannique',
      es: '/es/canada/columbia-britanica',
    },
    copy: {
      en: { eyebrow: 'Polls · British Columbia · Legislative Assembly', h1: 'British Columbia voting intention',
        lede1: 'NDP, Conservatives, Greens, OneBC, CentreBC: every published provincial poll on BC voting intention, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects the Legislative Assembly. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · BRITISH COLUMBIA', ogTitle: 'British Columbia voting intention', seoTitle: 'BC Election Polls 2026', ogSub: 'Vote-Scope · Legislative Assembly' },
      fr: { eyebrow: 'Sondages · Colombie-Britannique · Assemblée législative', h1: 'Intentions de vote en Colombie-Britannique',
        lede1: 'NPD, conservateurs, verts, OneBC, CentreBC : chaque sondage provincial publié sur les intentions de vote britanno-colombiennes, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette l’Assemblée législative. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · COLOMBIE-BRITANNIQUE', ogTitle: 'Intentions de vote en Colombie-Britannique', seoTitle: 'Sondages élections Colombie-Britannique 2026', ogSub: 'Vote-Scope · Assemblée législative' },
      es: { eyebrow: 'Encuestas · Columbia Británica · Asamblea Legislativa', h1: 'Intención de voto en Columbia Británica',
        lede1: 'NDP, conservadores, verdes, OneBC, CentreBC: cada encuesta provincial publicada sobre la intención de voto en Columbia Británica, encuestadora por encuestadora.',
        lede2: 'Vote-Scope las agrega y proyecta la Asamblea Legislativa. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo.',
        ogEyebrow: 'SONDEOS · COLUMBIA BRITÁNICA', ogTitle: 'Intención de voto en Columbia Británica', seoTitle: 'Encuestas elecciones Columbia Británica 2026', ogSub: 'Vote-Scope · Asamblea Legislativa' },
    },
  },
  uk: {
    webKey: 'uk', currentPage: 'uk', langs: ['en', 'fr', 'es'], seg: SEG,
    base: { en: '/en/uk', fr: '/fr/uk', es: '/es/uk' },
    copy: {
      en: { eyebrow: 'Polls · United Kingdom · Westminster', h1: 'UK voting intention',
        lede1: 'Labour, Conservatives, Reform, Lib Dems and the rest: every published national poll for the next UK general election, pollster by pollster.',
        lede2: 'Vote-Scope aggregates them and projects seats at Westminster. Below: the trend against the model estimate, then the full table.',
        ogEyebrow: 'POLLS · UNITED KINGDOM', ogTitle: 'UK voting intention', ogSub: 'Vote-Scope · Westminster' },
      fr: { eyebrow: 'Sondages · Royaume-Uni · Westminster', h1: 'Intentions de vote au Royaume-Uni',
        lede1: 'Travaillistes, Conservateurs, Reform, Lib Dems et les autres : chaque sondage national publié pour les prochaines législatives britanniques, maison par maison.',
        lede2: 'Vote-Scope les agrège et projette les sièges à Westminster. Ci-dessous : la tendance face à l’estimation du modèle, puis le tableau complet.',
        ogEyebrow: 'SONDAGES · ROYAUME-UNI', ogTitle: 'Intentions de vote au Royaume-Uni', ogSub: 'Vote-Scope · Westminster' },
      es: { eyebrow: 'Encuestas · Reino Unido · Westminster', h1: 'Intención de voto en el Reino Unido',
        lede1: 'Laboristas, Conservadores, Reform, Liberaldemócratas y el resto: cada encuesta nacional publicada para las próximas legislativas británicas, encuestadora por encuestadora.',
        lede2: 'Vote-Scope las agrega y proyecta los escaños en Westminster. Abajo: la tendencia frente a la estimación del modelo, y la tabla completa, sondeo por sondeo.',
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
