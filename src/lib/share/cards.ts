/**
 * Images de partage générées à la volée : un « clip » du module tel qu'il est sur
 * le site (carte, projection, graphique des sondages), comme chez 270toWin ou
 * Polymarket. Pas de titre-affiche : la matière d'abord, le symbole en petit.
 *
 * Fonctions pures qui rendent un arbre satori. Aucune dépendance Node : la même
 * source sert la fonction Cloudflare (functions/og/live) et les essais locaux.
 * Deux formats : paysage 1200 x 630 (X, Facebook, aperçus de liens) et carré
 * 1080 x 1080 (Instagram, téléphones).
 */
import { PARTY_ES } from '../party-names';
import { SHARE_ELECTIONS, type Lang } from './elections';
import { simulateRidings, decodeState, partyLabel as simPartyLabel, regionLabel, type SimDoc } from '../mini-sim';

export type Format = 'wide' | 'square';
export type Node = { type: string; props: Record<string, unknown> };
export const SIZE: Record<Format, { w: number; h: number }> = { wide: { w: 1200, h: 630 }, square: { w: 1080, h: 1080 } };

const INK = '#111111';
const INK_2 = '#3b3b3b';
const INK_3 = '#666666';
const RULE = '#d6d6d6';
const PAPER = '#ffffff';
const PAPER_2 = '#f4f4f4';
const SERRE = '#cdb98a';
const VIDE = '#d9d9d9';

export const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});
const img = (src: string, width: number, height: number, style: Record<string, unknown> = {}): Node =>
  ({ type: 'img', props: { src, width, height, style } });
const b64 = (s: string) => {
  // btoa n'accepte que du Latin-1 : on encode d'abord en UTF-8.
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const svgUri = (svg: string) => `data:image/svg+xml;base64,${b64(svg)}`;
const BRAND = svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><path d="M22 2 A20 20 0 0 0 22 42 Z" fill="#1f77d0"/><path d="M22 2 A20 20 0 0 1 22 42 Z" fill="#c62828"/><path d="M13 13 L31 31 M31 13 L13 31" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></svg>');

/** Couleur d'un parti mêlée de blanc (mêmes nuances que les tuiles du site). */
export const tint = (hex: string, a: number) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `#${v.map((x) => Math.round(x * a + 255 * (1 - a)).toString(16).padStart(2, '0')).join('')}`;
};
/** Mêmes seuils que lib/riding-certainty.ts : ≥ 85 % sûr, ≥ 60 % compétitif, sinon serré. */
export const fillFor = (color: string | undefined, p: number | undefined) =>
  !color ? VIDE : p === undefined || p >= 0.85 ? color : p >= 0.6 ? tint(color, 0.52) : SERRE;

const T = {
  fr: { safe: 'Sûr', comp: 'Compétitif', toss: 'Serré', flip: (y: number) => `Change de camp depuis ${y}`, empty: 'Pas d’élection', majority: (n: number) => `${n} pour la majorité`, chances: 'Chances de majorité', seats: 'Sièges projetés', range: 'Fourchette', party: 'Parti', asOf: 'Projection du', polls: (n: number | string) => `${n} sondages`, govs: 'Postes de gouverneur projetés', avg: 'Moyenne des sondages', by: 'Par Kim Leclerc', since: 'depuis' },
  en: { safe: 'Safe', comp: 'Competitive', toss: 'Toss-up', flip: (y: number) => `Changes hands since ${y}`, empty: 'No race', majority: (n: number) => `${n} for a majority`, chances: 'Chance of a majority', seats: 'Projected seats', range: 'Range', party: 'Party', asOf: 'Forecast of', polls: (n: number | string) => `${n} polls`, govs: 'Projected governorships', avg: 'Polling average', by: 'By Kim Leclerc', since: 'since' },
  es: { safe: 'Seguro', comp: 'Competitivo', toss: 'Reñido', flip: (y: number) => `Cambia de manos desde ${y}`, empty: 'Sin elección', majority: (n: number) => `${n} para la mayoría`, chances: 'Probabilidad de mayoría', seats: 'Escaños proyectados', range: 'Horquilla', party: 'Partido', asOf: 'Proyección del', polls: (n: number | string) => `${n} encuestas`, govs: 'Gobernaciones proyectadas', avg: 'Promedio de encuestas', by: 'Por Kim Leclerc', since: 'desde' },
};

const nf = (n: number, lang: Lang) => n.toLocaleString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-CA');
const pct = (p: number, lang: Lang) => {
  const v = Math.round(p * 100);
  const s = v >= 100 ? (lang === 'en' ? '>99' : '> 99') : v <= 0 ? (lang === 'en' ? '<1' : '< 1') : String(v);
  // Espace simple : l'espace fine insécable manque à Barlow Condensed (case vide).
  return lang === 'en' ? `${s}%` : `${s} %`;
};
const longDate = (iso: string, lang: Lang) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(
  lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-CA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const partyLabel = (p: { party: string; label_en?: string; label_fr?: string }, lang: Lang) =>
  lang === 'fr' ? (p.label_fr ?? p.label_en ?? p.party) : lang === 'es' ? (PARTY_ES[p.party] ?? p.label_fr ?? p.party) : (p.label_en ?? p.party);

const seatsOf = (p: any) => Math.round(p.seats_projected ?? p.seats_median ?? p.seats_mean ?? 0);

// ------------------------------------------------------------------ cadre commun

/** En-tête (nom du scrutin, date) et pied (symbole, signature, site) : petits. */
function frame(fmt: Format, lang: Lang, title: string, sub: string, body: Node, foot: string): Node {
  const { w, h: H } = SIZE[fmt];
  const pad = fmt === 'wide' ? 34 : 44;
  return h('div', { flexDirection: 'column', width: w, height: H, backgroundColor: PAPER, padding: `${pad - 6}px ${pad}px ${pad - 10}px`, fontFamily: 'Barlow', color: INK },
    h('div', { flexDirection: 'column', borderTop: `6px solid ${INK}`, paddingTop: 12 },
      h('div', { justifyContent: 'space-between', alignItems: 'baseline' },
        h('div', { fontSize: fmt === 'wide' ? 30 : 38, fontWeight: 700, lineHeight: 1.05 }, title),
        h('div', { fontSize: 17, fontWeight: 600, color: INK_3 }, sub))),
    h('div', { flexGrow: 1, flexDirection: 'column', marginTop: 10 }, body),
    h('div', { justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${RULE}`, paddingTop: 10, fontSize: 16, fontWeight: 600, color: INK_3 },
      h('div', {}, foot),
      h('div', { alignItems: 'center', color: INK_2 },
        img(BRAND, 22, 22),
        h('div', { marginLeft: 7, fontWeight: 700, color: INK }, 'Vote-Scope'),
        h('div', { marginLeft: 10 }, `· ${T[lang].by} · vote-scope.com`))));
}

// ------------------------------------------------------------------ barre des sièges

interface Seat { key: string; label: string; color: string; n: number }

/** Décompte par certitude, ligne de majorité — la grammaire de 270toWin. */
function seatBar(lang: Lang, width: number, ridings: { winner: string | null; p?: number }[], parties: any[], majority: number, flipYear: number | string | null, big: boolean, tiers?: [string, string, string]): Node {
  const t = T[lang];
  const total = ridings.length;
  const color: Record<string, string> = Object.fromEntries(parties.map((p) => [p.party, p.color]));
  const label: Record<string, string> = Object.fromEntries(parties.map((p) => [p.party, partyLabel(p, lang)]));
  const c: Record<string, { safe: number; comp: number; toss: number }> = {};
  let toss = 0;
  for (const r of ridings) {
    if (!r.winner) { toss++; continue; }
    const tier = r.p === undefined || r.p >= 0.85 ? 'safe' : r.p >= 0.6 ? 'comp' : 'toss';
    (c[r.winner] ||= { safe: 0, comp: 0, toss: 0 })[tier]++;
    if (tier === 'toss') toss++;
  }
  const seats = (k: string) => (c[k]?.safe ?? 0) + (c[k]?.comp ?? 0) + (c[k]?.toss ?? 0);
  const order = Object.keys(c).filter((k) => seats(k) > 0).sort((a, b) => seats(b) - seats(a));
  const duel = order.length >= 2 && seats(order[0]) + seats(order[1]) >= 0.97 * total;
  const side = (k: string, rev = false): Seat[] => {
    const s = [{ key: `${k}s`, label: '', color: color[k], n: c[k].safe }, { key: `${k}c`, label: '', color: tint(color[k], 0.52), n: c[k].comp }];
    return rev ? s.reverse() : s;
  };
  const segs: Seat[] = duel
    ? [...side(order[0]), { key: 't', label: '', color: SERRE, n: toss }, ...side(order[1], true), ...order.slice(2).flatMap((k) => side(k))]
    : [...order.flatMap((k) => side(k)), { key: 't', label: '', color: SERRE, n: toss }];
  const head = duel ? [order[0], order[1]] : order.slice(0, 4);
  const numSize = big ? 64 : 50;
  const x = (majority / total) * width;
  return h('div', { flexDirection: 'column', width },
    h('div', { justifyContent: duel ? 'space-between' : 'flex-start', alignItems: 'baseline' },
      ...head.map((k, i) => h('div', { alignItems: 'baseline', marginRight: duel ? 0 : 28, flexDirection: duel && i === 1 ? 'row-reverse' : 'row' },
        h('div', { fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: numSize, lineHeight: 1, color: color[k] }, String(seats(k))),
        h('div', { fontSize: big ? 24 : 20, fontWeight: 700, color: color[k], margin: duel && i === 1 ? '0 10px 0 0' : '0 0 0 10px' }, label[k])))),
    h('div', { position: 'relative', width, height: 30, marginTop: 8, backgroundColor: RULE },
      ...segs.filter((s) => s.n > 0).map((s) => h('div', {
        width: (s.n / total) * width, height: 30, backgroundColor: s.color, alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 15, fontWeight: 700,
      }, (s.n / total) * width > 34 ? String(s.n) : '')),
      h('div', { position: 'absolute', left: x - 1, top: -6, width: 2, height: 42, backgroundColor: INK })),
    h('div', { justifyContent: 'space-between', marginTop: 10, fontSize: 15, fontWeight: 600, color: INK_3 },
      legend(lang, head.map((k) => color[k]), flipYear, false, tiers),
      h('div', { color: INK_2 }, t.majority(majority))));
}

function legend(lang: Lang, colors: string[], flipYear: number | string | null, empty: boolean, tiers?: [string, string, string]): Node {
  const t = T[lang];
  const [l1, l2, l3] = tiers ?? [t.safe, t.comp, t.toss];
  const sw = (fills: string[], text: string, hatch = false) => h('div', { alignItems: 'center', marginRight: 16 },
    ...fills.map((f) => h('div', { width: 13, height: 13, backgroundColor: f, marginRight: 3, ...(hatch ? { backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,.5) 0 2px, transparent 2px 5px)' } : {}) })),
    h('div', { marginLeft: 3 }, text));
  const two = colors.slice(0, 2);
  return h('div', { alignItems: 'center', flexWrap: 'wrap' },
    sw(two, l1), sw(two.map((c) => tint(c, 0.52)), l2), sw([SERRE], l3),
    ...(flipYear ? [sw([PAPER_2], typeof flipYear === 'string' ? flipYear : t.flip(flipYear), true)] : []),
    ...(empty ? [sw([VIDE], t.empty)] : []));
}

// ------------------------------------------------------------------ carte

export interface GeoDoc { viewBox: [number, number, number, number]; panels: any[]; paths: Record<string, Record<string, string>> }

/** La carte (vraie carte + médaillons) en SVG : couleurs, hachures, cadres. Les
 *  titres des médaillons sont posés par satori par-dessus (resvg n'a pas de police). */
function mapSvg(geo: GeoDoc, fill: (id: string) => string, changed: (id: string) => boolean): string {
  const [, , W, H] = geo.viewBox;
  const parts: string[] = [`<defs><pattern id="hh" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.4" height="3" fill="rgba(0,0,0,.26)"/></pattern>`];
  for (const p of geo.panels) parts.push(`<clipPath id="c${p.id}"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"/></clipPath>`);
  parts.push('</defs>');
  for (const p of geo.panels) {
    parts.push(`<g clip-path="url(#c${p.id})">`);
    if (!p.main) parts.push(`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${PAPER_2}"/>`);
    for (const [id, d] of Object.entries(geo.paths[p.id] ?? {})) {
      parts.push(`<path d="${d}" fill="${fill(id)}" stroke="#fff" stroke-width="0.45"/>`);
      if (changed(id)) parts.push(`<path d="${d}" fill="url(#hh)"/>`);
    }
    parts.push('</g>');
    if (!p.main) parts.push(`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="none" stroke="#bdbdbd" stroke-width="0.8"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
}

export interface MapCardInput {
  key: string;
  lang: Lang;
  latest: any;          // web_data/<clé>/latest.json
  geo: GeoDoc;          // web_data/<clé>/geomap.json
}

/** Pied de carte : date du calcul ; passé le jour du vote, c'est la projection de la veille. */
function asOfLine(key: string, lang: Lang, latest: any): string {
  const t = T[lang];
  const el = SHARE_ELECTIONS[key];
  const run = latest.meta.run_date as string;
  const today = new Date().toISOString().slice(0, 10);
  const veille = el.date && run < el.date && today >= el.date;
  const base = veille
    ? ({ fr: `Projection de la veille du vote (${longDate(run, lang)})`, en: `Eve-of-election forecast (${longDate(run, lang)})`, es: `Proyección de la víspera (${longDate(run, lang)})` } as const)[lang]
    : `${t.asOf} ${longDate(run, lang)}`;
  return `${base}${latest.meta.n_polls ? ` · ${t.polls(nf(latest.meta.n_polls, lang))}` : ''}`;
}

export function mapCard(fmt: Format, { key, lang, latest, geo }: MapCardInput): Node {
  const baselineYear = SHARE_ELECTIONS[key].baselineYear;
  const t = T[lang];
  const el = SHARE_ELECTIONS[key];
  const { w, h: H } = SIZE[fmt];
  const pad = fmt === 'wide' ? 34 : 44;
  const inner = w - pad * 2;
  const color: Record<string, string> = Object.fromEntries(latest.parties.map((p: any) => [p.party, p.color]));
  const byId = new Map<string, any>(latest.ridings.map((r: any) => [String(r.riding_id).padStart(5, '0'), r]));
  const fill = (id: string) => {
    const r = byId.get(id);
    return r ? fillFor(color[r.projection?.winner], r.projection?.p_winner) : VIDE;
  };
  const changed = (id: string) => {
    const r = byId.get(id);
    const was = r?.baseline_result?.winner ?? r?.incumbent_party;
    return !!(r && was && r.projection?.winner && was !== r.projection.winner && (r.projection.p_winner ?? 0) >= 0.5);
  };
  const ridings = latest.ridings.map((r: any) => ({ winner: r.projection?.winner ?? null, p: r.projection?.p_winner }));
  const parties = [...latest.parties].sort((a: any, b: any) => seatsOf(b) - seatsOf(a));
  const lead = parties[0];

  // Au-dessus de la carte : la barre des sièges (chambre complète) ou une ligne de chances.
  const top = el.fullChamber
    ? seatBar(lang, inner, ridings, parties, latest.meta.majority_threshold ?? Math.floor(ridings.length / 2) + 1, baselineYear, fmt === 'square')
    : h('div', { flexDirection: 'column' },
      h('div', { alignItems: 'baseline', fontSize: 22, fontWeight: 700 },
        ...(key === 'us-governor'
          ? [h('div', { color: INK_2, marginRight: 14 }, t.govs), ...parties.slice(0, 2).map((p: any) => h('div', { color: p.color, marginRight: 16, alignItems: 'baseline' },
            h('div', { fontFamily: 'Barlow Condensed', fontSize: 46, marginRight: 8 }, String(seatsOf(p))), partyLabel(p, lang)))]
          : [h('div', { color: INK_2, marginRight: 14 }, t.chances), ...parties.slice(0, 2).map((p: any) => h('div', { color: p.color, marginRight: 16, alignItems: 'baseline' },
            h('div', { fontFamily: 'Barlow Condensed', fontSize: 46, marginRight: 8 }, pct(p.p_majority ?? 0, lang)), partyLabel(p, lang)))])),
      h('div', { marginTop: 6, fontSize: 15, fontWeight: 600, color: INK_3 }, legend(lang, parties.slice(0, 2).map((p: any) => p.color), baselineYear, true)));

  const [, , GW, GH] = geo.viewBox;
  const topH = el.fullChamber ? (fmt === 'square' ? 150 : 128) : 96;
  const boxH = H - pad * 2 - 60 - topH - 70;
  const k = Math.min(inner / GW, boxH / GH);
  const mw = Math.round(GW * k);
  const mh = Math.round(GH * k);
  const titres = geo.panels.filter((p: any) => !p.main).map((p: any) => h('div', {
    position: 'absolute', left: p.x * k + 3, top: p.y * k + 2, padding: '1px 4px', backgroundColor: 'rgba(255,255,255,.88)',
    fontSize: fmt === 'wide' ? 12 : 14, fontWeight: 700, color: INK,
  }, lang === 'en' ? p.title_en : lang === 'es' ? p.title_es : p.title_fr));

  const body = h('div', { flexDirection: 'column', flexGrow: 1 },
    top,
    h('div', { flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
      h('div', { position: 'relative', width: mw, height: mh },
        img(svgUri(mapSvg(geo, fill, changed)), mw, mh, { position: 'absolute', left: 0, top: 0 }),
        ...titres)));
  return frame(fmt, lang, `${el.name[lang]}`, el.when[lang], body, asOfLine(key, lang, latest));
}

// ------------------------------------------------------------------ projection

export function projectionCard(fmt: Format, { key, lang, latest }: { key: string; lang: Lang; latest: any }): Node {
  const t = T[lang];
  const el = SHARE_ELECTIONS[key];
  const { w } = SIZE[fmt];
  const pad = fmt === 'wide' ? 34 : 44;
  const inner = w - pad * 2;
  const parties = [...latest.parties].sort((a: any, b: any) => seatsOf(b) - seatsOf(a)).filter((p: any) => seatsOf(p) > 0 || (p.p_majority ?? 0) > 0.01).slice(0, fmt === 'wide' ? 4 : 6);
  const total = latest.meta.total_seats ?? parties.reduce((s: number, p: any) => s + seatsOf(p), 0);
  const majority = latest.meta.majority_threshold ?? Math.floor(total / 2) + 1;
  const big = fmt === 'square';
  const row = (p: any) => h('div', { alignItems: 'center', borderBottom: `1px solid ${RULE}`, padding: big ? '14px 0' : '9px 0' },
    h('div', { width: 8, height: big ? 40 : 32, backgroundColor: p.color, marginRight: 14 }),
    h('div', { flexGrow: 1, fontSize: big ? 30 : 26, fontWeight: 700 }, partyLabel(p, lang)),
    h('div', { width: 170, justifyContent: 'flex-end', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: big ? 60 : 50, lineHeight: 1, color: p.color }, String(seatsOf(p))),
    h('div', { width: 150, justifyContent: 'flex-end', fontSize: 20, fontWeight: 600, color: INK_3 },
      p.seats_ci_low_80 != null ? `${Math.round(p.seats_ci_low_80)}–${Math.round(p.seats_ci_high_80)}` : '—'),
    h('div', { width: 170, justifyContent: 'flex-end', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: big ? 50 : 42, lineHeight: 1 }, pct(p.p_majority ?? 0, lang)));
  const head = h('div', { alignItems: 'center', borderBottom: `1px solid ${INK}`, paddingBottom: 6, fontSize: 15, fontWeight: 600, color: INK_3 },
    h('div', { flexGrow: 1, marginLeft: 22 }, t.party),
    h('div', { width: 170, justifyContent: 'flex-end' }, t.seats),
    h('div', { width: 150, justifyContent: 'flex-end' }, t.range),
    h('div', { width: 170, justifyContent: 'flex-end' }, t.chances));
  // Barre des sièges projetés avec la ligne de majorité.
  const bar = h('div', { position: 'relative', width: inner, height: 26, marginTop: 18, backgroundColor: RULE },
    ...parties.map((p: any) => h('div', { width: (seatsOf(p) / total) * inner, height: 26, backgroundColor: p.color })),
    h('div', { position: 'absolute', left: (majority / total) * inner - 1, top: -6, width: 2, height: 38, backgroundColor: INK }));
  const body = h('div', { flexDirection: 'column', flexGrow: 1, justifyContent: 'flex-start', paddingTop: big ? 40 : 18 },
    h('div', { fontSize: big ? 52 : 40, fontWeight: 700, lineHeight: 1.05, marginBottom: big ? 34 : 16 }, el.question[lang]),
    head, ...parties.map(row), bar,
    h('div', { marginTop: 8, fontSize: 15, fontWeight: 600, color: INK_2 }, t.majority(majority)));
  return frame(fmt, lang, el.name[lang], el.when[lang], body, asOfLine(key, lang, latest));
}

// ------------------------------------------------------------------ graphique des sondages

export function chartCard(fmt: Format, { key, lang, latest }: { key: string; lang: Lang; latest: any }): Node {
  const t = T[lang];
  const el = SHARE_ELECTIONS[key];
  const { w, h: H } = SIZE[fmt];
  const pad = fmt === 'wide' ? 34 : 44;
  const inner = w - pad * 2;
  const polls: any[] = (latest.polls_history ?? []).filter((p: any) => p.date);
  const parties = [...latest.parties].filter((p: any) => !/_oth$/.test(p.party)).sort((a: any, b: any) => (b.vote_mean ?? 0) - (a.vote_mean ?? 0)).slice(0, 4);
  const last = polls.length ? polls[polls.length - 1].date : latest.meta.run_date;
  const t1 = Date.parse(`${last}T12:00:00Z`);
  const t0 = t1 - 365 * 86400000;
  const recent = polls.filter((p) => Date.parse(`${p.date}T12:00:00Z`) >= t0);
  const values = recent.flatMap((p) => parties.map((q: any) => p[q.party]).filter((v: any) => typeof v === 'number'));
  const vmax = Math.min(100, Math.ceil(((values.length ? Math.max(...values) : 50) + 4) / 10) * 10);
  const vmin = Math.max(0, Math.floor(((values.length ? Math.min(...values) : 0) - 4) / 10) * 10);
  const cw = inner - 150;
  const ch = H - pad * 2 - 60 - 70 - (fmt === 'wide' ? 70 : 110);
  const X = (d: string) => ((Date.parse(`${d}T12:00:00Z`) - t0) / (t1 - t0)) * cw;
  const Y = (v: number) => ch - ((v - vmin) / (vmax - vmin)) * ch;
  // Moyenne mobile pondérée sur 30 jours, un point par semaine.
  const lines = parties.map((q: any) => {
    const pts: string[] = [];
    for (let d = t0; d <= t1; d += 7 * 86400000) {
      let s = 0; let wsum = 0;
      for (const p of recent) {
        const dt = Math.abs(Date.parse(`${p.date}T12:00:00Z`) - d) / 86400000;
        if (dt > 30 || typeof p[q.party] !== 'number') continue;
        // Poids égaux : la courbe décrit les sondages publiés, pas la pondération
        // du modèle (qui met les vieux sondages à zéro).
        const wt = 1 - dt / 31;
        s += p[q.party] * wt; wsum += wt;
      }
      if (wsum > 0) pts.push(`${((d - t0) / (t1 - t0) * cw).toFixed(1)},${Y(s / wsum).toFixed(1)}`);
    }
    const end = pts.length ? Number(pts[pts.length - 1].split(',')[1]) : Y(q.vote_mean ?? 0);
    const endValue = vmin + ((ch - end) / ch) * (vmax - vmin);
    return { q, pts, endValue };
  });
  const grid: string[] = [];
  for (let v = vmin; v <= vmax; v += 10) grid.push(`<line x1="0" y1="${Y(v)}" x2="${cw}" y2="${Y(v)}" stroke="#e3e3e3" stroke-width="1"/>`);
  const dots = recent.flatMap((p) => parties.map((q: any) => typeof p[q.party] === 'number'
    ? `<circle cx="${X(p.date).toFixed(1)}" cy="${Y(p[q.party]).toFixed(1)}" r="2.2" fill="${q.color}" fill-opacity=".28"/>` : ''));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cw} ${ch}">${grid.join('')}${dots.join('')}${lines.map((l) => `<polyline points="${l.pts.join(' ')}" fill="none" stroke="${l.q.color}" stroke-width="3.2" stroke-linejoin="round"/>`).join('')}</svg>`;
  const axis = [];
  for (let v = vmin; v <= vmax; v += 10) axis.push(h('div', { position: 'absolute', left: 0, top: Y(v) - 9, fontSize: 14, fontWeight: 600, color: INK_3 }, lang === 'en' ? `${v}%` : `${v} %`));
  const labels = lines.map((l) => {
    // L'étiquette dit la valeur où la courbe s'arrête, pas un autre chiffre.
    const v = l.endValue;
    return h('div', { position: 'absolute', left: cw + 10, top: Y(v) - 14, alignItems: 'baseline', color: l.q.color },
      h('div', { fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 30 }, `${Math.round(v)}`),
      h('div', { fontSize: 14, fontWeight: 700, marginLeft: 6 }, partyLabel(l.q, lang)));
  });
  const months = [];
  for (let i = 0; i <= 12; i += fmt === 'wide' ? 2 : 3) {
    const d = new Date(t0 + (i / 12) * (t1 - t0));
    months.push(h('div', { position: 'absolute', left: (i / 12) * cw - 20, top: ch + 6, width: 60, fontSize: 14, fontWeight: 600, color: INK_3 },
      d.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-CA', { month: 'short', year: '2-digit', timeZone: 'UTC' })));
  }
  const body = h('div', { flexDirection: 'column', flexGrow: 1 },
    h('div', { fontSize: fmt === 'wide' ? 34 : 42, fontWeight: 700, lineHeight: 1.05 }, t.avg),
    h('div', { position: 'relative', width: inner, height: ch + 30, marginTop: 18 },
      h('div', { position: 'absolute', left: 40, top: 0, width: cw, height: ch }, img(svgUri(svg), cw, ch)),
      ...axis, ...labels.map((n) => ({ ...n, props: { ...n.props, style: { ...(n.props.style as object), left: cw + 50 } } })),
      ...months.map((n) => ({ ...n, props: { ...n.props, style: { ...(n.props.style as object), left: ((n.props.style as any).left as number) + 40 } } }))));
  const foot = `${t.polls(nf(recent.length, lang))} · ${t.asOf} ${longDate(latest.meta.run_date, lang)}`;
  return frame(fmt, lang, el.name[lang], el.when[lang], body, foot);
}

// ------------------------------------------------------------------ scénario du lecteur (« fais ta carte »)


const SCEN = {
  fr: { title: 'Mon scénario', everywhere: 'partout', flip: 'Bascule par rapport à la projection', base: 'Curseurs du simulateur Vote-Scope', clear: 'Avance nette', thin: 'Avance mince', toss: 'Serré' },
  en: { title: 'My scenario', everywhere: 'nationwide', flip: 'Flips from the forecast', base: 'Vote-Scope simulator sliders', clear: 'Clear lead', thin: 'Narrow lead', toss: 'Toss-up' },
  es: { title: 'Mi escenario', everywhere: 'en todo el país', flip: 'Cambia respecto a la proyección', base: 'Controles del simulador de Vote-Scope', clear: 'Ventaja clara', thin: 'Ventaja estrecha', toss: 'Reñido' },
};

/** Une ligne lisible : « Libéral −3,0 · Conservateur +2,0 partout ; Québec : Bloc +4,0 ». */
function scenarioLine(doc: SimDoc, sim: string, lang: Lang): string {
  const [nat, reg] = decodeState(sim, doc);
  const lbl = new Map(doc.parties.map((p) => [p.code, simPartyLabel(p, lang)]));
  const num = (v: number) => `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', lang === 'en' ? '.' : ',')}`;
  const part = (d: Record<string, number>) => Object.entries(d).filter(([, v]) => Math.abs(v) > 0.05).map(([k, v]) => `${lbl.get(k) ?? k} ${num(v)}`).join(' · ');
  const out: string[] = [];
  if (part(nat)) out.push(`${part(nat)} ${SCEN[lang].everywhere}`);
  for (const [rid, d] of Object.entries(reg)) {
    const r = doc.regions.find((x) => x.id === rid);
    if (part(d)) out.push(`${r ? regionLabel(r, lang) : rid} : ${part(d)}`.replace(' : ', lang === 'fr' ? ' : ' : ': '));
  }
  return out.join(' ; ');
}

export function scenarioCard(fmt: Format, { key, lang, doc, geo, sim }: { key: string; lang: Lang; doc: SimDoc; geo: GeoDoc; sim: string }): Node {
  const el = SHARE_ELECTIONS[key];
  const s = SCEN[lang];
  const { w, h: H } = SIZE[fmt];
  const pad = fmt === 'wide' ? 34 : 44;
  const inner = w - pad * 2;
  const [nat, reg] = decodeState(sim, doc);
  const states = simulateRidings(doc, nat, reg, lang);
  const color: Record<string, string> = Object.fromEntries(doc.parties.map((p) => [p.code, p.color]));
  const byId = new Map(states.map((r) => [String(r.id).padStart(5, '0'), r]));
  // Pas de probabilité dans un scénario : la nuance dit l'écart (≥ 8 pts net, ≥ 3 mince, sinon serré).
  const tier = (m: number) => (m >= 8 ? 1 : m >= 3 ? 0.7 : 0.5);
  const fill = (id: string) => { const r = byId.get(id); return r ? fillFor(color[r.winner], tier(r.margin)) : VIDE; };
  const changed = (id: string) => !!byId.get(id)?.changed;
  const parties = doc.parties.map((p) => ({ party: p.code, label_fr: p.label_fr, label_en: p.label_en, color: p.color }));
  const ridings = states.map((r) => ({ winner: r.winner, p: tier(r.margin) }));
  const top = seatBar(lang, inner, ridings, parties, doc.meta.majority_threshold, s.flip, fmt === 'square', [s.clear, s.thin, s.toss]);
  const line = scenarioLine(doc, sim, lang);
  const [, , GW, GH] = geo.viewBox;
  const boxH = H - pad * 2 - 60 - (fmt === 'square' ? 150 : 128) - 100;
  const k = Math.min(inner / GW, boxH / GH);
  const mw = Math.round(GW * k);
  const mh = Math.round(GH * k);
  const titres = geo.panels.filter((p: any) => !p.main).map((p: any) => h('div', {
    position: 'absolute', left: p.x * k + 3, top: p.y * k + 2, padding: '1px 4px', backgroundColor: 'rgba(255,255,255,.88)',
    fontSize: fmt === 'wide' ? 12 : 14, fontWeight: 700, color: INK,
  }, lang === 'en' ? p.title_en : lang === 'es' ? p.title_es : p.title_fr));
  // La légende du scénario parle d'écart, pas de probabilité.
  const legendTop = h('div', { flexDirection: 'column' },
    top,
    h('div', { marginTop: 8, fontSize: 17, fontWeight: 700, color: INK_2 }, line));
  const body = h('div', { flexDirection: 'column', flexGrow: 1 },
    legendTop,
    h('div', { flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
      h('div', { position: 'relative', width: mw, height: mh },
        img(svgUri(mapSvg(geo, fill, changed)), mw, mh, { position: 'absolute', left: 0, top: 0 }),
        ...titres)));
  return frame(fmt, lang, `${el.name[lang]} — ${s.title}`, el.when[lang], body, s.base);
}
