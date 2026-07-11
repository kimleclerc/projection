import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type BarrageLocale = 'en' | 'fr' | 'es';

export interface BarrageMeta {
  generated_at?: string;
  as_of_date?: string;
  election_cycle?: string;
  first_round_date?: string;
  runoff_date?: string;
  model_run_date?: string;
  version?: string;
  methodology_url?: string;
}

export interface BarrageScore {
  score: number;
  label_en?: string;
  label_fr?: string;
  label_es?: string;
  zone_color?: string;
  delta_7d?: number | null;
  data_quality?: string;
  n_components?: number;
}

export interface BarrageComponent {
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
  n_polls?: number;
  tooltip_en?: string;
  tooltip_fr?: string;
  tooltip_es?: string;
}

export interface BarrageZone {
  min: number;
  max: number;
  label_en: string;
  label_fr: string;
  label_es?: string;
  color: string;
}

export interface BarrageHistoryPoint {
  date: string;
  bfi?: number | null;
  runoff_share?: number | null;
  p_barrage?: number | null;
  far_right_bloc?: number | null;
}

export interface BarrageDuel {
  scenario_id?: string;
  scenario_label?: string;
  p_duel?: number;
  barrage_id?: string;
  barrage_name?: string;
  far_right_id?: string;
  far_right_name?: string;
  barrage_share_mean?: number;
  barrage_win_prob?: number;
  far_right_win_prob?: number;
}

export interface BarrageRetro {
  cycle: string;
  year: number;
  barrage_candidate: string;
  far_right_candidate: string;
  barrage_share: number;
  margin_pp: number;
  runoff_margin_score: number;
  held: boolean;
}

export interface BarrageTickerItem {
  tag: string;
  tone?: 'red' | 'blue' | 'duck' | 'neutral';
  text: string;
  time?: string;
  href?: string;
}

export interface BarrageData {
  meta: BarrageMeta;
  bfi: BarrageScore;
  zones: BarrageZone[];
  components: BarrageComponent[];
  duel: BarrageDuel;
  retro: BarrageRetro[];
  history: BarrageHistoryPoint[];
  ticker: BarrageTickerItem[];
  computed: {
    daysToFirstRound: number | null;
    asOfLabel: string;
    dataQualityLabel: Record<BarrageLocale, string>;
  };
}

function daysUntil(dateString?: string) {
  if (!dateString) return null;
  const target = new Date(`${dateString}T00:00:00+02:00`);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function asDateLabel(dateString?: string, locale: BarrageLocale = 'en') {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '—';
  const bcp47 = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale];
  return date.toLocaleDateString(bcp47, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getBarrageData(locale: BarrageLocale = 'en'): BarrageData {
  const raw = JSON.parse(
    readFileSync(resolve(process.cwd(), 'web_data/fr-barrage/latest.json'), 'utf-8'),
  ) as Partial<BarrageData>;

  const meta = raw.meta ?? {};
  const bfi = raw.bfi ?? { score: 0 };
  const isReal = bfi.data_quality === 'real';

  return {
    meta,
    bfi,
    zones: Array.isArray(raw.zones) ? raw.zones : [],
    components: raw.components ?? [],
    duel: raw.duel ?? {},
    retro: raw.retro ?? [],
    history: raw.history ?? [],
    ticker: buildTicker(raw, locale),
    computed: {
      daysToFirstRound: daysUntil(meta.first_round_date),
      asOfLabel: asDateLabel(meta.as_of_date, locale),
      dataQualityLabel: {
        en: isReal ? 'All real data' : 'Mixed data',
        fr: isReal ? 'Données réelles' : 'Données mixtes',
        es: isReal ? 'Datos reales' : 'Datos mixtos',
      },
    },
  };
}

function buildTicker(data: Partial<BarrageData>, locale: BarrageLocale = 'en'): BarrageTickerItem[] {
  const bfi = data.bfi;
  const components = data.components ?? [];
  const duel = data.duel ?? {};
  const runoff = components.find((c) => c.id === 'runoff_margin');
  const model = components.find((c) => c.id === 'model_hold');
  const pressure = components.find((c) => c.id === 'far_right_pressure');

  // Virgule décimale fr/es, comme fmtPct1 (src/lib/fr-pres.ts).
  const num = (v: string) => (locale === 'en' ? v : v.replace(/(\d)\.(\d)/g, '$1,$2'));
  // raw_label localisé (raw_label_fr/_es) quand disponible, sinon la version EN.
  const localizedRaw = (c?: BarrageComponent): string => {
    const raw =
      locale === 'fr' ? c?.raw_label_fr ?? c?.raw_label
      : locale === 'es' ? c?.raw_label_es ?? c?.raw_label
      : c?.raw_label;
    return raw ? num(raw) : '—';
  };

  // Chaînes d'habillage localisées. Les valeurs viennent de la couche data.
  const T = {
    en: {
      index: (s: string) => `Barrage Index at ${s}/100`,
      runoff: (rl: string) => `Second-round polls: ${rl}`,
      model: (rl: string) => `${rl} (VoteScope, 20k sims)`,
      duel: (a: string, b: string) => `${a} vs ${b} — most likely runoff`,
      bloc: (v: string) => `Far-right first-round bloc ${v}%`,
      latest: 'latest', polls: 'polls', model_time: 'model', scenario: 'scenario',
    },
    fr: {
      index: (s: string) => `Barrage Index à ${s}/100`,
      runoff: (rl: string) => `Sondages 2e tour : ${rl}`,
      model: (rl: string) => `${rl} (VoteScope, 20 000 sims)`,
      duel: (a: string, b: string) => `${a} vs ${b} — duel le plus probable`,
      bloc: (v: string) => `Bloc extrême droite au 1er tour ${v}%`,
      latest: 'récent', polls: 'sondages', model_time: 'modèle', scenario: 'scénario',
    },
    es: {
      index: (s: string) => `Barrage Index en ${s}/100`,
      runoff: (rl: string) => `Sondeos de 2ª vuelta: ${rl}`,
      model: (rl: string) => `${rl} (VoteScope, 20k sims)`,
      duel: (a: string, b: string) => `${a} vs ${b} — segunda vuelta más probable`,
      bloc: (v: string) => `Bloque de extrema derecha en 1ª vuelta ${v}%`,
      latest: 'reciente', polls: 'sondeos', model_time: 'modelo', scenario: 'escenario',
    },
  }[locale];

  return [
    {
      tag: 'BARRAGE',
      tone: 'blue',
      text: T.index(bfi?.score != null ? num(bfi.score.toFixed(1)) : '—'),
      time: data.meta?.as_of_date ?? T.latest,
      href: `/${locale}/france/indexes/barrage/`,
    },
    {
      tag: locale === 'fr' ? '2E TOUR' : locale === 'es' ? '2ª VUELTA' : 'RUNOFF',
      tone: 'red',
      text: T.runoff(localizedRaw(runoff)),
      time: runoff?.last_updated ?? T.polls,
    },
    {
      tag: locale === 'fr' ? 'MODÈLE' : locale === 'es' ? 'MODELO' : 'MODEL',
      tone: 'neutral',
      text: T.model(localizedRaw(model)),
      time: model?.last_updated ?? T.model_time,
      href: `/${locale}/france/`,
    },
    {
      tag: locale === 'es' ? 'DUELO' : 'DUEL',
      tone: 'red',
      text: T.duel(duel.barrage_name ?? '—', duel.far_right_name ?? '—'),
      time: duel.scenario_label ?? T.scenario,
    },
    {
      tag: locale === 'fr' ? 'T1' : locale === 'es' ? 'V1' : 'R1',
      tone: 'duck',
      text: T.bloc(pressure?.raw_value != null ? num(String(pressure.raw_value)) : '—'),
      time: pressure?.last_updated ?? T.polls,
    },
  ];
}

export function barrageLabel(
  item: { label_en?: string; label_fr?: string; label_es?: string; name_en?: string; name_fr?: string; name_es?: string },
  locale: BarrageLocale,
) {
  if (locale === 'fr') return item.label_fr ?? item.name_fr ?? item.label_en ?? item.name_en ?? '';
  if (locale === 'es') return item.label_es ?? item.name_es ?? item.label_en ?? item.name_en ?? '';
  return item.label_en ?? item.name_en ?? '';
}
