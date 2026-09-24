// Primaire sociale-démocrate 2026 (PS, Place publique, GRS) — faits éditoriaux.
//
// Les CHIFFRES de la page viennent du moteur (polls.json, candidacy_effects.json,
// latest.json) et se mettent à jour chaque nuit. Ici, seulement ce qui ne se
// calcule pas : calendrier, règles, candidats, débats — et les résultats, à
// saisir le soir du 10 octobre (1er tour) et du 17 octobre (2d tour).
//
// Sources vérifiées le 2026-09-24 : France 24 (16 sept. 2026), LCP, Wikipédia
// (Primaire présidentielle socialiste française de 2026).

export type Loc = 'fr' | 'en' | 'es';
type T = Record<Loc, string>;

export interface PrimaryCandidate {
  id: string;            // candidate_id du registre France (moteur)
  role: T;
}

export interface PrimaryResult {
  id: string;
  share: number;         // % des suffrages exprimés
}

export const PS_PRIMARY = {
  firstRound: { start: '2026-10-09', end: '2026-10-10' },
  secondRound: { start: '2026-10-16', end: '2026-10-17' },
  parties: { fr: 'PS, Place publique et Gauche républicaine et socialiste', en: 'PS, Place publique and the Republican and Socialist Left', es: 'PS, Place publique y la Izquierda Republicana y Socialista' } as T,
  candidates: [
    { id: 'left_glucksmann', role: { fr: 'Député européen, Place publique', en: 'MEP, Place publique', es: 'Eurodiputado, Place publique' } },
    { id: 'left_faure', role: { fr: 'Premier secrétaire du Parti socialiste', en: 'First secretary of the Socialist Party', es: 'Primer secretario del Partido Socialista' } },
    { id: 'left_royal', role: { fr: 'Candidate socialiste à la présidentielle de 2007', en: 'Socialist presidential candidate in 2007', es: 'Candidata socialista a la presidencial de 2007' } },
    { id: 'left_guedj', role: { fr: 'Député socialiste', en: 'Socialist member of parliament', es: 'Diputado socialista' } },
    { id: 'left_maurel', role: { fr: 'Président de la Gauche républicaine et socialiste', en: 'President of the Republican and Socialist Left', es: 'Presidente de la Izquierda Republicana y Socialista' } },
  ] as PrimaryCandidate[],
  howToVote: {
    fr: [
      'Vote en ligne, avec environ 1 000 points de vote physiques (tablette dans un isoloir).',
      'Ouvert aux adhérents à jour du PS, de Place publique et de la GRS, et aux non-adhérents qui versent 15 € (10 € pour les étudiants et les non-imposables).',
      'Inscription au plus tard trois jours avant le scrutin.',
      'Les organisateurs attendent environ 50 000 votants, 100 000 au mieux. En 2017, près de 2 millions avaient voté à la primaire socialiste.',
    ],
    en: [
      'Online vote, with about 1,000 physical voting points (a tablet in a booth).',
      'Open to paid-up members of the PS, Place publique and the GRS, and to non-members who pay €15 (€10 for students and non-taxpayers).',
      'Registration at least three days before the vote.',
      'Organizers expect about 50,000 voters, 100,000 at best. In 2017, nearly 2 million voted in the Socialist primary.',
    ],
    es: [
      'Voto en línea, con unos 1.000 puntos de votación físicos (tableta en una cabina).',
      'Abierto a los afiliados al día del PS, Place publique y la GRS, y a los no afiliados que paguen 15 € (10 € para estudiantes y no contribuyentes).',
      'Inscripción como mínimo tres días antes de la votación.',
      'Los organizadores esperan unos 50.000 votantes, 100.000 como mucho. En 2017, casi 2 millones votaron en las primarias socialistas.',
    ],
  } as Record<Loc, string[]>,
  debates: [
    { date: '2026-09-23', where: 'LCI' },
    { date: '2026-10-01', where: 'France 2 · France Inter' },
    { date: null, where: 'BFMTV', note: { fr: 'dans les jours précédant le premier tour', en: 'in the days before the first round', es: 'en los días previos a la primera vuelta' } as T },
  ] as Array<{ date: string | null; where: string; note?: T }>,
  outOfRace: {
    fr: 'Philippe Brun, dont la candidature avait été validée, a été suspendu du PS le 16 septembre et ne participe pas. François Ruffin et Matthieu Pigasse n’ont pas obtenu l’accord nécessaire pour y entrer.',
    en: 'Philippe Brun, whose candidacy had been validated, was suspended from the PS on September 16 and is not taking part. François Ruffin and Matthieu Pigasse did not get the agreement needed to enter.',
    es: 'Philippe Brun, cuya candidatura había sido validada, fue suspendido del PS el 16 de septiembre y no participa. François Ruffin y Matthieu Pigasse no obtuvieron el acuerdo necesario para entrar.',
  } as T,
  // À saisir le soir des résultats (parts des suffrages exprimés).
  results: {
    firstRound: null as PrimaryResult[] | null,
    secondRound: null as PrimaryResult[] | null,
  },
};
