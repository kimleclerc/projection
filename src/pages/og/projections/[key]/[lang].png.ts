/** Dynamic social/download cards for the seven ProjectionEngine forecasts. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderPollCard, type CardEntry } from '../../../../lib/og/poll-card';

type Lang = 'en' | 'fr' | 'es';
const LANGS: Lang[] = ['en', 'fr', 'es'];
const KEYS = ['federal', 'ontario', 'quebec', 'us-house', 'us-senate', 'us-governor', 'uk'] as const;
type Key = (typeof KEYS)[number];

export const getStaticPaths: GetStaticPaths = () =>
  KEYS.flatMap((key) => LANGS.map((lang) => ({ params: { key, lang } })));

const TITLES: Record<Key, Record<Lang, string>> = {
  federal: { en: 'Canada federal forecast', fr: 'Projection fédérale · Canada', es: 'Pronóstico federal · Canadá' },
  ontario: { en: 'Ontario election forecast', fr: 'Ontario · Projection électorale', es: 'Ontario · Pronóstico electoral' },
  quebec: { en: 'Quebec 2026 forecast', fr: 'Québec 2026 · Projection', es: 'Quebec 2026 · Pronóstico' },
  'us-house': { en: 'U.S. House forecast', fr: 'Projection · Chambre des États-Unis', es: 'Pronóstico · Cámara de EE. UU.' },
  'us-senate': { en: 'U.S. Senate forecast', fr: 'Projection · Sénat des États-Unis', es: 'Pronóstico · Senado de EE. UU.' },
  'us-governor': { en: 'U.S. governor forecast', fr: 'Projection \u00b7 Gouverneurs am\u00e9ricains', es: 'Pron\u00f3stico \u00b7 Gobernadores de EE. UU.' },
  uk: { en: 'U.K. election forecast', fr: 'Royaume-Uni · Projection', es: 'Reino Unido · Pronóstico' },
};

const PARTY_SHORT: Record<string, Partial<Record<Lang, string>>> = {
  lib: { en: 'Liberal', fr: 'Libéral', es: 'Liberal' },
  con: { en: 'Conservative', fr: 'Conservateur', es: 'Conservador' },
  bq: { en: 'Bloc Québécois', fr: 'Bloc québécois', es: 'Bloque Quebequés' },
  ndp: { en: 'NDP', fr: 'NPD', es: 'NPD' },
  on_pc: { en: 'PC', fr: 'PC', es: 'PC' },
  on_lib: { en: 'Liberal', fr: 'Libéral', es: 'Liberal' },
  on_ndp: { en: 'NDP', fr: 'NPD', es: 'NPD' },
  on_grn: { en: 'Green', fr: 'Vert', es: 'Verde' },
  pq: { en: 'PQ', fr: 'PQ', es: 'PQ' }, plq: { en: 'QLP', fr: 'PLQ', es: 'PLQ' },
  caq: { en: 'CAQ', fr: 'CAQ', es: 'CAQ' }, pcq: { en: 'PCQ', fr: 'PCQ', es: 'PCQ' },
  qs: { en: 'Québec solidaire', fr: 'Québec solidaire', es: 'Québec solidaire' },
  us_dem: { en: 'Democrats', fr: 'Démocrates', es: 'Demócratas' },
  us_rep: { en: 'Republicans', fr: 'Républicains', es: 'Republicanos' },
  uk_ref: { en: 'Reform UK', fr: 'Reform UK', es: 'Reform UK' },
  uk_lab: { en: 'Labour', fr: 'Travaillistes', es: 'Laboristas' },
  uk_con: { en: 'Conservatives', fr: 'Conservateurs', es: 'Conservadores' },
  uk_ld: { en: 'Lib Dem', fr: 'Lib. dém.', es: 'Lib. dem.' },
};

const LABELS = {
  en: { eyebrow: 'VOTE-SCOPE FORECAST', seats: 'seats', majority: 'majority', largest: 'finishes first', polls: 'polls', simulations: 'simulations', threshold: 'majority at', asOf: 'Run' },
  fr: { eyebrow: 'PRÉVISION VOTE-SCOPE', seats: 'sièges', majority: 'majorité', largest: 'finit premier', polls: 'sondages', simulations: 'simulations', threshold: 'majorité à', asOf: 'Mise à jour' },
  es: { eyebrow: 'PRONÓSTICO VOTE-SCOPE', seats: 'escaños', majority: 'mayoría', largest: 'queda primero', polls: 'encuestas', simulations: 'simulaciones', threshold: 'mayoría en', asOf: 'Corte' },
} as const;

const projectedSeats = (party: any) =>
  Math.round(party.seats_projected ?? party.seats_median ?? party.seats_mean ?? 0);

const partyLabel = (party: any, lang: Lang) =>
  PARTY_SHORT[party.party]?.[lang] ?? (lang === 'fr' ? party.label_fr : party.label_en);

export const GET: APIRoute = async ({ params }) => {
  const key = params.key as Key;
  const lang = (params.lang as Lang) ?? 'en';
  const t = LABELS[lang];
  const data = JSON.parse(readFileSync(resolve(process.cwd(), 'web_data', key, 'latest.json'), 'utf8'));
  const parties = [...data.parties]
    .sort((a: any, b: any) => projectedSeats(b) - projectedSeats(a))
    .filter((party: any) => projectedSeats(party) > 0);
  const lead = parties[0];
  const majorityProbability = Number(lead.p_majority ?? 0);
  const firstProbability = Number(lead.p_largest ?? 0);
  const probability = majorityProbability >= 0.01 ? majorityProbability : firstProbability;
  const probabilityLabel = majorityProbability >= 0.01 ? t.majority : t.largest;
  const formatter = new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : lang === 'es' ? 'es-ES' : 'en-CA');

  const entries: CardEntry[] = parties.slice(0, 4).map((party: any) => ({
    label: partyLabel(party, lang),
    color: party.color,
    value: projectedSeats(party),
    valueText: String(projectedSeats(party)),
  }));

  const png = await renderPollCard({
    eyebrow: t.eyebrow,
    title: TITLES[key][lang],
    subtitle: `${partyLabel(lead, lang)} ${projectedSeats(lead)} ${t.seats} · ${Math.round(probability * 100)}% ${probabilityLabel}`,
    meta2: `${formatter.format(data.meta.n_polls ?? 0)} ${t.polls} · ${formatter.format(data.meta.n_simulations ?? 0)} ${t.simulations} · ${t.threshold} ${data.meta.majority_threshold}`,
    entries,
    footerLeft: `${t.asOf} ${data.meta.run_date}`,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
