// Partielles UK — config par course, pattern canadaByelections mais adapté :
// une course « pending » n'a PAS de projection (convention moteur : aucun
// nombre sans sondage local — docs/UK_CLACTON_BYELECTION.md côté engine).

export type UkByelectionLocale = 'en' | 'fr' | 'es';

export interface UkPastCandidate {
  name: string;
  party: string;
  party_label_en: string;
  party_label_fr: string;
  party_label_es: string;
  color: string;
  votes: number;
  pct: number;
  is_winner: boolean;
}

export interface UkContextPollOption {
  label_en: string;
  label_fr: string;
  label_es: string;
  pct: number;
  color: string;
}

export interface UkContextPoll {
  firm: string;
  field_dates_label: Record<UkByelectionLocale, string>;
  sample_size: number;
  /** national | local — national NE DOIT JAMAIS être présenté comme intention de vote locale. */
  scope: 'national' | 'local';
  question_en: string;
  question_fr: string;
  question_es: string;
  options: UkContextPollOption[];
}

/**
 * Dépouillement officiel d'une partielle réglée. Même forme que
 * `ByelectionResult` côté Canada : c'est ce bloc, et l'absence de données
 * live, qui fait basculer la page de « course » à « résultat ».
 */
export interface UkByelectionResult {
  date_held: string;
  turnout_pct: number;
  registered_voters?: number;
  candidates: UkPastCandidate[];
  /** Bilan du modèle : ce qu'on avait dit, ce qui s'est produit. */
  blurb_en: string;
  blurb_fr: string;
  blurb_es: string;
}

export interface UkByelectionConfig {
  slug: string;
  ridingId: string;
  ridingName: string;
  constituencyPath: string;
  status: 'pending' | 'resolved';
  vacancyDate: string;
  /** null tant que le writ n'est pas déposé. */
  electionDate: string | null;
  title: Record<UkByelectionLocale, string>;
  description: Record<UkByelectionLocale, string>;
  last2024: {
    date: string;
    turnout_note_en: string;
    turnout_note_fr: string;
    turnout_note_es: string;
    candidates: UkPastCandidate[];
  };
  /** Présent seulement quand le scrutin a eu lieu — bascule la page en archive. */
  result?: UkByelectionResult;
  contextPolls: UkContextPoll[];
  paths: Record<UkByelectionLocale, string>;
}

/** Partielles 2026 résolues — strip du desk UK (source : data/uk_byelections.csv du moteur). */
export interface UkResolvedByelection {
  name: string;
  /** Page d'archive, quand la course en a une (Clacton). */
  paths?: Record<UkByelectionLocale, string>;
  date: string;
  winner_party: string;
  color: string;
  pct: number;
  outcome_en: string;
  outcome_fr: string;
  outcome_es: string;
}

export const ukResolvedByelections2026: UkResolvedByelection[] = [
  {
    name: 'Clacton',
    paths: {
      en: '/en/uk/byelections/clacton/',
      fr: '/fr/uk/byelections/clacton/',
      es: '/es/uk/byelections/clacton/',
    },
    date: '2026-08-13',
    winner_party: 'REF',
    color: '#12B6CF',
    pct: 63.3,
    outcome_en: 'Reform hold — Farage back with 63.3% against Count Binface, on a 44.4% turnout.',
    outcome_fr: 'Maintien Reform — Farage revient à 63,3 % face à Count Binface, participation 44,4 %.',
    outcome_es: 'Retención de Reform — Farage vuelve con 63,3 % frente a Count Binface, participación 44,4 %.',
  },
  {
    name: 'Gorton and Denton',
    date: '2026-02-26',
    winner_party: 'GRN',
    color: '#6AB023',
    pct: 40.7,
    outcome_en: 'Green gain from Labour — first Green by-election win.',
    outcome_fr: 'Gain vert sur les travaillistes — première victoire verte en partielle.',
    outcome_es: 'Ganancia verde sobre los laboristas — primera victoria verde en una parcial.',
  },
  {
    name: 'Makerfield',
    date: '2026-06-18',
    winner_party: 'LAB',
    color: '#E4003B',
    pct: 54.8,
    outcome_en: 'Labour hold — Andy Burnham returns to Westminster.',
    outcome_fr: 'Maintien travailliste — Andy Burnham revient à Westminster.',
    outcome_es: 'Retención laborista — Andy Burnham vuelve a Westminster.',
  },
  {
    name: 'Aberdeen South',
    date: '2026-06-18',
    winner_party: 'CON',
    color: '#0087DC',
    pct: 49.5,
    outcome_en: 'Conservative gain from the SNP — first Scottish by-election gain since 1967.',
    outcome_fr: 'Gain conservateur sur le SNP — premier gain en partielle écossaise depuis 1967.',
    outcome_es: 'Ganancia conservadora sobre el SNP — primera en una parcial escocesa desde 1967.',
  },
  {
    name: 'Arbroath and Broughty Ferry',
    date: '2026-06-18',
    winner_party: 'SNP',
    color: '#FDF38E',
    pct: 41.1,
    outcome_en: 'SNP hold.',
    outcome_fr: 'Maintien SNP.',
    outcome_es: 'Retención del SNP.',
  },
];

export const ukByelections: Record<string, UkByelectionConfig> = {
  holborn: {
    slug: 'holborn-and-st-pancras',
    ridingId: 'E14001290',
    ridingName: 'Holborn and St Pancras',
    constituencyPath: '/en/uk/constituencies/E14001290-holborn-and-st-pancras/',
    status: 'pending',
    vacancyDate: '2026-09-01',
    electionDate: null,
    title: {
      en: 'Holborn and St Pancras By-Election: Labour Defends Starmer’s Seat — Forecast, Field and Path to Victory — Vote-Scope',
      fr: 'Partielle de Holborn and St Pancras : le Labour défend le siège de Starmer — Projection, champ et path to victory — Vote-Scope',
      es: 'Parcial de Holborn and St Pancras: el laborismo defiende el escaño de Starmer — Proyección, campo y path to victory — Vote-Scope',
    },
    description: {
      en: 'Keir Starmer resigned from the Commons on 1 September 2026. No writ, no date, no declared candidates and no constituency poll — so Vote-Scope publishes ranges and field scenarios rather than a point estimate. Labour projects at 35.3% and holds in 82.2% of simulations; if Green leader Zack Polanski stands, that falls to 55.8%.',
      fr: 'Keir Starmer a quitté les Communes le 1er septembre 2026. Ni writ, ni date, ni candidature déclarée, ni sondage de circonscription — Vote-Scope publie donc des fourchettes et des scénarios de champ plutôt qu’un point. Le Labour se projette à 35,3 % et conserve le siège dans 82,2 % des simulations ; si Zack Polanski se présente, cela tombe à 55,8 %.',
      es: 'Keir Starmer dejó los Comunes el 1 de septiembre de 2026. Sin writ, sin fecha, sin candidaturas declaradas y sin encuesta de circunscripción — Vote-Scope publica rangos y escenarios de campo en lugar de un punto. El laborismo se proyecta en 35,3 % y retiene el escaño en 82,2 % de las simulaciones; si se presenta Zack Polanski, cae a 55,8 %.',
    },
    last2024: {
      date: '2024-07-04',
      turnout_note_en: 'July 4, 2024 general election result — 38,602 votes cast, 54.1% turnout.',
      turnout_note_fr: 'Résultat de la générale du 4 juillet 2024 — 38 602 votes exprimés, participation 54,1 %.',
      turnout_note_es: 'Resultado de las generales del 4 de julio de 2024 — 38 602 votos, participación del 54,1 %.',
      candidates: [
        { name: 'Keir Starmer', party: 'LAB', party_label_en: 'Labour', party_label_fr: 'Travailliste', party_label_es: 'Laborista', color: '#E4003B', votes: 18884, pct: 48.92, is_winner: true },
        { name: 'Andrew Feinstein', party: 'IND', party_label_en: 'Independent', party_label_fr: 'Indépendant', party_label_es: 'Independiente', color: '#6b5b95', votes: 7312, pct: 18.94, is_winner: false },
        { name: 'David Stansell', party: 'GRN', party_label_en: 'Green', party_label_fr: 'Vert', party_label_es: 'Verde', color: '#6AB023', votes: 4030, pct: 10.44, is_winner: false },
        { name: 'Mehreen Malik', party: 'CON', party_label_en: 'Conservative', party_label_fr: 'Conservateur', party_label_es: 'Conservador', color: '#0087DC', votes: 2776, pct: 7.19, is_winner: false },
        { name: 'David Roberts', party: 'REF', party_label_en: 'Reform UK', party_label_fr: 'Reform UK', party_label_es: 'Reform UK', color: '#12B6CF', votes: 2371, pct: 6.14, is_winner: false },
        { name: 'Charlie Clinton', party: 'LD', party_label_en: 'Liberal Democrat', party_label_fr: 'Libéral-démocrate', party_label_es: 'Liberal demócrata', color: '#FAA61A', votes: 2236, pct: 5.79, is_winner: false },
        { name: '', party: 'OTH', party_label_en: 'Six other candidates', party_label_fr: 'Six autres candidats', party_label_es: 'Seis otras candidaturas', color: '#9a938a', votes: 993, pct: 2.57, is_winner: false },
      ],
    },
    contextPolls: [],
    paths: {
      en: '/en/uk/byelections/holborn-and-st-pancras/',
      fr: '/fr/uk/byelections/holborn-and-st-pancras/',
      es: '/es/uk/byelections/holborn-and-st-pancras/',
    },
  },
  clacton: {
    slug: 'clacton',
    ridingId: 'E14001174',
    ridingName: 'Clacton',
    constituencyPath: '/en/uk/constituencies/E14001174-clacton/',
    // Scrutin tenu le 13 août 2026 (hold REF). La page reste en ligne comme
    // archive de course ; le statut ne doit plus la faire passer pour vivante.
    status: 'resolved',
    vacancyDate: '2026-07-07',
    electionDate: '2026-08-13',
    title: {
      en: 'Clacton By-Election 2026: Farage vs Count Binface — Live Forecast, Polymarket, Bookmakers & Path to Victory — Vote-Scope',
      fr: 'Partielle de Clacton 2026 : Farage vs Count Binface — Pronostics en direct, Polymarket, Bookmakers & Path to Victory — Vote-Scope',
      es: 'Parcial de Clacton 2026: Farage vs Count Binface — Pronóstico en vivo, Polymarket, Bookmakers y Path to Victory — Vote-Scope',
    },
    description: {
      en: 'August 13, 2026: Farage recontests his own seat against Count Binface while the major parties boycott. Vote-Scope Monte Carlo forecast, Polymarket and Kalshi prices, bookmaker odds and Count Binface’s path to victory — updated as the race moves.',
      fr: 'Le 13 août 2026, Farage rejoue son propre siège face à Count Binface pendant que les grands partis boycottent. Projection Monte Carlo Vote-Scope, prix Polymarket et Kalshi, cotes des bookmakers et le path to victory de Count Binface — mis à jour au fil de la course.',
      es: 'El 13 de agosto de 2026, Farage disputa su propio escaño contra Count Binface mientras los grandes partidos boicotean. Proyección Monte Carlo de Vote-Scope, precios de Polymarket y Kalshi, cuotas de casas de apuestas y el path to victory de Count Binface.',
    },
    last2024: {
      date: '2024-07-04',
      turnout_note_en: 'July 4, 2024 general election result in Clacton.',
      turnout_note_fr: 'Résultat de la générale du 4 juillet 2024 à Clacton.',
      turnout_note_es: 'Resultado de las generales del 4 de julio de 2024 en Clacton.',
      candidates: [
        { name: 'Nigel Farage', party: 'REF', party_label_en: 'Reform UK', party_label_fr: 'Reform UK', party_label_es: 'Reform UK', color: '#12B6CF', votes: 21225, pct: 46.2, is_winner: true },
        { name: 'Giles Watling', party: 'CON', party_label_en: 'Conservative', party_label_fr: 'Conservateur', party_label_es: 'Conservador', color: '#0087DC', votes: 12820, pct: 27.9, is_winner: false },
        { name: 'Jovan Owusu-Nepaul', party: 'LAB', party_label_en: 'Labour', party_label_fr: 'Travailliste', party_label_es: 'Laborista', color: '#E4003B', votes: 7448, pct: 16.2, is_winner: false },
        { name: 'Matthew Bensilum', party: 'LD', party_label_en: 'Liberal Democrat', party_label_fr: 'Libéral-démocrate', party_label_es: 'Liberal demócrata', color: '#FAA61A', votes: 2016, pct: 4.4, is_winner: false },
        { name: 'Natasha Osben', party: 'GRN', party_label_en: 'Green', party_label_fr: 'Vert', party_label_es: 'Verde', color: '#6AB023', votes: 1935, pct: 4.2, is_winner: false },
      ],
    },
    result: {
      date_held: '2026-08-13',
      turnout_pct: 44.37,
      registered_voters: 79785,
      candidates: [
        { name: 'Nigel Farage', party: 'REF', party_label_en: 'Reform UK', party_label_fr: 'Reform UK', party_label_es: 'Reform UK', color: '#12B6CF', votes: 22239, pct: 63.34, is_winner: true },
        { name: 'Count Binface', party: 'IND', party_label_en: 'Count Binface Party', party_label_fr: 'Count Binface Party', party_label_es: 'Count Binface Party', color: '#1a1a1a', votes: 9455, pct: 26.93, is_winner: false },
        { name: 'Laurence Fox', party: 'RECLAIM', party_label_en: 'The Reclaim Party', party_label_fr: 'The Reclaim Party', party_label_es: 'The Reclaim Party', color: '#7b4ea8', votes: 348, pct: 0.99, is_winner: false },
        { name: '', party: 'OTH', party_label_en: '31 other candidates', party_label_fr: '31 autres candidats', party_label_es: '31 otras candidaturas', color: '#9a938a', votes: 3070, pct: 8.74, is_winner: false },
      ],
      blurb_en: "Reform hold, and the closest call the special engine has made. Vote-Scope's final run put Farage at a 62.6% median with a 99.6% win probability; the count gave him 63.34% — 0.78 points of error on the winner's share. Count Binface was projected at 20.8% [13.9–29.7] and took 26.93%: above the median, comfortably inside the interval, and the reason the range mattered. Where the model was wrong was below the fold — Laurence Fox was projected at 3.0% and got 0.99%, and the 31 micro-candidates were projected at 13.3% against 8.74% counted. The floor for a record 34-candidate field, calibrated against Haltemprice & Howden 2008, was too generous by about four and a half points, and that surplus went to Binface. One structural fact the projection did not carry: Farage won more raw votes than in 2024 (22,239 against 21,225) while the total collapsed 23.6% — the entire drop came from the other side, down 48%. Source: Tendring District Council declaration, 44.37% turnout on 79,785 registered, 32 lost deposits.",
      blurb_fr: "Maintien Reform, et l'appel le plus juste qu'ait produit le moteur spécial. Le dernier run de Vote-Scope plaçait Farage à 62,6 % de médiane avec 99,6 % de probabilité de victoire ; le dépouillement lui a donné 63,34 % — 0,78 point d'erreur sur la part du vainqueur. Count Binface était projeté à 20,8 % [13,9–29,7] et a obtenu 26,93 % : au-dessus de la médiane, largement dans l'intervalle, et c'est précisément à ça que servait la fourchette. Là où le modèle a fauté, c'est en bas de tableau — Laurence Fox projeté à 3,0 % pour 0,99 % obtenu, et les 31 micro-candidats projetés à 13,3 % contre 8,74 % comptés. Le plancher « autres » d'un champ record de 34 candidats, calibré contre Haltemprice & Howden 2008, était trop généreux d'environ quatre points et demi, et ce surplus est allé à Binface. Un fait structurel que la projection ne portait pas : Farage obtient plus de voix brutes qu'en 2024 (22 239 contre 21 225) alors que le total chute de 23,6 % — toute la baisse vient du camp adverse, en recul de 48 %. Source : proclamation du Tendring District Council, participation 44,37 % sur 79 785 inscrits, 32 cautions perdues.",
      blurb_es: "Retención de Reform, y el pronóstico más ajustado que ha producido el motor especial. La última ejecución de Vote-Scope situaba a Farage en una mediana de 62,6 % con 99,6 % de probabilidad de victoria; el recuento le dio 63,34 % — 0,78 puntos de error en la cuota del ganador. Count Binface estaba proyectado en 20,8 % [13,9–29,7] y obtuvo 26,93 %: por encima de la mediana y holgadamente dentro del intervalo, que es exactamente para lo que servía el rango. Donde el modelo falló fue abajo — Laurence Fox proyectado en 3,0 % frente al 0,99 % obtenido, y las 31 micro-candidaturas proyectadas en 13,3 % frente al 8,74 % contado. El suelo de «otros» para un campo récord de 34 candidatos, calibrado contra Haltemprice & Howden 2008, era demasiado generoso en unos cuatro puntos y medio, y ese excedente fue a Binface. Un hecho estructural que la proyección no recogía: Farage obtiene más votos brutos que en 2024 (22 239 frente a 21 225) mientras el total cae un 23,6 % — toda la bajada viene del campo contrario, un 48 % menos. Fuente: proclamación del Tendring District Council, participación del 44,37 % sobre 79 785 inscritos, 32 depósitos perdidos.",
    },
    contextPolls: [
      {
        firm: 'Ipsos',
        field_dates_label: { en: '8–9 July 2026', fr: '8–9 juillet 2026', es: '8–9 de julio de 2026' },
        sample_size: 1000,
        scope: 'national',
        question_en: 'Which of the following, if either, would you prefer to win the by-election in Clacton? (British adults, national)',
        question_fr: 'Lequel des deux préféreriez-vous voir gagner la partielle de Clacton ? (adultes britanniques, national)',
        question_es: '¿A cuál de los dos preferiría ver ganar la parcial de Clacton? (adultos británicos, nacional)',
        options: [
          { label_en: 'Count Binface', label_fr: 'Count Binface', label_es: 'Count Binface', pct: 33, color: '#1a1a1a' },
          { label_en: 'Nigel Farage', label_fr: 'Nigel Farage', label_es: 'Nigel Farage', pct: 21, color: '#12B6CF' },
          { label_en: 'Neither', label_fr: 'Ni l’un ni l’autre', label_es: 'Ninguno', pct: 32, color: '#9a938a' },
          { label_en: "Don't know", label_fr: 'Ne sait pas', label_es: 'No sabe', pct: 13, color: '#c4bdb3' },
        ],
      },
    ],
    paths: {
      en: '/en/uk/byelections/clacton/',
      fr: '/fr/uk/byelections/clacton/',
      es: '/es/uk/byelections/clacton/',
    },
  },
};

export function ukByelectionAlternates(config: UkByelectionConfig) {
  return Object.fromEntries(
    Object.entries(config.paths).map(([locale, path]) => [locale, `https://vote-scope.com${path}`]),
  ) as Record<UkByelectionLocale, string>;
}
