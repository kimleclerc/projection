/**
 * Desk-sections registry — the single source of truth for "what lives in this
 * desk", used by components/DeskSections.astro on every geography hub AND on
 * the home page.
 *
 * Why this exists. The deep pages (projection / polls / ridings) already share
 * a uniform sub-nav driven by lib/jurisdiction-nav.ts. The HUBS did not: each
 * of /us/, /canada/, /uk/, /france/, /indexes/ and /sports/ had grown its own
 * hand-written editorial sections, so a reader landing on a desk had no
 * consistent way to see everything it ships — and half the properties
 * (primaries, Latino radar, by-elections, candidate barometer, the indices)
 * were reachable only from the global header or from another page's body.
 *
 * Two registries, one principle. jurisdiction-nav owns the *sections of a
 * jurisdiction* (forecast ↔ polls ↔ districts). This file owns the *contents
 * of a desk* — the jurisdictions themselves plus everything that is not a
 * jurisdiction (indices, by-election desks, sport models, budget). It REUSES
 * jurisdiction-nav for every URL it can, via `fromJurisdiction`, so a route
 * change stays a one-line edit there.
 *
 * Adding a property = one entry here, and it appears on its desk, on the home
 * directory, and in all three languages at once.
 */
import {
  getNavEntry, sectionUrl, sectionLabel,
  type NavLang, type SectionKey,
} from './jurisdiction-nav';

export type { NavLang };

type L10n = Record<NavLang, string>;

/** A link inside a property card (its sections). */
export interface DeskLink {
  label: L10n;
  href: L10n;
  /** Languages that actually ship this page. Omitted = all three. */
  langs?: NavLang[];
}

/** One product inside a desk: a jurisdiction, an index, a race desk… */
export interface DeskItem {
  id: string;
  label: L10n;
  /** One line saying what question it answers. */
  blurb: L10n;
  href: L10n;
  /** Lateral links (forecast / polls / districts…). */
  links?: DeskLink[];
  langs?: NavLang[];
}

export interface DeskGroup {
  id: 'us' | 'canada' | 'uk' | 'france' | 'indexes' | 'sports';
  label: L10n;
  hub: L10n;
  items: DeskItem[];
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const l10n = (en: string, fr: string, es: string): L10n => ({ en, fr, es });

/** Same path under each language prefix (used for routes that don't localise). */
const samePath = (path: string): L10n => ({
  en: `/en${path}`, fr: `/fr${path}`, es: `/es${path}`,
});

/** Per-language paths, given without the leading /xx language prefix. */
const perLang = (en: string, fr: string, es: string): L10n => ({
  en: `/en${en}`, fr: `/fr${fr}`, es: `/es${es}`,
});

/**
 * Build a desk item from a jurisdiction-nav entry: its projection page becomes
 * the item href, and its sections become the lateral links. Keeps every
 * jurisdiction URL single-sourced in jurisdiction-nav.ts.
 */
function fromJurisdiction(
  webKey: string,
  blurb: L10n,
  opts: { label?: L10n; sections?: SectionKey[] } = {},
): DeskItem {
  const entry = getNavEntry(webKey);
  if (!entry) throw new Error(`desk-sections: unknown jurisdiction "${webKey}"`);

  const langs: NavLang[] = ['en', 'fr', 'es'];
  const url = (s: SectionKey): L10n =>
    Object.fromEntries(langs.map((l) => [l, sectionUrl(entry, s, l)])) as L10n;
  const lbl = (s: SectionKey): L10n =>
    Object.fromEntries(langs.map((l) => [l, sectionLabel(entry, s, l)])) as L10n;

  const wanted = opts.sections ?? (['polls', 'districts'] as SectionKey[]);
  const links = wanted
    .filter((s) => entry.sections[s])
    .map((s) => ({ label: lbl(s), href: url(s) }));

  return {
    id: webKey,
    label: opts.label ?? (entry.label as L10n),
    blurb,
    href: url('projection'),
    links: links.length ? links : undefined,
  };
}

/* ── The desks ───────────────────────────────────────────────────────────── */

export const DESKS: DeskGroup[] = [
  {
    id: 'us',
    label: l10n('United States', 'États-Unis', 'EE. UU.'),
    hub: samePath('/us/'),
    items: [
      fromJurisdiction('us-president', l10n(
        'Electoral college, 270 to win, and the invisible primary in both parties.',
        'Collège électoral, 270 pour gagner, et la primaire invisible dans les deux partis.',
        'Colegio electoral, 270 para ganar y la primaria invisible en ambos partidos.',
      )),
      fromJurisdiction('us-house', l10n(
        'All 435 districts, redistricting included, through the 2026 midterms.',
        'Les 435 districts, redécoupage compris, jusqu’aux midterms de 2026.',
        'Los 435 distritos, con la redistribución, hasta las midterms de 2026.',
      )),
      fromJurisdiction('us-senate', l10n(
        'The seats up in 2026 and the arithmetic of control.',
        'Les sièges en jeu en 2026 et l’arithmétique du contrôle.',
        'Los escaños en juego en 2026 y la aritmética del control.',
      )),
      {
        id: 'us-primaries',
        label: l10n('Primaries', 'Primaires', 'Primarias'),
        blurb: l10n(
          'Live calls and county results across the 2026 primary calendar.',
          'Appels en direct et résultats par comté du calendrier primaire 2026.',
          'Proyecciones en vivo y resultados por condado del calendario primario 2026.',
        ),
        href: perLang('/us/primaries/', '/us/primaires/', '/us/primarias/'),
      },
      {
        id: 'us-latino',
        label: l10n('Latino Radar', 'Radar Latino', 'Radar Latino'),
        blurb: l10n(
          'Where the Latino vote is moving, district by district.',
          'Où bouge le vote latino, district par district.',
          'Hacia dónde se mueve el voto latino, distrito a distrito.',
        ),
        href: perLang('/us/latino-radar/', '/us/radar-latino/', '/us/radar-latino/'),
      },
      {
        id: 'us-lame-duck',
        label: l10n('Lame-Duck Index', 'Indice Lame-Duck', 'Índice Lame-Duck'),
        blurb: l10n(
          'How much presidential weight is left before the midterms.',
          'Ce qu’il reste de poids présidentiel avant les midterms.',
          'Cuánto peso presidencial queda antes de las midterms.',
        ),
        href: samePath('/us/indexes/lame-duck/'),
      },
    ],
  },
  {
    id: 'canada',
    label: l10n('Canada', 'Canada', 'Canadá'),
    hub: samePath('/canada/'),
    items: [
      fromJurisdiction('federal', l10n(
        '343 ridings, seat pressure, and the 45th Parliament as it stands.',
        '343 circonscriptions, pression en sièges, et la 45e législature telle qu’elle est.',
        '343 distritos, presión de escaños y la 45.ª legislatura tal como está.',
      )),
      fromJurisdiction('quebec', l10n(
        'The October 2026 general election on the new 127-seat map.',
        'La générale d’octobre 2026 sur la nouvelle carte à 127 sièges.',
        'Las generales de octubre de 2026 en el nuevo mapa de 127 escaños.',
      )),
      fromJurisdiction('ontario', l10n(
        'Queen’s Park after 2025, riding by riding.',
        'Queen’s Park après 2025, circonscription par circonscription.',
        'Queen’s Park después de 2025, distrito a distrito.',
      )),
      {
        id: 'ca-byelections',
        label: l10n('Federal by-elections', 'Partielles fédérales', 'Elecciones parciales federales'),
        blurb: l10n(
          'Every pending seat: personal vote stripped, turnout residual applied.',
          'Chaque siège en attente : vote personnel retiré, résidu de participation appliqué.',
          'Cada escaño pendiente: voto personal retirado, residuo de participación aplicado.',
        ),
        href: samePath('/canada/byelections/'),
      },
      {
        id: 'on-byelections',
        label: l10n('Ontario by-elections', 'Partielles ontariennes', 'Parciales de Ontario'),
        blurb: l10n(
          'Provincial by-elections, modelled on their own local terrain.',
          'Les partielles provinciales, modélisées sur leur terrain local.',
          'Las parciales provinciales, modeladas sobre su propio terreno local.',
        ),
        href: samePath('/canada/ontario/byelections/'),
      },
      {
        id: 'qc-barometer',
        label: l10n('Quebec candidate barometer', 'Baromètre des candidatures QC', 'Barómetro de candidaturas QC'),
        blurb: l10n(
          'Who is running where, and what the declared field says about access.',
          'Qui se présente où, et ce que le champ déclaré dit de l’accès.',
          'Quién se presenta dónde y qué dice el campo declarado sobre el acceso.',
        ),
        href: perLang(
          '/canada/quebec/candidate-barometer/',
          '/canada/quebec/barometre-candidatures/',
          '/canada/quebec/barometro-candidaturas/',
        ),
      },
      {
        id: 'ca-goose',
        label: l10n('Canada Goose Index', 'Indice Bernache', 'Índice Barnacla'),
        blurb: l10n(
          'The prime minister’s standing, on one scale you can follow over time.',
          'Le poids du premier ministre, sur une échelle suivie dans le temps.',
          'El peso del primer ministro, en una escala que se sigue en el tiempo.',
        ),
        href: samePath('/canada/indexes/canada-goose/'),
      },
    ],
  },
  {
    id: 'uk',
    label: l10n('United Kingdom', 'Royaume-Uni', 'Reino Unido'),
    hub: samePath('/uk/'),
    items: [
      fromJurisdiction('uk', l10n(
        '650 constituencies calibrated against the published MRPs.',
        '650 circonscriptions calibrées sur les MRP publiés.',
        '650 circunscripciones calibradas con los MRP publicados.',
      ), { label: l10n('General election', 'Élection générale', 'Elecciones generales') }),
      {
        id: 'uk-clacton',
        label: l10n('Clacton by-election', 'Partielle de Clacton', 'Parcial de Clacton'),
        blurb: l10n(
          'Farage against a record 34-candidate field — 13 August.',
          'Farage face à un champ record de 34 candidats — le 13 août.',
          'Farage ante un campo récord de 34 candidatos — el 13 de agosto.',
        ),
        href: samePath('/uk/byelections/clacton/'),
      },
    ],
  },
  {
    id: 'france',
    label: l10n('France', 'France', 'Francia'),
    hub: samePath('/france/'),
    items: [
      fromJurisdiction('france', l10n(
        'Who reaches the runoff in 2027, and who wins it.',
        'Qui atteint le second tour en 2027, et qui le gagne.',
        'Quién llega a la segunda vuelta en 2027 y quién la gana.',
      )),
      fromJurisdiction('france-legislative', l10n(
        '577 constituencies, calibrated withdrawals, and the presidential bridge.',
        '577 circonscriptions, désistements calibrés, et le pont présidentiel.',
        '577 circunscripciones, retiradas calibradas y el puente presidencial.',
      )),
      {
        id: 'fr-candidates',
        label: l10n('Declared field', 'Candidatures', 'Candidaturas'),
        blurb: l10n(
          'Every declared, probable and withdrawn candidate for 2027.',
          'Chaque candidature déclarée, probable ou retirée pour 2027.',
          'Cada candidatura declarada, probable o retirada para 2027.',
        ),
        href: perLang('/france/candidates/', '/france/candidats/', '/france/candidatos/'),
      },
      {
        id: 'fr-barrage',
        label: l10n('Barrage Index', 'Indice Barrage', 'Índice Barrage'),
        blurb: l10n(
          'How solid the firewall against the far right still is.',
          'Ce qui reste de solidité au barrage contre l’extrême droite.',
          'Qué solidez le queda al cortafuegos contra la extrema derecha.',
        ),
        href: samePath('/france/indexes/barrage/'),
      },
    ],
  },
  {
    id: 'indexes',
    label: l10n('Indices', 'Indices', 'Índices'),
    hub: samePath('/indexes/'),
    items: [
      {
        id: 'idx-all',
        label: l10n('All instruments', 'Tous les instruments', 'Todos los instrumentos'),
        blurb: l10n(
          'Every proprietary index in one filterable shelf.',
          'Tous les indices propriétaires sur une seule étagère filtrable.',
          'Todos los índices propios en un solo estante filtrable.',
        ),
        href: samePath('/indexes/'),
      },
      {
        id: 'idx-cusma',
        label: l10n('CUSMA Showdown', 'Duel ACEUM', 'Duelo T-MEC'),
        blurb: l10n(
          'Canada Goose against Lame-Duck: who blinks first on trade.',
          'Bernache contre Canard boiteux : qui cède le premier sur le commerce.',
          'Barnacla contra Lame-Duck: quién cede primero en comercio.',
        ),
        href: samePath('/indexes/cusma-showdown/'),
      },
      {
        id: 'idx-fraser',
        label: l10n('Fraser Interim Index', 'Indice Fraser', 'Índice Fraser'),
        blurb: l10n(
          'How an interim leader is holding the Ontario Liberals together.',
          'Comment un chef par intérim tient les libéraux ontariens.',
          'Cómo un líder interino mantiene unidos a los liberales de Ontario.',
        ),
        href: samePath('/indexes/fraser-interim/'),
        langs: ['en', 'fr'],
      },
      {
        id: 'idx-budget',
        label: l10n('Budget desk', 'Desk Budget', 'Mesa de Presupuesto'),
        blurb: l10n(
          'Fiscal analysis, one page per budget edition.',
          'Analyse fiscale, une page par édition budgétaire.',
          'Análisis fiscal, una página por edición presupuestaria.',
        ),
        href: samePath('/budget/'),
      },
    ],
  },
  {
    id: 'sports',
    label: l10n('Sports', 'Sports', 'Deportes'),
    hub: samePath('/sports/'),
    items: [
      {
        id: 'sp-mlb',
        label: l10n('MLB 2026', 'MLB 2026', 'MLB 2026'),
        blurb: l10n(
          'The World Series race, rerun nightly.',
          'La course à la Série mondiale, relancée chaque nuit.',
          'La carrera por la Serie Mundial, recalculada cada noche.',
        ),
        href: samePath('/sports/mlb/'),
      },
      {
        id: 'sp-nhl',
        label: l10n('NHL', 'LNH', 'NHL'),
        blurb: l10n(
          'Playoff paths and goalie volatility, season by season.',
          'Chemins vers les séries et volatilité des gardiens, saison par saison.',
          'Caminos a los playoffs y volatilidad de porteros, temporada a temporada.',
        ),
        href: samePath('/sports/nhl/'),
      },
      {
        id: 'sp-wc',
        label: l10n('World Cup 2026', 'Coupe du monde 2026', 'Mundial 2026'),
        blurb: l10n(
          'Archive: what the model saw before Spain lifted the trophy.',
          'Archive : ce que le modèle voyait avant le sacre de l’Espagne.',
          'Archivo: lo que veía el modelo antes del título de España.',
        ),
        href: samePath('/sports/wc2026/'),
      },
      {
        id: 'sp-record',
        label: l10n('Sports track record', 'Bilan sportif', 'Historial deportivo'),
        blurb: l10n(
          'Every sports call the model made, scored after the fact.',
          'Chaque appel sportif du modèle, noté après coup.',
          'Cada pronóstico deportivo del modelo, evaluado a posteriori.',
        ),
        href: samePath('/sports/track-record/'),
      },
    ],
  },
];

const BY_ID: Record<string, DeskGroup> = Object.fromEntries(
  DESKS.map((d) => [d.id, d]),
);

export function getDesk(id: DeskGroup['id']): DeskGroup | undefined {
  return BY_ID[id];
}

/** Items a given language actually ships (drops pages that don't exist yet). */
export function deskItems(desk: DeskGroup, lang: NavLang): DeskItem[] {
  return desk.items.filter((i) => !i.langs || i.langs.includes(lang));
}

/** Links of an item a given language actually ships. */
export function itemLinks(item: DeskItem, lang: NavLang): DeskLink[] {
  return (item.links ?? []).filter((l) => !l.langs || l.langs.includes(lang));
}
