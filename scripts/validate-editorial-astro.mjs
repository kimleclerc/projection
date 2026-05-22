import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [];

function check(name, condition, detail = '') {
  checks.push({ name, condition: Boolean(condition), detail });
}

function read(path) {
  const fullPath = join(root, path);
  return existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : '';
}

function fileIncludes(path, needles) {
  const content = read(path);
  return needles.every((needle) => content.includes(needle));
}

const expectedFiles = [
  'src/data/editorial.ts',
  'src/components/EditorialHero.astro',
  'src/components/InstrumentGrid.astro',
  'src/islands/InstrumentFilter.tsx',
  'src/islands/SignalTicker.tsx',
  'src/components/MarketCheck.astro',
  'src/components/MethodologyNote.astro',
  'src/layouts/EditorialLayout.astro',
  'src/pages/en/index.astro',
  'src/pages/en/us/index.astro',
  'src/pages/en/canada/index.astro',
  'src/pages/en/sports/index.astro',
  'src/pages/en/indexes/index.astro',
  'src/pages/fr/index.astro',
  'src/pages/fr/us/index.astro',
  'src/pages/fr/canada/index.astro',
  'src/pages/fr/sports/index.astro',
  'src/pages/fr/indexes/index.astro',
  'src/pages/en/us/specials/[slug].astro',
  'src/pages/fr/us/specials/[slug].astro',
  'src/pages/es/us/specials/[slug].astro',
  'src/data/specialElections.ts',
];

for (const path of expectedFiles) {
  check(`exists: ${path}`, existsSync(join(root, path)));
}

check(
  'Astro uses explicit /en and /fr editions',
  fileIncludes('astro.config.mjs', ['preact()', 'prefixDefaultLocale: true', 'redirectToDefaultLocale: true']),
  'astro.config.mjs should prefix the default locale and redirect / to /en/'
);

check(
  'Brand philosophy is encoded in editorial data',
  fileIncludes('src/data/editorial.ts', [
    'bureau of electoral and sports intelligence',
    'Not just who’s ahead',
    'Pas juste qui mène',
    'one page, one question',
  ])
);

check(
  'English home page exposes the editorial promise',
  fileIncludes('src/pages/en/index.astro', [
    'Not just who’s ahead',
    'bureau of electoral and sports intelligence',
    'What’s moving',
  ])
);

check(
  'French home page exposes the editorial promise',
  fileIncludes('src/pages/fr/index.astro', [
    'Pas juste qui mène',
    'bureau d’intelligence électorale et sportive',
    'Ce qui bouge',
  ])
);

check(
  'Indexes catalog includes priority instruments',
  fileIncludes('src/data/editorial.ts', [
    'Lame-Duck Index',
    'Majority Fragility Index',
    'Model vs Market Gap',
    'Cup Path Index',
    'Goalie Volatility Index',
  ])
);

check(
  'Astro islands are used for reusable interactive surfaces',
  fileIncludes('src/pages/en/indexes/index.astro', ['client:visible']) &&
    fileIncludes('src/islands/InstrumentFilter.tsx', ['useState', 'data-instrument-filter']) &&
    fileIncludes('src/islands/SignalTicker.tsx', ['data-signal-ticker']),
  'indexes should hydrate the filter as an island, not as page-global legacy JS'
);

check(
  'Redirects include legacy language and index routes',
  fileIncludes('_redirects', [
    '/fr/usa/canard-boiteux /fr/us/indexes/lame-duck 301',
    '/usa/lame-duck /en/us/indexes/lame-duck 301',
    '/usa-hub.html /en/us/ 301',
    '/sports/nhl/ /en/sports/nhl/ 301',
  ])
);

check(
  'Redirects include CA-1 special routes',
  fileIncludes('_redirects', [
    '/ca1-special /en/us/specials/ca1/ 301',
    '/us/ca1-special /en/us/specials/ca1/ 301',
  ])
);

check(
  'Special election routes are config-driven',
  fileIncludes('src/data/specialElections.ts', [
    "ca1: {",
    "dataPath: 'ca1-special'",
    "en: '/en/us/specials/ca1/'",
  ])
);

const failures = checks.filter((entry) => !entry.condition);

if (failures.length) {
  console.error(`Editorial Astro validation failed (${failures.length}/${checks.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure.name}${failure.detail ? `: ${failure.detail}` : ''}`);
  }
  process.exit(1);
}

console.log(`Editorial Astro validation passed (${checks.length} checks).`);
