// Provinces espagnoles : listes proclamées au Congrès (BOE du 3 novembre 2026) et
// projection par province. Les deux fichiers viennent du moteur (es_export_web.py).
import candidates from '../../web_data/spain/candidates.json';
import latest from '../../web_data/spain/latest.json';

export type Locale = 'en' | 'fr' | 'es';

export interface SpainList {
  order: number;
  name: string;
  abbr: string;
  party: string;
  proclaimed: boolean;
  titulares: string[];
  suplentes: string[];
}

export interface SpainProvince {
  code: string;
  name: string;
  slug: string;
  seats: number;
  lists: SpainList[];
  /** Projection du jour : parti → part, sièges médians, chance d'au moins un siège. */
  projection: Record<string, { vote_mean: number; seats_median: number; p_at_least_one: number }>;
  seats2023: Record<string, number>;
}

export const SEG: Record<Locale, string> = { en: 'provinces', fr: 'provinces', es: 'provincias' };

export const provinceUrl = (lang: Locale, slug?: string) =>
  `/${lang}/spain/${SEG[lang]}/${slug ? `${slug}/` : ''}`;

export const candidatesMeta = (candidates as any).meta as {
  source: string; published: string; source_url: string; n_lists: number; n_candidates: number;
};

export function getSpainProvinces(): SpainProvince[] {
  const proj = (latest as any).provinces as Record<string, any>;
  return Object.entries((candidates as any).provinces as Record<string, any>)
    .map(([code, p]) => ({
      code,
      name: p.name,
      slug: p.slug,
      seats: p.seats,
      lists: (p.lists as SpainList[]).filter((l) => l.proclaimed),
      projection: proj[code]?.parties ?? {},
      seats2023: proj[code]?.seats_2023 ?? {},
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
