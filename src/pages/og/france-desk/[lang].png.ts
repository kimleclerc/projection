/**
 * Carte og:image du desk présidentiel France 2027 — le 1er tour du scénario
 * hero (même sélection éditoriale que la page, via lib/fr-explorer), rendu
 * en barres via renderPollCard. Générée au build : chaque partage du desk
 * (permaliens ?scenario= inclus) montre la projection du run courant.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderPollCard, type CardEntry } from '../../../lib/og/poll-card';
import { toScenarioCard, blocHex, type FrScenario, type Locale } from '../../../lib/fr-pres';
import { pickHeroScenario } from '../../../lib/fr-explorer';

const LANGS: Locale[] = ['en', 'fr', 'es'];

export const getStaticPaths: GetStaticPaths = () =>
  LANGS.map((lang) => ({ params: { lang } }));

const COPY: Record<Locale, {
  eyebrow: string;
  title: string;
  duel: (l: string, ls: string, r: string, rs: string) => string;
  footer: (date: string, n: number) => string;
}> = {
  fr: {
    eyebrow: 'PRÉSIDENTIELLE 2027 · PROJECTION',
    title: 'Premier tour projeté — casting vedette',
    duel: (l, ls, r, rs) => `2d tour projeté : ${l} ${ls} % — ${r} ${rs} %`,
    footer: (date, n) => `Run du ${date} · ${n} sondages agrégés`,
  },
  en: {
    eyebrow: '2027 FRENCH PRESIDENTIAL · PROJECTION',
    title: 'Projected first round — featured lineup',
    duel: (l, ls, r, rs) => `Projected runoff: ${l} ${ls}% — ${r} ${rs}%`,
    footer: (date, n) => `Run of ${date} · ${n} polls aggregated`,
  },
  es: {
    eyebrow: 'PRESIDENCIAL FRANCESA 2027 · PROYECCIÓN',
    title: 'Primera vuelta proyectada — combinación destacada',
    duel: (l, ls, r, rs) => `Segunda vuelta proyectada: ${l} ${ls} % — ${r} ${rs} %`,
    footer: (date, n) => `Run del ${date} · ${n} sondeos agregados`,
  },
};

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang as Locale) ?? 'fr';
  const copy = COPY[lang];

  const ROOT = process.cwd();
  const latest = JSON.parse(fs.readFileSync(path.join(ROOT, 'web_data/france-presidential/latest.json'), 'utf-8'));
  const dataSheets = JSON.parse(fs.readFileSync(path.join(ROOT, 'web_data/france-presidential/data_sheets.json'), 'utf-8'));

  const scenarios = latest.scenarios as FrScenario[];
  const candidates = (dataSheets.candidates ?? []) as any[];
  const { heroScenario } = pickHeroScenario(scenarios, candidates, latest.default_scenario_id);
  const card = toScenarioCard(heroScenario, lang);

  const fmt = (v: number) => (lang === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ','));
  const entries: CardEntry[] = card.qualification.slice(0, 5).map((q) => ({
    label: q.name,
    color: blocHex(q.bloc),
    value: q.mean,
  }));

  const subtitle = card.duel
    ? copy.duel(card.duel.leftName, fmt(card.duel.leftShare), card.duel.rightName, fmt(card.duel.rightShare))
    : card.label;

  const png = await renderPollCard({
    eyebrow: copy.eyebrow,
    title: copy.title,
    subtitle,
    entries,
    footerLeft: copy.footer(latest.meta?.run_date ?? '', latest.meta?.n_first_round_polls ?? 0),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
