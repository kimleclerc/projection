// VoteScope Labs — lecture des sorties du moteur expérimental (web_data/labs)
// et textes des pages, en trois langues.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type Locale = 'fr' | 'en' | 'es';
export type LabsKey = 'qc_2026' | 'bc_44' | 'us_senate' | 'us_house' | 'us_governor';

export const LABS_KEYS: LabsKey[] = ['qc_2026', 'bc_44', 'us_senate', 'us_house', 'us_governor'];

export const SLUGS: Record<Locale, Record<LabsKey, string>> = {
  fr: { qc_2026: 'quebec', bc_44: 'colombie-britannique', us_senate: 'senat', us_house: 'chambre', us_governor: 'gouverneurs' },
  en: { qc_2026: 'quebec', bc_44: 'british-columbia', us_senate: 'senate', us_house: 'house', us_governor: 'governors' },
  es: { qc_2026: 'quebec', bc_44: 'columbia-britanica', us_senate: 'senado', us_house: 'camara', us_governor: 'gobernadores' },
};

export const MAIN_PAGES: Record<Locale, Record<LabsKey, string>> = {
  fr: { qc_2026: '/fr/canada/quebec', bc_44: '/fr/canada/colombie-britannique', us_senate: '/fr/us/senat', us_house: '/fr/us/chambre', us_governor: '/fr/us/gouverneurs' },
  en: { qc_2026: '/en/canada/quebec', bc_44: '/en/canada/british-columbia', us_senate: '/en/us/senate', us_house: '/en/us/house', us_governor: '/en/us/governors' },
  es: { qc_2026: '/es/canada/quebec', bc_44: '/es/canada/columbia-britanica', us_senate: '/es/us/senate', us_house: '/es/us/house', us_governor: '/es/us/gobernadores' },
};

export const LABS_ROOT: Record<Locale, string> = { fr: '/fr/labs', en: '/en/labs', es: '/es/labs' };

export function labsUrl(locale: Locale, key?: LabsKey): string {
  return key ? `${LABS_ROOT[locale]}/${SLUGS[locale][key]}` : LABS_ROOT[locale];
}

export function keyFromSlug(locale: Locale, slug: string): LabsKey | undefined {
  return LABS_KEYS.find((k) => SLUGS[locale][k] === slug);
}

const dir = resolve(process.cwd(), 'web_data', 'labs');

export function hasLabs(key: LabsKey): boolean {
  return existsSync(resolve(dir, `${key}.json`));
}

export function loadLabs(key: LabsKey): any {
  return JSON.parse(readFileSync(resolve(dir, `${key}.json`), 'utf-8'));
}

export function loadBacktests(): any | null {
  const f = resolve(dir, 'backtests.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : null;
}

const US_LABELS: Record<string, Record<Locale, string>> = {
  us_dem: { fr: 'Démocrates', en: 'Democrats', es: 'Demócratas' },
  us_rep: { fr: 'Républicains', en: 'Republicans', es: 'Republicanos' },
  us_oth: { fr: 'Autres', en: 'Others', es: 'Otros' },
};
const US_COLORS: Record<string, string> = { us_dem: '#1f77d0', us_rep: '#c62828', us_oth: '#888888' };

export function partyLabel(data: any, party: string, locale: Locale): string {
  if (US_LABELS[party]) return US_LABELS[party][locale];
  const l = data.labels?.[party];
  const txt = locale === 'fr' ? l?.fr : l?.en;
  return txt || party.replace(/^(bc|qc|us)_/, '').toUpperCase();
}

export function partyColor(data: any, party: string): string {
  return US_COLORS[party] || data.labels?.[party]?.color || '#888888';
}

const NUM_LOCALE: Record<Locale, string> = { fr: 'fr-CA', en: 'en-US', es: 'es-ES' };

export function fmt(n: number | null | undefined, locale: Locale, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString(NUM_LOCALE[locale], { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pct(p: number | null | undefined, locale: Locale): string {
  if (p === null || p === undefined) return '—';
  const v = 100 * p;
  const txt = v > 99 ? '> 99' : v < 1 ? '< 1' : fmt(v, locale, 0);
  return locale === 'en' ? `${txt}%` : `${txt} %`;
}

export function fmtDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(NUM_LOCALE[locale], { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Textes ────────────────────────────────────────────────────────────────
export const NAMES: Record<LabsKey, Record<Locale, string>> = {
  qc_2026: { fr: 'Québec 2026', en: 'Quebec 2026', es: 'Quebec 2026' },
  bc_44: { fr: 'Colombie-Britannique 2026', en: 'British Columbia 2026', es: 'Columbia Británica 2026' },
  us_senate: { fr: 'Sénat américain 2026', en: 'U.S. Senate 2026', es: 'Senado de EE. UU. 2026' },
  us_house: { fr: 'Chambre des représentants 2026', en: 'U.S. House 2026', es: 'Cámara de Representantes 2026' },
  us_governor: { fr: 'Gouverneurs américains 2026', en: 'U.S. Governors 2026', es: 'Gobernadores de EE. UU. 2026' },
};

export const T = {
  fr: {
    brand: 'VoteScope Labs',
    kicker: 'Moteur expérimental',
    updated: 'Mis à jour le',
    hubTitle: 'Les mêmes sondages. Une autre physique.',
    hubDek: 'VoteScope Labs fait tourner un second moteur de projection, construit de zéro, à côté de nos projections de référence. Il lit exactement les mêmes sondages et les mêmes résultats passés, mais il les traite avec des outils venus de la géométrie et de la physique quantique. Quand les deux moteurs s’accordent, le signal est solide. Quand ils divergent, c’est là qu’il faut regarder.',
    deskDek: 'Mêmes sondages, mêmes résultats passés, mécanique entièrement différente. Voici ce que voit le moteur Labs, à côté de notre projection de référence.',
    reference: 'Projection de référence',
    labs: 'Labs',
    favorite: 'Favori du moteur Labs',
    chanceFirst: 'chances de terminer premier',
    seatsLeader: 'Sièges gagnés par le favori',
    range80: '8 chances sur 10 entre',
    and: 'et',
    majority: 'Majorité',
    control: 'Contrôle de la chambre',
    agreement: 'Même favori que la référence',
    agreementNote: 'des circonscriptions',
    table: 'Parti par parti',
    party: 'Parti',
    vote: 'Vote',
    seats: 'Sièges',
    favoredIn: 'Favori dans (circonscriptions)',
    divergeTitle: 'Là où les deux moteurs ne sont pas d’accord',
    divergeNone: 'Les deux moteurs désignent le même favori partout.',
    divergeFav: 'Favori Labs',
    divergeRef: 'Favori référence',
    racesTitle: 'Les courses les plus serrées selon le Labs',
    race: 'Course',
    polls: 'Sondages',
    labsChance: 'Chances D (Labs)',
    refChance: 'Chances D (référence)',
    instruments: 'Les instruments du Labs',
    moved: 'Électeurs qui ont changé de camp depuis la dernière élection',
    movedNote: 'minimum, en points de l’électorat',
    spread: 'Écart moyen entre sondeurs',
    spreadNote: 'points, autour de l’état le plus probable',
    cone: 'Cône des possibles d’ici le vote',
    coneNote: 'points de mouvement maximal pour un parti',
    days: 'Jours avant le vote',
    generic: 'Vote générique (Labs)',
    backtests: 'Rejoué sur les élections passées',
    backtestsNote: 'Chaque élection est rejouée avec les seuls sondages connus la veille du vote. Écart moyen, par parti, entre les sièges gagnés projetés et les sièges réels — la même mesure que notre historique de précision.',
    election: 'Élection',
    errLabs: 'Écart Labs',
    errRef: 'Écart référence',
    ridingsRight: 'Circonscriptions justes (Labs)',
    notAvailable: 'non rejouée',
    howTitle: 'Comment fonctionne le moteur Labs',
    how: [
      ['L’opinion vit sur une sphère', 'Une répartition des voix est un point sur une surface courbe, où un mouvement de 2 points ne pèse pas la même chose pour un parti à 5 % et pour un parti à 40 %. Les tendances suivent le chemin le plus court sur cette courbe, et le mouvement national est déplacé jusqu’à chaque circonscription en respectant la courbure. Un nouveau parti peut ainsi apparaître là où il n’existait pas.'],
      ['Les sondages sont des mesures', 'Chaque sondage est traité comme une mesure d’un état de l’électorat, à la manière d’une mesure en physique quantique. Le moteur suit cet état jour après jour, corrige les biais propres à chaque sondeur et ne laisse pas un sondeur très prolifique dicter la moyenne.'],
      ['Les sièges se comptent, ils ne se tirent pas', 'Chaque circonscription est un registre dont les amplitudes donnent les chances de chaque parti. Le nombre de sièges est lu exactement sur un compteur, au lieu de dizaines de milliers de tirages au hasard. Seuls les grands chocs communs, nationaux et régionaux, sont parcourus sur une grille régulière.'],
    ],
    caveat: 'Le Labs est un banc d’essai. Notre projection de référence reste celle de la page principale.',
    goMain: 'Voir la projection de référence',
    goHub: 'Tous les moteurs Labs',
    openDesk: 'Ouvrir',
    usNotValidated: 'Aucune élection américaine passée n’est encore rejouée dans le Labs : ces chiffres n’ont pas d’historique de précision.',
    readMore: 'Pour aller plus loin',
    refs: 'Références',
    wins: 'Victoires',
    hubDesks: 'Les projections Labs',
  },
  en: {
    brand: 'VoteScope Labs',
    kicker: 'Experimental engine',
    updated: 'Updated',
    hubTitle: 'Same polls. Different physics.',
    hubDek: 'VoteScope Labs runs a second forecasting engine, built from scratch, next to our reference forecasts. It reads exactly the same polls and past results, but processes them with tools borrowed from geometry and quantum physics. When the two engines agree, the signal is solid. When they diverge, that is where to look.',
    deskDek: 'Same polls, same past results, a completely different machine. Here is what the Labs engine sees, next to our reference forecast.',
    reference: 'Reference forecast',
    labs: 'Labs',
    favorite: 'Labs engine favourite',
    chanceFirst: 'chance of finishing first',
    seatsLeader: 'Seats won by the favourite',
    range80: '8 in 10 chance between',
    and: 'and',
    majority: 'Majority',
    control: 'Chamber control',
    agreement: 'Same favourite as the reference',
    agreementNote: 'of ridings',
    table: 'Party by party',
    party: 'Party',
    vote: 'Vote',
    seats: 'Seats',
    favoredIn: 'Favourite in (ridings)',
    divergeTitle: 'Where the two engines disagree',
    divergeNone: 'Both engines name the same favourite everywhere.',
    divergeFav: 'Labs favourite',
    divergeRef: 'Reference favourite',
    racesTitle: 'The closest races according to Labs',
    race: 'Race',
    polls: 'Polls',
    labsChance: 'Dem chance (Labs)',
    refChance: 'Dem chance (reference)',
    instruments: 'Labs instruments',
    moved: 'Voters who switched sides since the last election',
    movedNote: 'minimum, in points of the electorate',
    spread: 'Average gap between pollsters',
    spreadNote: 'points, around the most likely state',
    cone: 'Cone of possibilities until election day',
    coneNote: 'points of maximum movement for one party',
    days: 'Days to election',
    generic: 'Generic ballot (Labs)',
    backtests: 'Replayed on past elections',
    backtestsNote: 'Each election is replayed with only the polls known the day before the vote. Average gap, per party, between projected seats won and actual seats — the same measure as our track record.',
    election: 'Election',
    errLabs: 'Labs gap',
    errRef: 'Reference gap',
    ridingsRight: 'Ridings called right (Labs)',
    notAvailable: 'not replayed',
    howTitle: 'How the Labs engine works',
    how: [
      ['Opinion lives on a sphere', 'A vote split is a point on a curved surface, where a 2-point move does not weigh the same for a party at 5% and a party at 40%. Trends follow the shortest path on that curve, and the national swing is carried to each riding while respecting the curvature. A new party can therefore appear where it did not exist.'],
      ['Polls are measurements', 'Each poll is treated as a measurement of the state of the electorate, the way a measurement works in quantum physics. The engine tracks that state day after day, corrects each pollster’s own lean and does not let one very prolific pollster dictate the average.'],
      ['Seats are counted, not drawn', 'Each riding is a register whose amplitudes give every party’s chances. The seat count is read exactly from a counter instead of tens of thousands of random draws. Only the large common shocks, national and regional, are walked through on a regular grid.'],
    ],
    caveat: 'Labs is a test bench. Our reference forecast remains the one on the main page.',
    goMain: 'See the reference forecast',
    goHub: 'All Labs engines',
    openDesk: 'Open',
    usNotValidated: 'No past U.S. election has been replayed in Labs yet: these numbers have no accuracy record.',
    readMore: 'Further reading',
    refs: 'References',
    wins: 'Wins',
    hubDesks: 'Labs forecasts',
  },
  es: {
    brand: 'VoteScope Labs',
    kicker: 'Motor experimental',
    updated: 'Actualizado el',
    hubTitle: 'Las mismas encuestas. Otra física.',
    hubDek: 'VoteScope Labs hace funcionar un segundo motor de proyección, construido desde cero, junto a nuestras proyecciones de referencia. Lee exactamente las mismas encuestas y los mismos resultados pasados, pero los procesa con herramientas de la geometría y de la física cuántica. Cuando los dos motores coinciden, la señal es sólida. Cuando divergen, ahí hay que mirar.',
    deskDek: 'Mismas encuestas, mismos resultados pasados, una mecánica completamente distinta. Esto es lo que ve el motor Labs, junto a nuestra proyección de referencia.',
    reference: 'Proyección de referencia',
    labs: 'Labs',
    favorite: 'Favorito del motor Labs',
    chanceFirst: 'probabilidad de terminar primero',
    seatsLeader: 'Escaños ganados por el favorito',
    range80: '8 de cada 10 entre',
    and: 'y',
    majority: 'Mayoría',
    control: 'Control de la cámara',
    agreement: 'Mismo favorito que la referencia',
    agreementNote: 'de las circunscripciones',
    table: 'Partido por partido',
    party: 'Partido',
    vote: 'Voto',
    seats: 'Escaños',
    favoredIn: 'Favorito en (circunscripciones)',
    divergeTitle: 'Donde los dos motores no coinciden',
    divergeNone: 'Los dos motores señalan el mismo favorito en todas partes.',
    divergeFav: 'Favorito Labs',
    divergeRef: 'Favorito referencia',
    racesTitle: 'Las contiendas más reñidas según Labs',
    race: 'Contienda',
    polls: 'Encuestas',
    labsChance: 'Prob. D (Labs)',
    refChance: 'Prob. D (referencia)',
    instruments: 'Los instrumentos de Labs',
    moved: 'Votantes que cambiaron de bando desde la última elección',
    movedNote: 'mínimo, en puntos del electorado',
    spread: 'Diferencia media entre encuestadoras',
    spreadNote: 'puntos, alrededor del estado más probable',
    cone: 'Cono de lo posible hasta el día de la votación',
    coneNote: 'puntos de movimiento máximo para un partido',
    days: 'Días para la votación',
    generic: 'Voto genérico (Labs)',
    backtests: 'Repetido sobre elecciones pasadas',
    backtestsNote: 'Cada elección se repite solo con las encuestas conocidas la víspera. Diferencia media, por partido, entre escaños ganados proyectados y reales — la misma medida que nuestro historial de precisión.',
    election: 'Elección',
    errLabs: 'Diferencia Labs',
    errRef: 'Diferencia referencia',
    ridingsRight: 'Circunscripciones acertadas (Labs)',
    notAvailable: 'no repetida',
    howTitle: 'Cómo funciona el motor Labs',
    how: [
      ['La opinión vive sobre una esfera', 'Un reparto de votos es un punto sobre una superficie curva, donde un movimiento de 2 puntos no pesa lo mismo para un partido al 5 % que para uno al 40 %. Las tendencias siguen el camino más corto sobre esa curva, y el movimiento nacional se traslada a cada circunscripción respetando la curvatura. Así, un partido nuevo puede aparecer donde no existía.'],
      ['Las encuestas son mediciones', 'Cada encuesta se trata como una medición del estado del electorado, como una medición en física cuántica. El motor sigue ese estado día tras día, corrige el sesgo propio de cada encuestadora y no deja que una encuestadora muy prolífica dicte el promedio.'],
      ['Los escaños se cuentan, no se sortean', 'Cada circunscripción es un registro cuyas amplitudes dan las probabilidades de cada partido. El número de escaños se lee exactamente en un contador, en lugar de decenas de miles de sorteos al azar. Solo los grandes choques comunes, nacionales y regionales, se recorren sobre una malla regular.'],
    ],
    caveat: 'Labs es un banco de pruebas. Nuestra proyección de referencia sigue siendo la de la página principal.',
    goMain: 'Ver la proyección de referencia',
    goHub: 'Todos los motores Labs',
    openDesk: 'Abrir',
    usNotValidated: 'Todavía no se ha repetido en Labs ninguna elección estadounidense pasada: estas cifras no tienen historial de precisión.',
    readMore: 'Para saber más',
    refs: 'Referencias',
    wins: 'Victorias',
    hubDesks: 'Proyecciones Labs',
  },
} as const;

export const REFERENCES = [
  { label: 'Dubois — On quantum models for opinion and voting intention polls', url: 'https://arxiv.org/abs/2411.13593' },
  { label: 'Lin, Wang & Hong — The Poisson multinomial distribution and its applications in voting theory', url: 'https://arxiv.org/abs/2201.04237' },
  { label: 'Borghesi & Bouchaud — Spatial correlations in vote statistics: a diffusive field model', url: 'https://arxiv.org/abs/1003.2807' },
  { label: 'Khrennikov & Haven — Quantum-like modelling of the non-separability of voters’ preferences', url: 'https://arxiv.org/abs/1405.1029' },
];
