/**
 * Aggregate hub share-card (og:image), generic across all polls jurisdictions.
 * Built statically → /og/<key>/polls/{lang}.png. Shows the recent Vote-Scope
 * average as a branded, watermarked card. Copy comes from POLLS_HUBS.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getNationalPolls, getPollsMeta, getDisplayPartyCodes } from '../../../../lib/polls-adapter';
import { pollPartyChips } from '../../../../lib/poll-parties';
import { renderPollCard, type CardEntry } from '../../../../lib/og/poll-card';
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
  const copy = cfg.copy[lang];

  const polls = getNationalPolls(key).slice(0, RECENT_N);
  const sum: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  for (const p of polls) {
    for (const [code, v] of Object.entries(p.topline)) {
      if (typeof v !== 'number' || v <= 0) continue;
      sum[code] = (sum[code] ?? 0) + v;
      cnt[code] = (cnt[code] ?? 0) + 1;
    }
  }
  const chips = pollPartyChips(key, getDisplayPartyCodes(key), lang);
  const entries: CardEntry[] = chips
    .filter((c) => cnt[c.code])
    .map((c) => ({ label: c.label, color: c.color, value: sum[c.code] / cnt[c.code] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const LOC: Record<HubLang, string> = { en: 'en-US', fr: 'fr-CA', es: 'es-ES' };
  const iso = meta.latest_field_end ?? meta.run_date;
  const d = new Date(`${iso}T00:00:00Z`);
  const dateStr = Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(LOC[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const footByLang: Record<HubLang, (s: string) => string> = {
    en: (s) => `Latest fieldwork: ${s}`,
    fr: (s) => `Terrain le plus récent : ${s}`,
    es: (s) => `Campo más reciente: ${s}`,
  };

  const png = await renderPollCard({
    eyebrow: copy.ogEyebrow,
    title: copy.ogTitle,
    subtitle: copy.ogSub,
    entries,
    footerLeft: footByLang[lang](dateStr),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
