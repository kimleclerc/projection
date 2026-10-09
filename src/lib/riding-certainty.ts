/**
 * Un seul niveau de certitude par circonscription, partagé par la question,
 * le panneau de projection et le texte de lecture (docs/DESIGN.md § 7, fiche de
 * circonscription). Il se lit sur la probabilité affichée au lecteur, pas sur un
 * autre indicateur : « siège sûr » ne peut pas côtoyer « 70 % ».
 */
export type Certainty = 'tossup' | 'competitive' | 'safe';

export function certainty(p: { p_winner: number }): Certainty {
  if (p.p_winner < 0.6) return 'tossup';
  if (p.p_winner < 0.85) return 'competitive';
  return 'safe';
}

export const CERTAINTY_LABEL: Record<'en' | 'fr' | 'es', Record<Certainty, string>> = {
  en: { tossup: 'Toss-up', competitive: 'Competitive', safe: 'Safe seat' },
  fr: { tossup: 'Course serrée', competitive: 'Compétitif', safe: 'Siège sûr' },
  es: { tossup: 'Carrera reñida', competitive: 'Competitivo', safe: 'Escaño seguro' },
};
