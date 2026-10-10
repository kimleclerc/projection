/**
 * Images de partage fixes, fabriquées au build (forfait gratuit de Cloudflare) :
 *   /og/share/<map|projection|chart>/<scrutin>/<langue>.png        paysage 1200 x 630
 *   /og/share/<map|projection|chart>/<scrutin>/<langue>-carre.png  carré 1080 x 1080
 *   /og/share/<map|projection|chart>/<scrutin>/<langue>-story.png  story 1080 x 1920 (Instagram, TikTok)
 * Même dessin que les images à la volée (src/lib/share/cards.ts). Refaites à chaque
 * publication, donc à jour avec le calcul de la nuit. Voir LIVE_IMAGES.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { mapCard, projectionCard, chartCard, SIZE, type Format } from '../../../../../lib/share/cards';
import { SHARE_ELECTIONS, type Lang } from '../../../../../lib/share/elections';

const ROOT = process.cwd();
const data = (key: string, f: string) => resolve(ROOT, 'web_data', key, f);
const read = (key: string, f: string) => JSON.parse(readFileSync(data(key, f), 'utf8'));
const font = (f: string) => readFileSync(resolve(ROOT, 'public', 'og-fonts', f));
const FONTS = [
  { name: 'Barlow', data: font('barlow-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Barlow', data: font('barlow-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Barlow', data: font('barlow-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
  { name: 'Barlow Condensed', data: font('barlow-condensed-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
];

export const getStaticPaths: GetStaticPaths = () => {
  const out = [];
  for (const key of Object.keys(SHARE_ELECTIONS)) {
    if (!existsSync(data(key, 'latest.json'))) continue;
    const latest = read(key, 'latest.json');
    const kinds = ['projection'];
    if (existsSync(data(key, 'geomap.json'))) kinds.push('map');
    if ((latest.polls_history ?? []).length > 10) kinds.push('chart');
    for (const kind of kinds) for (const lang of ['fr', 'en', 'es']) for (const suffix of ['', '-carre', '-story']) {
      out.push({ params: { kind, key, file: `${lang}${suffix}` } });
    }
  }
  return out;
};

export const GET: APIRoute = async ({ params }) => {
  const { kind, key } = params as { kind: string; key: string };
  const file = params.file as string;
  const fmt: Format = file.endsWith('-carre') ? 'square' : file.endsWith('-story') ? 'story' : 'wide';
  const lang = file.replace(/-(carre|story)$/, '') as Lang;
  const latest = read(key, 'latest.json');
  const tree = kind === 'map'
    ? mapCard(fmt, { key, lang, latest, geo: read(key, 'geomap.json') })
    : kind === 'chart' ? chartCard(fmt, { key, lang, latest }) : projectionCard(fmt, { key, lang, latest });
  const svg = await satori(tree as never, { width: SIZE[fmt].w, height: SIZE[fmt].h, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE[fmt].w } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
