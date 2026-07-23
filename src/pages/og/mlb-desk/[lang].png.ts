/**
 * Carte og:image du desk MLB 2026 — top 5 des probabilités de Série mondiale
 * en barres (couleurs d'équipe du JSON) + angle Blue Jays en sous-titre,
 * rendue via renderPollCard. Générée au build : chaque partage du desk montre
 * la lecture du run courant (données régénérées chaque nuit).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderPollCard, type CardEntry } from '../../../lib/og/poll-card';
import { teamLabel, type MlbData, type MlbLocale } from '../../../lib/mlb';

const LANGS: MlbLocale[] = ['en', 'fr', 'es'];

export const getStaticPaths: GetStaticPaths = () =>
  LANGS.map((lang) => ({ params: { lang } }));

const COPY: Record<MlbLocale, {
  eyebrow: string;
  title: string;
  jays: (label: string, p: string) => string;
  footer: (sims: string, date: string) => string;
}> = {
  fr: {
    eyebrow: 'MLB 2026 · PROJECTION',
    title: 'La course à la Série mondiale',
    jays: (label, p) => `Focus canadien : ${label} — séries à ${p}`,
    footer: (sims, date) => `${sims} simulations · pythagenpat+log5 · run du ${date}`,
  },
  en: {
    eyebrow: 'MLB 2026 · FORECAST',
    title: 'The World Series race',
    jays: (label, p) => `Canadian focus: ${label} — playoffs at ${p}`,
    footer: (sims, date) => `${sims} simulations · pythagenpat+log5 · run of ${date}`,
  },
  es: {
    eyebrow: 'MLB 2026 · PROYECCIÓN',
    title: 'La carrera por la Serie Mundial',
    jays: (label, p) => `Foco canadiense: ${label} — postemporada al ${p}`,
    footer: (sims, date) => `${sims} simulaciones · pythagenpat+log5 · run del ${date}`,
  },
};

const LOC: Record<MlbLocale, string> = { en: 'en-US', fr: 'fr-CA', es: 'es-ES' };

const fmtPct = (p: number, lang: MlbLocale): string => {
  const s = (p * 100).toFixed(1);
  return lang === 'en' ? `${s}%` : `${s.replace('.', ',')} %`;
};

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang as MlbLocale) ?? 'en';
  const copy = COPY[lang];

  const ROOT = process.cwd();
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'web_data/sports/mlb2026_latest.json'), 'utf-8'),
  ) as MlbData;

  const top5 = [...data.board].sort((a, b) => b.p_ws - a.p_ws).slice(0, 5);
  const entries: CardEntry[] = top5.map((t) => ({
    label: t.code.toUpperCase(),
    color: t.color,
    value: t.p_ws * 100,
    valueText: fmtPct(t.p_ws, lang),
  }));

  const jays = data.board.find((t) => t.code === data.hero.canadian_focus.code);
  const subtitle = jays
    ? copy.jays(teamLabel(jays, lang), fmtPct(jays.p_series, lang))
    : undefined;

  const runDate = new Date(data.board_meta.data_fetched_at).toLocaleDateString(LOC[lang], {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const sims = data.board_meta.sims.toLocaleString(LOC[lang]);

  const png = await renderPollCard({
    eyebrow: copy.eyebrow,
    title: copy.title,
    subtitle,
    entries,
    footerLeft: copy.footer(sims, runDate),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
