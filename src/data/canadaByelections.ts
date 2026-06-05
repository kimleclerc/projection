export type ByelectionLocale = 'en' | 'fr';

export interface ByelectionCandidate {
  name: string;
  party: string;
  party_label_en: string;
  party_label_fr: string;
  color: string;
  votes: number;
  pct: number;
  is_winner: boolean;
}

export interface ByelectionResult {
  date_held: string;
  /** Optional — omit when official registered-voter count is not available. */
  turnout_pct?: number;
  candidates: ByelectionCandidate[];
  blurb_en?: string;
  blurb_fr?: string;
}

export interface CanadaByelectionConfig {
  slug: string;
  /** Path under web_data/, or null if no model data exists yet. */
  dataPath: string | null;
  currentPage: string;
  title: string;
  description: string;
  kicker: string;
  headline: string;
  dek: string;
  /** ISO date string (YYYY-MM-DD) for the ElectionCountdown Island. */
  electionDate: string;
  /** Override title shown in ElectionCountdown. Falls back to neutral generic when absent. */
  countdownTitle?: string;
  /** Hardcoded archive result. Preferred over dataPath when dataPath is null. */
  result?: ByelectionResult;
  paths: Partial<Record<ByelectionLocale, string>>;
  translated: Partial<Record<ByelectionLocale, boolean>>;
}

export const canadaByelections = {
  'scarborough-southwest': {
    slug: 'scarborough-southwest',
    dataPath: null,
    currentPage: 'canada',
    title: 'Scarborough Southwest By-Election Result — Vote-Scope',
    description:
      'Doly Begum (Liberal) won Scarborough Southwest on April 13, 2026 with 69.6% of the vote — one of three Liberal gains that secured a Commons majority. Vote-Scope called it correctly.',
    kicker: 'Federal by-election · April 13, 2026',
    headline: 'Scarborough Southwest.',
    dek:
      'Doly Begum and the Liberals took Scarborough Southwest with the highest share of the three April 13, 2026 federal by-elections. Together with Terrebonne and University—Rosedale, the result handed the Carney government an absolute majority in the House of Commons.',
    electionDate: '2026-04-13',
    result: {
      date_held: '2026-04-13',
      candidates: [
        {
          name: 'Doly Begum',
          party: 'lib',
          party_label_en: 'Liberal',
          party_label_fr: 'Libéral',
          color: '#D71920',
          votes: 20121,
          pct: 69.6,
          is_winner: true,
        },
        {
          name: 'Diana Filipova',
          party: 'con',
          party_label_en: 'Conservative',
          party_label_fr: 'Conservateur',
          color: '#1A4782',
          votes: 5433,
          pct: 18.8,
          is_winner: false,
        },
        {
          name: 'Fatima Shaban',
          party: 'ndp',
          party_label_en: 'NDP',
          party_label_fr: 'NPD',
          color: '#F58220',
          votes: 1714,
          pct: 5.9,
          is_winner: false,
        },
        {
          name: 'Pooja Malhotra',
          party: 'grn',
          party_label_en: 'Green',
          party_label_fr: 'Vert',
          color: '#3D9B35',
          votes: 711,
          pct: 2.5,
          is_winner: false,
        },
      ],
      blurb_en: 'Doly Begum cleared 69% of valid votes — the strongest Liberal performance of the three April 13, 2026 by-elections. Source: Elections Canada validated returns.',
      blurb_fr: 'Doly Begum a franchi le seuil des 69 % des votes valides — la meilleure performance libérale des trois partielles du 13 avril 2026. Source : résultats validés d\'Élections Canada.',
    },
    paths: {
      en: '/en/canada/byelections/scarborough-southwest/',
      fr: '/fr/canada/byelections/scarborough-southwest/',
    },
    translated: {
      en: true,
      fr: false,
    },
  },
  terrebonne: {
    slug: 'terrebonne',
    dataPath: null,
    currentPage: 'canada',
    title: 'Terrebonne By-Election Result — Vote-Scope',
    description:
      "Tatiana Auguste (Liberal) gained Terrebonne from the Bloc Québécois on April 13, 2026. Vote-Scope called the Liberal gain correctly before election day.",
    kicker: 'Résultat confirmé · 13 avril 2026',
    headline: 'Terrebonne.',
    dek:
      'Tatiana Auguste et les libéraux gagnent Terrebonne. Vote-Scope had projected a Liberal gain over the Bloc with 63% confidence before the April 13, 2026 federal by-election — the result confirmed the call.',
    electionDate: '2026-04-13',
    result: {
      date_held: '2026-04-13',
      turnout_pct: 51.3,
      candidates: [
        {
          name: 'Tatiana Auguste',
          party: 'lib',
          party_label_en: 'Liberal',
          party_label_fr: 'Libéral',
          color: '#D71920',
          votes: 22445,
          pct: 48.3,
          is_winner: true,
        },
        {
          name: 'Nathalie Sinclair-Desgagné',
          party: 'bq',
          party_label_en: 'Bloc Québécois',
          party_label_fr: 'Bloc québécois',
          color: '#33B2CC',
          votes: 21777,
          pct: 46.9,
          is_winner: false,
        },
        {
          name: 'Adrienne Charles',
          party: 'con',
          party_label_en: 'Conservative',
          party_label_fr: 'Conservateur',
          color: '#1A4782',
          votes: 1548,
          pct: 3.3,
          is_winner: false,
        },
        {
          name: 'Maxime Beaudoin',
          party: 'ndp',
          party_label_en: 'NDP',
          party_label_fr: 'NPD',
          color: '#F58220',
          votes: 248,
          pct: 0.5,
          is_winner: false,
        },
        {
          name: 'Benjamin Rankin',
          party: 'grn',
          party_label_en: 'Green',
          party_label_fr: 'Vert',
          color: '#3D9B35',
          votes: 194,
          pct: 0.4,
          is_winner: false,
        },
      ],
      blurb_en: 'The closest of the three April 13, 2026 by-elections. Tatiana Auguste won by 668 votes over the Bloc Québécois — a 1.4-point margin that kept the count open deep into the night before a durable Liberal lead held. Source: Elections Canada validated returns.',
      blurb_fr: 'La plus serrée des trois partielles du 13 avril 2026. Tatiana Auguste l\'emporte par 668 voix sur le Bloc québécois — une marge de 1,4 point qui a tenu le dépouillement en suspens tard dans la soirée avant qu\'une avance libérale durable ne se stabilise. Source : résultats validés d\'Élections Canada.',
    },
    paths: {
      en: '/en/canada/byelections/terrebonne/',
      fr: '/fr/canada/byelections/terrebonne/',
    },
    translated: {
      en: true,
      fr: false,
    },
  },
  'university-rosedale': {
    slug: 'university-rosedale',
    dataPath: null,
    currentPage: 'canada',
    title: 'University—Rosedale By-Election Result — Vote-Scope',
    description:
      'Danielle Martin (Liberal) won University—Rosedale on April 13, 2026 with 64.3% — one of three Liberal wins that secured the Carney government a Commons majority. Vote-Scope called it.',
    kicker: 'Federal by-election · April 13, 2026',
    headline: 'University—Rosedale.',
    dek:
      'Danielle Martin and the Liberals held University—Rosedale comfortably. With Terrebonne and Scarborough Southwest the same night, the result handed the Carney government an absolute majority in the House of Commons.',
    electionDate: '2026-04-13',
    result: {
      date_held: '2026-04-13',
      turnout_pct: 33.1,
      candidates: [
        {
          name: 'Danielle Martin',
          party: 'lib',
          party_label_en: 'Liberal',
          party_label_fr: 'Libéral',
          color: '#D71920',
          votes: 19961,
          pct: 64.3,
          is_winner: true,
        },
        {
          name: 'Serena Purdy',
          party: 'ndp',
          party_label_en: 'NDP',
          party_label_fr: 'NPD',
          color: '#F58220',
          votes: 5870,
          pct: 18.9,
          is_winner: false,
        },
        {
          name: 'Don Hodgson',
          party: 'con',
          party_label_en: 'Conservative',
          party_label_fr: 'Conservateur',
          color: '#1A4782',
          votes: 3852,
          pct: 12.4,
          is_winner: false,
        },
        {
          name: 'Andrew Massey',
          party: 'grn',
          party_label_en: 'Green',
          party_label_fr: 'Vert',
          color: '#3D9B35',
          votes: 915,
          pct: 2.9,
          is_winner: false,
        },
      ],
      blurb_en: 'University—Rosedale remained the safest of the three April 13, 2026 by-elections. Danielle Martin took 64.3% of valid votes against an NDP second place. Source: Elections Canada validated returns.',
      blurb_fr: 'University—Rosedale restait la plus sûre des trois partielles du 13 avril 2026. Danielle Martin a recueilli 64,3 % des votes valides devant le NPD. Source : résultats validés d\'Élections Canada.',
    },
    paths: {
      en: '/en/canada/byelections/university-rosedale/',
      fr: '/fr/canada/byelections/university-rosedale/',
    },
    translated: {
      en: true,
      fr: false,
    },
  },
} satisfies Record<string, CanadaByelectionConfig>;

export type CanadaByelectionKey = keyof typeof canadaByelections;

export function getByelectionAlternates(config: CanadaByelectionConfig) {
  return Object.fromEntries(
    Object.entries(config.paths).map(([locale, path]) => [
      locale,
      `https://vote-scope.com${path}`,
    ]),
  ) as { en: string; fr: string };
}
