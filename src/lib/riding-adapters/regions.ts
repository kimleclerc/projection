/**
 * Noms lisibles des régions de circonscription.
 *
 * Le gabarit affichait le CODE de région tel quel, souligné d'un simple
 * `replace('_', ' ')` et d'une capitalisation CSS : « Bc Fraser », « On 905 ».
 * Acceptable tant que le code ressemblait à un nom ; illisible dès que la
 * Colombie-Britannique est arrivée avec des régions préfixées.
 *
 * Seule la Colombie-Britannique est traduite ici. Les autres juridictions
 * gardent leur affichage actuel : renommer leurs régions est un choix
 * éditorial qui leur appartient, pas un effet de bord du desk BC.
 */
export type RegionLabel = { en: string; fr: string; es: string };

const BC_REGIONS: Record<string, RegionLabel> = {
  bc_metro_van: { en: 'Metro Vancouver', fr: 'Grand Vancouver', es: 'Gran Vancouver' },
  bc_fraser:    { en: 'Fraser Valley',   fr: 'Vallée du Fraser', es: 'Valle del Fraser' },
  bc_island:    { en: 'Vancouver Island & Coast', fr: 'Île de Vancouver et Côte', es: 'Isla de Vancouver y Costa' },
  bc_interior:  { en: 'Interior',        fr: 'Intérieur',        es: 'Interior' },
  bc_north:     { en: 'North',           fr: 'Nord',             es: 'Norte' },
};

const BY_JURISDICTION: Record<string, Record<string, RegionLabel>> = {
  'british-columbia': BC_REGIONS,
};

/** Nom lisible d'une région, ou le code nettoyé quand aucun nom n'est déclaré.
 *
 * La capitalisation est faite ICI, et non en CSS : `text-transform: capitalize`
 * écrivait « Vallée Du Fraser ». Un nom déclaré est rendu tel qu'il est écrit ;
 * seul un code de repli est capitalisé mot à mot. */
export function regionLabel(jurisdiction: string, region: string | undefined,
                            lang: 'en' | 'fr' | 'es'): string {
  if (!region) return '';
  const label = BY_JURISDICTION[jurisdiction]?.[region];
  if (label) return label[lang];
  return region
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
