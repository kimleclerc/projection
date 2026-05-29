/**
 * Hub share-card (og:image) for the US House polls hub, one PNG per language.
 * Built statically → /og/us-house/polls/{es,en,fr}.png. Shows the recent
 * Vote-Scope generic-ballot average as a branded, watermarked card.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getNationalPolls, getPollsMeta } from '../../../../lib/polls-adapter';
import { pollPartyChips } from '../../../../lib/poll-parties';
import { renderPollCard, type CardEntry } from '../../../../lib/og/poll-card';

const WEB_KEY = 'us-house';
const RECENT_N = 15;

const COPY = {
  es: { eyebrow: 'SONDEOS · CÁMARA US', title: 'Voto genérico — Cámara US', sub: 'Promedio Vote-Scope · ciclo 2026', foot: (d: string) => `Campo más reciente: ${d}` },
  en: { eyebrow: 'POLLS · U.S. HOUSE', title: 'Generic Ballot — U.S. House', sub: 'Vote-Scope average · 2026 cycle', foot: (d: string) => `Latest fieldwork: ${d}` },
  fr: { eyebrow: 'SONDAGES · CHAMBRE US', title: 'Vote générique — Chambre US', sub: 'Moyenne Vote-Scope · cycle 2026', foot: (d: string) => `Terrain le plus récent : ${d}` },
} as const;

type Lang = keyof typeof COPY;

export const getStaticPaths: GetStaticPaths = () =>
  (['es', 'en', 'fr'] as Lang[]).map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang as Lang) ?? 'en';
  const meta = getPollsMeta(WEB_KEY)!;
  const polls = getNationalPolls(WEB_KEY).slice(0, RECENT_N);

  // mean topline across the most recent national polls
  const sum: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  for (const p of polls) {
    for (const [code, v] of Object.entries(p.topline)) {
      if (typeof v !== 'number' || v <= 0) continue;
      sum[code] = (sum[code] ?? 0) + v;
      cnt[code] = (cnt[code] ?? 0) + 1;
    }
  }
  const chips = pollPartyChips(WEB_KEY, meta.parties, lang);
  const entries: CardEntry[] = chips
    .filter((c) => cnt[c.code])
    .map((c) => ({ label: c.label, color: c.color, value: sum[c.code] / cnt[c.code] }))
    .sort((a, b) => b.value - a.value);

  const c = COPY[lang];
  const png = await renderPollCard({
    eyebrow: c.eyebrow,
    title: c.title,
    subtitle: c.sub,
    entries,
    footerLeft: c.foot(meta.latest_field_end ?? meta.run_date),
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
