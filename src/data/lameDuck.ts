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

function asDateLabel(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getLameDuckData(): LameDuckData {
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
    ticker: buildTicker(data),
    computed: {
      daysToMidterms: daysUntil(meta.midterm_date),
      asOfLabel: asDateLabel(meta.as_of_date),
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

function buildTicker(data: Partial<LameDuckData>): LameDuckTickerItem[] {
  if (Array.isArray(data.ticker) && data.ticker.length > 0) return data.ticker;

  const ldi = data.ldi;
  const components = data.components ?? [];
  const midterms = data.midterms ?? {};
  const approval = components.find((component) => component.id === 'net_approval');
  const genericBallot = components.find((component) => component.id === 'generic_ballot');
  const econ = components.find((component) => component.id === 'economic_sentiment');

  return [
    {
      tag: 'LDI',
      tone: 'duck',
      text: `Lame-Duck Index at ${ldi?.score?.toFixed(1) ?? '—'}/100`,
      time: data.meta?.as_of_date ?? 'latest',
      href: '/en/us/indexes/lame-duck/',
    },
    {
      tag: 'POLLS',
      tone: 'red',
      text: `Trump net approval ${approval?.raw_label ?? '—'}`,
      time: approval?.last_updated ?? 'tracker',
    },
    {
      tag: 'HOUSE',
      tone: 'blue',
      text: `House model: Democrats ${midterms.house_seats_dem ?? '—'} seats`,
      time: 'model',
      href: '/en/us/house/',
    },
    {
      tag: 'SENATE',
      tone: 'red',
      text: `Senate control probability ${(Number(midterms.senate_dem_prob ?? 0) * 100).toFixed(0)}% Democratic`,
      time: 'model',
      href: '/en/us/senate/',
    },
    {
      tag: 'BALLOT',
      tone: 'neutral',
      text: `Generic ballot climate ${genericBallot?.raw_label ?? '—'}`,
      time: genericBallot?.last_updated ?? 'polls',
    },
    {
      tag: 'ECON',
      tone: 'duck',
      text: `Consumer sentiment ${econ?.raw_label ?? '—'}`,
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
