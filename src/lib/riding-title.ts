/**
 * Nom humain d'une fiche. Un district américain s'appelle par son État et son
 * numéro ; le code (TX-24) sert à chercher, il passe en complément.
 * Partagé par l'entrée de la fiche et par les images (fiche, sondages locaux).
 */
import { usStateName } from './place-names';
import { ridingName } from './format';
import type { RidingData } from './riding-adapters/types';

type Lang = 'en' | 'fr' | 'es';
const ordinalEn = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;

export function ridingTitle(data: RidingData, lang: Lang): { title: string; code: string | null } {
  const L = <T,>(fr: T, en: T, es: T): T => (lang === 'fr' ? fr : lang === 'es' ? es : en);
  const rawName = ridingName(lang === 'fr' ? data.name.fr : data.name.en);
  const usCode = data.jurisdiction === 'us-house' ? /^([A-Z]{2})-(AL|\d+)$/.exec(rawName) : null;
  if (!usCode) return { title: rawName, code: null };
  const state = usStateName(usCode[1], lang) ?? usCode[1];
  const n = usCode[2] === 'AL' ? 0 : Number(usCode[2]);
  const title = n === 0
    ? L(`${state} — district unique`, `${state} — at-large district`, `${state} — distrito único`)
    : L(`${state}, ${n}${n === 1 ? 'er' : 'e'} district`, `${state}’s ${ordinalEn(n)} District`, `${state}, distrito ${n}`);
  return { title, code: rawName };
}
