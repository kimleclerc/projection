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
    // Gouverneurs : pas de majorité institutionnelle (le moteur porte `majority: null`),
    // mais la jauge marque 26, plus de la moitié des 50 postes, et le dit comme tel.
    majority: desk.meta.majority_threshold ?? null,
    parties: usLiveParties(locale),
    geoUrl: `/web_data/us-${chamber}/geomap.json`,
    pagePath: PAGE[chamber][locale],
  };
}

/** Pages de la soirée, par chambre et par langue (lien de partage, intégration). */
export const PAGE: Record<Chamber, Record<Locale, string>> = {
  house: { fr: '/fr/us/chambre/', en: '/en/us/house/', es: '/es/us/house/' },
  senate: { fr: '/fr/us/senat/', en: '/en/us/senate/', es: '/es/us/senate/' },
  governor: { fr: '/fr/us/gouverneurs/', en: '/en/us/governors/', es: '/es/us/gobernadores/' },
};
export const EMBED: Record<Chamber, Record<Locale, string>> = {
  house: { fr: '/fr/embed/us-chambre-resultats/', en: '/en/embed/us-house-results/', es: '/es/embed/us-camara-resultados/' },
  senate: { fr: '/fr/embed/us-senat-resultats/', en: '/en/embed/us-senate-results/', es: '/es/embed/us-senado-resultados/' },
  governor: { fr: '/fr/embed/us-gouverneurs-resultats/', en: '/en/embed/us-governors-results/', es: '/es/embed/us-gobernadores-resultados/' },
};

/**
 * Titre et description de partage des trois pages, la semaine du vote. Une page
 * statique ne peut pas connaître le décompte : elle dit ce qu'elle montre (les
 * résultats du 3 novembre) et le dernier résultat connu au build, notre
 * projection, chiffres à l'appui. L'état du décompte voyage par l'image que le
 * lecteur télécharge depuis l'îlot.
 */
export function usShareMeta(chamber: Chamber, locale: Locale): { title: string; description: string } {
  const desk = SOURCES[chamber] as Desk & { parties?: { party: string; seats_projected?: number; seats_median?: number }[]; meta: { run_date?: string } };
  const seats = (code: string) => {
    const p = desk.parties?.find((x) => x.party === code);
    return Math.round(p?.seats_projected ?? p?.seats_median ?? 0);
  };
  // Chambre : la médiane, comme la tuile du bureau US et ProjectionEngine.
  const houseDem = chamber === 'house'
    ? desk.parties?.find((x) => x.party === 'us_dem')?.seats_median : undefined;
  const d = houseDem != null ? Math.round(houseDem) : seats('us_dem');
  const r = houseDem != null ? 435 - d : seats('us_rep');
  const run = desk.meta.run_date ? new Date(`${desk.meta.run_date}T12:00:00Z`) : null;
  const day = run ? run.toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-CA', { day: 'numeric', month: 'long', timeZone: 'UTC' }) : '';
  const n = desk.ridings.length;
  const maj = desk.meta.majority_threshold ?? 0;
  const T = {
    house: {
      fr: { title: 'Chambre des représentants : résultats du 3 novembre 2026, district par district — Vote-Scope',
        description: `Les 435 districts au fil du dépouillement, à partir de 18 h (heure de l’Est) le 3 novembre. Notre projection du ${day} : démocrates ${d} sièges, républicains ${r} ; il en faut ${maj} pour la majorité.` },
      en: { title: 'U.S. House: November 3, 2026 results, district by district — Vote-Scope',
        description: `All 435 districts as the count comes in, from 6 p.m. Eastern on November 3. Our ${day} forecast: Democrats ${d} seats, Republicans ${r}; ${maj} make a majority.` },
      es: { title: 'Cámara de Representantes: resultados del 3 de noviembre de 2026, distrito por distrito — Vote-Scope',
        description: `Los 435 distritos a medida que avanza el recuento, desde las 18:00 (hora del Este) del 3 de noviembre. Nuestra proyección del ${day}: demócratas ${d} escaños, republicanos ${r}; la mayoría es ${maj}.` },
    },
    senate: {
      fr: { title: 'Sénat américain : résultats du 3 novembre 2026, État par État — Vote-Scope',
        description: `Les ${n} courses au Sénat au fil du dépouillement, avec les 65 sièges non renouvelés. Notre projection du ${day} : démocrates ${d} sièges, républicains ${r} ; il en faut ${maj}, ou 50 pour le parti du vice-président, républicain.` },
      en: { title: 'U.S. Senate: November 3, 2026 results, state by state — Vote-Scope',
        description: `All ${n} Senate races as the count comes in, plus the 65 seats not up this year. Our ${day} forecast: Democrats ${d} seats, Republicans ${r}; ${maj} make a majority, or 50 for the vice president’s party, the Republicans.` },
      es: { title: 'Senado de EE. UU.: resultados del 3 de noviembre de 2026, estado por estado — Vote-Scope',
        description: `Las ${n} contiendas al Senado a medida que avanza el recuento, más los 65 escaños sin elección. Nuestra proyección del ${day}: demócratas ${d} escaños, republicanos ${r}; la mayoría es ${maj}, o 50 para el partido del vicepresidente, el republicano.` },
    },
    governor: {
      fr: { title: 'Gouverneurs américains : résultats du 3 novembre 2026, État par État — Vote-Scope',
        description: `Les ${n} courses de gouverneur au fil du dépouillement, avec les 14 postes qui ne sont pas en jeu. Notre projection du ${day} : démocrates ${d} postes sur 50, républicains ${r}.` },
      en: { title: 'U.S. governors: November 3, 2026 results, state by state — Vote-Scope',
        description: `All ${n} governor races as the count comes in, plus the 14 offices not up this year. Our ${day} forecast: Democrats ${d} of 50 governorships, Republicans ${r}.` },
      es: { title: 'Gobernadores de EE. UU.: resultados del 3 de noviembre de 2026, estado por estado — Vote-Scope',
        description: `Las ${n} contiendas a gobernador a medida que avanza el recuento, más los 14 cargos sin elección. Nuestra proyección del ${day}: demócratas ${d} de 50 gobernaciones, republicanos ${r}.` },
    },
  };
  return T[chamber][locale];
}

/**
 * Données structurées de la soirée (schema.org) : une couverture en direct
 * (`LiveBlogPosting`) de l'élection du 3 novembre, posée sur chaque fiche à côté
 * du jeu de données de la projection. Les heures sont celles du direct : premières
 * fermetures à 18 h HNE (23 h UTC, est de l'Indiana et du Kentucky), couverture
 * ouverte jusqu'au 5 au matin.
 * Rien n'y est inventé : titre et description sont ceux de la page.
 */
export function usLiveJsonLd(chamber: Chamber, locale: Locale) {
  const share = usShareMeta(chamber, locale);
  const url = `https://vote-scope.com${PAGE[chamber][locale]}`;
  const election = {
    fr: 'Élections de mi-mandat américaines du 3 novembre 2026',
    en: 'U.S. midterm elections, November 3, 2026',
    es: 'Elecciones intermedias de EE. UU. del 3 de noviembre de 2026',
  }[locale];
  return {
    '@context': 'https://schema.org',
    '@type': 'LiveBlogPosting',
    headline: share.title,
    description: share.description,
    url,
    mainEntityOfPage: url,
    inLanguage: locale,
    datePublished: '2026-11-02T12:00:00Z',
    coverageStartTime: '2026-11-03T23:00:00Z',
    coverageEndTime: '2026-11-05T12:00:00Z',
    author: { '@type': 'Person', name: 'Kim Leclerc', url: 'https://kimleclerc.ca' },
    publisher: { '@type': 'Organization', name: 'Vote-Scope', url: 'https://vote-scope.com' },
    isAccessibleForFree: true,
    about: {
      '@type': 'Event',
      name: election,
      startDate: '2026-11-03',
      endDate: '2026-11-03',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Country', name: { fr: 'États-Unis', en: 'United States', es: 'Estados Unidos' }[locale] },
    },
  };
}

/**
 * Nos trois chiffres de la soirée — Chambre, Sénat, gouverneurs — pour le bloc
 * de partage du bureau US et sa carte sociale (/og/us-midterms/…). Lus dans la
 * projection finale publiée (web_data), jamais recalculés : Chambre en médiane
 * des simulations, comme la tuile du bureau et usShareMeta.
 */
export function usTrio(locale: Locale) {
  type P = { party: string; seats_median?: number; p_majority?: number };
  const dem = (desk: Desk) => (desk as Desk & { parties: P[] }).parties.find((p) => p.party === 'us_dem')!;
  const pc = (p: number) => {
    const n = Math.round(p * 100);
    return locale === 'en' ? `${n}%` : `${n} %`;
  };
  const nf = (n: number) => n.toLocaleString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-CA');
  const h = dem(SOURCES.house), s = dem(SOURCES.senate), g = dem(SOURCES.governor);
  const houseD = Math.round(h.seats_median!);
  const houseR = (SOURCES.house.meta.total_seats ?? 435) - houseD;
  const govD = Math.round(g.seats_median!);
  const meta = SOURCES.house.meta as Desk['meta'] & { run_date: string; n_simulations?: number };
  const sims = nf(meta.n_simulations ?? 0);
  const v = { house: pc(h.p_majority!), senate: pc(s.p_majority!), governor: pc(g.p_majority!), houseD, houseR, govD,
    houseMaj: SOURCES.house.meta.majority_threshold ?? 218, govMaj: SOURCES.governor.meta.majority_threshold ?? 26, sims, runDate: meta.run_date };
  const path = { fr: '/fr/us/', en: '/en/us/', es: '/es/us/' }[locale];
  const T = {
    fr: {
      title: 'Mi-mandat 2026 : nos trois chiffres',
      rows: [
        { label: 'Chambre', value: v.house, line: `Démocrates favoris · médiane de ${houseD} sièges contre ${houseR}` },
        { label: 'Sénat', value: v.senate, line: 'Démocrates favoris pour la majorité' },
        { label: 'Gouverneurs', value: v.governor, line: `Démocrates à ${v.govMaj} postes ou plus · médiane de ${govD} sur 50` },
      ],
      text: `Notre projection finale des mi-mandats américains (${sims} simulations) : Chambre, démocrates favoris à ${v.house} (médiane de ${houseD} sièges contre ${houseR}) ; Sénat, démocrates favoris à ${v.senate} ; gouverneurs, ${v.governor} de chances que les démocrates détiennent au moins ${v.govMaj} des 50 postes. Résultats ce soir dès 18 h, heure de l’Est.`,
      foot: `Projection finale du 3 novembre 2026 · ${sims} simulations`,
    },
    en: {
      title: '2026 midterms: our three numbers',
      rows: [
        { label: 'House', value: v.house, line: `Democrats favoured · median ${houseD} seats to ${houseR}` },
        { label: 'Senate', value: v.senate, line: 'Democrats favoured for the majority' },
        { label: 'Governors', value: v.governor, line: `Democrats at ${v.govMaj}+ governorships · median ${govD} of 50` },
      ],
      text: `Our final forecast for the U.S. midterms (${sims} simulations): House, Democrats favoured at ${v.house} (median ${houseD} seats to ${houseR}); Senate, Democrats favoured at ${v.senate}; governors, a ${v.governor} chance Democrats hold at least ${v.govMaj} of 50 governorships. Results tonight from 6 p.m. Eastern.`,
      foot: `Final forecast, November 3, 2026 · ${sims} simulations`,
    },
    es: {
      title: 'Intermedias 2026: nuestras tres cifras',
      rows: [
        { label: 'Cámara', value: v.house, line: `Demócratas favoritos · mediana de ${houseD} escaños frente a ${houseR}` },
        { label: 'Senado', value: v.senate, line: 'Demócratas favoritos para la mayoría' },
        { label: 'Gobernadores', value: v.governor, line: `Demócratas con ${v.govMaj} gobernaciones o más · mediana de ${govD} de 50` },
      ],
      text: `Nuestra proyección final de las intermedias de EE. UU. (${sims} simulaciones): Cámara, demócratas favoritos con un ${v.house} (mediana de ${houseD} escaños frente a ${houseR}); Senado, demócratas favoritos con un ${v.senate}; gobernadores, un ${v.governor} de probabilidad de que los demócratas tengan al menos ${v.govMaj} de las 50 gobernaciones. Resultados esta noche desde las 18:00, hora del Este.`,
      foot: `Proyección final del 3 de noviembre de 2026 · ${sims} simulaciones`,
    },
  }[locale];
  return { ...T, url: `https://vote-scope.com${path}`, image: `/og/us-midterms/${locale}.png`, runDate: v.runDate };
}
