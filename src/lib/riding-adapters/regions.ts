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


const FED_REGIONS: Record<string, RegionLabel> = {
  atlantic: { en: 'Atlantic Canada', fr: 'Atlantique', es: 'Canadá Atlántico' },
  fed_qc: { en: 'Quebec', fr: 'Québec', es: 'Quebec' },
  toronto_core: { en: 'City of Toronto', fr: 'Ville de Toronto', es: 'Ciudad de Toronto' },
  toronto_suburbs_peel_halton: { en: 'Peel and Halton', fr: 'Peel et Halton', es: 'Peel y Halton' },
  toronto_suburbs_york_durham: { en: 'York and Durham', fr: 'York et Durham', es: 'York y Durham' },
  eastern_on: { en: 'Eastern Ontario', fr: 'Est de l’Ontario', es: 'Este de Ontario' },
  southwestern_on: { en: 'Southwestern Ontario', fr: 'Sud-Ouest de l’Ontario', es: 'Suroeste de Ontario' },
  ottawa_region: { en: 'Ottawa region', fr: 'Région d’Ottawa', es: 'Región de Ottawa' },
  mb_rural: { en: 'Rural Manitoba', fr: 'Manitoba rural', es: 'Manitoba rural' },
  winnipeg: { en: 'Winnipeg', fr: 'Winnipeg', es: 'Winnipeg' },
  sk_rural: { en: 'Rural Saskatchewan', fr: 'Saskatchewan rurale', es: 'Saskatchewan rural' },
  sk_urban: { en: 'Regina and Saskatoon', fr: 'Regina et Saskatoon', es: 'Regina y Saskatoon' },
  calgary: { en: 'Calgary', fr: 'Calgary', es: 'Calgary' },
  edmonton: { en: 'Edmonton', fr: 'Edmonton', es: 'Edmonton' },
  ab_rural: { en: 'Rural Alberta', fr: 'Alberta rurale', es: 'Alberta rural' },
  vancouver_metro: { en: 'Metro Vancouver', fr: 'Grand Vancouver', es: 'Gran Vancouver' },
  bc_north: { en: 'Northern B.C.', fr: 'Nord de la C.-B.', es: 'Norte de la C. B.' },
  bc_interior: { en: 'B.C. Interior', fr: 'Intérieur de la C.-B.', es: 'Interior de la C. B.' },
  bc_island: { en: 'Vancouver Island', fr: 'Île de Vancouver', es: 'Isla de Vancouver' },
  territories: { en: 'The North', fr: 'Territoires', es: 'Territorios' },
};

const QC_REGIONS: Record<string, RegionLabel> = {
  mtl: { en: 'Montreal', fr: 'Montréal', es: 'Montreal' },
  qcc: { en: 'Quebec City', fr: 'Capitale-Nationale', es: 'Ciudad de Quebec' },
  rest: { en: 'Rest of Quebec', fr: 'Reste du Québec', es: 'Resto de Quebec' },
};

const ON_REGIONS: Record<string, RegionLabel> = {
  on_tor: { en: 'City of Toronto', fr: 'Ville de Toronto', es: 'Ciudad de Toronto' },
  on_905: { en: 'Greater Toronto (905)', fr: 'Banlieue de Toronto (905)', es: 'Área de Toronto (905)' },
  on_east: { en: 'Eastern Ontario', fr: 'Est de l’Ontario', es: 'Este de Ontario' },
  on_sw: { en: 'Southwestern Ontario', fr: 'Sud-Ouest de l’Ontario', es: 'Suroeste de Ontario' },
  on_north: { en: 'Northern Ontario', fr: 'Nord de l’Ontario', es: 'Norte de Ontario' },
  on_provincewide: { en: 'Ontario', fr: 'Ontario', es: 'Ontario' },
};

const UK_REGIONS: Record<string, RegionLabel> = {
  north_east: { en: 'North East', fr: 'Nord-Est', es: 'Noreste' },
  north_west: { en: 'North West', fr: 'Nord-Ouest', es: 'Noroeste' },
  yorkshire_and_the_humber: { en: 'Yorkshire and the Humber', fr: 'Yorkshire-et-Humber', es: 'Yorkshire y Humber' },
  east_midlands: { en: 'East Midlands', fr: 'Midlands de l’Est', es: 'Midlands del Este' },
  west_midlands: { en: 'West Midlands', fr: 'Midlands de l’Ouest', es: 'Midlands del Oeste' },
  east_of_england: { en: 'East of England', fr: 'Est de l’Angleterre', es: 'Este de Inglaterra' },
  london: { en: 'London', fr: 'Londres', es: 'Londres' },
  south_east: { en: 'South East', fr: 'Sud-Est', es: 'Sureste' },
  south_west: { en: 'South West', fr: 'Sud-Ouest', es: 'Suroeste' },
  scotland: { en: 'Scotland', fr: 'Écosse', es: 'Escocia' },
  wales: { en: 'Wales', fr: 'pays de Galles', es: 'Gales' },
  northern_ireland: { en: 'Northern Ireland', fr: 'Irlande du Nord', es: 'Irlanda del Norte' },
};

/** Nations du Royaume-Uni, telles que les données les écrivent (en anglais). */
export const UK_NATIONS: Record<string, RegionLabel> = {
  England: { en: 'England', fr: 'Angleterre', es: 'Inglaterra' },
  Scotland: { en: 'Scotland', fr: 'Écosse', es: 'Escocia' },
  Wales: { en: 'Wales', fr: 'pays de Galles', es: 'Gales' },
  'Northern Ireland': { en: 'Northern Ireland', fr: 'Irlande du Nord', es: 'Irlanda del Norte' },
};

const BY_JURISDICTION: Record<string, Record<string, RegionLabel>> = {
  'british-columbia': BC_REGIONS,
  federal: FED_REGIONS,
  quebec: QC_REGIONS,
  ontario: ON_REGIONS,
  uk: UK_REGIONS,
};

/** Nom lisible d'une région, ou le code nettoyé quand aucun nom n'est déclaré.
 *
 * La capitalisation est faite ICI, et non en CSS : `text-transform: capitalize`
 * écrivait « Vallée Du Fraser ». Un nom déclaré est rendu tel qu'il est écrit ;
 * seul un code de repli est capitalisé mot à mot. */
export function regionLabel(jurisdiction: string, region: string | undefined,
                            lang: 'en' | 'fr' | 'es'): string {
  if (!region) return '';
  // Aux États-Unis, la « région » est l'État lui-même, déjà affiché : rien à ajouter.
  if (/^us_/.test(region)) return '';
  const label = BY_JURISDICTION[jurisdiction]?.[region];
  if (label) return label[lang];
  return region
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
