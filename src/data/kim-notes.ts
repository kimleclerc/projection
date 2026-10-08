/**
 * « Le mot de Kim » : une note courte, datée et signée, en tête des grandes pages.
 * C'est la voix de Kim Leclerc — jamais un texte généré publié tel quel.
 * Une note ne s'affiche que si `published` est vrai ET qu'elle existe dans la langue
 * de la page. Les brouillons (published: false) ne sont visibles que sur /essai-signature.
 */
export interface KimNote {
  date: string; // AAAA-MM-JJ
  published: boolean;
  text: Partial<Record<'fr' | 'en' | 'es', string>>;
}

export const KIM_NOTES: Record<string, KimNote> = {
  'us-senate': {
    date: '2026-10-08',
    published: false,
    text: {
      fr: 'Les démocrates partent favoris, mais trois courses se jouent encore à moins de cinq points : le Maine, l’Iowa et le Kansas. J’ai vu assez de soirées électorales pour savoir qu’une avance de deux points peut fondre en une fin de semaine. Si je ne devais regarder qu’un État le 3 novembre, ce serait le Maine.',
    },
  },
  'british-columbia': {
    date: '2026-10-08',
    published: false,
    text: {
      fr: 'À seize jours du vote, les conservateurs sont en position de majorité dans presque toutes nos simulations. La vraie question n’est plus qui gagne, mais l’ampleur : le NPD peut-il sauver ses châteaux forts de la région de Vancouver? C’est là que se joue la forme de la prochaine législature.',
    },
  },
};

export function kimNote(key: string, lang: 'fr' | 'en' | 'es', includeDrafts = false) {
  const n = KIM_NOTES[key];
  if (!n || (!n.published && !includeDrafts)) return null;
  const text = n.text[lang];
  return text ? { date: n.date, text } : null;
}
