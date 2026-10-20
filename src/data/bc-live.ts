/**
 * Soirée britanno-colombienne du 24 octobre 2026 : réglages partagés par la
 * page de résultats et le bloc « en direct » des 93 fiches de circonscription.
 */
import { partyMeta } from '../lib/riding-adapters/parties';
import ridingsSource from '../../web_data/british-columbia/ridings.json';
import membersSource from '../../web_data/british-columbia/members.json';

type Locale = 'fr' | 'en' | 'es';

export const BC_LIVE_EVENT_ID = import.meta.env.PUBLIC_LIVE_EVENT_ID ?? 'bc-2026-10-24';
// Rail statique d'abord (Pages, sans plafond de requêtes), Worker en repli.
export const BC_LIVE_API_BASE = import.meta.env.PUBLIC_LIVE_API_BASE ?? 'https://votescope-live.pages.dev';
export const BC_LIVE_FALLBACK_API_BASE = import.meta.env.PUBLIC_LIVE_FALLBACK_API_BASE ?? 'https://vote-scope.com';
export const BC_TZ = 'America/Vancouver';

// Noms courts (tableaux, légende) et longs (appels sur le gouvernement).
const NAMES: Record<string, Record<Locale, [string, string]>> = {
  bc_ndp:    { fr: ['NPD', 'le NPD'], en: ['NDP', 'the NDP'], es: ['NPD', 'el NPD'] },
  bc_con:    { fr: ['Conservateurs', 'le Parti conservateur'], en: ['Conservatives', 'the Conservatives'], es: ['Conservadores', 'el Partido Conservador'] },
  bc_grn:    { fr: ['Verts', 'le Parti vert'], en: ['Greens', 'the Greens'], es: ['Verdes', 'el Partido Verde'] },
  bc_onebc:  { fr: ['OneBC', 'OneBC'], en: ['OneBC', 'OneBC'], es: ['OneBC', 'OneBC'] },
  bc_centre: { fr: ['CentreBC', 'CentreBC'], en: ['CentreBC', 'CentreBC'], es: ['CentreBC', 'CentreBC'] },
  bc_oth:    { fr: ['Autres', 'un autre parti'], en: ['Others', 'another party'], es: ['Otros', 'otro partido'] },
};

export function bcLiveParties(locale: Locale) {
  return Object.entries(NAMES).map(([code, n]) => ({
    code, color: partyMeta('british-columbia', code).color, label: n[locale][0], long: n[locale][1],
  }));
}

const ridingsBase = { fr: 'circonscriptions', en: 'ridings', es: 'distritos' } as const;
export const bcProvinceBase = { fr: '/fr/canada/colombie-britannique', en: '/en/canada/british-columbia', es: '/es/canada/columbia-britanica' } as const;
export const bcResultsHref = { fr: '/fr/canada/colombie-britannique/resultats/', en: '/en/canada/british-columbia/results/', es: '/es/canada/columbia-britanica/resultados/' } as const;

type RawRiding = { riding_id: string; name_en: string; name_fr?: string; region?: string;
  projection?: { winner?: string }; baseline_result?: { winner?: string } };
type Member = { mp_name?: string | null };

/**
 * Une ligne par circonscription pour les blocs du direct. La référence des
 * « gains » est le vainqueur de 2024 : vingt élus conservateurs ont changé de
 * caucus depuis, l'étiquette du siège à la dissolution ne dirait pas grand-chose.
 * Le député sortant sert à distinguer « réélu » de « élu ».
 */
export function bcLiveRiding(r: RawRiding, locale: Locale, slugOf: (id: string) => string) {
  const m = (membersSource as Record<string, Member | undefined>)[r.riding_id];
  const words = (m?.mp_name ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    id: r.riding_id,
    name: locale === 'fr' ? (r.name_fr || r.name_en) : r.name_en,
    href: `${bcProvinceBase[locale]}/${ridingsBase[locale]}/${slugOf(r.riding_id)}/`,
    region: r.region ?? 'rest',
    winner2022: r.baseline_result?.winner ?? null,
    holder: r.baseline_result?.winner ?? null,
    projected: r.projection?.winner ?? null,
    mna: words.length >= 2 ? { name: m?.mp_name ?? null, first: words[0], last: words[words.length - 1], g: null } : null,
  };
}

export const bcRawRidings = (ridingsSource as { ridings: RawRiding[] }).ridings;
