/**
 * Nom d'un lieu (État, circonscription) dans la langue de la page — une seule
 * fonction pour tout le site. Les données portent name_en et name_fr ; en espagnol,
 * les États américains prennent leur nom usuel (Nueva York, Carolina del Norte…),
 * les autres lieux gardent leur nom officiel.
 */
export const US_STATE_ES: Record<string, string> = {
  'New York': 'Nueva York', 'New Jersey': 'Nueva Jersey', 'New Mexico': 'Nuevo México', 'New Hampshire': 'Nuevo Hampshire',
  'North Carolina': 'Carolina del Norte', 'South Carolina': 'Carolina del Sur', 'North Dakota': 'Dakota del Norte',
  'South Dakota': 'Dakota del Sur', 'Pennsylvania': 'Pensilvania', 'Hawaii': 'Hawái', 'Louisiana': 'Luisiana',
  'Michigan': 'Míchigan', 'Oregon': 'Oregón', 'West Virginia': 'Virginia Occidental', 'Mississippi': 'Misisipi',
  'Missouri': 'Misuri', 'Tennessee': 'Tennessee', 'District of Columbia': 'Distrito de Columbia',
};

type Lang = 'en' | 'fr' | 'es';
interface Named { name_en?: string; name_fr?: string; name_es?: string | null }

export function placeNameEs(en: string): string {
  // « Ohio (special) », « Nebraska 2 » : on traduit la partie État.
  for (const [k, v] of Object.entries(US_STATE_ES)) if (en === k || en.startsWith(k + ' ')) return v + en.slice(k.length);
  return en;
}

export function placeName(p: Named, lang: Lang): string {
  if (lang === 'fr') return p.name_fr ?? p.name_en ?? '';
  if (lang === 'es') return p.name_es ?? placeNameEs(p.name_en ?? p.name_fr ?? '');
  return p.name_en ?? p.name_fr ?? '';
}

/** Code postal d'État → nom anglais et complément français « du Texas », « de la Géorgie ». */
export const US_STATES: Record<string, { en: string; frDe: string }> = {
  AL: { en: 'Alabama', frDe: 'de l’Alabama' }, AK: { en: 'Alaska', frDe: 'de l’Alaska' },
  AZ: { en: 'Arizona', frDe: 'de l’Arizona' }, AR: { en: 'Arkansas', frDe: 'de l’Arkansas' },
  CA: { en: 'California', frDe: 'de la Californie' }, CO: { en: 'Colorado', frDe: 'du Colorado' },
  CT: { en: 'Connecticut', frDe: 'du Connecticut' }, DE: { en: 'Delaware', frDe: 'du Delaware' },
  FL: { en: 'Florida', frDe: 'de la Floride' }, GA: { en: 'Georgia', frDe: 'de la Géorgie' },
  HI: { en: 'Hawaii', frDe: 'd’Hawaï' }, ID: { en: 'Idaho', frDe: 'de l’Idaho' },
  IL: { en: 'Illinois', frDe: 'de l’Illinois' }, IN: { en: 'Indiana', frDe: 'de l’Indiana' },
  IA: { en: 'Iowa', frDe: 'de l’Iowa' }, KS: { en: 'Kansas', frDe: 'du Kansas' },
  KY: { en: 'Kentucky', frDe: 'du Kentucky' }, LA: { en: 'Louisiana', frDe: 'de la Louisiane' },
  ME: { en: 'Maine', frDe: 'du Maine' }, MD: { en: 'Maryland', frDe: 'du Maryland' },
  MA: { en: 'Massachusetts', frDe: 'du Massachusetts' }, MI: { en: 'Michigan', frDe: 'du Michigan' },
  MN: { en: 'Minnesota', frDe: 'du Minnesota' }, MS: { en: 'Mississippi', frDe: 'du Mississippi' },
  MO: { en: 'Missouri', frDe: 'du Missouri' }, MT: { en: 'Montana', frDe: 'du Montana' },
  NE: { en: 'Nebraska', frDe: 'du Nebraska' }, NV: { en: 'Nevada', frDe: 'du Nevada' },
  NH: { en: 'New Hampshire', frDe: 'du New Hampshire' }, NJ: { en: 'New Jersey', frDe: 'du New Jersey' },
  NM: { en: 'New Mexico', frDe: 'du Nouveau-Mexique' }, NY: { en: 'New York', frDe: 'de l’État de New York' },
  NC: { en: 'North Carolina', frDe: 'de la Caroline du Nord' }, ND: { en: 'North Dakota', frDe: 'du Dakota du Nord' },
  OH: { en: 'Ohio', frDe: 'de l’Ohio' }, OK: { en: 'Oklahoma', frDe: 'de l’Oklahoma' },
  OR: { en: 'Oregon', frDe: 'de l’Oregon' }, PA: { en: 'Pennsylvania', frDe: 'de la Pennsylvanie' },
  RI: { en: 'Rhode Island', frDe: 'du Rhode Island' }, SC: { en: 'South Carolina', frDe: 'de la Caroline du Sud' },
  SD: { en: 'South Dakota', frDe: 'du Dakota du Sud' }, TN: { en: 'Tennessee', frDe: 'du Tennessee' },
  TX: { en: 'Texas', frDe: 'du Texas' }, UT: { en: 'Utah', frDe: 'de l’Utah' },
  VT: { en: 'Vermont', frDe: 'du Vermont' }, VA: { en: 'Virginia', frDe: 'de la Virginie' },
  WA: { en: 'Washington', frDe: 'de l’État de Washington' }, WV: { en: 'West Virginia', frDe: 'de la Virginie-Occidentale' },
  WI: { en: 'Wisconsin', frDe: 'du Wisconsin' }, WY: { en: 'Wyoming', frDe: 'du Wyoming' },
  DC: { en: 'District of Columbia', frDe: 'du district de Columbia' },
};
