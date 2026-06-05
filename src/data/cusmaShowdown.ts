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
