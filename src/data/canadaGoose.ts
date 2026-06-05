import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type GooseLocale = 'en' | 'fr' | 'es';

export interface GooseMeta {
  generated_at?: string;
  as_of_date?: string;
  pm?: string;
  mandate_start?: string;
  next_election?: string;
  version?: string;
  methodology_url?: string;
}

export interface GooseScore {
  score: number;
  label_en?: string;
  label_fr?: string;
  label_es?: string;
  zone_color?: string;
  delta_7d?: number | null;
  data_quality?: string;
  n_components?: number;
}

export interface GooseComponent {
  id: string;
  name_en?: string;
  name_fr?: string;
  name_es?: string;
  weight?: number;
  score?: number | null;
  raw_value?: unknown;
  raw_label?: string;
  raw_label_fr?: string;
  raw_label_es?: string;
  delta_30d?: number | null;
  trend?: 'up' | 'down' | 'flat' | string;
  data_quality?: string;
  last_updated?: string | null;
  tooltip_en?: string;
  tooltip_fr?: string;
  tooltip_es?: string;
}

export interface GooseZone {
  min: number;
  max: number;
  label_en: string;
  label_fr: string;
  label_es?: string;
  color: string;
}

export interface GooseHistoryPoint {
  date: string;
  cgi?: number | null;
  lib_lead?: number | null;
  approval_gov?: number | null;
  bncci?: number | null;
}

export interface GooseMandate {
  seats_mean?: number;
  seats_median?: number;
  p_majority?: number;
  vote_mean?: number;
  majority_threshold?: number;
  total_seats?: number;
  current_seats?: number;
  next_election?: string;
}

export interface GooseMarketSignal {
  id: string;
  label_en?: string;
  label_fr?: string;
  embed_url?: string;
  market_url?: string;
  note_en?: string;
  note_fr?: string;
}

export interface GooseTickerItem {
  tag: string;
  tone?: 'red' | 'blue' | 'duck' | 'neutral';
  text: string;
  time?: string;
  href?: string;
}

export interface GooseData {
  meta: GooseMeta;
  cgi: GooseScore;
  zones: GooseZone[];
  components: GooseComponent[];
  history: GooseHistoryPoint[];
  mandate: GooseMandate;
  market_signals: GooseMarketSignal[];
  ticker: GooseTickerItem[];
  computed: {
    daysToElection: number | null;
    asOfLabel: string;
    leadLabel: string;
    dataQualityLabel: Record<GooseLocale, string>;
  };
}

function daysUntil(dateString?: string) {
  if (!dateString) return null;
  const target = new Date(`${dateString}T00:00:00-05:00`);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function asDateLabel(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCanadaGooseData(): GooseData {
  const raw = JSON.parse(
    readFileSync(resolve(process.cwd(), 'web_data/ca-canada-goose/latest.json'), 'utf-8'),
  ) as Partial<GooseData>;

  const meta = raw.meta ?? {};
  const cgi = raw.cgi ?? { score: 0 };
  const components = raw.components ?? [];
  const isReal = cgi.data_quality === 'real';
  const electoral = components.find((c) => c.id === 'electoral_strength');

  return {
    meta,
    cgi,
    zones: Array.isArray(raw.zones) ? raw.zones : [],
    components,
    history: raw.history ?? [],
    mandate: raw.mandate ?? {},
    market_signals: raw.market_signals ?? [],
    ticker: buildTicker(raw),
    computed: {
      daysToElection: daysUntil(meta.next_election),
      asOfLabel: asDateLabel(meta.as_of_date),
      leadLabel: electoral?.raw_label ?? '—',
      dataQualityLabel: {
        en: isReal ? 'All real data' : 'Mixed data',
        fr: isReal ? 'Données réelles' : 'Données mixtes',
        es: isReal ? 'Datos reales' : 'Datos mixtos',
      },
    },
  };
}

function buildTicker(data: Partial<GooseData>): GooseTickerItem[] {
  const cgi = data.cgi;
  const components = data.components ?? [];
  const mandate = data.mandate ?? {};
  const electoral = components.find((c) => c.id === 'electoral_strength');
  const approval = components.find((c) => c.id === 'government_approval');
  const econ = components.find((c) => c.id === 'economic_confidence');

  return [
    {
      tag: 'CGI',
      tone: 'blue',
      text: `Canada Goose Index at ${cgi?.score?.toFixed(1) ?? '—'}/100`,
      time: data.meta?.as_of_date ?? 'latest',
      href: '/en/canada/indexes/canada-goose/',
    },
    {
      tag: 'POLLS',
      tone: 'blue',
      text: `Liberal lead ${electoral?.raw_label ?? '—'}`,
      time: electoral?.last_updated ?? 'tracker',
    },
    {
      tag: 'SEATS',
      tone: 'blue',
      text: `Federal model: Liberals ${mandate.seats_mean ?? '—'} seats`,
      time: 'model',
      href: '/en/canada/federal/',
    },
    {
      tag: 'APPROVAL',
      tone: 'neutral',
      text: `Government approval ${approval?.raw_label ?? '—'}`,
      time: approval?.last_updated ?? 'polls',
    },
    {
      tag: 'ECON',
      tone: 'duck',
      text: `Nanos confidence ${econ?.raw_label ?? '—'}`,
      time: econ?.last_updated ?? 'Nanos',
    },
  ];
}

export function gooseLabel(
  item: { label_en?: string; label_fr?: string; label_es?: string; name_en?: string; name_fr?: string; name_es?: string },
  locale: GooseLocale,
) {
  if (locale === 'fr') return item.label_fr ?? item.name_fr ?? item.label_en ?? item.name_en ?? '';
  if (locale === 'es') return item.label_es ?? item.name_es ?? item.label_en ?? item.name_en ?? '';
  return item.label_en ?? item.name_en ?? '';
}
