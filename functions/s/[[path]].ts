/**
 * Lien de partage d'un module : /s/<carte|projection|graphique>/<scrutin>/<langue>
 *
 * Les réseaux (X, Facebook, Bluesky, iMessage) lisent les balises og: de CETTE
 * adresse : l'aperçu montre donc l'image du module partagé (la carte, le tableau,
 * la courbe), pas l'image générique de la page. Une personne est renvoyée tout
 * de suite à l'endroit de la page où se trouve le module. Aucune page dans le
 * déploiement : la réponse est fabriquée ici. La destination est tirée d'une
 * table fixe (pas d'un paramètre), donc pas de redirection ouverte.
 */
import { SHARE_ELECTIONS, SHARE_KINDS, SIM_RE, type Lang, type ShareKind } from '../../src/lib/share/elections';

type Ctx = { request: Request; params: { path?: string[] } };
const LANGS = new Set(['fr', 'en', 'es']);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const DESC = {
  fr: (what: string, name: string) => `Vote-Scope — ${what} : ${name}. Projection indépendante, mise à jour chaque jour.`,
  en: (what: string, name: string) => `Vote-Scope — ${what}: ${name}. Independent forecast, updated daily.`,
  es: (what: string, name: string) => `Vote-Scope — ${what}: ${name}. Proyección independiente, actualizada cada día.`,
};
const GO = { fr: 'Ouvrir sur Vote-Scope', en: 'Open on Vote-Scope', es: 'Abrir en Vote-Scope' };

export const onRequestGet = async ({ request, params }: Ctx) => {
  const [kind, key, lang] = (params.path ?? []) as [ShareKind, string, Lang];
  const el = SHARE_ELECTIONS[key];
  if (!el || !(kind in SHARE_KINDS) || !LANGS.has(lang)) return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  const v = (url.searchParams.get('v') ?? '').replace(/[^0-9-]/g, '').slice(0, 10);
  const origin = url.origin;
  // Un scénario rouvre le simulateur sur les mêmes curseurs ; le reste, la page à l'ancre du module.
  const sim = url.searchParams.get('sim') ?? '';
  if (kind === 'scenario' && (!el.simulator || !SIM_RE.test(sim))) return new Response('Not found', { status: 404 });
  const page = kind === 'scenario'
    ? `${origin}${el.simulator![lang]}?sim=${encodeURIComponent(sim)}`
    : `${origin}${el.page[lang]}#${SHARE_KINDS[kind].anchor}`;
  const image = kind === 'scenario'
    ? `${origin}/og/live/scenario/${key}/${lang}.png?sim=${encodeURIComponent(sim)}`
    : `${origin}/og/live/${kind}/${key}/${lang}.png${v ? `?v=${v}` : ''}`;
  const title = `${el.question[lang]} — Vote-Scope`;
  const what = SHARE_KINDS[kind].label[lang];
  const desc = DESC[lang](what.charAt(0).toUpperCase() + what.slice(1), el.name[lang]);
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${esc(`${origin}${el.page[lang]}`)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Vote-Scope">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url.toString())}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@kimleclerc">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=${esc(page)}">
</head><body style="font-family:system-ui,sans-serif;padding:24px">
<p><a href="${esc(page)}">${GO[lang]}</a></p>
<script>location.replace(${JSON.stringify(page)})</script>
</body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
};
