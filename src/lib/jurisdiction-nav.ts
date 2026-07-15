/**
 * Jurisdiction-nav registry — drives the contextual sub-nav band
 * (components/JurisdictionNav.astro) that lets a reader move LATERALLY between
 * a jurisdiction's sections (projection ↔ polls ↔ districts) and SWITCH
 * jurisdiction from any page, without climbing back up to a geography hub and
 * down again (the wayfinding gap Kim flagged).
 *
 * One entry per jurisdiction = the single source of truth for section URLs.
 * Section URL = `${base[lang]}/${seg[lang]}/`, or `${base[lang]}/` when the
 * segment is empty (the projection landing usually IS the base). All paths are
 * directory-format with a trailing slash, matching the built output.
 *
 * `base[lang]` mirrors POLLS_HUBS (kept in sync by hand — two small registries,
 * no runtime coupling). Adding a jurisdiction = one entry here + one in
 * POLLS_HUBS, and the band lights up across every shared page (uniformity).
 */
export type NavLang = 'en' | 'fr' | 'es';
export type SectionKey = 'projection' | 'polls' | 'districts';

/** Per-language URL segment for a section ('' → the base path itself). */
type Seg = Record<NavLang, string>;

export interface JurisdictionNavEntry {
  webKey: string;                    // matches Jurisdiction.dataPath & POLLS_HUBS key
  langs: NavLang[];
  group: Record<NavLang, string>;    // 'United States' / 'Canada' / 'United Kingdom'
  label: Record<NavLang, string>;    // short chamber label: 'House', 'Quebec', …
  base: Record<NavLang, string>;
  /** Sections this jurisdiction actually ships. Order here = tab order. */
  sections: Partial<Record<SectionKey, {
    seg: Seg;
    /** Tab label. Projection/polls fall back to SECTION_LABEL; districts vary. */
    label?: Record<NavLang, string>;
  }>>;
}

const SEG_POLLS: Seg = { en: 'polls', fr: 'sondages', es: 'sondeos' };
const SEG_NONE: Seg = { en: '', fr: '', es: '' };
const SEG_RIDINGS: Seg = { en: 'ridings', fr: 'circonscriptions', es: 'distritos' };
const LABEL_RIDINGS = { en: 'Ridings', fr: 'Circonscriptions', es: 'Distritos' };

/** Generic labels for sections whose wording doesn't vary by jurisdiction. */
export const SECTION_LABEL: Record<'projection' | 'polls', Record<NavLang, string>> = {
  projection: { en: 'Forecast', fr: 'Prévision', es: 'Pronóstico' },
  polls: { en: 'Polls', fr: 'Sondages', es: 'Sondeos' },
};

const GROUP_US = { en: 'United States', fr: 'États-Unis', es: 'EE. UU.' };
const GROUP_CA = { en: 'Canada', fr: 'Canada', es: 'Canadá' };
const GROUP_UK = { en: 'United Kingdom', fr: 'Royaume-Uni', es: 'Reino Unido' };
const GROUP_FR = { en: 'France', fr: 'France', es: 'Francia' };

/** Ordered — also drives the jurisdiction switcher list order. */
export const JURISDICTION_NAV: JurisdictionNavEntry[] = [
  {
    webKey: 'us-house', langs: ['en', 'fr', 'es'], group: GROUP_US,
    label: { en: 'House', fr: 'Chambre', es: 'Cámara' },
    base: { en: '/en/us/house', fr: '/fr/us/chambre', es: '/es/us/house' },
    sections: {
      projection: { seg: SEG_NONE },
      polls: { seg: SEG_POLLS },
      districts: { seg: { en: 'districts', fr: 'districts', es: 'distritos' },
        label: { en: 'Districts', fr: 'Districts', es: 'Distritos' } },
    },
  },
  {
    webKey: 'us-senate', langs: ['en', 'fr', 'es'], group: GROUP_US,
    label: { en: 'Senate', fr: 'Sénat', es: 'Senado' },
    base: { en: '/en/us/senate', fr: '/fr/us/senat', es: '/es/us/senate' },
    sections: {
      projection: { seg: SEG_NONE },
      polls: { seg: SEG_POLLS },
      districts: { seg: { en: 'seats', fr: 'sieges', es: 'escanos' },
        label: { en: 'Seats', fr: 'Sièges', es: 'Escaños' } },
    },
  },
  {
    webKey: 'federal', langs: ['en', 'fr', 'es'], group: GROUP_CA,
    label: { en: 'Federal', fr: 'Fédéral', es: 'Federal' },
    base: { en: '/en/canada/federal', fr: '/fr/canada/federal', es: '/es/canada/federal' },
    sections: {
      projection: { seg: SEG_NONE },
      polls: { seg: SEG_POLLS },
      districts: { seg: SEG_RIDINGS, label: LABEL_RIDINGS },
    },
  },
  {
    webKey: 'quebec', langs: ['en', 'fr', 'es'], group: GROUP_CA,
    label: { en: 'Quebec', fr: 'Québec', es: 'Quebec' },
    base: { en: '/en/canada/quebec', fr: '/fr/canada/quebec', es: '/es/canada/quebec' },
    sections: {
      projection: { seg: SEG_NONE },
      polls: { seg: SEG_POLLS },
      districts: { seg: SEG_RIDINGS, label: LABEL_RIDINGS },
    },
  },
  {
    webKey: 'ontario', langs: ['en', 'fr', 'es'], group: GROUP_CA,
    label: { en: 'Ontario', fr: 'Ontario', es: 'Ontario' },
    base: { en: '/en/canada/ontario', fr: '/fr/canada/ontario', es: '/es/canada/ontario' },
    sections: {
      projection: { seg: SEG_NONE },
      polls: { seg: SEG_POLLS },
      districts: { seg: SEG_RIDINGS, label: LABEL_RIDINGS },
    },
  },
  {
    webKey: 'uk', langs: ['en', 'fr', 'es'], group: GROUP_UK,
    label: { en: 'United Kingdom', fr: 'Royaume-Uni', es: 'Reino Unido' },
    base: { en: '/en/uk', fr: '/fr/uk', es: '/es/uk' },
    sections: {
      // UK projection landing is /uk/general-election/, not the geography hub /uk/.
      projection: { seg: { en: 'general-election', fr: 'general-election', es: 'general-election' } },
      polls: { seg: SEG_POLLS },
      districts: { seg: { en: 'constituencies', fr: 'circonscriptions', es: 'circunscripciones' },
        label: { en: 'Constituencies', fr: 'Circonscriptions', es: 'Circunscripciones' } },
    },
  },
  {
    // Présidentielle française — modèle par scénarios (pas de projection par
    // sièges), d'où l'onglet « Cartes » (résultats 2022) au lieu de districts.
    // L'onglet « Sondages » s'ajoute avec la page de compilation dédiée.
    webKey: 'france', langs: ['en', 'fr', 'es'], group: GROUP_FR,
    label: { en: 'Presidential', fr: 'Présidentielle', es: 'Presidencial' },
    base: { en: '/en/france', fr: '/fr/france', es: '/es/france' },
    sections: {
      projection: { seg: SEG_NONE },
      polls: { seg: SEG_POLLS },
      districts: {
        seg: { en: 'presidential/maps', fr: 'presidentielle/cartes', es: 'presidencial/mapas' },
        label: { en: 'Maps', fr: 'Cartes', es: 'Mapas' },
      },
    },
  },
  {
    webKey: 'france-legislative', langs: ['en', 'fr', 'es'], group: GROUP_FR,
    label: { en: 'Legislative', fr: 'Législatives', es: 'Legislativas' },
    base: {
      en: '/en/france/legislative-election',
      fr: '/fr/france/legislatives',
      es: '/es/france/legislativas',
    },
    sections: {
      projection: { seg: SEG_NONE },
      districts: {
        seg: { en: 'constituencies', fr: 'circonscriptions', es: 'circunscripciones' },
        label: { en: 'Constituencies', fr: 'Circonscriptions', es: 'Circunscripciones' },
      },
    },
  },
];

const BY_KEY: Record<string, JurisdictionNavEntry> = Object.fromEntries(
  JURISDICTION_NAV.map((e) => [e.webKey, e]),
);

/** RidingData.jurisdiction → registry webKey (only 'federal-ca' diverges). */
const RIDING_JURISDICTION_TO_KEY: Record<string, string> = {
  'federal-ca': 'federal',
  quebec: 'quebec',
  ontario: 'ontario',
  'us-house': 'us-house',
  'us-senate': 'us-senate',
  uk: 'uk',
};

export function getNavEntry(webKey: string): JurisdictionNavEntry | undefined {
  return BY_KEY[webKey];
}

export function getNavEntryForRiding(jurisdiction: string): JurisdictionNavEntry | undefined {
  return BY_KEY[RIDING_JURISDICTION_TO_KEY[jurisdiction] ?? jurisdiction];
}

/** Section URL for an entry+lang (trailing slash; '' segment → the base). */
export function sectionUrl(entry: JurisdictionNavEntry, section: SectionKey, lang: NavLang): string {
  const def = entry.sections[section];
  if (!def) return `${entry.base[lang]}/`;
  const seg = def.seg[lang];
  return seg ? `${entry.base[lang]}/${seg}/` : `${entry.base[lang]}/`;
}

/** Tab label for a section (per-jurisdiction districts label, else generic). */
export function sectionLabel(entry: JurisdictionNavEntry, section: SectionKey, lang: NavLang): string {
  const def = entry.sections[section];
  if (def?.label) return def.label[lang];
  if (section === 'projection' || section === 'polls') return SECTION_LABEL[section][lang];
  return section;
}

/**
 * Where the switcher should send a reader who is currently on `active` and
 * picks `target`: same section if the target ships it, else its projection.
 */
export function switchUrl(target: JurisdictionNavEntry, active: SectionKey, lang: NavLang): string {
  const section: SectionKey = target.sections[active] ? active : 'projection';
  return sectionUrl(target, section, lang);
}
