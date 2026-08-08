import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://vote-scope.com';

const requiredFiles = [
  'llms.txt',
  'llms-long.txt',
  'llms-full.txt',
  'ai-index.json',
  'ai.txt',
  'sitemap-index.xml',
];

for (const file of requiredFiles) {
  assert(existsSync(join(DIST, file)), `missing generated file: /${file}`);
}

const short = readFileSync(join(DIST, 'llms.txt'), 'utf8');
const long = readFileSync(join(DIST, 'llms-long.txt'), 'utf8');
const full = readFileSync(join(DIST, 'llms-full.txt'), 'utf8');
const catalog = JSON.parse(readFileSync(join(DIST, 'ai-index.json'), 'utf8'));

for (const path of ['/llms-long.txt', '/llms-full.txt', '/ai-index.json', '/ai.txt']) {
  assert(short.includes(`${ORIGIN}${path}`), `llms.txt does not link to ${path}`);
}
for (const path of ['/llms.txt', '/llms-full.txt', '/ai-index.json']) {
  assert(long.includes(`${ORIGIN}${path}`), `llms-long.txt does not link to ${path}`);
}
for (const path of ['/llms.txt', '/llms-long.txt', '/ai-index.json']) {
  assert(full.includes(`${ORIGIN}${path}`), `llms-full.txt does not link to ${path}`);
}

assert(!full.includes('Instantané des projections'), 'llms-full.txt contains a volatile forecast snapshot');
assert(!full.includes('fallback MVN silencieux'), 'llms-full.txt exposes an internal fallback note');

const sourceDatasets = new Map([
  ['federal', readJson('web_data/federal/latest.json')],
  ['quebec', readJson('web_data/quebec/latest.json')],
  ['ontario', readJson('web_data/ontario/latest.json')],
  ['us-house', readJson('web_data/us-house/latest.json')],
  ['us-senate', readJson('web_data/us-senate/latest.json')],
  ['uk', readJson('web_data/uk/latest.json')],
]);

for (const dataset of catalog.datasets) {
  const source = sourceDatasets.get(dataset.id);
  assert(source, `unknown catalog dataset: ${dataset.id}`);
  for (const field of [
    'run_date',
    'total_seats',
    'majority_threshold',
    'n_polls',
    'n_bsts_draws',
    'n_monte_carlo_simulations',
    'n_simulations',
  ]) {
    assert(
      dataset.meta[field] === source.meta[field],
      `${dataset.id}.${field} differs between ai-index.json and source JSON`
    );
  }
  const monteCarloCount =
    source.meta.n_monte_carlo_simulations ?? source.meta.n_simulations;
  assert(
    monteCarloCount >= 50_000,
    `${dataset.id} must expose at least 50,000 election-level Monte Carlo simulations`
  );
}

const federal = sourceDatasets.get('federal');
assert(federal.meta.n_bsts_draws === 10_000, 'Federal source must expose 10,000 BSTS/MCMC draws');
assert(
  federal.meta.n_monte_carlo_simulations === 50_000,
  'Federal source must expose 50,000 election-level Monte Carlo simulations'
);
assert(
  full.includes('Do not describe `meta.n_bsts_draws` as the Monte Carlo election count'),
  'llms-full.txt does not distinguish BSTS draws from election-level Monte Carlo simulations'
);

const quebec = sourceDatasets.get('quebec');
assert(quebec.meta.total_seats === 127, 'Québec source must expose the 127-seat map');
assert(quebec.meta.majority_threshold === 64, 'Québec majority threshold must be 64');
assert(short.includes('127 seats, majority 64'), 'llms.txt does not reflect Québec source metadata');

for (const section of catalog.sections) {
  for (const [locale, pages] of Object.entries(section.pages)) {
    for (const page of pages) {
      assertPublicUrl(page.href, `${section.id}.${locale}`);
    }
  }
}

for (const sample of [
  'en/index.html',
  'fr/index.html',
  'es/index.html',
  'en/uk/byelections/clacton/index.html',
  'fr/france/candidats/marine-le-pen/index.html',
]) {
  const htmlPath = join(DIST, sample);
  assert(existsSync(htmlPath), `missing sample HTML page: /${sample}`);
  const html = readFileSync(htmlPath, 'utf8');
  assert(html.includes('class="discovery-strip"'), `missing contextual discovery rail in /${sample}`);
  for (const document of ['/llms.txt', '/llms-long.txt', '/llms-full.txt', '/ai-index.json']) {
    assert(html.includes(`href="${document}"`), `missing ${document} alternate in /${sample}`);
  }
}

console.log(`✓ AI discovery validation passed (${catalog.sections.length} sections, ${catalog.datasets.length} datasets)`);

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
}

function assertPublicUrl(url, context) {
  assert(url.startsWith(ORIGIN), `${context}: external URL in internal discovery graph: ${url}`);
  const pathname = new URL(url).pathname;
  const relative = pathname.replace(/^\/+/, '');
  const candidates = pathname.match(/\.[a-z0-9]+$/i)
    ? [join(DIST, relative)]
    : [join(DIST, relative, 'index.html'), join(DIST, `${relative}.html`)];
  assert(candidates.some(existsSync), `${context}: generated target not found for ${pathname}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(`AI discovery validation failed: ${message}`);
}
