/**
 * Carte sociale des trois chiffres du mi-mandat (Chambre, Sénat, gouverneurs),
 * fabriquée au build depuis la projection finale publiée :
 *   /og/us-midterms/<langue>.png        paysage 1200 x 630 (og:image du bureau US)
 *   /og/us-midterms/<langue>-carre.png  carré 1080 x 1080
 *   /og/us-midterms/<langue>-story.png  story 1080 x 1920
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { trioCard, type Format } from '../../../lib/share/cards';
import { renderPngServer } from '../../../lib/share/render-server';
import { usTrio } from '../../../data/us-live';
import { partyMeta } from '../../../lib/riding-adapters/parties';

type Lang = 'fr' | 'en' | 'es';

export const getStaticPaths: GetStaticPaths = () =>
  (['fr', 'en', 'es'] as const).flatMap((lang) => ['', '-carre', '-story'].map((s) => ({ params: { file: `${lang}${s}` } })));

export const GET: APIRoute = async ({ params }) => {
  const file = params.file as string;
  const fmt: Format = file.endsWith('-carre') ? 'square' : file.endsWith('-story') ? 'story' : 'wide';
  const lang = file.replace(/-(carre|story)$/, '') as Lang;
  const t = usTrio(lang);
  const tree = trioCard(fmt, lang, { title: t.title, rows: t.rows, voteDay: '2026-11-03', foot: t.foot, color: partyMeta('us-house', 'us_dem').color });
  return new Response(await renderPngServer(tree, fmt), { headers: { 'Content-Type': 'image/png' } });
};
