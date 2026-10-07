/**
 * Images de partage générées à la demande (à la Polymarket).
 *
 * /og/live/us-senate/en.png  → carte du Sénat, dessinée avec les données du
 * dernier run (web_data/us-senate/latest.json). Aucun PNG n'est ajouté au
 * déploiement : l'image est rendue par satori + resvg au premier appel, puis
 * gardée en cache chez Cloudflare pendant une heure.
 */
import { ImageResponse } from '@cf-wasm/og/workerd';

type Lang = 'en' | 'fr' | 'es';
type Env = { ASSETS: { fetch: (req: Request | string) => Promise<Response> } };
type Ctx = { request: Request; env: Env; params: { path?: string[] }; waitUntil: (p: Promise<unknown>) => void };

const PAPER = '#f6f2ea';
const CARD = '#fffdf8';
const INK = '#1d1b18';
const INK_2 = '#55504a';
const INK_3 = '#8a847b';
const RULE = '#e4ddd0';
const TOSSUP = '#c8b88e';
const EMPTY = '#ece6da';

const ELECTION_DAY = Date.UTC(2026, 10, 3);

// Grille des États, copiée de src/lib/us-pres.ts (même disposition que la carte du site).
const TILES: Record<string, [number, number]> = {
  AK: [0, 0], ME: [0, 11], VT: [1, 10], NH: [1, 11],
  WA: [2, 0], ID: [2, 1], MT: [2, 2], ND: [2, 3], MN: [2, 4], IL: [2, 5],
  WI: [2, 6], MI: [2, 7], NY: [2, 9], RI: [2, 10], MA: [2, 11],
  OR: [3, 0], NV: [3, 1], WY: [3, 2], SD: [3, 3], IA: [3, 4], IN: [3, 5],
  OH: [3, 6], PA: [3, 7], NJ: [3, 8], CT: [3, 9],
  CA: [4, 0], UT: [4, 1], CO: [4, 2], NE: [4, 3], MO: [4, 4], KY: [4, 5],
  WV: [4, 6], VA: [4, 7], MD: [4, 8], DE: [4, 9],
  AZ: [5, 1], NM: [5, 2], KS: [5, 3], AR: [5, 4], TN: [5, 5], NC: [5, 6],
  SC: [5, 7], DC: [5, 8],
  OK: [6, 3], LA: [6, 4], MS: [6, 5], AL: [6, 6], GA: [6, 7],
  HI: [7, 0], TX: [7, 3], FL: [7, 8],
};

const TEXT = {
  en: {
    eyebrow: '2026 SENATE FORECAST',
    by: 'By',
    question: 'Who controls the Senate after November 3?',
    chance: 'chance of a Senate majority',
    party: { us_dem: 'Democrats', us_rep: 'Republicans', us_oth: 'Other' },
    seats: 'projected seats',
    majority: '51 for control',
    sims: (n: string) => `${n} simulations`,
    days: (d: number) => (d === 0 ? 'Election Day' : d === 1 ? '1 day to go' : `${d} days to go`),
    legend: ['Solid', 'Likely', 'Lean', 'Toss-up'],
    date: (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
  },
  fr: {
    eyebrow: 'SÉNAT AMÉRICAIN · PROJECTION 2026',
    by: 'Par',
    question: 'Qui contrôlera le Sénat après le 3 novembre ?',
    chance: 'de chances de majorité au Sénat',
    party: { us_dem: 'Démocrates', us_rep: 'Républicains', us_oth: 'Autres' },
    seats: 'sièges projetés',
    majority: '51 pour le contrôle',
    sims: (n: string) => `${n} simulations`,
    days: (d: number) => (d === 0 ? 'Jour du vote' : d === 1 ? 'J-1' : `J-${d}`),
    legend: ['Solide', 'Probable', 'Penche', 'Serré'],
    date: (d: Date) => d.toLocaleDateString('fr-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
  },
  es: {
    eyebrow: 'SENADO DE EE. UU. · PRONÓSTICO 2026',
    by: 'Por',
    question: '¿Quién controlará el Senado después del 3 de noviembre?',
    chance: 'de probabilidad de mayoría en el Senado',
    party: { us_dem: 'Demócratas', us_rep: 'Republicanos', us_oth: 'Otros' },
    seats: 'escaños proyectados',
    majority: '51 para el control',
    sims: (n: string) => `${n} simulaciones`,
    days: (d: number) => (d === 0 ? 'Día de la elección' : d === 1 ? 'Falta 1 día' : `Faltan ${d} días`),
    legend: ['Seguro', 'Probable', 'Inclinado', 'Reñido'],
    date: (d: Date) => d.toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
  },
} as const;

// Petit constructeur d'éléments pour satori (pas de JSX dans les Functions).
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});

const mix = (hex: string, amount: number) => {
  // Mélange la couleur du parti avec le papier : 1 = couleur pleine, 0 = papier.
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [a, b] = [p(hex), p(PAPER)];
  return `#${a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, '0')).join('')}`;
};

const ratingColor = (code: string, colors: Record<string, string>) => {
  const [strength, side] = code.split('_');
  if (!side) return TOSSUP;
  const base = colors[side === 'dem' ? 'us_dem' : 'us_rep'];
  return mix(base, strength === 'solid' ? 1 : strength === 'likely' ? 0.68 : 0.42);
};

let fontCache: Promise<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: 'normal' }[]> | null = null;
const loadFonts = (env: Env, origin: string) => {
  if (!fontCache) {
    const get = (file: string) => env.ASSETS.fetch(`${origin}/og-fonts/${file}`).then((r) => r.arrayBuffer());
    fontCache = Promise.all([
      get('newsreader-latin-400-normal.woff').then((data) => ({ name: 'Newsreader', data, weight: 400 as const, style: 'normal' as const })),
      get('newsreader-latin-600-normal.woff').then((data) => ({ name: 'Newsreader', data, weight: 600 as const, style: 'normal' as const })),
      get('jetbrains-mono-latin-400-normal.woff').then((data) => ({ name: 'JetBrains Mono', data, weight: 400 as const, style: 'normal' as const })),
      get('jetbrains-mono-latin-500-normal.woff').then((data) => ({ name: 'JetBrains Mono', data, weight: 500 as const, style: 'normal' as const })),
    ]);
    fontCache.catch(() => { fontCache = null; });
  }
  return fontCache;
};

function senateCard(data: any, lang: Lang) {
  const t = TEXT[lang];
  const colors: Record<string, string> = Object.fromEntries(data.parties.map((p: any) => [p.party, p.color]));
  const byParty: Record<string, any> = Object.fromEntries(data.parties.map((p: any) => [p.party, p]));
  const seats = (k: string) => Math.round(byParty[k]?.seats_projected ?? byParty[k]?.seats_median ?? 0);
  const leader = ['us_dem', 'us_rep'].sort((a, b) => (byParty[b]?.p_majority ?? 0) - (byParty[a]?.p_majority ?? 0))[0];
  const pct = Math.round((byParty[leader]?.p_majority ?? 0) * 100);

  const runDate = new Date(`${data.meta.run_date}T00:00:00Z`);
  const daysLeft = Math.max(0, Math.round((ELECTION_DAY - runDate.getTime()) / 86400000));
  const sims = Number(data.meta.n_simulations).toLocaleString(lang === 'en' ? 'en-US' : lang === 'fr' ? 'fr-CA' : 'es-ES');

  // Une course par État ; s'il y en a deux (élection spéciale), on garde la plus serrée.
  const race: Record<string, string> = {};
  const closeness = (r: any) => Math.abs((r.projection?.p_winner ?? 1) - 0.5);
  for (const r of [...data.ridings].sort((a: any, b: any) => closeness(b) - closeness(a))) {
    race[r.province] = r.projection?.rating?.code ?? 'tossup';
  }

  const D = seats('us_dem');
  const R = seats('us_rep');
  const O = Math.max(0, 100 - D - R);
  const TILE = 36;
  const GAP = 4;

  const tiles = Object.entries(TILES).map(([st, [r, c]]) => {
    const code = race[st];
    const fill = code ? ratingColor(code, colors) : EMPTY;
    const strong = code && (code.startsWith('solid') || code.startsWith('likely'));
    return h('div', {
      position: 'absolute', left: c * (TILE + GAP), top: r * (TILE + GAP), width: TILE, height: TILE,
      backgroundColor: fill, borderRadius: 5, alignItems: 'center', justifyContent: 'center',
      fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 12,
      color: !code ? '#b9b1a3' : strong ? '#ffffff' : INK,
    }, st);
  });

  const legendSwatch = (fills: string[], label: string, last = false) =>
    h('div', { alignItems: 'center', marginRight: last ? 0 : 12 },
      ...fills.map((fill) => h('div', { width: 12, height: 12, borderRadius: 3, backgroundColor: fill, marginRight: 3 })),
      h('div', { fontFamily: 'JetBrains Mono', fontSize: 13, color: INK_2, marginLeft: 3 }, label));

  const seg = (n: number, fill: string, label: string | null) =>
    h('div', { width: `${n}%`, height: 30, backgroundColor: fill, alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 16 }, label ?? '');

  return h('div', { width: 1200, height: 630, backgroundColor: PAPER, padding: 36 },
    h('div', { flexDirection: 'column', width: '100%', height: '100%', backgroundColor: CARD, border: `1px solid ${RULE}`, borderRadius: 18, padding: '34px 44px' },
      // Bandeau
      h('div', { justifyContent: 'space-between', alignItems: 'center', fontFamily: 'JetBrains Mono', fontSize: 17, letterSpacing: '0.12em', color: INK_2 },
        h('div', { fontWeight: 500, color: INK }, `VOTE·SCOPE  ·  ${t.eyebrow}`),
        h('div', { backgroundColor: INK, color: PAPER, padding: '6px 12px', borderRadius: 6, letterSpacing: '0.06em' }, t.days(daysLeft))),
      // Corps
      h('div', { marginTop: 26, flexGrow: 1 },
        h('div', { flexDirection: 'column', width: 520 },
          h('div', { fontFamily: 'Newsreader', fontWeight: 600, fontSize: t.question.length > 46 ? 38 : 44, lineHeight: 1.08, color: INK, letterSpacing: '-0.01em' }, t.question),
          h('div', { alignItems: 'flex-end', marginTop: 18 },
            h('div', { fontFamily: 'Newsreader', fontWeight: 600, fontSize: 124, lineHeight: 0.9, color: colors[leader] }, lang === 'en' ? `${pct}%` : `${pct}\u202f%`),
            h('div', { fontFamily: 'Newsreader', fontWeight: 600, fontSize: 34, color: colors[leader], marginLeft: 18, marginBottom: 14 }, t.party[leader as 'us_dem'])),
          h('div', { fontFamily: 'Newsreader', fontSize: 22, color: INK_2, marginTop: 8 }, t.chance),
          // Barre de sièges
          h('div', { flexDirection: 'column', marginTop: 24 },
            h('div', { justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 15, color: INK_2, marginBottom: 8 },
              h('div', {}, `${t.party.us_dem} ${D}`),
              h('div', {}, t.seats),
              h('div', {}, `${R} ${t.party.us_rep}`)),
            h('div', { position: 'relative', width: '100%', borderRadius: 6, overflow: 'hidden' },
              seg(D, colors.us_dem, String(D)),
              ...(O > 0 ? [seg(O, '#9a948a', null)] : []),
              seg(R, colors.us_rep, String(R))),
            h('div', { position: 'relative', height: 26, marginTop: 4 },
              h('div', { position: 'absolute', left: '51%', marginLeft: -1, top: -34, width: 2, height: 40, backgroundColor: INK }),
              h('div', { position: 'absolute', left: '44%', top: 8, fontFamily: 'JetBrains Mono', fontSize: 13, color: INK_3 }, t.majority)))),
        // Carte en tuiles
        h('div', { flexDirection: 'column', marginLeft: 'auto', alignItems: 'flex-end' },
          h('div', { position: 'relative', width: 12 * (TILE + GAP), height: 8 * (TILE + GAP) }, ...tiles),
          h('div', { marginTop: 14 },
            legendSwatch([colors.us_dem, colors.us_rep], t.legend[0]),
            legendSwatch([mix(colors.us_dem, 0.68), mix(colors.us_rep, 0.68)], t.legend[1]),
            legendSwatch([mix(colors.us_dem, 0.42), mix(colors.us_rep, 0.42)], t.legend[2]),
            legendSwatch([TOSSUP], t.legend[3], true)))),
      // Pied
      h('div', { justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${RULE}`, paddingTop: 14, fontFamily: 'JetBrains Mono', fontSize: 15, color: INK_3 },
        h('div', {}, `${t.date(runDate)}`),
        h('div', { alignItems: 'center' },
          h('div', { fontFamily: 'Newsreader', fontWeight: 600, fontSize: 19, color: INK_2, marginRight: 18 }, `${t.by} Kim Leclerc · @kimleclerc`),
          h('div', { fontWeight: 500, fontSize: 18, color: INK, letterSpacing: '0.04em' }, 'vote-scope.com')))));
}

const CARDS: Record<string, { data: string; render: (data: any, lang: Lang) => Node }> = {
  'us-senate': { data: 'us-senate', render: senateCard },
};

export const onRequestGet = async ({ request, env, params, waitUntil }: Ctx) => {
  const [key, file] = params.path ?? [];
  const lang = (file ?? '').replace(/\.png$/, '') as Lang;
  const card = CARDS[key ?? ''];
  if (!card || !(lang in TEXT)) return new Response('Not found', { status: 404 });

  const url = new URL(request.url);
  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await env.ASSETS.fetch(`${url.origin}/web_data/${card.data}/latest.json`);
  if (!res.ok) return new Response('Data unavailable', { status: 502 });
  const data = await res.json();

  const image = await ImageResponse.async(card.render(data, lang) as never, {
    width: 1200,
    height: 630,
    fonts: await loadFonts(env, url.origin),
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
  const response = new Response(image.body, image);
  waitUntil(cache.put(request, response.clone()));
  return response;
};
