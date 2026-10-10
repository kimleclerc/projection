/**
 * Contrôle de langue des pages construites (dist/fr, dist/es).
 * Repère les lignes de texte visible — et les infobulles, libellés d'accessibilité,
 * champs de recherche — qui sont de l'anglais sur une page FR/ES, ou du français
 * sur une page ES. Les noms propres connus (instituts, circonscriptions, titres
 * d'ouvrages) sont dans ALLOW.
 *
 *   node scripts/check-lang.mjs            → rapport
 *   node scripts/check-lang.mjs --strict   → code de sortie 1 s'il reste un écart
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const EN = new Set(`the and of with for from this that these those what which who will would should could have has had been being are was were your our their
seats seat forecast forecasts polls poll open see more results result chance chances majority projected track tracker latest updated update
read view every page pages how why when where here there today now model election elections race races district loading search
house senate governor governors party parties vote votes voters share median range simulations simulation explore show hide close clear
democratic republican democrats republicans others other winner winning margin turnout probability baseline swing lead leads ahead behind
download copy link post back home next previous less only also into over under than then data index indexes meter history unavailable`.split(/\s+/));
const FR = new Set(`les des du sièges sondages chances être était avec dans pour sur mais aussi cette ces leur leurs nous vous quand où projeté projetés voix
mise jour circonscription circonscriptions majorité victoire parti partis élection élections aujourd plus moins`.split(/\s+/));
// Noms propres et titres cités : laissés dans leur langue d'origine.
const ALLOW = /(Washington Post|Data For Progress|Big Data Poll|Race to the WH|\bPAC\b|Institute|Islands|Holland|Wolds|Westminster|Axholme|Telegraph|Times|Association|Honest Poll|ABC News|Pooling the Polls|Monte Carlo|Dubois|Metropolis|Saanich|Kingston|Texans|Long Run|Holborn|Clacton|Winning the Issues|Signal and the Noise|Art of Statistics|Storytelling with Data|Radio-Canada|Bouches-du-Rhône|Corse-du-Sud|Rivière-du-Loup|Côte-du-Sud|Où bouge le vote latino|Parti [a-zé]+ du Québec|Parti Québécois|Québec solidaire|Coalition avenir Québec|Parti canadien du Québec|Parti marxiste-léniniste|data10|Reclaim Party|Iron Workers|political matrix|print\(|for race in |Lame-Duck Index|Canada Goose Index|^Index$|^Vote$|^Districts$|^District$|\d[\d  ]* simulations|\d+ districts|^Projection$|^Contact$)/;

function* pages(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* pages(p);
    else if (name.endsWith('.html')) yield p;
  }
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function linesOf(html) {
  const attrs = [...html.matchAll(/(?:title|aria-label|placeholder|alt)="([^"]{3,})"/g)].map((m) => decode(m[1]));
  const body = html
    .replace(/<head\b[\s\S]*?<\/head>/i, ' ')
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ');
  const text = decode(body.replace(/<[^>]+>/g, '\n'));
  return [...text.split('\n').map((l) => l.trim()).filter((l) => l.length >= 3), ...attrs];
}

const strict = process.argv.includes('--strict');
const found = new Map();
for (const lang of ['fr', 'es']) {
  for (const file of pages(join(DIST, lang))) {
    const route = '/' + relative(DIST, file).replace(/index\.html$/, '');
    for (const line of linesOf(readFileSync(file, 'utf8'))) {
      if (ALLOW.test(line)) continue;
      const words = line.match(/[A-Za-zÀ-ÿ']+/g);
      if (!words) continue;
      const en = words.filter((w) => EN.has(w.toLowerCase()));
      let bad = (en.length >= 2 && en.length / words.length >= 0.3) || (words.length <= 3 && en.length === words.length);
      if (lang === 'es') {
        const fr = words.filter((w) => FR.has(w.toLowerCase()));
        if (fr.length >= 2 && fr.length / words.length >= 0.25) bad = true;
      }
      if (!bad) continue;
      const key = line.slice(0, 110);
      if (!found.has(key)) found.set(key, new Set());
      found.get(key).add(route);
    }
  }
}

if (!found.size) console.log('Langue : aucune ligne anglaise sur les pages FR/ES.');
else {
  console.log(`Langue : ${found.size} ligne(s) à vérifier sur les pages FR/ES`);
  for (const [line, routes] of [...found].sort((a, b) => b[1].size - a[1].size).slice(0, 60)) {
    console.log(`  ${String(routes.size).padStart(3)} × ${line}   (${[...routes][0]})`);
  }
}
if (strict && found.size) process.exit(1);
