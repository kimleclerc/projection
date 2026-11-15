/**
 * Image de partage d'une province espagnole (élections générales du 29/11/2026), au build :
 *   /og/share/province/<slug>/<langue>[-carre|-story].png
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { provinceCard, SIZE, type Format } from '../../../../../lib/share/cards';
import { provinceCardInput } from '../../../../../lib/share/province-input';
import { getSpainProvinces } from '../../../../../lib/spain-provinces';
import type { Lang } from '../../../../../lib/share/elections';
import latest from '../../../../../../web_data/spain/latest.json';

const ROOT = process.cwd();
const font = (f: string) => readFileSync(resolve(ROOT, 'public', 'og-fonts', f));
const FONTS = [
  { name: 'Barlow', data: font('barlow-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Barlow', data: font('barlow-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Barlow', data: font('barlow-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
  { name: 'Barlow Condensed', data: font('barlow-condensed-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
];

export const getStaticPaths: GetStaticPaths = () => {
  const out = [];
  for (const c of getSpainProvinces()) for (const lang of ['fr', 'en', 'es']) for (const suffix of ['', '-carre', '-story']) {
    out.push({ params: { slug: c.slug, file: `${lang}${suffix}` } });
  }
  return out;
};

export const GET: APIRoute = async ({ params }) => {
  const file = params.file as string;
  const fmt: Format = file.endsWith('-carre') ? 'square' : file.endsWith('-story') ? 'story' : 'wide';
  const lang = file.replace(/-(carre|story)$/, '') as Lang;
  const p = getSpainProvinces().find((x) => x.slug === params.slug)!;
  const tree = provinceCard(fmt, lang, provinceCardInput(p, (latest as any).meta.run_date));
  const svg = await satori(tree as never, { width: SIZE[fmt].w, height: SIZE[fmt].h, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE[fmt].w } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
