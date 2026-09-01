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
  'beaches-east-york': {
    slug: 'beaches-east-york',
    dataPath: null,
    currentPage: 'canada',
    title: 'Beaches—East York By-Election Result — Vote-Scope',
    description:
      'Tanveer Shahnawaz held Beaches—East York for the Liberals on August 31, 2026. Vote-Scope called the Liberal hold on election night, but under-read the New Democratic vote by sixteen points.',
    kicker: 'Résultat confirmé · 31 août 2026',
    headline: 'Beaches—East York.',
    dek:
      "Tanveer Shahnawaz garde Beaches—East York pour les libéraux. Vote-Scope a appelé la victoire libérale le soir même, à 4 % des bureaux dépouillés — mais projetait le NPD à 9,6 % là où il a obtenu 25,8 %.",
    electionDate: '2026-08-31',
    result: {
      date_held: '2026-08-31',
      turnout_pct: 40.4,
      candidates: [
        {
          name: 'Tanveer Shahnawaz',
          party: 'lib',
          party_label_en: 'Liberal',
          party_label_fr: 'Libéral',
          color: '#D71920',
          votes: 18361,
          pct: 55.7,
          is_winner: true,
        },
        {
          name: 'Shannon Devine',
          party: 'ndp',
          party_label_en: 'NDP',
          party_label_fr: 'NPD',
          color: '#F58220',
          votes: 8512,
          pct: 25.8,
          is_winner: false,
        },
        {
          name: 'Jim Syrbos',
          party: 'con',
          party_label_en: 'Conservative',
          party_label_fr: 'Conservateur',
          color: '#1A4782',
          votes: 5116,
          pct: 15.5,
          is_winner: false,
        },
        {
          name: 'Bruce Livesey',
          party: 'grn',
          party_label_en: 'Green',
          party_label_fr: 'Vert',
          color: '#3D9B35',
          votes: 573,
          pct: 1.7,
          is_winner: false,
        },
        {
          name: 'Michel Lachance',
          party: 'ppc',
          party_label_en: "People's Party",
          party_label_fr: 'Parti populaire',
          color: '#442D7B',
          votes: 248,
          pct: 0.8,
          is_winner: false,
        },
        {
          name: 'Cameron Thomas',
          party: 'oth',
          party_label_en: 'Other',
          party_label_fr: 'Autre',
          color: '#78909C',
          votes: 163,
          pct: 0.5,
          is_winner: false,
        },
      ],
      blurb_en: "A comfortable Liberal hold on 40.4% turnout — and the projection's worst miss of the three. Vote-Scope had the Liberals at 68% and the New Democrats at 9.6%; the count returned 55.7% and 25.8%. The winner was never in doubt, the shape of the race was. Source: Elections Canada preliminary returns, 200 of 200 polls.",
      blurb_fr: "Une victoire libérale confortable sur une participation de 40,4 % — et la projection la plus fautive des trois. Vote-Scope donnait les libéraux à 68 % et le NPD à 9,6 % ; le dépouillement a rendu 55,7 % et 25,8 %. Le vainqueur n'a jamais fait de doute, la forme de la course oui. Source : résultats préliminaires d'Élections Canada, 200 bureaux sur 200.",
    },
    paths: {
      en: '/en/canada/byelections/beaches-east-york/',
      fr: '/fr/canada/byelections/beaches-east-york/',
    },
    translated: {
      en: true,
      fr: false,
    },
  },
  'chicoutimi-le-fjord': {
    slug: 'chicoutimi-le-fjord',
    dataPath: null,
    currentPage: 'canada',
    title: 'Chicoutimi—Le Fjord By-Election Result — Vote-Scope',
    description:
      'Daniel Gobeil gained Chicoutimi—Le Fjord for the Liberals from the Conservatives on August 31, 2026. Vote-Scope had the Liberal favoured at 79.8% when others called the race a toss-up.',
    kicker: 'Résultat confirmé · 31 août 2026',
    headline: 'Chicoutimi—Le Fjord.',
    dek:
      "Daniel Gobeil arrache Chicoutimi—Le Fjord aux conservateurs. Vote-Scope donnait le libéral favori à 79,8 % et au-dessus de 40 % — le résultat a confirmé le sens, mais l'ampleur nous a échappé.",
    electionDate: '2026-08-31',
    result: {
      date_held: '2026-08-31',
      turnout_pct: 42.2,
      candidates: [
        {
          name: 'Daniel Gobeil',
          party: 'lib',
          party_label_en: 'Liberal',
          party_label_fr: 'Libéral',
          color: '#D71920',
          votes: 16235,
          pct: 51.3,
          is_winner: true,
        },
        {
          name: 'Caroline Dubé',
          party: 'bq',
          party_label_en: 'Bloc Québécois',
          party_label_fr: 'Bloc québécois',
          color: '#33B2CC',
          votes: 10401,
          pct: 32.9,
          is_winner: false,
        },
        {
          name: 'Régis Gaudreault',
          party: 'con',
          party_label_en: 'Conservative',
          party_label_fr: 'Conservateur',
          color: '#1A4782',
          votes: 3962,
          pct: 12.5,
          is_winner: false,
        },
        {
          name: 'Raphaël Émond',
          party: 'ndp',
          party_label_en: 'NDP',
          party_label_fr: 'NPD',
          color: '#F58220',
          votes: 619,
          pct: 2.0,
          is_winner: false,
        },
        {
          name: 'Nathe Perrone',
          party: 'grn',
          party_label_en: 'Green',
          party_label_fr: 'Vert',
          color: '#3D9B35',
          votes: 221,
          pct: 0.7,
          is_winner: false,
        },
        {
          name: 'François Sabourin',
          party: 'ppc',
          party_label_en: "People's Party",
          party_label_fr: 'Parti populaire',
          color: '#442D7B',
          votes: 189,
          pct: 0.6,
          is_winner: false,
        },
      ],
      blurb_en: "The only genuine contest of the three, and a Liberal gain from the Conservatives. Vote-Scope projected the Liberal ahead of the Bloc 41.3 to 37.3 with a 79.8% win probability; the count gave 51.3 to 32.9. Against the other public models, this was the clearest call and the closest: Canada Projections published 49.8% against 48.6% — a literal coin flip — 338Canada had 35 ±7 against 34 ±7, and Evan Scrimshaw 36.7 against 34.8. Vote-Scope was the only one above 40% for the Liberal, and the closest on every party: 10.1 points of error on the Liberal share against 14.6 to 16.3 for the others, and 2.7 on the Conservative against 8.7 to 13.5. That Conservative collapse was anticipated — 15.1% projected against 12.5% counted — but its vote went almost entirely to the Liberals rather than splitting, which is where the projection erred. Source: Elections Canada preliminary returns, 212 of 212 polls.",
      blurb_fr: "La seule vraie course des trois, et un gain libéral sur les conservateurs. Vote-Scope projetait le libéral devant le Bloc 41,3 contre 37,3, avec 79,8 % de probabilité de victoire ; le dépouillement a donné 51,3 contre 32,9. Face aux autres modèles publics, c'était l'appel le plus tranché et le plus juste : Canada Projections publiait 49,8 % contre 48,6 % — un pile ou face littéral —, 338Canada donnait 35 ±7 contre 34 ±7, et Evan Scrimshaw 36,7 contre 34,8. Vote-Scope était le seul au-dessus de 40 % pour le libéral, et le plus près sur chaque parti : 10,1 points d'erreur sur la part libérale contre 14,6 à 16,3 pour les autres, et 2,7 sur la part conservatrice contre 8,7 à 13,5. Cet effondrement conservateur était prévu — 15,1 % projeté contre 12,5 % compté — mais son vote est allé presque entièrement aux libéraux au lieu de se partager, et c'est là que la projection a fauté. Source : résultats préliminaires d'Élections Canada, 212 bureaux sur 212.",
    },
    paths: {
      en: '/en/canada/byelections/chicoutimi-le-fjord/',
      fr: '/fr/canada/byelections/chicoutimi-le-fjord/',
    },
    translated: {
      en: true,
      fr: false,
    },
  },
  'north-vancouver-capilano': {
    slug: 'north-vancouver-capilano',
    dataPath: null,
    currentPage: 'canada',
    title: 'North Vancouver—Capilano By-Election Result — Vote-Scope',
    description:
      'Braeden Caley held North Vancouver—Capilano for the Liberals on August 31, 2026. Vote-Scope came within 2.6 points on the Liberal share and 0.3 on the Conservative.',
    kicker: 'Résultat confirmé · 31 août 2026',
    headline: 'North Vancouver—Capilano.',
    dek:
      'Braeden Caley garde North Vancouver—Capilano pour les libéraux. La projection la plus juste des trois : 61,2 % projeté contre 58,6 % obtenu chez les libéraux, 29,5 contre 29,2 chez les conservateurs.',
    electionDate: '2026-08-31',
    result: {
      date_held: '2026-08-31',
      turnout_pct: 45.6,
      candidates: [
        {
          name: 'Braeden Caley',
          party: 'lib',
          party_label_en: 'Liberal',
          party_label_fr: 'Libéral',
          color: '#D71920',
          votes: 23805,
          pct: 58.6,
          is_winner: true,
        },
        {
          name: 'Stephen Curran',
          party: 'con',
          party_label_en: 'Conservative',
          party_label_fr: 'Conservateur',
          color: '#1A4782',
          votes: 11852,
          pct: 29.2,
          is_winner: false,
        },
        {
          name: 'Shelley Luce',
          party: 'grn',
          party_label_en: 'Green',
          party_label_fr: 'Vert',
          color: '#3D9B35',
          votes: 3534,
          pct: 8.7,
          is_winner: false,
        },
        {
          name: 'Stephen Tweedale',
          party: 'ndp',
          party_label_en: 'NDP',
          party_label_fr: 'NPD',
          color: '#F58220',
          votes: 1272,
          pct: 3.1,
          is_winner: false,
        },
        {
          name: 'Ehsan Arjmand',
          party: 'ppc',
          party_label_en: "People's Party",
          party_label_fr: 'Parti populaire',
          color: '#442D7B',
          votes: 135,
          pct: 0.3,
          is_winner: false,
        },
        {
          name: 'Jeff Monds',
          party: 'oth',
          party_label_en: 'Other',
          party_label_fr: 'Autre',
          color: '#78909C',
          votes: 56,
          pct: 0.1,
          is_winner: false,
        },
      ],
      blurb_en: 'The highest turnout of the three at 45.6%, and the closest projection: 2.0 points of average error across the parties. The Green vote was the exception, running 4.9 points above forecast. Source: Elections Canada preliminary returns, 204 of 204 polls.',
      blurb_fr: "La plus forte participation des trois à 45,6 %, et la projection la plus serrée : 2,0 points d'erreur moyenne sur l'ensemble des partis. Le vote vert fait exception, 4,9 points au-dessus de la prévision. Source : résultats préliminaires d'Élections Canada, 204 bureaux sur 204.",
    },
    paths: {
      en: '/en/canada/byelections/north-vancouver-capilano/',
      fr: '/fr/canada/byelections/north-vancouver-capilano/',
    },
    translated: {
      en: true,
      fr: false,
    },
  },
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
