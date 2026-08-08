#!/usr/bin/env node
/**
 * check-polymarket-embeds — vérifie que chaque embed Polymarket du site
 * pointe sur un marché qui existe VRAIMENT.
 *
 * Pourquoi un script dédié. Le mode d'échec est silencieux : passer un slug
 * d'ÉVÉNEMENT (plusieurs issues, ex. « next-french-presidential-election »,
 * 128 marchés) au paramètre `?market=` renvoie un **HTTP 200** portant une
 * carte « Market not found ». Aucun vérificateur de liens ne le voit — seul
 * l'œil sur la page. C'est exactement ainsi que le desk France et la Coupe
 * du monde sont restés cassés sans alerte.
 *
 * Règle : `?market=` pour une question oui/non unique, `?event=` pour un
 * événement à issues multiples (prop `kind="event"` du composant).
 *
 * Usage : node scripts/check-polymarket-embeds.mjs
 * Sortie : code 1 si au moins un embed est cassé.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (extname(e.name) === '.astro') out.push(p);
  }
  return out;
}

/** Extrait les <PolymarketEmbed …> et leur couple (slug, kind). */
function extractEmbeds(source, file) {
  const found = [];
  const re = /<PolymarketEmbed\b([\s\S]*?)\/>/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const attrs = m[1];
    const slug = attrs.match(/\bslug=["']([^"']+)["']/)?.[1];
    if (!slug) continue; // slug dynamique ou null : hors périmètre
    const kind = attrs.match(/\bkind=["'](market|event)["']/)?.[1] ?? 'market';
    found.push({ slug, kind, file: file.replace(ROOT, '') });
  }
  return found;
}

const files = await walk(SRC);
const embeds = [];
for (const f of files) embeds.push(...extractEmbeds(await readFile(f, 'utf8'), f));

// Dédoublonne : le même couple slug/kind n'a pas besoin de N appels réseau.
const seen = new Map();
for (const e of embeds) {
  const key = `${e.kind}:${e.slug}`;
  if (!seen.has(key)) seen.set(key, { ...e, files: [] });
  seen.get(key).files.push(e.file);
}

console.log(`Embeds Polymarket trouvés : ${embeds.length} (${seen.size} uniques)\n`);

let broken = 0;
for (const [key, e] of seen) {
  const param = e.kind === 'event' ? 'event' : 'market';
  const url = `https://embed.polymarket.com/market?${param}=${e.slug}`;
  let verdict;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const body = await res.text();
    // Le 200 ne prouve rien : c'est la carte d'erreur qu'il faut chercher.
    const notFound = /Market not found/i.test(body);
    if (!res.ok || notFound) {
      broken++;
      const why = notFound ? 'carte « Market not found »' : `HTTP ${res.status}`;
      const hint = e.kind === 'market'
        ? ' — slug d\'ÉVÉNEMENT passé à ?market= ? essayer kind="event"'
        : ' — slug de MARCHÉ passé à ?event= ? retirer kind="event"';
      verdict = `CASSÉ  (${why})${hint}`;
    } else {
      verdict = 'OK';
    }
  } catch (err) {
    broken++;
    verdict = `INJOIGNABLE (${err.message})`;
  }
  console.log(`  ${verdict.startsWith('OK') ? '✓' : '✗'} ${key}\n      ${verdict}`);
  if (!verdict.startsWith('OK')) console.log(`      utilisé par : ${e.files.join(', ')}`);
}

console.log();
if (broken) {
  console.error(`✗ ${broken} embed(s) Polymarket cassé(s).`);
  process.exit(1);
}
console.log('✓ Tous les embeds Polymarket résolvent.');
