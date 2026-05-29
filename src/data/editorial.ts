export type Locale = 'en' | 'fr' | 'es';
export type EditorialLocale = 'en' | 'fr' | 'es';

export interface Instrument {
  id: string;
  name: string;
  family: 'Power' | 'Movement' | 'Markets' | 'Sports';
  question: string;
  description: string;
  href: string;
  status: 'live' | 'next' | 'planned';
  cadence: string;
  metric?: string;
}

export interface Desk {
  id: string;
  name: string;
  eyebrow: string;
  question: string;
  description: string;
  href: string;
  signal: string;
}

export const editorialPhilosophy = {
  en: {
    position:
      "Vote-Scope is a bureau of electoral and sports intelligence that publishes its instruments.",
    promise:
      "Not just who’s ahead. What’s moving, what’s fragile, and what the market is missing.",
    method: "one page, one question",
    proof:
      "Every projection is built from public polls, an open Bayesian method, and the source data behind it — all on the page.",
  },
  fr: {
    position:
      "Vote-Scope est un bureau d’intelligence électorale et sportive qui publie ses instruments.",
    promise:
      "Pas juste qui mène. Ce qui bouge, ce qui est fragile, et ce que le marché ne voit pas encore.",
    method: "une page, une question",
    proof:
      "Chaque projection s'appuie sur des sondages publics, une méthode bayésienne ouverte et les données sources — le tout sur la page.",
  },
  es: {
    position:
      "Vote-Scope es una oficina de inteligencia electoral y deportiva que publica sus instrumentos.",
    promise:
      "No solo quién va adelante. Qué se está moviendo, qué es frágil y qué está perdiendo el mercado.",
    method: "una página, una pregunta",
    proof:
      "Cada proyección parte de sondeos públicos, un método bayesiano abierto y los datos de origen — todo en la página.",
  },
} as const;

export const desks: Record<'en' | 'fr' | 'es', Desk[]> = {
  en: [
    {
      id: 'us',
      name: 'United States Desk',
      eyebrow: 'Midterms 2026',
      question: 'Who controls Washington when the map stops being theoretical?',
      description:
        'House, Senate, special elections, presidential drag, and the market gaps that make U.S. politics readable day to day.',
      href: '/en/us/',
      signal: 'Trump Drag & Lame-Duck Index is live',
    },
    {
      id: 'canada',
      name: 'Canada Desk',
      eyebrow: 'Federal + provincial',
      question: 'Where is the Canadian map stable, and where is it only pretending?',
      description:
        'Federal, Quebec, Ontario, by-elections, riding risk, and the path from public polls to seat pressure.',
      href: '/en/canada/',
      signal: 'Riding-level projections remain the backbone',
    },
    {
      id: 'sports',
      name: 'Sports Scope',
      eyebrow: 'NHL + World Cup',
      question: 'Who has the cleanest path, and who is riding a fragile streak?',
      description:
        'A sportier desk for playoff paths, goalie volatility, live scores, market checks, and tournament chaos.',
      href: '/en/sports/',
      signal: 'Cup Path and Goalie Volatility are the next instruments',
    },
  ],
  fr: [
    {
      id: 'us',
      name: 'Desk États-Unis',
      eyebrow: 'Midterms 2026',
      question: "Qui contrôle Washington quand la carte cesse d'être théorique?",
      description:
        'Chambre, Sénat, partielles, poids présidentiel et écarts de marché pour lire la politique américaine au quotidien.',
      href: '/fr/us/',
      signal: "L'indice Lame-Duck est en ligne",
    },
    {
      id: 'canada',
      name: 'Desk Canada',
      eyebrow: 'Fédéral + provinces',
      question: 'Où la carte canadienne est-elle solide, et où fait-elle seulement semblant?',
      description:
        'Fédéral, Québec, Ontario, partielles, risque par circonscription et passage des sondages à la pression en sièges.',
      href: '/fr/canada/',
      signal: 'Les projections par circonscription restent la colonne vertébrale',
    },
    {
      id: 'sports',
      name: 'Sports Scope',
      eyebrow: 'NHL + Coupe du monde',
      question: 'Qui a le chemin le plus propre, et qui vit sur une séquence fragile?',
      description:
        'Une verticale plus sportive pour chemins de séries, volatilité des gardiens, scores live, marchés et chaos de tournoi.',
      href: '/fr/sports/',
      signal: 'Cup Path et Goalie Volatility sont les prochains instruments',
    },
  ],
  es: [
    {
      id: 'us',
      name: 'Desk Estados Unidos',
      eyebrow: 'Midterms 2026',
      question: '¿Quién controla Washington cuando el mapa deja de ser teórico?',
      description:
        'Cámara, Senado, elecciones especiales, peso presidencial y las brechas de mercado que hacen legible la política estadounidense día a día.',
      href: '/es/us/',
      signal: 'Trump Drag y el Lame-Duck Index están en vivo',
    },
    {
      id: 'canada',
      name: 'Desk Canadá',
      eyebrow: 'Federal + provincial',
      question: '¿Dónde es estable el mapa canadiense y dónde solo lo aparenta?',
      description:
        'Federal, Quebec, Ontario, parciales, riesgo por circunscripción y el paso de las encuestas a la presión en escaños.',
      href: '/en/canada/',
      signal: 'Las proyecciones por circunscripción siguen siendo la columna vertebral',
    },
    {
      id: 'sports',
      name: 'Sports Scope',
      eyebrow: 'NHL + Copa del Mundo',
      question: '¿Quién tiene el camino más despejado y quién vive de una racha frágil?',
      description:
        'Una vertical más deportiva para caminos de playoff, volatilidad de porteros, marcadores en vivo, mercados y caos de torneo.',
      href: '/es/sports/',
      signal: 'Cup Path y Goalie Volatility son los próximos instrumentos',
    },
  ],
};

export const instruments: Record<'en' | 'fr' | 'es', Instrument[]> = {
  en: [
    {
      id: 'lame-duck',
      name: 'Lame-Duck Index',
      family: 'Power',
      question: 'How politically constrained is the presidency right now?',
      description:
        'A named daily instrument for presidential drag, congressional risk, approval, and economic sentiment.',
      href: '/en/us/indexes/lame-duck/',
      status: 'live',
      cadence: 'Daily / weekly inputs',
      metric: 'Current score from web_data/us-lame-duck/latest.json',
    },
    {
      id: 'majority-fragility',
      name: 'Majority Fragility Index',
      family: 'Power',
      question: 'How breakable is the governing majority?',
      description:
        'Turns seat margins, local risk, and by-election signals into a readable stress score.',
      href: '/en/indexes/',
      status: 'next',
      cadence: 'After projection runs',
    },
    {
      id: 'model-market-gap',
      name: 'Model vs Market Gap',
      family: 'Markets',
      question: 'Where does Vote-Scope disagree with the market?',
      description:
        'A market benchmark that treats Polymarket and odds data as a comparison layer, not a betting product.',
      href: '/en/indexes/',
      status: 'next',
      cadence: 'After market refreshes',
    },
    {
      id: 'battleground-heat',
      name: 'Battleground Heat Index',
      family: 'Movement',
      question: 'Which races are becoming politically hot before the topline notices?',
      description:
        'A scan for swing, volatility, and attention across districts, states, ridings, and regions.',
      href: '/en/indexes/',
      status: 'planned',
      cadence: 'Nightly',
    },
    {
      id: 'cup-path',
      name: 'Cup Path Index',
      family: 'Sports',
      question: 'Who has the cleanest path to the Stanley Cup?',
      description:
        'Combines team strength, bracket path, goalie layer, injuries, and market expectations.',
      href: '/en/sports/',
      status: 'next',
      cadence: 'After NHL game updates',
    },
    {
      id: 'goalie-volatility',
      name: 'Goalie Volatility Index',
      family: 'Sports',
      question: 'Which teams are most exposed to the next bad crease night?',
      description:
        'A Sports Scope instrument built around starter uncertainty, high-danger save rates, and playoff leverage.',
      href: '/en/sports/',
      status: 'next',
      cadence: 'Game days',
    },
    {
      id: 'fraser-interim',
      name: 'Fraser Interim Index',
      family: 'Power',
      question: 'Do Ontario Liberals poll better under Fraser as interim leader?',
      description:
        'Editorial indicator comparing Ontario Liberal polling under interim leader John Fraser vs permanent leaders. Score 0-100, 50 = neutral.',
      href: '/en/indexes/fraser-interim/',
      status: 'live',
      cadence: 'Quarterly',
      metric: '65.8 / 100',
    },
  ],
  fr: [
    {
      id: 'lame-duck',
      name: 'Lame-Duck Index',
      family: 'Power',
      question: 'À quel point la présidence est-elle contrainte politiquement?',
      description:
        "Un instrument quotidien nommé pour lire le poids présidentiel, le risque au Congrès, l'approbation et l'économie.",
      href: '/fr/us/indexes/lame-duck/',
      status: 'live',
      cadence: 'Entrées quotidiennes / hebdomadaires',
      metric: 'Score courant depuis web_data/us-lame-duck/latest.json',
    },
    {
      id: 'majority-fragility',
      name: 'Majority Fragility Index',
      family: 'Power',
      question: 'À quel point une majorité gouvernementale est-elle cassable?',
      description:
        'Transforme les marges en sièges, les risques locaux et les signaux de partielles en score de tension lisible.',
      href: '/fr/indexes/',
      status: 'next',
      cadence: 'Après les runs de projection',
    },
    {
      id: 'model-market-gap',
      name: 'Model vs Market Gap',
      family: 'Markets',
      question: 'Où Vote-Scope est-il en désaccord avec le marché?',
      description:
        "Un repère de comparaison qui traite Polymarket et les cotes comme une couche de lecture, pas comme un produit de pari.",
      href: '/fr/indexes/',
      status: 'next',
      cadence: 'Après les refreshs marché',
    },
    {
      id: 'battleground-heat',
      name: 'Battleground Heat Index',
      family: 'Movement',
      question: 'Quelles courses chauffent avant que le topline le voie?',
      description:
        "Un balayage du swing, de la volatilité et de l'attention dans les districts, États, circonscriptions et régions.",
      href: '/fr/indexes/',
      status: 'planned',
      cadence: 'Chaque nuit',
    },
    {
      id: 'cup-path',
      name: 'Cup Path Index',
      family: 'Sports',
      question: 'Qui a le chemin le plus propre vers la Coupe Stanley?',
      description:
        "Combine force d'équipe, chemin de bracket, couche gardiens, blessures et attentes du marché.",
      href: '/fr/sports/',
      status: 'next',
      cadence: 'Après les matchs NHL',
    },
    {
      id: 'goalie-volatility',
      name: 'Goalie Volatility Index',
      family: 'Sports',
      question: 'Quelles équipes sont exposées à la prochaine mauvaise soirée devant le filet?',
      description:
        "Un instrument Sports Scope autour de l'incertitude des partants, du HDSV% et du levier en séries.",
      href: '/fr/sports/',
      status: 'next',
      cadence: 'Jours de match',
    },
    {
      id: 'fraser-interim',
      name: 'Indice Fraser intérimaire',
      family: 'Power',
      question: 'Les libéraux ontariens sondent-ils mieux avec Fraser comme chef intérimaire?',
      description:
        'Indicateur éditorial comparant les sondages des libéraux ontariens sous John Fraser (intérimaire) vs les chefs permanents. Score 0-100, 50 = neutre.',
      href: '/fr/indexes/fraser-interim/',
      status: 'live',
      cadence: 'Trimestriel',
      metric: '65,8 / 100',
    },
  ],
  es: [
    {
      id: 'lame-duck',
      name: 'Lame-Duck Index',
      family: 'Power',
      question: '¿Qué tan políticamente limitada está la presidencia ahora mismo?',
      description:
        'Un instrumento diario con nombre propio para medir el peso presidencial, el riesgo en el Congreso, la aprobación y el sentimiento económico.',
      href: '/es/us/indexes/lame-duck/',
      status: 'live',
      cadence: 'Entradas diarias / semanales',
      metric: 'Puntuación actual desde web_data/us-lame-duck/latest.json',
    },
    {
      id: 'majority-fragility',
      name: 'Majority Fragility Index',
      family: 'Power',
      question: '¿Qué tan fácil es romper la mayoría gobernante?',
      description:
        'Convierte márgenes de escaños, riesgos locales y señales de elecciones parciales en una puntuación de estrés legible.',
      href: '/es/indexes/',
      status: 'next',
      cadence: 'Tras las ejecuciones de proyección',
    },
    {
      id: 'model-market-gap',
      name: 'Model vs Market Gap',
      family: 'Markets',
      question: '¿Dónde discrepa Vote-Scope con el mercado?',
      description:
        'Un punto de referencia que trata a Polymarket y los datos de cuotas como una capa de comparación, no como un producto de apuestas.',
      href: '/es/indexes/',
      status: 'next',
      cadence: 'Tras las actualizaciones del mercado',
    },
    {
      id: 'battleground-heat',
      name: 'Battleground Heat Index',
      family: 'Movement',
      question: '¿Qué carreras se están calentando antes de que el topline lo note?',
      description:
        'Un análisis de swing, volatilidad y atención en distritos, estados, circunscripciones y regiones.',
      href: '/es/indexes/',
      status: 'planned',
      cadence: 'Cada noche',
    },
    {
      id: 'cup-path',
      name: 'Cup Path Index',
      family: 'Sports',
      question: '¿Quién tiene el camino más despejado hacia la Copa Stanley?',
      description:
        'Combina fortaleza del equipo, ruta en el bracket, capa de porteros, lesiones y expectativas del mercado.',
      href: '/es/sports/',
      status: 'next',
      cadence: 'Tras los partidos de la NHL',
    },
    {
      id: 'goalie-volatility',
      name: 'Goalie Volatility Index',
      family: 'Sports',
      question: '¿Qué equipos están más expuestos a una mala noche bajo los palos?',
      description:
        'Un instrumento Sports Scope centrado en la incertidumbre del titular, el HDSV% y el apalancamiento en playoffs.',
      href: '/es/sports/',
      status: 'next',
      cadence: 'Días de partido',
    },
  ],
};
