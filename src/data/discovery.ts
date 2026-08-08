export type SiteLocale = 'en' | 'fr' | 'es';

export interface DiscoveryLink {
  href: string;
  label: string;
  description?: string;
}

export interface DiscoverySection {
  id: string;
  labels: Record<SiteLocale, string>;
  links: Record<SiteLocale, DiscoveryLink[]>;
}

export const AI_DOCUMENTS = [
  {
    href: '/llms.txt',
    label: 'LLM index',
    type: 'text/plain',
    description: 'Concise map of Vote-Scope and its primary pages.',
  },
  {
    href: '/llms-long.txt',
    label: 'LLM editorial guide',
    type: 'text/plain',
    description: 'Jurisdictions, navigation paths, methodology and editorial context.',
  },
  {
    href: '/llms-full.txt',
    label: 'LLM technical reference',
    type: 'text/plain',
    description: 'Data contracts, current dataset metadata, methodology and limitations.',
  },
  {
    href: '/ai-index.json',
    label: 'Machine-readable site catalog',
    type: 'application/json',
    description: 'Structured catalog of documentation, sections and current datasets.',
  },
  {
    href: '/ai.txt',
    label: 'AI usage notice',
    type: 'text/plain',
    description: 'Terms, attribution and automated-access notice.',
  },
] as const;

export const DISCOVERY_SECTIONS: DiscoverySection[] = [
  {
    id: 'canada',
    labels: { en: 'Explore the Canada desk', fr: 'Explorer le desk Canada', es: 'Explorar el desk Canadá' },
    links: {
      en: [
        { href: '/en/canada/', label: 'Canada hub', description: 'All federal and provincial coverage' },
        { href: '/en/canada/federal/', label: 'Federal forecast', description: '343 ridings and national polling' },
        { href: '/en/canada/quebec/', label: 'Québec forecast', description: '127-seat National Assembly' },
        { href: '/en/canada/ontario/', label: 'Ontario forecast', description: '124-seat Legislative Assembly' },
        { href: '/en/canada/byelections/', label: 'By-elections', description: 'Current and archived races' },
      ],
      fr: [
        { href: '/fr/canada/', label: 'Hub Canada', description: 'Toute la couverture fédérale et provinciale' },
        { href: '/fr/canada/federal/', label: 'Projection fédérale', description: '343 circonscriptions et sondages nationaux' },
        { href: '/fr/canada/quebec/', label: 'Projection Québec', description: 'Assemblée nationale de 127 sièges' },
        { href: '/fr/canada/ontario/', label: 'Projection Ontario', description: 'Assemblée législative de 124 sièges' },
        { href: '/fr/canada/byelections/', label: 'Élections partielles', description: 'Courses actives et archives' },
      ],
      es: [
        { href: '/es/canada/', label: 'Hub Canadá', description: 'Toda la cobertura federal y provincial' },
        { href: '/es/canada/federal/', label: 'Proyección federal', description: '343 distritos y encuestas nacionales' },
        { href: '/es/canada/quebec/', label: 'Proyección Quebec', description: 'Asamblea Nacional de 127 escaños' },
        { href: '/es/canada/ontario/', label: 'Proyección Ontario', description: 'Asamblea Legislativa de 124 escaños' },
        { href: '/es/canada/byelections/', label: 'Elecciones parciales', description: 'Contiendas activas y archivos' },
      ],
    },
  },
  {
    id: 'us',
    labels: { en: 'Explore the U.S. desk', fr: 'Explorer le desk États-Unis', es: 'Explorar el desk de EE. UU.' },
    links: {
      en: [
        { href: '/en/us/', label: 'U.S. hub', description: 'Congress, presidency and indexes' },
        { href: '/en/us/house/', label: 'House forecast', description: 'All 435 districts' },
        { href: '/en/us/senate/', label: 'Senate forecast', description: '35 contested seats' },
        { href: '/en/us/president/', label: 'Presidential desk', description: 'Scenarios and national indicators' },
        { href: '/en/us/indexes/lame-duck/', label: 'Lame-Duck Index', description: 'Daily presidential-power index' },
      ],
      fr: [
        { href: '/fr/us/', label: 'Hub États-Unis', description: 'Congrès, présidence et index' },
        { href: '/fr/us/chambre/', label: 'Projection Chambre', description: 'Les 435 districts' },
        { href: '/fr/us/senat/', label: 'Projection Sénat', description: '35 sièges contestés' },
        { href: '/fr/us/presidentielle/', label: 'Desk présidentiel', description: 'Scénarios et indicateurs nationaux' },
        { href: '/fr/us/indexes/lame-duck/', label: 'Index canard boiteux', description: 'Indice quotidien du pouvoir présidentiel' },
      ],
      es: [
        { href: '/es/us/', label: 'Hub EE. UU.', description: 'Congreso, presidencia e índices' },
        { href: '/es/us/house/', label: 'Proyección Cámara', description: 'Los 435 distritos' },
        { href: '/es/us/senate/', label: 'Proyección Senado', description: '35 escaños disputados' },
        { href: '/es/us/presidencial/', label: 'Desk presidencial', description: 'Escenarios e indicadores nacionales' },
        { href: '/es/us/indexes/lame-duck/', label: 'Índice Lame-Duck', description: 'Índice diario de poder presidencial' },
      ],
    },
  },
  {
    id: 'uk',
    labels: { en: 'Explore the U.K. desk', fr: 'Explorer le desk Royaume-Uni', es: 'Explorar el desk del Reino Unido' },
    links: {
      en: [
        { href: '/en/uk/', label: 'U.K. hub', description: 'Forecast, polls and special races' },
        { href: '/en/uk/general-election/', label: 'General-election forecast', description: 'All 650 constituencies' },
        { href: '/en/uk/polls/', label: 'Polling hub', description: 'National trend and poll archive' },
        { href: '/en/uk/constituencies/', label: 'Constituency profiles', description: 'MPs, demographics and neighbours' },
        { href: '/en/uk/byelections/clacton/', label: 'Clacton special desk', description: 'Farage vs Count Binface' },
      ],
      fr: [
        { href: '/fr/uk/', label: 'Hub Royaume-Uni', description: 'Projection, sondages et courses spéciales' },
        { href: '/fr/uk/general-election/', label: 'Projection générale', description: 'Les 650 circonscriptions' },
        { href: '/fr/uk/sondages/', label: 'Hub des sondages', description: 'Tendance nationale et archives' },
        { href: '/fr/uk/circonscriptions/', label: 'Fiches de circonscription', description: 'Députés, démographie et voisinage' },
        { href: '/fr/uk/byelections/clacton/', label: 'Desk spécial Clacton', description: 'Farage contre Count Binface' },
      ],
      es: [
        { href: '/es/uk/', label: 'Hub Reino Unido', description: 'Proyección, encuestas y carreras especiales' },
        { href: '/es/uk/general-election/', label: 'Proyección general', description: 'Las 650 circunscripciones' },
        { href: '/es/uk/sondeos/', label: 'Hub de encuestas', description: 'Tendencia nacional y archivo' },
        { href: '/es/uk/circunscripciones/', label: 'Perfiles de circunscripción', description: 'Diputados, demografía y vecindario' },
        { href: '/es/uk/byelections/clacton/', label: 'Desk especial Clacton', description: 'Farage contra Count Binface' },
      ],
    },
  },
  {
    id: 'france',
    labels: { en: 'Explore the France desk', fr: 'Explorer le desk France', es: 'Explorar el desk Francia' },
    links: {
      en: [
        { href: '/en/france/', label: 'France hub', description: '2027 presidential scenarios' },
        { href: '/en/france/polls/', label: 'Polling hub', description: 'First round and runoff polling' },
        { href: '/en/france/candidates/', label: 'Candidate profiles', description: 'People, scenarios and books' },
        { href: '/en/france/presidential/maps/', label: 'Electoral maps', description: 'Territorial results and scenarios' },
        { href: '/en/france/legislative-election/', label: 'Legislative election', description: 'National Assembly outlook' },
      ],
      fr: [
        { href: '/fr/france/', label: 'Hub France', description: 'Scénarios présidentiels 2027' },
        { href: '/fr/france/sondages/', label: 'Hub des sondages', description: 'Premier tour et duels' },
        { href: '/fr/france/candidats/', label: 'Fiches des candidats', description: 'Personnes, scénarios et livres' },
        { href: '/fr/france/presidentielle/cartes/', label: 'Cartes électorales', description: 'Résultats territoriaux et scénarios' },
        { href: '/fr/france/legislatives/', label: 'Élections législatives', description: 'Perspective de l’Assemblée nationale' },
      ],
      es: [
        { href: '/es/france/', label: 'Hub Francia', description: 'Escenarios presidenciales 2027' },
        { href: '/es/france/sondeos/', label: 'Hub de encuestas', description: 'Primera vuelta y duelos' },
        { href: '/es/france/candidatos/', label: 'Perfiles de candidatos', description: 'Personas, escenarios y libros' },
        { href: '/es/france/presidencial/mapas/', label: 'Mapas electorales', description: 'Resultados territoriales y escenarios' },
        { href: '/es/france/legislativas/', label: 'Elecciones legislativas', description: 'Perspectiva de la Asamblea Nacional' },
      ],
    },
  },
  {
    id: 'sports',
    labels: { en: 'Explore Sports Scope', fr: 'Explorer Sports Scope', es: 'Explorar Sports Scope' },
    links: {
      en: [
        { href: '/en/sports/', label: 'Sports hub', description: 'All current models and tournaments' },
        { href: '/en/sports/nhl/', label: 'NHL desk', description: 'Stanley Cup probabilities' },
        { href: '/en/sports/mlb/', label: 'MLB desk', description: 'Baseball forecasts and standings' },
        { href: '/en/sports/wc2026/', label: 'World Cup 2026', description: 'Tournament archive and team stories' },
        { href: '/en/sports/track-record/', label: 'Sports track record', description: 'Resolved model calls' },
      ],
      fr: [
        { href: '/fr/sports/', label: 'Hub sports', description: 'Tous les modèles et tournois' },
        { href: '/fr/sports/nhl/', label: 'Desk LNH', description: 'Probabilités de la Coupe Stanley' },
        { href: '/fr/sports/mlb/', label: 'Desk MLB', description: 'Projections et classements de baseball' },
        { href: '/fr/sports/wc2026/', label: 'Coupe du monde 2026', description: 'Archives du tournoi et équipes' },
        { href: '/fr/sports/track-record/', label: 'Historique sportif', description: 'Prédictions résolues du modèle' },
      ],
      es: [
        { href: '/es/sports/', label: 'Hub deportes', description: 'Todos los modelos y torneos' },
        { href: '/es/sports/nhl/', label: 'Desk NHL', description: 'Probabilidades de la Stanley Cup' },
        { href: '/es/sports/mlb/', label: 'Desk MLB', description: 'Proyecciones y clasificaciones' },
        { href: '/es/sports/wc2026/', label: 'Mundial 2026', description: 'Archivo del torneo e historias' },
        { href: '/es/sports/track-record/', label: 'Historial deportivo', description: 'Pronósticos resueltos' },
      ],
    },
  },
];

const GENERAL_LINKS: Record<SiteLocale, DiscoveryLink[]> = {
  en: [
    { href: '/en/canada/', label: 'Canada' },
    { href: '/en/us/', label: 'United States' },
    { href: '/en/uk/', label: 'United Kingdom' },
    { href: '/en/france/', label: 'France' },
    { href: '/en/indexes/', label: 'Indexes' },
  ],
  fr: [
    { href: '/fr/canada/', label: 'Canada' },
    { href: '/fr/us/', label: 'États-Unis' },
    { href: '/fr/uk/', label: 'Royaume-Uni' },
    { href: '/fr/france/', label: 'France' },
    { href: '/fr/indexes/', label: 'Index' },
  ],
  es: [
    { href: '/es/canada/', label: 'Canadá' },
    { href: '/es/us/', label: 'Estados Unidos' },
    { href: '/es/uk/', label: 'Reino Unido' },
    { href: '/es/france/', label: 'Francia' },
    { href: '/es/indexes/', label: 'Índices' },
  ],
};

export function getContextualDiscovery(pathname: string, locale: SiteLocale) {
  const section = DISCOVERY_SECTIONS.find((candidate) => pathname.includes(`/${candidate.id}/`));
  const title = section?.labels[locale] ?? (
    locale === 'fr' ? 'Poursuivre l’exploration'
      : locale === 'es' ? 'Seguir explorando'
        : 'Keep exploring'
  );
  const links = (section?.links[locale] ?? GENERAL_LINKS[locale])
    .filter((link) => normalizePath(link.href) !== normalizePath(pathname))
    .slice(0, 4);
  return { title, links };
}

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}
