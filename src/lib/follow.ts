/**
 * « Mes courses » : les courses suivies par le lecteur, enregistrées dans SON
 * navigateur (localStorage). Rien n'est envoyé au site ; pas de compte, pas de
 * synchronisation entre appareils. Ce module est importable côté client : pas
 * d'adaptateur ni de JSON lourd ici.
 */
export type Lang = 'fr' | 'en' | 'es';

/** Scrutins qu'on peut suivre : clé = `jurisdiction` des adaptateurs. */
export const FOLLOW_ELECTIONS: Record<string, { label: Record<Lang, string>; route: Record<Lang, string> }> = {
  'federal-ca': {
    label: { fr: 'Canada, élection fédérale', en: 'Canada, federal election', es: 'Canadá, elección federal' },
    route: { fr: '/fr/canada/federal/circonscriptions/', en: '/en/canada/federal/ridings/', es: '/es/canada/federal/distritos/' },
  },
  quebec: {
    label: { fr: 'Québec, élection générale', en: 'Quebec, general election', es: 'Quebec, elección general' },
    route: { fr: '/fr/canada/quebec/circonscriptions/', en: '/en/canada/quebec/ridings/', es: '/es/canada/quebec/distritos/' },
  },
  ontario: {
    label: { fr: 'Ontario, élection générale', en: 'Ontario, general election', es: 'Ontario, elección general' },
    route: { fr: '/fr/canada/ontario/circonscriptions/', en: '/en/canada/ontario/ridings/', es: '/es/canada/ontario/distritos/' },
  },
  'british-columbia': {
    label: { fr: 'Colombie-Britannique, 24 octobre', en: 'British Columbia, October 24', es: 'Columbia Británica, 24 de octubre' },
    route: { fr: '/fr/canada/colombie-britannique/circonscriptions/', en: '/en/canada/british-columbia/ridings/', es: '/es/canada/columbia-britanica/distritos/' },
  },
  uk: {
    label: { fr: 'Royaume-Uni, élections générales', en: 'United Kingdom, general election', es: 'Reino Unido, elecciones generales' },
    route: { fr: '/fr/uk/circonscriptions/', en: '/en/uk/constituencies/', es: '/es/uk/circunscripciones/' },
  },
  'us-house': {
    label: { fr: 'États-Unis, Chambre (3 novembre)', en: 'United States, House (November 3)', es: 'Estados Unidos, Cámara (3 de noviembre)' },
    route: { fr: '/fr/us/chambre/districts/', en: '/en/us/house/districts/', es: '/es/us/house/distritos/' },
  },
  'us-senate': {
    label: { fr: 'États-Unis, Sénat (3 novembre)', en: 'United States, Senate (November 3)', es: 'Estados Unidos, Senado (3 de noviembre)' },
    route: { fr: '/fr/us/senat/sieges/', en: '/en/us/senate/seats/', es: '/es/us/senate/escanos/' },
  },
  'us-governor': {
    label: { fr: 'États-Unis, gouverneurs (3 novembre)', en: 'United States, governors (November 3)', es: 'Estados Unidos, gobernadores (3 de noviembre)' },
    route: { fr: '/fr/us/gouverneurs/courses/', en: '/en/us/governors/races/', es: '/es/us/gobernadores/carreras/' },
  },
};

export const MY_RACES_URL: Record<Lang, string> = { fr: '/fr/mes-courses/', en: '/en/my-races/', es: '/es/mis-contiendas/' };

/** Ce que le lecteur a vu d'une course : parti en tête, probabilité, date du calcul. */
export interface Snap { w: string; p: number; d: string; final?: boolean }

export interface Follow {
  j: string;
  id: string;
  slug: string;
  name: Record<Lang, string>;
  at: string;          // date du suivi (AAAA-MM-JJ)
  seen: Snap;          // dernière version vue sur « Mes courses »
  prev?: Snap | null;  // version précédente, pour « depuis votre dernière visite »
}

const KEY = 'vs:follows:v1';

export function readFollows(): Follow[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function writeFollows(list: Follow[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const followKey = (j: string, id: string) => `${j}:${id}`;
