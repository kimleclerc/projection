#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, …) after a deploy.
 *
 * IndexNow lets us ping search engines the moment content changes instead
 * of waiting for the next crawl. Bing in particular leans on it heavily.
 *
 * How it works:
 *   1. A verification key file is hosted at the site root
 *      (e218854fe8e84c5d01aba2961670c496.txt). Search engines fetch it to
 *      confirm we own the key before trusting our submissions.
 *   2. We POST a JSON body { host, key, keyLocation, urlList } to one
 *      IndexNow endpoint; participating engines share submissions.
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs               # submit a curated set of
 *                                                  # high-value hub/index URLs
 *   node scripts/submit-indexnow.mjs --all         # submit every sitemap URL
 *                                                  # (batched by 10 000)
 *   node scripts/submit-indexnow.mjs --url <u> …   # submit specific URLs
 *
 * Run AFTER `npm run build` (it reads dist/sitemap-0.xml for --all). Safe to
 * re-run; IndexNow is idempotent.
 *
 * Note: this is a manual/CI step, not part of the static build — Cloudflare
 * Pages can't POST on deploy. Run it locally or from a deploy hook once the
 * new content is live.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const HOST = 'vote-scope.com';
const KEY = 'e218854fe8e84c5d01aba2961670c496';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 10000; // IndexNow hard cap per request

// Curated default set — the pages that change most and matter most for
// fresh-crawl. Used when no --all / --url flag is given.
const CURATED = [
  '/en/', '/fr/', '/es/',
  '/en/canada/', '/fr/canada/', '/es/canada/',
  '/en/canada/federal', '/fr/canada/federal', '/es/canada/federal',
  '/en/canada/quebec', '/fr/canada/quebec', '/es/canada/quebec',
  '/en/canada/ontario', '/fr/canada/ontario', '/es/canada/ontario',
  '/en/us/', '/fr/us/', '/es/us/',
  '/en/us/house', '/fr/us/chambre', '/es/us/house',
  '/en/us/senate', '/fr/us/senat', '/es/us/senate',
  '/en/us/indexes/lame-duck/', '/fr/us/indexes/lame-duck/', '/es/us/indexes/lame-duck/',
  '/en/uk/general-election/', '/fr/uk/general-election/', '/es/uk/general-election/',
  '/en/indexes/fraser-interim/', '/fr/indexes/fraser-interim/',
  '/en/sports/nhl/', '/fr/sports/nhl/', '/es/sports/nhl/',
  // France — toute la section manquait, d'où des pages candidat jamais
  // soumises (rapport Bing du 2026-08-04 : /fr/france/candidats/francois-hollande/).
  '/en/france/', '/fr/france/', '/es/france/',
  '/en/france/candidates/', '/fr/france/candidats/', '/es/france/candidatos/',
  // Hubs de partielles — absents jusqu'au 2026-08-04, alors que ce sont les
  // pages les plus mouvantes du site pendant une campagne.
  '/en/canada/byelections/', '/fr/canada/byelections/', '/es/canada/byelections/',
  '/en/canada/ontario/byelections/', '/fr/canada/ontario/byelections/', '/es/canada/ontario/byelections/',
  '/en/uk/byelections/clacton/', '/fr/uk/byelections/clacton/', '/es/uk/byelections/clacton/',
].map((p) => `https://${HOST}${p}`);

/** Desks de partielles individuels, repris du sitemap.
 *
 * Ils changent à chaque run et disparaissent après le scrutin : les lister à la
 * main garantit qu'on en oublie (rapport Bing du 2026-08-04 — Hamilton-Est—Stoney
 * Creek jamais soumise). On les ramasse par motif, donc toute nouvelle course
 * entre automatiquement dans l'envoi par défaut.
 */
const BYELECTION_PATTERN =
  /^https:\/\/vote-scope\.com\/(en|fr|es)\/(canada|canada\/ontario|uk)\/byelections\/[a-z0-9-]+\/$/;

/** Fiches candidat France — même raison : la liste bouge (déclarations,
 *  retraits), et le rapport Bing du 2026-08-04 signalait
 *  /fr/france/candidats/francois-hollande/ jamais soumise. */
const FR_CANDIDATE_PATTERN =
  /^https:\/\/vote-scope\.com\/(en|fr|es)\/france\/(candidates|candidats|candidatos)\/[a-z0-9-]+\/$/;

/** Pages de détail sensibles au temps, reprises du sitemap à chaque envoi. */
const AUTO_PATTERNS = [BYELECTION_PATTERN, FR_CANDIDATE_PATTERN];

function readSitemapUrls() {
  const sm = resolve(ROOT, 'dist', 'sitemap-0.xml');
  if (!existsSync(sm)) {
    console.error(`✗ ${sm} not found — run \`npm run build\` first.`);
    process.exit(1);
  }
  const xml = readFileSync(sm, 'utf-8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function submitBatch(urlList) {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  return res.status;
}

async function main() {
  const args = process.argv.slice(2);
  let urls;
  if (args[0] === '--all') {
    urls = readSitemapUrls();
    console.log(`Submitting ALL ${urls.length} sitemap URLs…`);
  } else if (args[0] === '--url') {
    urls = args.slice(1);
    console.log(`Submitting ${urls.length} explicit URL(s)…`);
  } else {
    // Curated + tous les desks de partielles présents au sitemap : ces pages
    // naissent et meurent au rythme des scrutins, une liste figée les rate.
    const auto = readSitemapUrls().filter((u) => AUTO_PATTERNS.some((re) => re.test(u)));
    urls = [...new Set([...CURATED, ...auto])];
    console.log(
      `Submitting ${urls.length} curated URLs (${CURATED.length} hubs + ${auto.length} time-sensitive detail pages)…`,
    );
  }

  if (urls.length === 0) {
    console.error('✗ No URLs to submit.');
    process.exit(1);
  }

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const status = await submitBatch(batch);
    // IndexNow returns 200 (accepted) or 202 (accepted, pending validation).
    const ok = status === 200 || status === 202;
    console.log(`  batch ${i / BATCH_SIZE + 1}: ${batch.length} URLs → HTTP ${status} ${ok ? '✓' : '✗'}`);
    if (!ok) {
      console.error('  Non-success status. Check key file is live at', KEY_LOCATION);
    }
  }
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
