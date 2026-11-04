/**
 * Ce que l'accueil US et l'accueil du site savent au build sur les résultats
 * du 3 novembre 2026 : la copie de repli du live.json, et le contexte stable
 * (sièges non renouvelés, parti sortant de chaque course, noms et liens).
 */
import snapshot from './us-results-snapshot.json';
import houseSource from '../../web_data/us-house/latest.json';
import senateSource from '../../web_data/us-senate/latest.json';
import governorSource from '../../web_data/us-governor/latest.json';
import houseMembers from '../../web_data/us-house/members.json';
import { CHAMBER_PREFIX, type Chamber, type UsLivePayload } from '../islands/usLive';
import { homeView, liveJsonUrl, type HomeContext } from '../lib/us-results';
import { PAGE, US_LIVE_API_BASE, US_LIVE_EVENT_ID, US_LIVE_FALLBACK_API_BASE, usLiveParties, usLiveProps } from './us-live';

type Locale = 'fr' | 'en' | 'es';
type Raw = { riding_id: string; incumbent_party?: string | null; baseline_result?: { winner?: string | null } | null };
const RAW: Record<Chamber, Raw[]> = {
  house: (houseSource as unknown as { ridings: Raw[] }).ridings,
  senate: (senateSource as unknown as { ridings: Raw[] }).ridings,
  governor: (governorSource as unknown as { ridings: Raw[] }).ridings,
};
const CH: Chamber[] = ['house', 'senate', 'governor'];

export const US_RESULTS_SNAPSHOT = snapshot as unknown as UsLivePayload;
export const US_RESULTS_URLS = [liveJsonUrl(US_LIVE_API_BASE, US_LIVE_EVENT_ID), liveJsonUrl(US_LIVE_FALLBACK_API_BASE, US_LIVE_EVENT_ID)];

/** Parti majoritaire avant le scrutin, par chambre (composition publiée du bureau). */
export function priorMajority(chamber: 'house' | 'senate'): string | null {
  const comp = ((chamber === 'house' ? houseSource : senateSource) as unknown as { current_composition?: Record<string, number> }).current_composition ?? {};
  const top = Object.entries(comp).filter(([k]) => k.startsWith('us_')).sort((a, b) => b[1] - a[1])[0];
  return top?.[0] ?? null;
}

export function usResultsHome(lang: Locale) {
  const prior: Record<string, string> = {};
  for (const ch of CH) {
    for (const r of RAW[ch]) {
      // Sortant : le parti du représentant en poste (siège vacant : le gagnant de 2024) ; Sénat et gouverneurs : incumbent_party.
      const member = (houseMembers as Record<string, { party_current?: string }>)[r.riding_id]?.party_current;
      const was = ch === 'house' ? (member === 'us_dem' || member === 'us_rep' ? member : r.baseline_result?.winner) : r.incumbent_party;
      if (was) prior[`${CHAMBER_PREFIX[ch]}${String(r.riding_id).padStart(5, '0')}`] = was;
    }
  }
  const props = Object.fromEntries(CH.map((ch) => [ch, usLiveProps(ch, lang)])) as Record<Chamber, ReturnType<typeof usLiveProps>>;
  const ctx: HomeContext = { prior, holdovers: Object.fromEntries(CH.map((ch) => [ch, props[ch].holdovers])) as HomeContext['holdovers'] };
  const races: Record<string, { name: string; href?: string }> = {};
  for (const ch of CH) for (const [id, r] of Object.entries(props[ch].races)) races[id] = { name: r.name, href: r.href };
  return {
    ctx, races,
    initial: homeView(US_RESULTS_SNAPSHOT, ctx),
    urls: US_RESULTS_URLS,
    colors: Object.fromEntries(usLiveParties(lang).map((p) => [p.code, p.color])) as Record<string, string>,
    pages: { house: PAGE.house[lang], senate: PAGE.senate[lang], governor: PAGE.governor[lang] },
    seats: Object.fromEntries(CH.map((ch) => [ch, props[ch].seats])) as Record<Chamber, number>,
    majority: Object.fromEntries(CH.map((ch) => [ch, props[ch].majority])) as Record<Chamber, number | null>,
  };
}
