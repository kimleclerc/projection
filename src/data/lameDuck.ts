import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type LameDuckLocale = 'en' | 'fr' | 'es';

export interface LameDuckMeta {
  generated_at?: string;
  as_of_date?: string;
  president?: string;
  term_start?: string;
  term_end?: string;
  midterm_date?: string;
  days_to_midterms?: number;
  version?: string;
  methodology_url?: string;
}

export interface LameDuckScore {
  score: number;
  label_en?: string;
  label_fr?: string;
  label_es?: string;
  zone_color?: string;
  delta_7d?: number;
  data_quality?: string;
  n_components?: number;
}

export interface LameDuckComponent {
  id: string;
  name_en?: string;
  name_fr?: string;
  name_es?: string;
  weight?: number;
  score?: number;
  raw_value?: unknown;
  raw_label?: string;
  raw_label_fr?: string;
  raw_label_es?: string;
  delta_30d?: number | null;
  trend?: 'up' | 'down' | 'flat' | string;
  data_quality?: string;
  last_updated?: string;
  tooltip_en?: string;
  tooltip_fr?: string;
  tooltip_es?: string;
}

export interface LameDuckZone {
  min: number;
  max: number;
  label_en: string;
  label_fr: string;
  label_es?: string;
  color: string;
  tip_en?: string;
  tip_fr?: string;
  tip_es?: string;
}

export interface LameDuckHistoryPoint {
  date: string;
  ldi?: number | null;
  net_approval?: number | null;
  gb_spread?: number | null;
  umcsent?: number | null;
}

export interface LameDuckPresident {
  name: string;
  term: string;
  party?: 'D' | 'R' | string;
  final_ldi?: number;
  sparkline?: number[];
}

export interface LameDuckMidterms {
  house_dem_prob?: number;
  senate_dem_prob?: number;
  house_seats_dem?: number;
  senate_seats_dem?: number;
  house_majority?: number;
  senate_majority?: number;
}

export interface LameDuckTickerItem {
  tag: string;
  tone?: 'red' | 'blue' | 'duck' | 'neutral';
  text: string;
  time?: string;
  href?: string;
}

export interface LameDuckData {
  meta: LameDuckMeta;
  ldi: LameDuckScore;
  zones: LameDuckZone[];
  components: LameDuckComponent[];
  history: LameDuckHistoryPoint[];
  historical_presidents: LameDuckPresident[];
  midterms: LameDuckMidterms;
  ticker: LameDuckTickerItem[];
  computed: {
    daysToMidterms: number | null;
    asOfLabel: string;
    dataQualityLabel: Record<'en' | 'fr' | 'es', string>;
  };
}

function daysUntil(dateString?: string) {
  if (!dateString) return null;
  const target = new Date(`${dateString}T00:00:00-05:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function asDateLabel(dateString?: string, locale: LameDuckLocale = 'en') {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  const bcp47 = { en: 'en-US', fr: 'fr-CA', es: 'es-ES' }[locale];
  return date.toLocaleDateString(bcp47, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getLameDuckData(locale: LameDuckLocale = 'en'): LameDuckData {
  const rawLameDuck = JSON.parse(
    readFileSync(resolve(process.cwd(), 'web_data/us-lame-duck/latest.json'), 'utf-8'),
  );
  const data = rawLameDuck as Partial<LameDuckData>;
  const meta = data.meta ?? {};
  const ldi = data.ldi ?? { score: 0 };
  const dataQualityIsReal = ldi.data_quality === 'real';

  return {
    meta,
    ldi,
    zones: normalizeZones(data.zones),
    components: data.components ?? [],
    history: data.history ?? [],
    historical_presidents: data.historical_presidents ?? [],
    midterms: data.midterms ?? {},
    ticker: buildTicker(data, locale),
    computed: {
      daysToMidterms: daysUntil(meta.midterm_date),
      asOfLabel: asDateLabel(meta.as_of_date, locale),
      dataQualityLabel: {
        en: dataQualityIsReal ? 'All real data' : 'Mixed data',
        fr: dataQualityIsReal ? 'Données réelles' : 'Données mixtes',
        es: dataQualityIsReal ? 'Datos reales' : 'Datos mixtos',
      },
    },
  };
}

function normalizeZones(zones: LameDuckZone[] | undefined): LameDuckZone[] {
  if (!Array.isArray(zones)) return [];
  return zones.map((zone) => ({
    ...zone,
    color: zone.color ?? 'var(--duck-deep)',
  }));
}

function buildTicker(data: Partial<LameDuckData>, locale: LameDuckLocale = 'en'): LameDuckTickerItem[] {
  if (Array.isArray(data.ticker) && data.ticker.length > 0) return data.ticker;

  const ldi = data.ldi;
  const components = data.components ?? [];
  const midterms = data.midterms ?? {};
  const approval = components.find((component) => component.id === 'net_approval');
  const genericBallot = components.find((component) => component.id === 'generic_ballot');
  const econ = components.find((component) => component.id === 'economic_sentiment');

  // Localised glue strings. raw_label*/score/seats come from the data layer.
  const T = {
    en: {
      ldi: (s: string) => `Lame-Duck Index at ${s}/100`,
      polls: (rl: string) => `Trump net approval ${rl}`,
      house: (seats: string) => `House model: Democrats ${seats} seats`,
      senate: (pct: string) => `Senate control probability ${pct}% Democratic`,
      ballot: (rl: string) => `Generic ballot climate ${rl}`,
      econ: (rl: string) => `Consumer sentiment ${rl}`,
      latest: 'latest', tracker: 'tracker', model: 'model', polls_time: 'polls',
    },
    fr: {
      ldi: (s: string) => `Indice canard boiteux à ${s}/100`,
      polls: (rl: string) => `Approbation nette Trump ${rl}`,
      house: (seats: string) => `Modèle Chambre : Démocrates ${seats} sièges`,
      senate: (pct: string) => `Probabilité contrôle Sénat Démocrate ${pct}%`,
      ballot: (rl: string) => `Baromètre vote générique ${rl}`,
      econ: (rl: string) => `Sentiment économique ${rl}`,
      latest: 'récent', tracker: 'sondages', model: 'modèle', polls_time: 'sondages',
    },
    es: {
      ldi: (s: string) => `Lame-Duck Index en ${s}/100`,
      polls: (rl: string) => `Aprobación neta de Trump ${rl}`,
      house: (seats: string) => `Modelo Cámara: Demócratas ${seats} escaños`,
      senate: (pct: string) => `Probabilidad de control demócrata del Senado ${pct}%`,
      ballot: (rl: string) => `Termómetro de voto genérico ${rl}`,
      econ: (rl: string) => `Sentimiento del consumidor ${rl}`,
      latest: 'reciente', tracker: 'sondeos', model: 'modelo', polls_time: 'sondeos',
    },
  }[locale];

  const pathPrefix = locale === 'fr' ? '/fr/us' : locale === 'es' ? '/es/us' : '/en/us';
  const senateSlug = locale === 'fr' ? 'senat' : 'senate';
  // Use the localised raw_label (raw_label_fr/_es) when available, else the EN one.
  const localizedRaw = (c?: LameDuckComponent | undefined): string => {
    if (!c) return '—';
    if (locale === 'fr') return c.raw_label_fr ?? c.raw_label ?? '—';
    if (locale === 'es') return c.raw_label_es ?? c.raw_label ?? '—';
    return c.raw_label ?? '—';
  };

  return [
    {
      tag: 'LDI',
      tone: 'duck',
      text: T.ldi(ldi?.score?.toFixed(1) ?? '—'),
      time: data.meta?.as_of_date ?? T.latest,
      href: `${pathPrefix}/indexes/lame-duck/`,
    },
    {
      tag: locale === 'es' ? 'SONDEOS' : (locale === 'fr' ? 'SONDAGES' : 'POLLS'),
      tone: 'red',
      text: T.polls(localizedRaw(approval)),
      time: approval?.last_updated ?? T.tracker,
    },
    {
      tag: locale === 'es' ? 'CÁMARA' : (locale === 'fr' ? 'CHAMBRE' : 'HOUSE'),
      tone: 'blue',
      text: T.house(String(midterms.house_seats_dem ?? '—')),
      time: T.model,
      href: `${pathPrefix}/${locale === 'fr' ? 'chambre' : 'house'}/`,
    },
    {
      tag: locale === 'es' ? 'SENADO' : (locale === 'fr' ? 'SÉNAT' : 'SENATE'),
      tone: 'red',
      text: T.senate(((Number(midterms.senate_dem_prob ?? 0) * 100)).toFixed(0)),
      time: T.model,
      href: `${pathPrefix}/${senateSlug}/`,
    },
    {
      tag: locale === 'es' ? 'BOLETA' : 'BALLOT',
      tone: 'neutral',
      text: T.ballot(localizedRaw(genericBallot)),
      time: genericBallot?.last_updated ?? T.polls_time,
    },
    {
      tag: locale === 'es' ? 'ECONOMÍA' : (locale === 'fr' ? 'ÉCONOMIE' : 'ECON'),
      tone: 'duck',
      text: T.econ(localizedRaw(econ)),
      time: econ?.last_updated ?? 'FRED',
    },
  ];
}

export function lameDuckLabel(
  item: { label_en?: string; label_fr?: string; label_es?: string; name_en?: string; name_fr?: string; name_es?: string },
  locale: LameDuckLocale,
) {
  if (locale === 'fr') return item.label_fr ?? item.name_fr ?? item.label_en ?? item.name_en ?? '';
  if (locale === 'es') return item.label_es ?? item.name_es ?? item.label_en ?? item.name_en ?? '';
  return item.label_en ?? item.name_en ?? '';
}
