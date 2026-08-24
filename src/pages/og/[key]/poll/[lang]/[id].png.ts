/**
 * Per-poll watermarked share card (build-time, satori → PNG), one per language,
 * generic across every polls jurisdiction that opts in via `hasCards` in
 * POLLS_HUBS (uniformity principle — one endpoint, not one per jurisdiction).
 *
 * Bounded to the most recent national polls (the only ones anyone shares) to
 * keep build time sane — see option-3 decision in the polls vertical memory.
 *
 * Output: /og/<key>/poll/{es,en,fr}/<poll_id>.png
 * Fields shown ("with what we have"): firm, field dates, publication date, n=,
 * population/type, sponsor (when present), topline. Absent fields are omitted.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getRecentNationalPolls, getPollRow, getPollsMeta, getDisplayPartyCodes, RECENT_CARD_N, type PollRow } from '../../../../../lib/polls-adapter';
import { pollPartyChips } from '../../../../../lib/poll-parties';
import { renderPollCard, type CardEntry } from '../../../../../lib/og/poll-card';
import { POLLS_HUBS, type HubLang } from '../../../../../lib/polls-hubs';

type Lang = 'es' | 'en' | 'fr';
const LOCALE: Record<Lang, string> = { es: 'es-ES', en: 'en-US', fr: 'fr-CA' };

// Language-generic labels; the jurisdiction-specific eyebrow comes from
// POLLS_HUBS[key].copy[lang].ogEyebrow so each hub keeps its own wording.
const COPY = {
  es: { field: 'Campo', pub: 'Publicado', by: 'Encargado por', lv: 'votantes probables', rv: 'votantes registrados', a: 'adultos', nonfr: 'solo anglófonos + alófonos · excluye francófonos' },
  en: { field: 'Field', pub: 'Released', by: 'Sponsored by', lv: 'likely voters', rv: 'registered voters', a: 'adults', nonfr: 'anglophones + allophones only · francophones excluded' },
  fr: { field: 'Terrain', pub: 'Publié', by: 'Commandé par', lv: 'électeurs probables', rv: 'électeurs inscrits', a: 'adultes', nonfr: 'anglophones + allophones seulement · francophones exclus' },
} as const;

function fmtLong(iso: string | null | undefined, loc: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
function fmtRange(p: PollRow, loc: string): string {
  const s = p.field_start;
  const e = p.field_end || p.display_date;
  if (!e) return fmtLong(p.release_date, loc);
  if (s && s !== e) {
    const sd = new Date(`${s}T00:00:00Z`).getUTCDate();
    const sameMonth = s.slice(0, 7) === e.slice(0, 7);
    return sameMonth ? `${sd}–${fmtLong(e, loc)}` : `${fmtLong(s, loc)} – ${fmtLong(e, loc)}`;
  }
  return fmtLong(e, loc);
}
function popLabel(pop: string | null | undefined, c: typeof COPY[Lang]): string {
  if (!pop) return '';
  const k = pop.toLowerCase();
  if (k === 'lv') return c.lv;
  if (k === 'rv') return c.rv;
  if (k === 'a' || k === 'adults') return c.a;
  if (k === 'anglophone_allophone_eligible_voters') return c.nonfr;
  return pop.toUpperCase();
}

export const getStaticPaths: GetStaticPaths = () =>
  Object.values(POLLS_HUBS)
    .filter((cfg) => cfg.hasCards)
    .flatMap((cfg) => {
      const recent = getRecentNationalPolls(cfg.webKey, RECENT_CARD_N);
      return (['es', 'en', 'fr'] as Lang[]).flatMap((lang) =>
        recent.map((p) => ({ params: { key: cfg.webKey, lang, id: p.poll_id } })),
      );
    });

export const GET: APIRoute = async ({ params }) => {
  const key = String(params.key);
  const lang = (params.lang as Lang) ?? 'en';
  const loc = LOCALE[lang];
  const c = COPY[lang];
  const cfg = POLLS_HUBS[key];
  const meta = getPollsMeta(key);
  if (!cfg || !cfg.hasCards || !meta) return new Response('Not found', { status: 404 });
  const p = getPollRow(key, String(params.id));
  if (!p) return new Response('Not found', { status: 404 });

  const chips = pollPartyChips(key, getDisplayPartyCodes(key), lang);
  const colorByCode: Record<string, string> = {};
  const labelByCode: Record<string, string> = {};
  const allowed = new Set(chips.map((ch) => ch.code));
  for (const ch of chips) { colorByCode[ch.code] = ch.color; labelByCode[ch.code] = ch.label; }

  const entries: CardEntry[] = Object.entries(p.topline)
    .filter(([code, v]) => typeof v === 'number' && v > 0 && allowed.has(code))
    .sort((a, b) => b[1] - a[1])
    .map(([code, v]) => ({
      label: labelByCode[code] ?? code.toUpperCase(),
      color: colorByCode[code] ?? '#999',
      value: v,
    }));

  const meta2Parts: string[] = [];
  if (p.sample_size && p.sample_size > 0) meta2Parts.push(`n = ${p.sample_size.toLocaleString(loc)}`);
  const pl = popLabel(p.population, c);
  if (pl) meta2Parts.push(pl);
  if (p.client) meta2Parts.push(`${c.by} ${p.client}`);

  const png = await renderPollCard({
    eyebrow: cfg.copy[lang as HubLang].ogEyebrow,
    title: p.firm_name,
    subtitle: `${c.field} : ${fmtRange(p, loc)}`,
    meta2: meta2Parts.join('  ·  '),
    entries,
    footerLeft: p.release_date ? `${c.pub} : ${fmtLong(p.release_date, loc)}` : '',
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
