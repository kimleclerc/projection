// Chargeur des éditions budget (web_data/budget/{slug}/{edition}.json).
// Glob eager à la compilation → utilisé par getStaticPaths + hubs.
import type { BudgetData } from './budget';

const modules = import.meta.glob<BudgetData>('../../web_data/budget/*/*.json', { eager: true });

// Ordre de tri des juridictions dans les hubs.
const JUR_ORDER = ['canada', 'ontario', 'quebec'];

function toData(m: any): BudgetData {
  return (m && m.default ? m.default : m) as BudgetData;
}

export const ALL: BudgetData[] = Object.values(modules)
  .map(toData)
  .filter((d) => d && d.slug && d.edition);

/** Éditions d'une juridiction, plus récentes d'abord (par year puis season). */
export function editionsFor(slug: string): BudgetData[] {
  const seasonRank = (s: string) => (s === 'fall' ? 2 : s === 'spring' ? 1 : 0);
  return ALL.filter((d) => d.slug === slug).sort((a, b) => {
    if (a.year !== b.year) return b.year.localeCompare(a.year);
    return seasonRank(b.season) - seasonRank(a.season);
  });
}

/** Juridictions présentes, dans l'ordre canonique. */
export function jurisdictions(): string[] {
  const present = new Set(ALL.map((d) => d.slug));
  return JUR_ORDER.filter((s) => present.has(s)).concat(
    [...present].filter((s) => !JUR_ORDER.includes(s)).sort(),
  );
}

/** Édition la plus récente d'une juridiction (pour les cartes de hub). */
export function latestFor(slug: string): BudgetData | undefined {
  return editionsFor(slug)[0];
}

export function getEdition(slug: string, edition: string): BudgetData | undefined {
  return ALL.find((d) => d.slug === slug && d.edition === edition);
}
