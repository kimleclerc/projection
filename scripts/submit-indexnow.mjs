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
  // Gouverneurs — section ouverte le 2026-09-04. Les trois pages de
  // projection et les deux index bougent à chaque run nocturne.
  '/en/us/governors', '/fr/us/gouverneurs', '/es/us/gobernadores',
  '/en/us/governors/races/', '/fr/us/gouverneurs/courses/', '/es/us/gobernadores/carreras/',
  '/en/us/governors/polls/', '/fr/us/gouverneurs/sondages/', '/es/us/gobernadores/sondeos/',
  '/en/us/indexes/lame-duck/', '/fr/us/indexes/lame-duck/', '/es/us/indexes/lame-duck/',
  // Les indices « maison » bougent tous les jours et n'étaient jamais soumis,
  // à l'exception du canard boiteux : le hub, la Bernache et surtout le pupitre
  // de la guerre commerciale, qui se met à jour avec les marchés live.
  '/en/indexes/', '/fr/indexes/', '/es/indexes/',
  '/en/indexes/cusma-showdown/', '/fr/indexes/cusma-showdown/', '/es/indexes/cusma-showdown/',
  '/en/canada/indexes/canada-goose/', '/fr/canada/indexes/canada-goose/', '/es/canada/indexes/canada-goose/',
  // Le jeu québécois, publié le 2026-08-22 et jamais annoncé aux moteurs.
  '/en/canada/quebec/match/', '/fr/canada/quebec/match/', '/es/canada/quebec/match/',
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
  // Desk interactif — le hub et les quatre simulateurs n'étaient dans aucune
  // des deux listes : `npm run indexnow` ne les a jamais soumis. Leurs sièges
  // sont réancrés à chaque run, donc ils bougent tous les jours.
  '/en/tools/', '/fr/outils/', '/es/herramientas/',
  '/en/tools/quebec-simulator/', '/fr/outils/simulateur-quebec/', '/es/herramientas/simulador-quebec/',
  '/en/tools/canada-simulator/', '/fr/outils/simulateur-canada/', '/es/herramientas/simulador-canada/',
  '/en/tools/ontario-simulator/', '/fr/outils/simulateur-ontario/', '/es/herramientas/simulador-ontario/',
  '/en/tools/us-house-simulator/', '/fr/outils/simulateur-chambre-us/', '/es/herramientas/simulador-camara-us/',
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

/** IndexNow REFUSE les chemins relatifs, en silence pour le lot entier.
 *
 *  Mesuré le 2026-09-04 : `{"urlList":["/en/us/governors/"]}` → HTTP 422 ;
 *  la même URL en absolu → HTTP 200. Or CURATED ne porte que des chemins
 *  (`'/en/'`, `'/en/us/senate'`, …) et le lot ne passait que parce que les
 *  pages tirées du sitemap, elles, sont absolues : l'API acceptait la requête
 *  et les 86 hubs curatés étaient perdus à chaque envoi. Le script annonçait
 *  « HTTP 200 ✓ » sans avoir soumis ce qu'il existe pour soumettre.
 *
 *  Les entrées déjà absolues passent inchangées (cas du sitemap et de --url). */
function absolute(entry) {
  const value = String(entry).trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${HOST}${value.startsWith('/') ? '' : '/'}${value}`;
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
    const batch = urls.slice(i, i + BATCH_SIZE).map(absolute);
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
