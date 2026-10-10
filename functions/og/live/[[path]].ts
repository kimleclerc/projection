/**
 * Images de partage générées à la demande — aucun PNG dans le déploiement.
 *
 *   /og/live/map/<scrutin>/<langue>.png         la carte (barre des sièges, vraie carte, médaillons)
 *   /og/live/projection/<scrutin>/<langue>.png  le tableau de projection
 *   /og/live/chart/<scrutin>/<langue>.png       la moyenne des sondages
 *   /og/live/scenario/<scrutin>/<langue>.png?sim=…  le scénario d'un lecteur (simulateur)
 *   ?f=square                                   format carré 1080 x 1080 (sinon 1200 x 630)
 *   ?v=<date du calcul>                         change à chaque calcul : l'image suit
 *
 * Le dessin vient de src/lib/share/cards.ts (même source que les essais locaux).
 * Rendu par satori + resvg au premier appel, puis gardé en cache chez Cloudflare.
 * L'ancienne adresse /og/live/us-senate/<langue>.png sert la carte du Sénat.
 */
import { ImageResponse } from '@cf-wasm/og/workerd';
import { mapCard, projectionCard, chartCard, scenarioCard, SIZE, type Format } from '../../../src/lib/share/cards';
import { SHARE_ELECTIONS, SIM_RE, type Lang } from '../../../src/lib/share/elections';

type Env = { ASSETS: { fetch: (req: Request | string) => Promise<Response> } };
type Ctx = { request: Request; env: Env; params: { path?: string[] }; waitUntil: (p: Promise<unknown>) => void };

const LANGS = new Set(['fr', 'en', 'es']);
const KINDS = new Set(['map', 'projection', 'chart', 'scenario']);

let fontCache: Promise<{ name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: 'normal' }[]> | null = null;
const loadFonts = (env: Env, origin: string) => {
  if (!fontCache) {
    const get = (file: string) => env.ASSETS.fetch(`${origin}/og-fonts/${file}`).then((r) => r.arrayBuffer());
    fontCache = Promise.all([
      get('barlow-latin-500-normal.woff').then((data) => ({ name: 'Barlow', data, weight: 500 as const, style: 'normal' as const })),
      get('barlow-latin-600-normal.woff').then((data) => ({ name: 'Barlow', data, weight: 600 as const, style: 'normal' as const })),
      get('barlow-latin-700-normal.woff').then((data) => ({ name: 'Barlow', data, weight: 700 as const, style: 'normal' as const })),
      get('barlow-condensed-latin-700-normal.woff').then((data) => ({ name: 'Barlow Condensed', data, weight: 700 as const, style: 'normal' as const })),
    ]);
    fontCache.catch(() => { fontCache = null; });
  }
  return fontCache;
};

export const onRequestGet = async ({ request, env, params, waitUntil }: Ctx) => {
  let [kind, key, file] = params.path ?? [];
  // Ancienne adresse : /og/live/us-senate/fr.png
  if (kind === 'us-senate' && key && !file) { file = key; key = 'us-senate'; kind = 'map'; }
  const lang = (file ?? '').replace(/\.png$/, '') as Lang;
  if (!KINDS.has(kind) || !SHARE_ELECTIONS[key] || !LANGS.has(lang)) return new Response('Not found', { status: 404 });

  const url = new URL(request.url);
  const f = url.searchParams.get('f');
  const fmt: Format = f === 'square' ? 'square' : f === 'story' ? 'story' : 'wide';
  const cache = (caches as unknown as { default: Cache }).default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const get = async (name: string) => {
    const r = await env.ASSETS.fetch(`${url.origin}/web_data/${key}/${name}`);
    return r.ok ? r.json() : null;
  };
  const latest = await get('latest.json');
  if (!latest) return new Response('Data unavailable', { status: 502 });
  let tree;
  if (kind === 'scenario') {
    const sim = url.searchParams.get('sim') ?? '';
    if (!SIM_RE.test(sim)) return new Response('Bad scenario', { status: 400 });
    const [doc, geo] = await Promise.all([get('simulator.json'), get('geomap.json')]);
    if (!doc || !geo) return new Response('Map unavailable', { status: 404 });
    tree = scenarioCard(fmt, { key, lang, doc, geo, sim });
  } else if (kind === 'map') {
    const geo = await get('geomap.json');
    if (!geo) return new Response('Map unavailable', { status: 404 });
    tree = mapCard(fmt, { key, lang, latest, geo });
  } else if (kind === 'projection') {
    tree = projectionCard(fmt, { key, lang, latest });
  } else {
    tree = chartCard(fmt, { key, lang, latest });
  }

  const image = await ImageResponse.async(tree as never, {
    width: SIZE[fmt].w,
    height: SIZE[fmt].h,
    fonts: await loadFonts(env, url.origin),
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
  const response = new Response(image.body, image);
  waitUntil(cache.put(request, response.clone()));
  return response;
};
