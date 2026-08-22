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
 * MISE À JOUR 2026-08-22. Gratter la page d'embed ne suffisait pas : elle est
 * rendue côté client, donc « Market not found » n'apparaît pas dans le HTML
 * initial et un marché RETIRÉ ou RÉSOLU passait le test. Trois embeds vivaient
 * ainsi sur le site — la Coupe Stanley 2026 (retirée de Polymarket) et
 * l'événement Coupe du monde (résolu le 2026-07-20). On interroge désormais
 * l'API Gamma, qui est l'autorité : existence ET statut.
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

const GAMMA = 'https://gamma-api.polymarket.com';

/** Interroge Gamma sur le bon endpoint et rend un verdict. */
async function inspect(slug, kind) {
  const endpoint = kind === 'event' ? 'events' : 'markets';
  const res = await fetch(`${GAMMA}/${endpoint}?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return { ok: false, why: `Gamma HTTP ${res.status}` };
  const rows = await res.json();

  if (!rows.length) {
    // Un slug d'événement passé à ?market= (ou l'inverse) revient vide côté
    // Gamma exactement comme un slug retiré : on teste l'autre endpoint pour
    // distinguer « mauvais kind » de « n'existe plus ».
    const other = kind === 'event' ? 'markets' : 'events';
    const alt = await fetch(`${GAMMA}/${other}?slug=${encodeURIComponent(slug)}`);
    const altRows = alt.ok ? await alt.json() : [];
    if (altRows.length) {
      const fix = kind === 'event' ? 'retirer kind="event"' : 'ajouter kind="event"';
      return { ok: false, why: `mauvais kind — c'est un ${other === 'events' ? 'ÉVÉNEMENT' : 'MARCHÉ'} : ${fix}` };
    }
    return { ok: false, why: 'introuvable sur Gamma — slug retiré par Polymarket' };
  }

  const row = rows[0];
  if (row.closed || row.archived) {
    return { ok: false, why: `RÉSOLU/ARCHIVÉ (fin ${(row.endDate || '').slice(0, 10)}) — l'embed affiche un marché mort` };
  }
  if (kind === 'event') {
    const open = (row.markets || []).filter((m) => !m.closed);
    if (open.length === 0) {
      return { ok: false, why: `événement sans marché ouvert (fin ${(row.endDate || '').slice(0, 10)})` };
    }
    return { ok: true, note: `${open.length} marché(s) ouvert(s)` };
  }
  const prices = JSON.parse(row.outcomePrices || '[]');
  const pct = prices.length ? `${Math.round(Number(prices[0]) * 100)}%` : '—';
  return { ok: true, note: `${pct} · fin ${(row.endDate || '').slice(0, 10)}` };
}

let broken = 0;
for (const [key, e] of seen) {
  let verdict;
  try {
    const r = await inspect(e.slug, e.kind);
    if (r.ok) {
      verdict = `OK  (${r.note})`;
    } else {
      broken++;
      verdict = `CASSÉ  ${r.why}`;
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
