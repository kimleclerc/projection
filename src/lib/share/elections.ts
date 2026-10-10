/**
 * Scrutins partageables : titres, questions, pages et ancres, en trois langues.
 * Lu par la fonction d'images (functions/og/live) et par la page de partage
 * (functions/s) — pas de dépendance Node, pas d'adaptateur.
 */
export type Lang = 'fr' | 'en' | 'es';
type L = Record<Lang, string>;

export interface ShareElection {
  name: L;              // « Chambre des États-Unis »
  question: L;          // « Qui contrôlera la Chambre ? »
  when: L;              // « 3 novembre 2026 »
  page: L;              // chemin de la page
  unit: 'state' | 'district' | 'riding';
  /** La carte couvre-t-elle toute la chambre (barre des sièges) ? */
  fullChamber: boolean;
  /** Scrutin de référence des « changements de camp » (jurisdictions.ts). */
  baselineYear: number;
  /** Jour du vote (ISO), quand il est fixé : passé ce jour, l'image dit « veille du vote ». */
  date?: string;
}

export const SHARE_ELECTIONS: Record<string, ShareElection> = {
  'us-house': {
    name: { fr: 'Chambre des États-Unis', en: 'U.S. House', es: 'Cámara de EE. UU.' },
    question: { fr: 'Qui contrôlera la Chambre ?', en: 'Who will control the House?', es: '¿Quién controlará la Cámara?' },
    when: { fr: '3 novembre 2026', en: 'November 3, 2026', es: '3 de noviembre de 2026' },
    page: { fr: '/fr/us/chambre/', en: '/en/us/house/', es: '/es/us/house/' },
    unit: 'district', fullChamber: true, baselineYear: 2024, date: '2026-11-03',
  },
  'us-senate': {
    name: { fr: 'Sénat des États-Unis', en: 'U.S. Senate', es: 'Senado de EE. UU.' },
    question: { fr: 'Qui contrôlera le Sénat ?', en: 'Who will control the Senate?', es: '¿Quién controlará el Senado?' },
    when: { fr: '3 novembre 2026', en: 'November 3, 2026', es: '3 de noviembre de 2026' },
    page: { fr: '/fr/us/senat/', en: '/en/us/senate/', es: '/es/us/senate/' },
    unit: 'state', fullChamber: false, baselineYear: 2024, date: '2026-11-03',
  },
  'us-governor': {
    name: { fr: 'Gouverneurs des États-Unis', en: 'U.S. governors', es: 'Gobernadores de EE. UU.' },
    question: { fr: 'Qui gagnera les postes de gouverneur ?', en: 'Who will win the governor races?', es: '¿Quién ganará las gobernaciones?' },
    when: { fr: '3 novembre 2026', en: 'November 3, 2026', es: '3 de noviembre de 2026' },
    page: { fr: '/fr/us/gouverneurs/', en: '/en/us/governors/', es: '/es/us/gobernadores/' },
    unit: 'state', fullChamber: false, baselineYear: 2022, date: '2026-11-03',
  },
  federal: {
    name: { fr: 'Élection fédérale canadienne', en: 'Canadian federal election', es: 'Elección federal canadiense' },
    question: { fr: 'Qui gouvernerait le Canada ?', en: 'Who would govern Canada?', es: '¿Quién gobernaría Canadá?' },
    when: { fr: 'prochaine élection', en: 'next election', es: 'próxima elección' },
    page: { fr: '/fr/canada/federal/', en: '/en/canada/federal/', es: '/es/canada/federal/' },
    unit: 'riding', fullChamber: true, baselineYear: 2025,
  },
  'british-columbia': {
    name: { fr: 'Colombie-Britannique', en: 'British Columbia', es: 'Columbia Británica' },
    question: { fr: 'Qui gagnera en Colombie-Britannique ?', en: 'Who will win British Columbia?', es: '¿Quién ganará en Columbia Británica?' },
    when: { fr: '24 octobre 2026', en: 'October 24, 2026', es: '24 de octubre de 2026' },
    page: { fr: '/fr/canada/colombie-britannique/', en: '/en/canada/british-columbia/', es: '/es/canada/columbia-britanica/' },
    unit: 'riding', fullChamber: true, baselineYear: 2024, date: '2026-10-24',
  },
  ontario: {
    name: { fr: 'Ontario', en: 'Ontario', es: 'Ontario' },
    question: { fr: 'Qui gouvernerait l’Ontario ?', en: 'Who would govern Ontario?', es: '¿Quién gobernaría Ontario?' },
    when: { fr: 'prochaine élection', en: 'next election', es: 'próxima elección' },
    page: { fr: '/fr/canada/ontario/', en: '/en/canada/ontario/', es: '/es/canada/ontario/' },
    unit: 'riding', fullChamber: true, baselineYear: 2022,
  },
  quebec: {
    name: { fr: 'Québec', en: 'Quebec', es: 'Quebec' },
    question: { fr: 'Qui gouvernera le Québec ?', en: 'Who will govern Quebec?', es: '¿Quién gobernará Quebec?' },
    when: { fr: '5 octobre 2026', en: 'October 5, 2026', es: '5 de octubre de 2026' },
    page: { fr: '/fr/canada/quebec/', en: '/en/canada/quebec/', es: '/es/canada/quebec/' },
    unit: 'riding', fullChamber: true, baselineYear: 2022, date: '2026-10-05',
  },
};

/** Ce qu'on partage, et l'ancre de la page où cela se trouve. */
export const SHARE_KINDS = {
  map: { anchor: 'map', label: { fr: 'la carte', en: 'the map', es: 'el mapa' } },
  projection: { anchor: 'forecast', label: { fr: 'la projection', en: 'the forecast', es: 'la proyección' } },
  chart: { anchor: 'analysis', label: { fr: 'les sondages', en: 'the polls', es: 'las encuestas' } },
} as const;
export type ShareKind = keyof typeof SHARE_KINDS;
