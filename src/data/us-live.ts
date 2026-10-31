/**
 * Mi-mandat américaines du 3 novembre 2026 : réglages et données de build de
 * l'îlot de direct posé sur les pages Chambre, Sénat et gouverneurs.
 *
 * Un seul événement (`us-2026-11-03`) et un seul live.json pour les 506
 * courses ; les identifiants y sont préfixés par chambre (`H-`, `S-`, `G-`)
 * et suivis du `riding_id` de web_data (FIPS zfillé à 5).
 */
import houseSource from '../../web_data/us-house/latest.json';
import senateSource from '../../web_data/us-senate/latest.json';
import governorSource from '../../web_data/us-governor/latest.json';
import { partyMeta } from '../lib/riding-adapters/parties';
import { ridingSlug } from '../lib/riding-adapters/types';
import { CHAMBER_PREFIX, type Chamber } from '../islands/usLive';
import type { UsRaceInfo } from '../islands/UsMidtermsLive';

type Locale = 'fr' | 'en' | 'es';

export const US_LIVE_EVENT_ID = import.meta.env.PUBLIC_US_LIVE_EVENT_ID ?? 'us-2026-11-03';
// Rail statique d'abord (Pages, sans plafond de requêtes), Worker en repli — comme au Québec et en C.-B.
export const US_LIVE_API_BASE = import.meta.env.PUBLIC_LIVE_API_BASE ?? 'https://votescope-live.pages.dev';
export const US_LIVE_FALLBACK_API_BASE = import.meta.env.PUBLIC_LIVE_FALLBACK_API_BASE ?? 'https://vote-scope.com';

// Les codes du collecteur (prepare_us_event.PARTY_LABELS) : trois seaux, pas plus.
const NAMES: Record<string, Record<Locale, string>> = {
  us_dem: { fr: 'Démocrates', en: 'Democrats', es: 'Demócratas' },
  us_rep: { fr: 'Républicains', en: 'Republicans', es: 'Republicanos' },
  us_oth: { fr: 'Autres', en: 'Others', es: 'Otros' },
};

export function usLiveParties(locale: Locale) {
  return Object.entries(NAMES).map(([code, n]) => ({ code, color: partyMeta('us-house', code).color, label: n[locale] }));
}

type RawRace = { riding_id: string; name_en: string; name_fr?: string; incumbent_party?: string;
  projection?: { winner?: string; mean_margin?: number; p_close_race?: number } };
type Desk = { meta: { total_seats?: number; majority_threshold?: number }; current_composition?: Record<string, number>; ridings: RawRace[] };

const SOURCES: Record<Chamber, Desk> = {
  house: houseSource as unknown as Desk,
  senate: senateSource as unknown as Desk,
  governor: governorSource as unknown as Desk,
};

const HREF: Record<Chamber, Record<Locale, string>> = {
  house: { fr: '/fr/us/chambre/districts', en: '/en/us/house/districts', es: '/es/us/house/distritos' },
  senate: { fr: '/fr/us/senat/sieges', en: '/en/us/senate/seats', es: '/es/us/senate/escanos' },
  governor: { fr: '/fr/us/gouverneurs/courses', en: '/en/us/governors/races', es: '/es/us/gobernadores/carreras' },
};

/**
 * Sièges NON renouvelés par parti : composition actuelle − sièges en jeu. Même
 * calcul que `prepare_us_event.holdovers` côté moteur (Sénat 65, gouverneurs 14).
 */
function holdovers(chamber: Chamber, desk: Desk): Record<string, number> {
  if (chamber === 'house') return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(desk.current_composition ?? {})) if (k.startsWith('us_')) out[k] = Number(v);
  for (const r of desk.ridings) if (r.incumbent_party && r.incumbent_party in out) out[r.incumbent_party] -= 1;
  return out;
}

export function usLiveProps(chamber: Chamber, locale: Locale) {
  const desk = SOURCES[chamber];
  // Courses serrées d'abord : c'est là que le lecteur regarde le soir.
  const ranked = desk.ridings.slice().sort((a, b) =>
    Math.abs(a.projection?.mean_margin ?? 99) - Math.abs(b.projection?.mean_margin ?? 99));
  const races: Record<string, UsRaceInfo> = {};
  ranked.forEach((r, rank) => {
    const id = `${CHAMBER_PREFIX[chamber]}${String(r.riding_id).padStart(5, '0')}`;
    races[id] = {
      name: locale === 'fr' ? (r.name_fr || r.name_en) : r.name_en,
      href: `${HREF[chamber][locale]}/${ridingSlug(r.riding_id, r.name_en || r.name_fr || '')}/`,
      projected: r.projection?.winner ?? null,
      rank,
    };
  });
  return {
    chamber,
    races,
    holdovers: holdovers(chamber, desk),
    seats: desk.meta.total_seats ?? (chamber === 'house' ? 435 : chamber === 'senate' ? 100 : 50),
    // Gouverneurs : pas de majorité à atteindre (le moteur porte `majority: null`).
    majority: chamber === 'governor' ? null : (desk.meta.majority_threshold ?? null),
    parties: usLiveParties(locale),
  };
}
