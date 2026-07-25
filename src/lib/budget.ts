// Helpers pour le desk Budget (analyse fiscale indépendante, Lab-incubateur).
// Modèle EVENT-scopé : chaque budget / mise à jour économique = une page
// permanente sous /{lang}/budget/{juridiction}/{edition}. Prose trilingue
// {en,fr,es}. Les nombres ne sont jamais traduits.

export type Locale = 'fr' | 'en' | 'es';
export interface Prose { en: string; fr: string; es: string }

/** Résout une prose vers la locale, avec repli en→fr. */
export function t(p: Prose | undefined, locale: Locale): string {
  if (!p) return '';
  return p[locale] || p.en || p.fr || '';
}

// ── Types du web_data (budget/{slug}/{edition}.json) ─────────────────────────
export interface KeyNumber { label: Prose; value: string; note: Prose; change: Prose; direction: string }
export interface Sector { id: string; priority: string; tags: string[]; title: Prose; spending: Prose; change: Prose; summary: Prose; points: Prose[] }
export interface Measure { label: Prose; value: string; note: Prose }
export interface Audience { id: string; priority: string; tags: string[]; title: Prose; summary: Prose; measures: Measure[] }
export interface Stakeholder { id: string; priority: string; tags: string[]; title: Prose; summary: Prose; issues: Prose[] }
export interface GlossaryItem { term: Prose; definition: Prose }
export interface ComparisonItem { label: Prose; before: Prose; after: Prose; direction: string }
export interface BudgetData {
  jurisdiction: string; slug: string; year: string; edition: string;
  type: 'budget' | 'economic_update'; season: 'fall' | 'spring';
  fiscal_year: string; status: string;
  title: Prose; title_full: Prose; date_tabled: Prose;
  minister: string; premier: string;
  quote: { text: Prose; author: string; role: Prose } | null;
  key_numbers: KeyNumber[]; sectors: Sector[]; audiences: Audience[];
  stakeholders: Stakeholder[]; glossary: GlossaryItem[];
  comparison: { previous_year: string; items: ComparisonItem[] } | null;
  sources: { plan: string; brief: string } | null;
  notebook: { url: string; label: Prose; note: Prose } | null;
  meta: { analyst: string; org: string; source: string; ingested_at: string; needs_translation: string[] };
}

// ── Étiquettes UI trilingues ─────────────────────────────────────────────────
type L = Record<Locale, string>;
const M = (fr: string, en: string, es: string): L => ({ fr, en, es });

export const JURISDICTION_LABEL: Record<string, L> = {
  canada: M('Canada', 'Canada', 'Canadá'),
  ontario: M('Ontario', 'Ontario', 'Ontario'),
  quebec: M('Québec', 'Quebec', 'Quebec'),
};
export const TYPE_LABEL: Record<string, L> = {
  budget: M('Budget', 'Budget', 'Presupuesto'),
  economic_update: M('Mise à jour économique', 'Economic update', 'Actualización económica'),
};
export const PRIORITY_LABEL: Record<string, L> = {
  high: M('Priorité élevée', 'High priority', 'Prioridad alta'),
  medium: M('Priorité moyenne', 'Medium priority', 'Prioridad media'),
  low: M('Priorité faible', 'Low priority', 'Prioridad baja'),
};

export const UI = {
  eyebrowIndep: M('Analyse indépendante', 'Independent analysis', 'Análisis independiente'),
  disclaimer: M(
    'Analyse indépendante — non affiliée à un gouvernement.',
    'Independent analysis — not affiliated with any government.',
    'Análisis independiente — sin afiliación gubernamental.'),
  minister: M('Ministre des Finances', 'Finance Minister', 'Ministro de Finanzas'),
  premier: M('Premier ministre', 'Prime Minister / Premier', 'Primer ministro'),
  tabled: M('Déposé le', 'Tabled', 'Presentado el'),
  keyNumbers: M('Les chiffres', 'The numbers', 'Las cifras'),
  sectors: M('Par secteur', 'By sector', 'Por sector'),
  forYou: M('Pour vous', 'For you', 'Para ti'),
  stakeholders: M('Parties prenantes', 'Stakeholders', 'Partes interesadas'),
  comparison: M('Avant / après', 'Before / after', 'Antes / después'),
  glossary: M('Glossaire', 'Glossary', 'Glosario'),
  sources: M('Sources', 'Sources', 'Fuentes'),
  planLabel: M('Plan budgétaire', 'Budget plan', 'Plan presupuestario'),
  briefLabel: M('Budget en bref', 'Budget in brief', 'Presupuesto en breve'),
  measures: M('Mesures', 'Measures', 'Medidas'),
  issues: M('Enjeux', 'Key issues', 'Cuestiones clave'),
  allEditions: M('Toutes les éditions', 'All editions', 'Todas las ediciones'),
  otherBudgets: M('Autres budgets', 'Other budgets', 'Otros presupuestos'),
  archived: M('Archive', 'Archived', 'Archivo'),
} as const;

export const lab = (l: L, locale: Locale) => l[locale];

// ── URLs (event-scopées, permanentes) ────────────────────────────────────────
export const budgetHub = (locale: Locale) => `/${locale}/budget/`;
export const budgetJur = (locale: Locale, slug: string) => `/${locale}/budget/${slug}/`;
export const budgetEdition = (locale: Locale, slug: string, edition: string) =>
  `/${locale}/budget/${slug}/${edition}/`;
export const labHub = (locale: Locale) => `/${locale}/lab/`;

export const methodHref = (locale: Locale): string =>
  locale === 'en' ? '/en/methodology/' : `/${locale}/${locale === 'es' ? 'metodologia' : 'methodologie'}/`;

/** Titre affichable d'une édition : « Budget 2025 » / « Mise à jour — printemps 2026 ». */
export function editionTitle(d: Pick<BudgetData, 'type' | 'year' | 'season' | 'title'>, locale: Locale): string {
  const type = TYPE_LABEL[d.type]?.[locale] ?? d.type;
  return `${type} ${d.year}`;
}
