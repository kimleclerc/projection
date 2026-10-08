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
