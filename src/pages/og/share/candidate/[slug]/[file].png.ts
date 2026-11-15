/**
 * Image de partage d'une fiche candidat (présidentielle française 2027), au build :
 *   /og/share/candidate/<slug>/<langue>.png        paysage 1200 x 630 (og:image)
 *   /og/share/candidate/<slug>/<langue>-carre.png  carré 1080 x 1080
 *   /og/share/candidate/<slug>/<langue>-story.png  story 1080 x 1920
 * Le slug est le même dans les trois langues (slugify du nom).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { candidateCard, SIZE, type Format } from '../../../../../lib/share/cards';
import { candidateCardInput } from '../../../../../lib/share/candidate-input';
import { getAllCandidates } from '../../../../../lib/fr-candidates';
import type { Lang } from '../../../../../lib/share/elections';
import latest from '../../../../../../web_data/france-presidential/latest.json';

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
  for (const c of getAllCandidates()) for (const lang of ['fr', 'en', 'es']) for (const suffix of ['', '-carre', '-story']) {
    out.push({ params: { slug: c.slug, file: `${lang}${suffix}` } });
  }
  return out;
};

export const GET: APIRoute = async ({ params }) => {
  const file = params.file as string;
  const fmt: Format = file.endsWith('-carre') ? 'square' : file.endsWith('-story') ? 'story' : 'wide';
  const lang = file.replace(/-(carre|story)$/, '') as Lang;
  const all = getAllCandidates();
  const c = all.find((x) => x.slug === params.slug)!;
  const tree = candidateCard(fmt, lang, candidateCardInput(c, lang, latest, all));
  const svg = await satori(tree as never, { width: SIZE[fmt].w, height: SIZE[fmt].h, fonts: FONTS });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE[fmt].w } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
