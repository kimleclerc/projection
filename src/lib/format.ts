/**
 * Chiffres et dates à la mode de chaque langue, pour toutes les pages.
 *
 * Le français et l'espagnol écrivent 54,5 % (virgule, espace avant %), l'anglais
 * 54.5% ; une date se lit « 9 octobre 2026 », jamais 2026-10-09. toFixed() imprime
 * un point dans les trois langues : on passe toujours par ici.
 */
export type Lang = 'fr' | 'en' | 'es';

const LOCALE: Record<Lang, string> = { fr: 'fr-CA', en: 'en-CA', es: 'es-ES' };
const DATE_LOCALE: Record<Lang, string> = { fr: 'fr-CA', en: 'en-US', es: 'es-ES' };

/** Nombre à `d` décimales (séparateur de la langue). */
export function num(v: number, lang: Lang, d = 0): string {
  return v.toLocaleString(LOCALE[lang], { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Pourcentage déjà exprimé sur 100 : 54,5 % / 54.5%. */
export function pct(v: number, lang: Lang, d = 1): string {
  const n = num(v, lang, d);
  return lang === 'en' ? `${n}%` : `${n} %`;
}

/** Écart signé en points : +11,1 / −9,7 (vrai signe moins). */
export function signed(v: number, lang: Lang, d = 1): string {
  const n = num(Math.abs(v), lang, d);
  return v > 0 ? `+${n}` : v < 0 ? `−${n}` : n;
}

/** « 9,3 points » / « 9.3 points » / « 9,3 puntos ». */
export function points(v: number, lang: Lang, d = 1): string {
  const word = lang === 'es' ? 'puntos' : lang === 'fr' && Math.abs(v) < 2 ? 'point' : 'points';
  return `${num(v, lang, d)} ${word}`;
}

/** Date ISO (AAAA-MM-JJ) écrite en toutes lettres. */
export function longDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(DATE_LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Nom propre saisi en capitales (« BETH VAN DUYNE ») remis en casse de titre. */
export function properName(name: string): string {
  if (!name || name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .replace(/(^|[\s\-'’.(])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())
    .replace(/\b(Ii|Iii|Iv)\b/g, (r) => r.toUpperCase());
}

/** Nom officiel : Élections Canada écrit « -- » pour le tiret long. */
export function ridingName(name: string): string {
  return name ? name.replace(/\s*--\s*/g, '—') : name;
}
