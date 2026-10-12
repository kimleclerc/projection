/**
 * Image de partage d'un tableau de sondages (og:image), au build :
 * /og/<scrutin>/polls/<langue>.png. Moyenne simple des 15 sondages les plus
 * récents, même dessin que l'image d'un sondage (cards.ts → pollCard).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getHubPolls, getPollsMeta, getDisplayPartyCodes } from '../../../../lib/polls-adapter';
import { pollPartyChips } from '../../../../lib/poll-parties';
import { pollCard } from '../../../../lib/share/cards';
import { renderPngServer } from '../../../../lib/share/render-server';
import { voteDayFor } from '../../../../lib/share/poll-payload';
import { longDate } from '../../../../lib/format';
import { POLLS_HUBS, type HubLang } from '../../../../lib/polls-hubs';

const RECENT_N = 15;

export const getStaticPaths: GetStaticPaths = () =>
  Object.values(POLLS_HUBS).flatMap((cfg) =>
    cfg.langs.map((lang) => ({ params: { key: cfg.webKey, lang } })),
  );

export const GET: APIRoute = async ({ params }) => {
  const key = String(params.key);
  const lang = (params.lang as HubLang) ?? 'en';
  const cfg = POLLS_HUBS[key];
  const meta = getPollsMeta(key);
  if (!cfg || !meta) return new Response('Not found', { status: 404 });

  const polls = getHubPolls(key).filter((p) => !p.topline_scope).slice(0, RECENT_N);
  const sum: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  for (const p of polls) {
    for (const [code, v] of Object.entries(p.topline)) {
      if (typeof v !== 'number' || v <= 0) continue;
      sum[code] = (sum[code] ?? 0) + v;
      cnt[code] = (cnt[code] ?? 0) + 1;
    }
  }
  const parties = pollPartyChips(key, getDisplayPartyCodes(key), lang)
    .filter((c) => cnt[c.code])
    .map((c) => ({ label: c.label, color: c.color, v: sum[c.code] / cnt[c.code] }))
    .sort((a, b) => b.v - a.v);

  const n = polls.length;
  const latest = meta.latest_field_end ?? meta.run_date;
  const tree = pollCard('wide', lang, {
    title: cfg.copy[lang].ogTitle,
    firm: ({ fr: `Moyenne des ${n} derniers sondages`, en: `Average of the latest ${n} polls`, es: `Promedio de las ${n} últimas encuestas` })[lang],
    field: ({ fr: `Terrain le plus récent : ${longDate(latest, lang)}`, en: `Most recent fieldwork: ${longDate(latest, lang)}`, es: `Trabajo de campo más reciente: ${longDate(latest, lang)}` })[lang],
    meta: ({ fr: 'Moyenne simple, sans correction', en: 'Simple average, uncorrected', es: 'Promedio simple, sin corrección' })[lang],
    parties,
    foot: ({ fr: `Mis à jour le ${longDate(meta.run_date, lang)}`, en: `Updated ${longDate(meta.run_date, lang)}`, es: `Actualizado el ${longDate(meta.run_date, lang)}` })[lang],
    voteDay: voteDayFor(key, meta.run_date),
    digits: 1,
  });
  const png = await renderPngServer(tree, 'wide');
  return new Response(png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' } });
};
