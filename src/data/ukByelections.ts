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
  contextPolls: UkContextPoll[];
  paths: Record<UkByelectionLocale, string>;
}

/** Partielles 2026 résolues — strip du desk UK (source : data/uk_byelections.csv du moteur). */
export interface UkResolvedByelection {
  name: string;
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
  clacton: {
    slug: 'clacton',
    ridingId: 'E14001174',
    ridingName: 'Clacton',
    constituencyPath: '/en/uk/constituencies/E14001174-clacton/',
    status: 'pending',
    vacancyDate: '2026-07-07',
    electionDate: null,
    title: {
      en: 'Clacton By-Election — Farage vs. a Single Independent — Vote-Scope',
      fr: 'Partielle de Clacton — Farage face à un indépendant unique — Vote-Scope',
      es: 'Parcial de Clacton — Farage frente a un único independiente — Vote-Scope',
    },
    description: {
      en: "Nigel Farage resigned his Clacton seat on July 7, 2026. The by-election shapes up as Farage against a single independent — a race with no partisan baseline. Vote-Scope tracks it live and explains why there is no projection yet.",
      fr: "Nigel Farage a démissionné de son siège de Clacton le 7 juillet 2026. La partielle s'annonce comme un duel Farage contre un indépendant unique — une course sans baseline partisane. Vote-Scope la suit en direct et explique pourquoi il n'y a pas encore de projection.",
      es: 'Nigel Farage renunció a su escaño de Clacton el 7 de julio de 2026. La parcial se perfila como Farage contra un único independiente — una contienda sin línea de base partidista. Vote-Scope la sigue en vivo y explica por qué aún no hay proyección.',
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
