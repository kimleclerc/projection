/**
 * Contrôle des règles de design (docs/DESIGN.md).
 *
 *   node scripts/check-design.mjs            → bilan par règle et fichiers les plus touchés
 *   node scripts/check-design.mjs --strict   → code de sortie 1 s'il reste un écart
 *   node scripts/check-design.mjs --list R   → toutes les occurrences de la règle R
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP = ['src/pages/essai-polices.astro', 'src/lib/og/', 'src/lib/wc-flags.ts'];
// Une ligne qui contient « design-ok » est une exception assumée (hachure qui porte une
// information, légende de carte, etc.) : elle n'est pas comptée.

const RULES = [
  { id: 'ombre', label: 'ombre portée', re: /box-shadow\s*:(?!\s*(?:none|inset))[^;"'`}]+/g },
  { id: 'verre', label: 'verre dépoli', re: /backdrop-filter\s*:/g },
  { id: 'degrade', label: 'dégradé', re: /(?:linear|radial|conic)-gradient\(/g },
  { id: 'pilule', label: 'pilule (rayon 999 px)', re: /border-radius\s*:\s*(?:999|9999|100)px/g },
  { id: 'arrondi', label: 'arrondi de 8 px et plus', re: /border-radius\s*:\s*(?:[89]|[1-9]\d)px/g },
  { id: 'majuscules', label: 'majuscules forcées', re: /text-transform\s*:\s*uppercase|textTransform\s*:\s*['"]uppercase/g },
  { id: 'interlettrage', label: 'interlettrage large (≥ 0,04 em)', re: /letter-spacing\s*:\s*0?\.(?:0[4-9]|[1-9]\d*)em/g },
  { id: 'barre-gauche', label: 'barre de couleur à gauche', re: /border-left\s*:\s*[2-6]px\s+solid/g },
  { id: 'animation', label: 'animation @keyframes', re: /@keyframes\s/g },
  { id: 'fleche', label: 'flèche collée à un libellé', re: / →(?=\s*(?:<\/|['"`]|\)|\}))/g },
  { id: 'creme', label: 'ancienne couleur crème en dur', re: /#(?:f5f1e8|ede8db|faf7ef|fffdf6|f6f2ea|fffdf8)\b/gi },
  { id: 'mono', label: 'police mono nommée', re: /JetBrains|Geist|Newsreader|ui-monospace/g },
  { id: 'emoji', label: 'émoji dans l’interface', re: /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2728}\u{1FA70}-\u{1FAFF}]/gu },
];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(ROOT, path);
    if (SKIP.some((s) => rel.startsWith(s))) continue;
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(astro|tsx|ts|css)$/.test(name)) yield path;
  }
}

const strict = process.argv.includes('--strict');
const listIdx = process.argv.indexOf('--list');
const listRule = listIdx > -1 ? process.argv[listIdx + 1] : null;

const totals = Object.fromEntries(RULES.map((r) => [r.id, 0]));
const perFile = new Map();
for (const path of files(join(ROOT, 'src'))) {
  const text = readFileSync(path, 'utf8');
  const rel = relative(ROOT, path);
  for (const rule of RULES) {
    const hits = [...text.matchAll(rule.re)].filter((h) => {
      const start = text.lastIndexOf('\n', h.index) + 1;
      const end = text.indexOf('\n', h.index);
      return !text.slice(start, end === -1 ? undefined : end).includes('design-ok');
    });
    if (!hits.length) continue;
    totals[rule.id] += hits.length;
    perFile.set(rel, (perFile.get(rel) ?? 0) + hits.length);
    if (listRule === rule.id) {
      for (const h of hits) {
        const line = text.slice(0, h.index).split('\n').length;
        console.log(`${rel}:${line}  ${h[0].slice(0, 70)}`);
      }
    }
  }
}

if (!listRule) {
  console.log('Règles de design (docs/DESIGN.md)');
  for (const r of RULES) console.log(`  ${String(totals[r.id]).padStart(5)}  ${r.id.padEnd(14)} ${r.label}`);
  const top = [...perFile].sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (top.length) {
    console.log('\nFichiers les plus touchés');
    for (const [f, n] of top) console.log(`  ${String(n).padStart(5)}  ${f}`);
  }
}
const remaining = Object.values(totals).reduce((a, b) => a + b, 0);
if (strict && remaining) process.exit(1);
