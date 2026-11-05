/**
 * Images de partage d'une édition du budget, fabriquées au build :
 *   /og/budget/<juridiction>/<édition>/<langue>.png        paysage 1200 x 630 (og:image)
 *   /og/budget/<juridiction>/<édition>/<langue>-carre.png  carré 1080 x 1080
 *   /og/budget/<juridiction>/<édition>/<langue>-story.png  story 1080 x 1920
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { budgetCard, type Format } from '../../../../../lib/share/cards';
import { renderPngServer } from '../../../../../lib/share/render-server';
import { ALL } from '../../../../../lib/budget-data';
import { budgetCardInput, type BudgetData, type Locale } from '../../../../../lib/budget';

export const getStaticPaths: GetStaticPaths = () =>
  ALL.flatMap((d) => (['fr', 'en', 'es'] as const).flatMap((lang) => ['', '-carre', '-story'].map((s) => ({
    params: { slug: d.slug, edition: d.edition, file: `${lang}${s}` }, props: { data: d },
  }))));

export const GET: APIRoute = async ({ params, props }) => {
  const file = params.file as string;
  const fmt: Format = file.endsWith('-carre') ? 'square' : file.endsWith('-story') ? 'story' : 'wide';
  const lang = file.replace(/-(carre|story)$/, '') as Locale;
  const tree = budgetCard(fmt, lang, budgetCardInput((props as { data: BudgetData }).data, lang));
  return new Response(await renderPngServer(tree, fmt), { headers: { 'Content-Type': 'image/png' } });
};
