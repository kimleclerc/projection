/**
 * Libellés de sources et de fiabilité venus des données (en anglais) : traduits pour
 * les pages FR/ES. Le nom de l'institution reste dans sa langue ; la description
 * après le tiret est traduite.
 */
type Lang = 'en' | 'fr' | 'es';
type L = { fr: string; es: string };

const WHOLE: Record<string, L> = {
  'Vote-Scope model': { fr: 'Modèle Vote-Scope', es: 'Modelo Vote-Scope' },
  'U.S. Census CVAP 2020-2024 ACS': { fr: 'Bureau du recensement des États-Unis, CVAP 2020-2024 (ACS)', es: 'Oficina del Censo de EE. UU., CVAP 2020-2024 (ACS)' },
  'U.S. Census CPS Voting Supplement 2024': { fr: 'Bureau du recensement des États-Unis, supplément électoral CPS 2024', es: 'Oficina del Censo de EE. UU., suplemento electoral CPS 2024' },
};
const DESC: Record<string, L> = {
  'certified 2026 primary results': { fr: 'résultats certifiés des primaires 2026', es: 'resultados certificados de las primarias 2026' },
  'official election results portal': { fr: 'portail officiel des résultats', es: 'portal oficial de resultados' },
  'unofficial, pending state certification': { fr: 'non officiel, en attente de la certification de l’État', es: 'no oficial, pendiente de la certificación estatal' },
  'Hispanic-American members of the 119th Congress': { fr: 'membres hispano-américains du 119ᵉ Congrès', es: 'miembros hispanoamericanos del 119.º Congreso' },
  'unofficial election night results': { fr: 'résultats non officiels du soir de l’élection', es: 'resultados no oficiales de la noche electoral' },
  'official 2026 primary vote totals': { fr: 'totaux officiels des primaires 2026', es: 'totales oficiales de las primarias 2026' },
  'official 2026 primary results': { fr: 'résultats officiels des primaires 2026', es: 'resultados oficiales de las primarias 2026' },
  'official 2026 primary returns': { fr: 'résultats officiels des primaires 2026', es: 'resultados oficiales de las primarias 2026' },
  'official 2026 primary ballot roster': { fr: 'liste officielle des candidats aux primaires 2026', es: 'lista oficial de candidatos a las primarias 2026' },
  'election night reporting API': { fr: 'résultats du soir de l’élection (API)', es: 'resultados de la noche electoral (API)' },
  'unofficial Massachusetts federal primary calls': { fr: 'résultats non officiels des primaires fédérales du Massachusetts', es: 'resultados no oficiales de las primarias federales de Massachusetts' },
  'certified 2026 partisan primary canvass': { fr: 'dépouillement certifié des primaires partisanes 2026', es: 'escrutinio certificado de las primarias partidistas 2026' },
};
const CONFIDENCE: Record<string, L> = {
  model: { fr: 'modèle', es: 'modelo' },
  official: { fr: 'officiel', es: 'oficial' },
  'official; state estimate': { fr: 'officiel ; estimation de l’État', es: 'oficial; estimación estatal' },
  'no verified candidate in registry': { fr: 'aucun candidat vérifié au registre', es: 'ningún candidato verificado en el registro' },
  reviewed: { fr: 'vérifié', es: 'revisado' },
};

export function sourceLabel(label: string, lang: Lang): string {
  if (lang === 'en' || !label) return label;
  if (WHOLE[label]) return WHOLE[label][lang];
  const i = label.indexOf(' — ');
  if (i > 0) {
    const desc = DESC[label.slice(i + 3)];
    if (desc) return `${label.slice(0, i)} — ${desc[lang]}`;
  }
  return label;
}
export function confidenceLabel(value: string, lang: Lang): string {
  return lang === 'en' ? value : CONFIDENCE[value]?.[lang] ?? value;
}
