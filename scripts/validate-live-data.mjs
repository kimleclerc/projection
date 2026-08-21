import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jurisdictions = [
  ['federal', 'FEDNUM'],
  ['ontario', 'FEDNUM'],
  ['quebec', 'CO_CEP'],
  ['uk', 'FEDNUM'],
  ['us-house', 'FEDNUM'],
  ['us-senate', 'riding_id'],
];

const load = (file) => readFile(path.join(root, file), 'utf8').then(JSON.parse);
const id = (value) => {
  const raw = String(value ?? '').trim();
  return /^\d+$/.test(raw) ? String(Number(raw)) : raw;
};
const difference = (left, right) => [...left].filter((value) => !right.has(value));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

let failed = false;

// Aggregators remain useful inside the ingestion pipeline, but they must not
// leak through the publication boundary as primary sources or backlinks.
const blockedPublicSource = /(?:338canada|qc125)/i;
const publicSourceFiles = ['web_data/federal/geo.json'];
for (const jurisdiction of ['federal', 'ontario', 'quebec']) {
  const directory = `web_data/${jurisdiction}/polls`;
  for (const filename of await readdir(path.join(root, directory))) {
    if (filename.endsWith('.json')) publicSourceFiles.push(`${directory}/${filename}`);
  }
}
const leakedSources = [];
for (const filename of publicSourceFiles) {
  if (blockedPublicSource.test(await readFile(path.join(root, filename), 'utf8'))) {
    leakedSources.push(filename);
  }
}
if (leakedSources.length) {
  failed = true;
  console.error(`✗ public source boundary: aggregator provenance leaked into ${leakedSources.length} file(s)`);
} else {
  console.log('✓ public source boundary: no 338Canada/QC125 links or source labels');
}

for (const [jurisdiction, geoId] of jurisdictions) {
  const base = `web_data/${jurisdiction}`;
  const [latest, ridings, geojson] = await Promise.all([
    load(`${base}/latest.json`),
    load(`${base}/ridings.json`),
    load(`${base}/ridings.geojson`),
  ]);
  const liveIds = new Set((latest.ridings ?? []).map((riding) => id(riding.riding_id)));
  const ridingIds = new Set((ridings.ridings ?? []).map((riding) => id(riding.riding_id)));
  const geoIds = new Set((geojson.features ?? []).map((feature) => id(feature.properties?.[geoId])));
  const problems = [
    ...difference(liveIds, ridingIds).map((value) => `latest-only:${value}`),
    ...difference(ridingIds, liveIds).map((value) => `ridings-only:${value}`),
    ...difference(liveIds, geoIds).map((value) => `model-without-geometry:${value}`),
    ...difference(geoIds, liveIds).map((value) => `geometry-without-model:${value}`),
  ];
  if (liveIds.size !== (latest.ridings ?? []).length) problems.push('duplicate model ID');
  if (geoIds.size !== (geojson.features ?? []).length) problems.push('duplicate geometry ID');

  if (problems.length) {
    failed = true;
    console.error(`✗ ${jurisdiction}: ${problems.join(', ')}`);
  } else {
    console.log(`✓ ${jurisdiction}: ${liveIds.size} ridings, model/data/geometry aligned`);
  }
}

// Le baromètre est calculé à partir de la liste de candidatures. Un artefact
// ancien ne doit jamais afficher un total différent de la liste publiée.
const [candidates, equity] = await Promise.all([
  load('web_data/quebec/candidates_2026.json'),
  load('web_data/quebec/equity/qc_2026.json'),
]);
const candidateCount = Object.values(candidates).reduce(
  (total, rows) => total + (Array.isArray(rows) ? rows.length : 0),
  0,
);
if (candidateCount !== equity.n_total) {
  failed = true;
  console.error(`✗ quebec equity: ${equity.n_total} entries for ${candidateCount} published candidacies`);
} else {
  console.log(`✓ quebec equity: ${candidateCount} published candidacies`);
}

// Le radar latino combine les projections et les résultats de primaires. Sa
// date de projection peut légitimement être plus ancienne, mais ses statuts de
// candidatures doivent toujours inclure le dernier bureau des primaires publié.
const [primaryDesk, latinoRadar] = await Promise.all([
  load('web_data/us-primaries/latest.json'),
  load('web_data/us-latino-radar/latest.json'),
]);
const primaryAsOf = primaryDesk.meta?.as_of ?? '';
const radarPrimaryAsOf = latinoRadar.meta?.primaries_as_of ?? '';
const radarProjectionAsOf = latinoRadar.meta?.projection_as_of ?? '';
if (!radarProjectionAsOf || !radarPrimaryAsOf || radarPrimaryAsOf < primaryAsOf) {
  failed = true;
  console.error(
    `✗ latino radar freshness: projection=${radarProjectionAsOf || 'missing'}, ` +
      `primaries=${radarPrimaryAsOf || 'missing'}, primary desk=${primaryAsOf || 'missing'}`,
  );
} else {
  console.log(
    `✓ latino radar: projection ${radarProjectionAsOf}, primaries ${radarPrimaryAsOf}`,
  );
}

// The additive public catalogue must remain a trustworthy view of the
// canonical /web_data/ files. This catches stale manifests before deployment.
const publicManifest = await load('web_data/public-api/latest.json');
const publicDatasets = publicManifest.datasets ?? [];
const publicIds = new Set(publicDatasets.map((dataset) => dataset.id));
const manifestProblems = [];
if (publicManifest.meta?.schema_version !== '1.0') manifestProblems.push('unsupported schema');
if (publicManifest.meta?.dataset_count !== publicDatasets.length) manifestProblems.push('dataset_count mismatch');
if (publicIds.size !== publicDatasets.length) manifestProblems.push('duplicate dataset ID');
const expectedApiDocs = {
  en: 'https://vote-scope.com/api/',
  fr: 'https://vote-scope.com/fr/api/',
  es: 'https://vote-scope.com/es/api/',
};
if (JSON.stringify(publicManifest.meta?.api_docs_urls) !== JSON.stringify(expectedApiDocs)) {
  manifestProblems.push('localized API documentation URLs missing');
}
const expectedCatalogues = {
  elections: ['election_forecast'],
  polls: ['polling_index'],
  candidates: ['candidate_registry'],
  primaries: ['primary_calendar'],
  indexes: ['original_index'],
  'special-elections': ['special_election'],
  'track-record': ['track_record'],
};

for (const dataset of publicDatasets) {
  const pathname = new URL(dataset.latest_url).pathname.replace(/^\//, '');
  try {
    const bytes = await readFile(path.join(root, pathname));
    if (sha256(bytes) !== dataset.latest_sha256) manifestProblems.push(`${dataset.id}: stale checksum`);
  } catch {
    manifestProblems.push(`${dataset.id}: missing latest file`);
  }
  if (!dataset.backlink_url || dataset.attribution?.url !== dataset.backlink_url) {
    manifestProblems.push(`${dataset.id}: invalid backlink attribution`);
  }
}

for (const [name, kinds] of Object.entries(expectedCatalogues)) {
  try {
    const catalogue = await load(`web_data/public-api/${name}.json`);
    const expected = publicDatasets.filter((dataset) => kinds.includes(dataset.kind));
    if (catalogue.meta?.dataset_count !== expected.length) {
      manifestProblems.push(`${name}: dataset_count mismatch`);
    }
    if ((catalogue.datasets ?? []).some((dataset) => !kinds.includes(dataset.kind))) {
      manifestProblems.push(`${name}: unexpected dataset kind`);
    }
    if (publicManifest.meta?.catalogs?.[name] !== `https://vote-scope.com/api/v1/${name}.json`) {
      manifestProblems.push(`${name}: missing stable API URL`);
    }
  } catch {
    manifestProblems.push(`${name}: missing catalogue`);
  }
}

const publicQuebec = publicDatasets.find((dataset) => dataset.id === 'qc-2026');
const canonicalQuebec = await load('web_data/quebec/latest.json');
if (
  publicQuebec?.total_seats !== canonicalQuebec.meta?.total_seats ||
  publicQuebec?.majority_seats !== canonicalQuebec.meta?.majority_threshold
) {
  manifestProblems.push('qc-2026: seat metadata differs from canonical data');
}
const publicQuebecCandidates = publicDatasets.find((dataset) => dataset.id === 'qc-2026-candidates');
if (publicQuebecCandidates?.record_count !== candidateCount) {
  manifestProblems.push('qc-2026-candidates: record count differs from published slate');
}
if (publicIds.has('us-senate-2026-polls')) {
  manifestProblems.push('stale U.S. Senate poll catalogue must not be public');
}

if (manifestProblems.length) {
  failed = true;
  console.error(`✗ public data manifest: ${manifestProblems.join(', ')}`);
} else {
  console.log(`✓ public data manifest: ${publicDatasets.length} datasets, checksums and backlinks valid`);
}

if (failed) process.exit(1);
