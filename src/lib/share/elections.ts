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
  /** Simulateur (« fais ta carte ») : un scénario partagé rouvre cette page. */
  simulator?: L;
}

export const SHARE_ELECTIONS: Record<string, ShareElection> = {
  'us-house': {
    name: { fr: 'Chambre des États-Unis', en: 'U.S. House', es: 'Cámara de EE. UU.' },
    question: { fr: 'Qui contrôlera la Chambre ?', en: 'Who will control the House?', es: '¿Quién controlará la Cámara?' },
    when: { fr: '3 novembre 2026', en: 'November 3, 2026', es: '3 de noviembre de 2026' },
    page: { fr: '/fr/us/chambre/', en: '/en/us/house/', es: '/es/us/house/' },
    unit: 'district', fullChamber: true, baselineYear: 2024, date: '2026-11-03',
    simulator: { fr: '/fr/outils/simulateur-chambre-us/', en: '/en/tools/us-house-simulator/', es: '/es/herramientas/simulador-camara-us/' },
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
    simulator: { fr: '/fr/outils/simulateur-canada/', en: '/en/tools/canada-simulator/', es: '/es/herramientas/simulador-canada/' },
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
    simulator: { fr: '/fr/outils/simulateur-ontario/', en: '/en/tools/ontario-simulator/', es: '/es/herramientas/simulador-ontario/' },
  },
  quebec: {
    name: { fr: 'Québec', en: 'Quebec', es: 'Quebec' },
    question: { fr: 'Qui gouvernera le Québec ?', en: 'Who will govern Quebec?', es: '¿Quién gobernará Quebec?' },
    when: { fr: '5 octobre 2026', en: 'October 5, 2026', es: '5 de octubre de 2026' },
    page: { fr: '/fr/canada/quebec/', en: '/en/canada/quebec/', es: '/es/canada/quebec/' },
    unit: 'riding', fullChamber: true, baselineYear: 2022, date: '2026-10-05',
    simulator: { fr: '/fr/outils/simulateur-quebec/', en: '/en/tools/quebec-simulator/', es: '/es/herramientas/simulador-quebec/' },
  },
};

/** Ce qu'on partage, et l'ancre de la page où cela se trouve. */
export const SHARE_KINDS = {
  map: { anchor: 'map', label: { fr: 'la carte', en: 'the map', es: 'el mapa' } },
  projection: { anchor: 'forecast', label: { fr: 'la projection', en: 'the forecast', es: 'la proyección' } },
  chart: { anchor: 'analysis', label: { fr: 'les sondages', en: 'the polls', es: 'las encuestas' } },
  scenario: { anchor: '', label: { fr: 'mon scénario', en: 'my scenario', es: 'mi escenario' } },
} as const;
export type ShareKind = keyof typeof SHARE_KINDS;

/** Cycle d'un simulateur (meta.election_cycle) → clé de partage. */
export function electionOfCycle(cycle: string): string | null {
  if (cycle.startsWith('us_house')) return 'us-house';
  if (cycle.startsWith('fed')) return 'federal';
  if (cycle.startsWith('qc')) return 'quebec';
  if (cycle.startsWith('on')) return 'ontario';
  if (cycle.startsWith('bc')) return 'british-columbia';
  return null;
}
/** Un état de scénario (?sim=) n'est fait que de codes, de chiffres et de séparateurs. */
export const SIM_RE = /^[a-z0-9_.:,|\-]{1,400}$/;

/**
 * Images à la volée (functions/og/live) ou fabriquées au build (/og/share/…).
 * Le forfait gratuit de Cloudflare (10 ms de calcul par requête) ne suffit pas à
 * dessiner une carte : on sert donc les images fixes du build, et le scénario
 * d'un lecteur est dessiné dans son navigateur. Passer à true avec le forfait
 * payant de Workers : tout repasse à la volée, sans autre changement.
 */
export const LIVE_IMAGES = false;

export type ShareFormat = 'wide' | 'square' | 'story';
/** Adresse de l'image d'un module (chemin relatif au site). */
export function shareImage(kind: ShareKind, key: string, lang: Lang, fmt: ShareFormat = 'wide', opts: { v?: string; sim?: string } = {}): string {
  if (LIVE_IMAGES) {
    const q = new URLSearchParams();
    if (opts.sim) q.set('sim', opts.sim); else if (opts.v) q.set('v', opts.v);
    if (fmt !== 'wide') q.set('f', fmt);
    return `/og/live/${kind}/${key}/${lang}.png?${q.toString()}`;
  }
  // Sans le calcul à la volée, l'aperçu d'un scénario montre la carte du scrutin.
  const k = kind === 'scenario' ? 'map' : kind;
  const suffix = fmt === 'square' ? '-carre' : fmt === 'story' ? '-story' : '';
  return `/og/share/${k}/${key}/${lang}${suffix}.png${opts.v ? `?v=${opts.v}` : ''}`;
}
