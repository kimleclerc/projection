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
      href: '/es/canada/',
      signal: 'Canada Goose Index is now live',
    },
    {
      id: 'uk',
      name: 'United Kingdom Desk',
      eyebrow: 'Westminster + by-elections',
      question: 'How real is the Reform wave, seat by seat?',
      description:
        '650 constituencies calibrated against published MRPs, real by-election anchoring, and a special desk for Clacton — Farage under investigation, market checks included.',
      href: '/en/uk/',
      signal: 'Clacton special desk is live',
    },
    {
      id: 'france',
      name: 'France Desk',
      eyebrow: '2027 Presidential',
      question: 'Who reaches the runoff, and who wins it, in a field still taking shape?',
      description:
        'The 2027 presidential first: first-round scenarios, runoff matchups, declared field. Plus a full legislative model — 577 constituencies, calibrated withdrawal scenarios, and a bridge that carries presidential polling movement when direct legislative polls go quiet.',
      href: '/en/france/',
      signal: 'Le Pen declared · Bardella leads the first round',
    },
    {
      id: 'sports',
      name: 'Sports Scope',
      eyebrow: 'Sports model archive',
      question: 'What did the models see before the trophies were awarded?',
      description:
        'A sportier desk for playoff paths, goalie volatility, live scores, market checks, and tournament chaos.',
      href: '/en/sports/',
      signal: 'Spain won the 2026 World Cup; the full model record remains public',
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
      signal: 'L’indice Bernache est maintenant en ligne',
    },
    {
      id: 'uk',
      name: 'Desk Royaume-Uni',
      eyebrow: 'Westminster + partielles',
      question: 'La vague Reform est-elle réelle, siège par siège?',
      description:
        '650 circonscriptions calibrées sur les MRP publiés, ancrage des partielles réelles, et un desk spécial pour Clacton — Farage sous enquête, marchés en comparaison.',
      href: '/fr/uk/',
      signal: 'Le desk spécial Clacton est en ligne',
    },
    {
      id: 'france',
      name: 'Desk France',
      eyebrow: 'Présidentielle 2027',
      question: 'Qui atteint le second tour, et qui le gagne, dans un champ encore mouvant?',
      description:
        'La présidentielle 2027 d’abord : scénarios de premier tour, duels, champ déclaré. Plus un modèle législatif complet — 577 circonscriptions, scénarios de désistement calibrés, et un pont qui porte le mouvement des sondages présidentiels quand les sondages législatifs se taisent.',
      href: '/fr/france/',
      signal: 'Le Pen déclarée · Bardella en tête au premier tour',
    },
    {
      id: 'sports',
      name: 'Sports Scope',
      eyebrow: 'Archives des modèles sportifs',
      question: 'Qu’avaient vu les modèles avant la remise des trophées?',
      description:
        'Une verticale plus sportive pour chemins de séries, volatilité des gardiens, scores live, marchés et chaos de tournoi.',
      href: '/fr/sports/',
      signal: 'L’Espagne a gagné le Mondial 2026; le bilan complet du modèle reste public',
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
      signal: 'El Canada Goose Index ya está en vivo',
    },
    {
      id: 'uk',
      name: 'Desk Reino Unido',
      eyebrow: 'Westminster + parciales',
      question: '¿Qué tan real es la ola de Reform, escaño por escaño?',
      description:
        '650 circunscripciones calibradas contra los MRP publicados, anclaje de parciales reales y un desk especial para Clacton — Farage bajo investigación, mercados como referencia.',
      href: '/es/uk/',
      signal: 'El desk especial de Clacton está en vivo',
    },
    {
      id: 'france',
      name: 'Mesa Francia',
      eyebrow: 'Presidencial 2027',
      question: '¿Quién llega a la segunda vuelta, y quién la gana, en un campo aún en formación?',
      description:
        'La presidencial de 2027 primero: escenarios de primera vuelta, duelos, campo declarado. Además un modelo legislativo completo — 577 circunscripciones, escenarios de retirada calibrados y un puente que traslada el movimiento presidencial cuando las encuestas legislativas callan.',
      href: '/es/france/',
      signal: 'Le Pen declarada · Bardella encabeza la primera vuelta',
    },
    {
      id: 'sports',
      name: 'Sports Scope',
      eyebrow: 'Archivo de modelos deportivos',
      question: '¿Qué vieron los modelos antes de que se entregaran los trofeos?',
      description:
        'Una vertical más deportiva para caminos de playoff, volatilidad de porteros, marcadores en vivo, mercados y caos de torneo.',
      href: '/es/sports/',
      signal: 'España ganó el Mundial 2026; el registro completo del modelo sigue público',
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
      id: 'canada-goose',
      name: 'Canada Goose Index',
      family: 'Power',
      question: 'How much standing does Carney bring to the CUSMA table?',
      description:
        'A composite of Liberal electoral lead, seat projection, government approval, Nanos confidence, national mood, and mandate runway. Higher = stronger negotiating posture.',
      href: '/en/canada/indexes/canada-goose/',
      status: 'live',
      cadence: 'As data lands',
      metric: 'Current score from web_data/ca-canada-goose/latest.json',
    },
    {
      id: 'cusma-showdown',
      name: 'CUSMA Showdown',
      family: 'Power',
      question: 'Who leads the CUSMA negotiating table — Carney or Trump?',
      description:
        'Pits the Canada Goose Index against the Trump Lame-Duck Index in one leverage-gap number. Positive = Canada ahead.',
      href: '/en/indexes/cusma-showdown/',
      status: 'live',
      cadence: 'Daily',
      metric: 'Leverage gap from web_data/cusma-showdown/latest.json',
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
    {
      id: 'barrage',
      name: 'Barrage Index',
      family: 'Power',
      question: 'How solid is France’s republican front against the RN ahead of 2027?',
      description:
        'A composite of second-round polling margins, the VoteScope model verdict, transfer discipline, and far-right first-round pressure. Higher = the barrage holds; lower = rising risk of a far-right win.',
      href: '/en/france/indexes/barrage/',
      status: 'live',
      cadence: 'As data lands',
      metric: 'Current score from web_data/fr-barrage/latest.json',
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
      id: 'canada-goose',
      name: 'Indice Bernache',
      family: 'Power',
      question: 'Quel poids Carney apporte-t-il à la table de l’ACEUM?',
      description:
        'Un composite de l’avance électorale libérale, la projection de sièges, l’approbation du gouvernement, la confiance Nanos, l’humeur nationale et l’horizon de mandat. Plus haut = posture plus forte.',
      href: '/fr/canada/indexes/canada-goose/',
      status: 'live',
      cadence: 'Au fil des données',
      metric: 'Score courant depuis web_data/ca-canada-goose/latest.json',
    },
    {
      id: 'cusma-showdown',
      name: 'Duel ACEUM',
      family: 'Power',
      question: 'Qui mène la table de l’ACEUM — Carney ou Trump?',
      description:
        'Oppose l’Indice Bernache à l’Indice canard boiteux de Trump en un seul écart de levier. Positif = avantage Canada.',
      href: '/fr/indexes/cusma-showdown/',
      status: 'live',
      cadence: 'Quotidien',
      metric: 'Écart de levier depuis web_data/cusma-showdown/latest.json',
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
    {
      id: 'barrage',
      name: 'Barrage Index',
      family: 'Power',
      question: 'Le barrage républicain tient-il face au RN à l’approche de 2027?',
      description:
        "Un composite des marges de duels de 2e tour, du verdict du modèle VoteScope, de la discipline de report et de la pression d'extrême droite au 1er tour. Plus haut = le barrage tient; plus bas = risque de bascule.",
      href: '/fr/france/indexes/barrage/',
      status: 'live',
      cadence: 'Au fil des données',
      metric: 'Score courant depuis web_data/fr-barrage/latest.json',
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
      id: 'canada-goose',
      name: 'Canada Goose Index',
      family: 'Power',
      question: '¿Cuánto peso aporta Carney a la mesa del T-MEC?',
      description:
        'Un compuesto de la ventaja electoral liberal, la proyección de escaños, la aprobación del gobierno, la confianza Nanos, el ánimo nacional y el horizonte de mandato. Más alto = postura más fuerte.',
      href: '/es/canada/indexes/canada-goose/',
      status: 'live',
      cadence: 'Según llegan los datos',
      metric: 'Puntuación actual desde web_data/ca-canada-goose/latest.json',
    },
    {
      id: 'cusma-showdown',
      name: 'Duelo T-MEC',
      family: 'Power',
      question: '¿Quién lidera la mesa del T-MEC — Carney o Trump?',
      description:
        'Enfrenta el Canada Goose Index al Lame-Duck Index de Trump en una sola brecha de ventaja. Positivo = Canadá adelante.',
      href: '/es/indexes/cusma-showdown/',
      status: 'live',
      cadence: 'Diario',
      metric: 'Brecha de ventaja desde web_data/cusma-showdown/latest.json',
    },
    {
      id: 'barrage',
      name: 'Barrage Index',
      family: 'Power',
      question: '¿Aguanta el frente republicano francés ante el RN de cara a 2027?',
      description:
        'Un compuesto de los márgenes de segunda vuelta, el veredicto del modelo VoteScope, la disciplina de transferencia y la presión de la extrema derecha en la primera vuelta. Más alto = el dique aguanta.',
      href: '/es/france/indexes/barrage/',
      status: 'live',
      cadence: 'Según llegan los datos',
      metric: 'Puntuación actual desde web_data/fr-barrage/latest.json',
    },
  ],
};
