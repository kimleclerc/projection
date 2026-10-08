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

export function getCanadaGooseData(locale: 'en' | 'fr' | 'es' = 'en'): GooseData {
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
    ticker: buildTicker(raw, locale),
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

function buildTicker(data: Partial<GooseData>, locale: 'en' | 'fr' | 'es' = 'en'): GooseTickerItem[] {
  const cgi = data.cgi;
  const components = data.components ?? [];
  const mandate = data.mandate ?? {};
  const electoral = components.find((c) => c.id === 'electoral_strength');
  const approval = components.find((c) => c.id === 'government_approval');
  const econ = components.find((c) => c.id === 'economic_confidence');
  const score = cgi?.score?.toFixed(1) ?? '—';
  const T = {
    en: {
      tags: ['CGI', 'POLLS', 'SEATS', 'APPROVAL', 'ECON'],
      cgi: `Canada Goose Index at ${score}/100`,
      lead: `Liberal lead ${electoral?.raw_label ?? '—'}`,
      seats: `Federal model: Liberals ${mandate.seats_mean ?? '—'} seats`,
      approval: `Government approval ${approval?.raw_label ?? '—'}`,
      econ: `Nanos confidence ${econ?.raw_label ?? '—'}`,
      latest: 'latest', tracker: 'tracker', model: 'model', polls: 'polls',
    },
    fr: {
      tags: ['BERNACHE', 'SONDAGES', 'SIÈGES', 'APPROBATION', 'ÉCONOMIE'],
      cgi: `Indice Bernache à ${score}/100`,
      lead: `Avance libérale ${electoral?.raw_label ?? '—'}`,
      seats: `Modèle fédéral : libéraux ${mandate.seats_mean ?? '—'} sièges`,
      approval: `Approbation du gouvernement ${approval?.raw_label ?? '—'}`,
      econ: `Confiance Nanos ${econ?.raw_label ?? '—'}`,
      latest: 'récent', tracker: 'sondages', model: 'modèle', polls: 'sondages',
    },
    es: {
      tags: ['CGI', 'ENCUESTAS', 'ESCAÑOS', 'APROBACIÓN', 'ECONOMÍA'],
      cgi: `Canada Goose Index en ${score}/100`,
      lead: `Ventaja liberal ${electoral?.raw_label ?? '—'}`,
      seats: `Modelo federal: liberales ${mandate.seats_mean ?? '—'} escaños`,
      approval: `Aprobación del gobierno ${approval?.raw_label ?? '—'}`,
      econ: `Confianza Nanos ${econ?.raw_label ?? '—'}`,
      latest: 'reciente', tracker: 'encuestas', model: 'modelo', polls: 'encuestas',
    },
  }[locale];

  return [
    { tag: T.tags[0], tone: 'blue', text: T.cgi, time: data.meta?.as_of_date ?? T.latest, href: `/${locale}/canada/indexes/canada-goose/` },
    { tag: T.tags[1], tone: 'blue', text: T.lead, time: electoral?.last_updated ?? T.tracker },
    { tag: T.tags[2], tone: 'blue', text: T.seats, time: T.model, href: `/${locale}/canada/federal/` },
    { tag: T.tags[3], tone: 'neutral', text: T.approval, time: approval?.last_updated ?? T.polls },
    { tag: T.tags[4], tone: 'duck', text: T.econ, time: econ?.last_updated ?? 'Nanos' },
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
