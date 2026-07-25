// scripts/budget-i18n.mjs — extract/apply pour la traduction déléguée (Haiku).
//
//   node scripts/budget-i18n.mjs extract   → web_data/budget/_i18n/<slug>-<year>.todo.json
//   node scripts/budget-i18n.mjs apply      ← web_data/budget/_i18n/<slug>-<year>.done.json
//
// extract : parcourt chaque JSON budget, collecte les objets prose {en,fr,es}
//   dont une cible manque (es toujours ; en pour QC). Sortie = map plate
//   { "chemin": { src, from, targets:[...] } }. Haiku ne touche QUE ce fichier
//   plat → il ne peut pas corrompre la structure ni les nombres.
// apply : réécrit en/es dans le JSON principal à chaque chemin.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'web_data', 'budget');
const I18N = path.join(OUT, '_i18n');

const FILES = [
  ['canada', '2025'],
  ['ontario', '2026'],
  ['quebec', '2026'],
];

const isProse = (v) => v && typeof v === 'object' && 'en' in v && 'fr' in v && 'es' in v && !Array.isArray(v);

function walk(node, prefix, visit) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${prefix}.${i}`, visit));
  } else if (node && typeof node === 'object') {
    if (isProse(node)) { visit(prefix, node); return; }
    for (const k of Object.keys(node)) walk(node[k], prefix ? `${prefix}.${k}` : k, visit);
  }
}

function getAt(obj, p) {
  return p.split('.').reduce((o, k) => (o == null ? o : o[Array.isArray(o) ? Number(k) : k]), obj);
}

function extract() {
  fs.mkdirSync(I18N, { recursive: true });
  for (const [slug, year] of FILES) {
    const data = JSON.parse(fs.readFileSync(path.join(OUT, slug, `${year}.json`), 'utf8'));
    const todo = {};
    walk(data, '', (p, prose) => {
      const targets = [];
      if (!prose.es) targets.push('es');
      if (!prose.en) targets.push('en');
      if (!targets.length) return;
      const from = prose.en ? 'en' : 'fr';
      const src = prose[from];
      if (!src) return;
      todo[p] = { src, from, targets };
    });
    const file = path.join(I18N, `${slug}-${year}.todo.json`);
    fs.writeFileSync(file, JSON.stringify(todo, null, 2));
    console.log(`✓ ${slug}-${year}.todo.json — ${Object.keys(todo).length} champs à traduire`);
  }
}

function apply() {
  for (const [slug, year] of FILES) {
    const doneFile = path.join(I18N, `${slug}-${year}.done.json`);
    if (!fs.existsSync(doneFile)) { console.log(`⚠ ${slug}-${year}.done.json absent — sauté`); continue; }
    const done = JSON.parse(fs.readFileSync(doneFile, 'utf8'));
    const mainFile = path.join(OUT, slug, `${year}.json`);
    const data = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
    let n = 0;
    for (const [p, tr] of Object.entries(done)) {
      const node = getAt(data, p);
      if (!isProse(node)) continue;
      if (tr.es != null && !node.es) { node.es = tr.es; n++; }
      if (tr.en != null && !node.en) { node.en = tr.en; n++; }
    }
    // Purge le drapeau de traduction si tout est rempli.
    let remaining = 0;
    walk(data, '', (_p, prose) => { if (!prose.en || !prose.es) remaining++; });
    data.meta.needs_translation = remaining ? data.meta.needs_translation : [];
    fs.writeFileSync(mainFile, JSON.stringify(data, null, 2));
    console.log(`✓ ${slug}/${year}.json — ${n} champs remplis, ${remaining} prose encore incomplètes`);
  }
}

const mode = process.argv[2];
if (mode === 'extract') extract();
else if (mode === 'apply') apply();
else { console.error('usage: node scripts/budget-i18n.mjs extract|apply'); process.exit(1); }
