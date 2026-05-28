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
].map((p) => `https://${HOST}${p}`);

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
    urls = CURATED;
    console.log(`Submitting ${urls.length} curated hub/index URLs…`);
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
