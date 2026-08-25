/**
 * Model release registry — the single source of truth for the version badge
 * and the "grandes mises à jour" (major-update) changelog on the methodology
 * page. Releases are NAMED (bird theme, echoing the index instruments — Canada
 * Goose, Lame Duck…), not numbered: a numbered "v1" read as a generic model.
 *
 * A new NAME = a major methodology change (new engine behaviour, recalibration
 * that moves results). Log it here → it surfaces in the badge and the
 * methodology changelog at once. Minor tweaks go in the per-page "sous mises à
 * jour" list, not here.
 *
 * Ordered newest-first. releases[0] is current.
 */
export type NavLang = 'en' | 'fr' | 'es';

export interface ModelRelease {
  /** Codename, shown in the badge. Single proper noun across languages. */
  name: string;
  /** When this release became current, 'YYYY-MM'. */
  since: string;
  /** One-line summary of what the release changed. */
  headline: Record<NavLang, string>;
}

export const MODEL_RELEASES: ModelRelease[] = [
  {
    name: 'Harfang des neiges',
    since: '2026-08',
    headline: {
      fr: 'Refonte de la projection locale. La concentration du vote d’un parti dépend désormais de son niveau — un parti à 7 % ne se répartit pas comme un parti à 30 % — et la géographie propre de chaque parti entre dans la projection par circonscription. Effets d’institut activés au Québec.',
      en: 'Rebuilt riding-level projection. A party’s vote concentration now depends on its level — a party at 7% does not spread like one at 30% — and each party’s own geography feeds the riding projection. House effects switched on for Quebec.',
      es: 'Rediseño de la proyección local. La concentración del voto de un partido depende ahora de su nivel — un partido con 7 % no se reparte como uno con 30 % — y la geografía propia de cada partido alimenta la proyección por circunscripción. Efectos de encuestadora activados en Quebec.',
    },
  },
  {
    name: 'Heron',
    since: '2026-07',
    headline: {
      fr: 'Première version nommée. Agrégation bayésienne BSTS, biais d’institut estimés et corrigés, reports de voix en Dirichlet, corrélations inter-blocs estimées des données, et calibration publiée sur les élections passées.',
      en: 'First named release. Bayesian BSTS aggregation, estimated-and-corrected house effects, Dirichlet vote transfers, inter-bloc correlations estimated from the data, and calibration published against past elections.',
      es: 'Primera versión con nombre. Agregación bayesiana BSTS, sesgos de encuestadora estimados y corregidos, transferencias de voto Dirichlet, correlaciones entre bloques estimadas de los datos y calibración publicada sobre elecciones pasadas.',
    },
  },
];

export const CURRENT_RELEASE = MODEL_RELEASES[0];

/** Localized badge label, e.g. "Modèle Heron". */
export function modelBadge(locale: NavLang): string {
  const word = { fr: 'Modèle', en: 'Model', es: 'Modelo' }[locale];
  return `${word} ${CURRENT_RELEASE.name}`;
}
