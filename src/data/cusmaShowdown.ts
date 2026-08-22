import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type ShowdownLocale = 'en' | 'fr' | 'es';

export interface ShowdownZone {
  min: number;
  max: number;
  label_en: string;
  label_fr: string;
  label_es?: string;
  color: string;
}

export interface ShowdownSide {
  id: 'canada' | 'us';
  name: string;
  index: string;
  index_name_en?: string;
  index_name_fr?: string;
  score?: number;
  ldi?: number;
  strength?: number;
  label_en?: string;
  label_fr?: string;
  delta_7d?: number | null;
  href_en?: string;
  href_fr?: string;
  color?: string;
}

export interface ShowdownContext {
  cad_usd?: { value: number; prev: number; as_of: string; source: string } | null;
  canada_favourability?: { value: number; prev: number; as_of: string; source: string; note_en: string; note_fr: string } | null;
  tariff_market?: {
    id: string;
    label_en?: string;
    label_fr?: string;
    embed_url?: string;
    market_url?: string;
  } | null;
}

export interface ShowdownHistoryPoint {
  date: string;
  gap?: number | null;
  cgi?: number | null;
  trump_strength?: number | null;
}

/* ------------------------------------------------------------------ *
 * Trade-war desk — the editorial layer around the instrument.
 * Engine-generated (cusma_showdown/trade_war_desk.py). Every block is
 * context: none of it feeds the leverage gap.
 * ------------------------------------------------------------------ */

/** A field carrying one string per locale, suffixed `_en` / `_fr` / `_es`. */
export type Localised<Prefix extends string> = {
  [K in `${Prefix}_en` | `${Prefix}_fr` | `${Prefix}_es`]?: string;
};

export interface WarFact extends Localised<'label'>, Localised<'note'> {
  id: string;
  value: string;
  value_en?: string;
  value_es?: string;
  tone?: 'bad' | 'good' | 'neutral';
}

export interface WarQuote extends Localised<'role'>, Localised<'text'>, Localised<'context'> {
  speaker: string;
  side: 'canada' | 'us';
}

export interface WarStatus extends Localised<'headline'>, Localised<'standfirst'> {
  state: string;
  since: string;
  facts: WarFact[];
  sticking_points_en?: string[];
  sticking_points_fr?: string[];
  sticking_points_es?: string[];
  quotes: WarQuote[];
  sources: { label: string; url: string }[];
}

export interface TimelineEntry extends Localised<'title'>, Localised<'body'> {
  date: string;
  tag: string;
}

export interface PollResult extends Localised<'label'> {
  pct: number;
  tone?: string;
}

export interface PollCard
  extends Localised<'question'>, Localised<'headline'>, Localised<'note'> {
  id: string;
  firm: string;
  firm_fr?: string;
  firm_es?: string;
  field_start: string;
  field_end: string;
  n?: number | null;
  moe?: string | null;
  source_url: string;
  results: PollResult[];
}

export interface MarketCard extends Localised<'question'>, Localised<'reading'> {
  id: string;
  venue: 'polymarket' | 'kalshi';
  prob: number;
  slug?: string;
  ticker?: string;
  kind?: 'market' | 'event';
  event_url?: string;
  url?: string;
  volume_usd?: number;
  liquidity_usd?: number;
  open_interest?: number;
  bid?: number | null;
  ask?: number | null;
  closes?: string;
  group?: string;
  featured?: boolean;
  caveat?: boolean;
  thin?: boolean;
}

export interface MarketBoard extends Localised<'note'> {
  as_of: string;
  board: MarketCard[];
  stale: boolean;
  venues: string[];
}

export interface EditorialTake extends Localised<'title'>, Localised<'body'> {
  id: string;
}

export interface Editorial extends Localised<'stance_label'>, Localised<'stance'> {
  byline: string;
  updated: string;
  takes: EditorialTake[];
  watch_en?: string[];
  watch_fr?: string[];
  watch_es?: string[];
}

export interface ShowdownData {
  meta: {
    generated_at?: string;
    as_of_date?: string;
    pm?: string;
    president?: string;
    version?: string;
    methodology_url?: string;
  };
  showdown: {
    gap: number;
    leader: 'canada' | 'us' | 'even';
    label_en?: string;
    label_fr?: string;
    label_es?: string;
    zone_color?: string;
    delta_7d?: number | null;
    data_quality?: string;
  };
  sides: { canada: ShowdownSide; us: ShowdownSide };
  context_signals: ShowdownContext;
  history: ShowdownHistoryPoint[];
  zones: ShowdownZone[];
  war_status: WarStatus | null;
  timeline: TimelineEntry[];
  polls: { canada: PollCard[]; us: PollCard[] };
  markets: MarketBoard | null;
  editorial: Editorial | null;
  computed: {
    asOfLabel: string;
    dataQualityLabel: Record<ShowdownLocale, string>;
  };
}

function asDateLabel(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getCusmaShowdownData(): ShowdownData {
  const raw = JSON.parse(
    readFileSync(resolve(process.cwd(), 'web_data/cusma-showdown/latest.json'), 'utf-8'),
  ) as Partial<ShowdownData>;

  const meta = raw.meta ?? {};
  const showdown = raw.showdown ?? { gap: 0, leader: 'even' as const };
  const isReal = showdown.data_quality === 'real';

  return {
    meta,
    showdown,
    sides: raw.sides ?? ({} as ShowdownData['sides']),
    context_signals: raw.context_signals ?? {},
    history: raw.history ?? [],
    zones: Array.isArray(raw.zones) ? raw.zones : [],
    war_status: raw.war_status ?? null,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    polls: {
      canada: raw.polls?.canada ?? [],
      us: raw.polls?.us ?? [],
    },
    markets: raw.markets ?? null,
    editorial: raw.editorial ?? null,
    computed: {
      asOfLabel: asDateLabel(meta.as_of_date),
      dataQualityLabel: {
        en: isReal ? 'All real data' : 'Mixed data',
        fr: isReal ? 'Données réelles' : 'Données mixtes',
        es: isReal ? 'Datos reales' : 'Datos mixtos',
      },
    },
  };
}

export function showdownLabel(
  item: { label_en?: string; label_fr?: string; label_es?: string },
  locale: ShowdownLocale,
) {
  if (locale === 'fr') return item.label_fr ?? item.label_en ?? '';
  if (locale === 'es') return item.label_es ?? item.label_en ?? '';
  return item.label_en ?? '';
}

/**
 * Reads a `_en` / `_fr` / `_es` triplet off an engine-generated object and
 * falls back to English. The desk blocks are dictionaries, not typed records,
 * so this is the single place the suffix convention is spelled out.
 */
export function pick(item: unknown, field: string, locale: ShowdownLocale): string {
  if (!item || typeof item !== 'object') return '';
  const bag = item as Record<string, unknown>;
  const value = bag[`${field}_${locale}`] ?? bag[`${field}_en`];
  return typeof value === 'string' ? value : '';
}

/** Same, for the `_en` / `_fr` / `_es` string-array fields (watch lists). */
export function pickList(item: unknown, field: string, locale: ShowdownLocale): string[] {
  if (!item || typeof item !== 'object') return [];
  const bag = item as Record<string, unknown>;
  const value = bag[`${field}_${locale}`] ?? bag[`${field}_en`];
  return Array.isArray(value) ? (value as string[]) : [];
}
