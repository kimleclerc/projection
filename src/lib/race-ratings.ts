// Cotes de course (sûr → incertain) : palette et ordre partagés par la page
// projection et le comparateur de prévisions — une seule source de vérité.
// ---------------------------------------------------------------------------
// Barre de sièges graduée par cote (Solid / Likely / Lean / Toss-up).
//
// La barre de composition ne dit que « combien de sièges par parti ». Elle ne
// dit pas SI ces sièges tiennent. Deux chambres au même score n'ont pas la même
// fragilité : au 2026-09-19 le Sénat porte 4 toss-up sur 35 courses quand la
// Chambre en porte 40 sur 435. La cote existe déjà par siège dans
// `projection.rating` — elle n'était affichée que sur les pages de course.
//
// Encodage divergent : une seule rampe de luminosité, bleu foncé → bleu clair →
// gris neutre → rouge clair → rouge foncé. L'intensité EST la solidité, donc la
// barre se lit d'un coup d'œil, et même en niveaux de gris.
//
// ⚠ La paire « Lean R ↔ Toss-up » tombe à ΔE 7,0 en protanopie (validateur
// dataviz). C'est admissible UNIQUEMENT avec un encodage secondaire, d'où les
// trois présents ensemble : écart de 2 px entre segments, effectif écrit dans
// chaque segment, et hachure à 45° sur le toss-up. Ne pas retirer la hachure en
// croyant nettoyer le style : elle porte l'information pour un lecteur sur douze.
export const RATING_ORDER = ['solid_dem', 'likely_dem', 'lean_dem', 'tossup', 'lean_rep', 'likely_rep', 'solid_rep'] as const;
export const RATING_STYLE: Record<string, { light: string; dark: string; en: string; fr: string; es: string }> = {
  solid_dem:  { light: '#17558F', dark: '#3D7CB4', en: 'Solid D',  fr: 'Sûr D',      es: 'Seguro D' },
  likely_dem: { light: '#2E86D3', dark: '#4A9BE0', en: 'Likely D', fr: 'Probable D', es: 'Probable D' },
  lean_dem:   { light: '#7FB5E4', dark: '#74B0E0', en: 'Lean D',   fr: 'Penche D',   es: 'Inclina D' },
  tossup:     { light: '#8C8C8C', dark: '#8A8A8A', en: 'Toss-up',  fr: 'Incertain',  es: 'Incierto' },
  lean_rep:   { light: '#F08A72', dark: '#E8907A', en: 'Lean R',   fr: 'Penche R',   es: 'Inclina R' },
  likely_rep: { light: '#D2222D', dark: '#E14A4A', en: 'Likely R', fr: 'Probable R', es: 'Probable R' },
  solid_rep:  { light: '#93202A', dark: '#BE3A42', en: 'Solid R',  fr: 'Sûr R',      es: 'Solide R' },
};
