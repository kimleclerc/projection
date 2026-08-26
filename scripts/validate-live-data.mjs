import { readFile, readdir, stat } from 'node:fs/promises';
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

// Les cartes OG de partage sont générées par le moteur, publiées comme des
// fichiers statiques et illustrées de chiffres qu'elles gravent en pixels : rien
// dans un PNG ne dit de quel run il sort. C'est ainsi que les 642 cartes du
// Radar latino ont dérivé cinq semaines (publish_web.py ne copiait pas
// public/og/) — les pages montraient les chiffres du jour, les cartes
// annonçaient « Updated 2026-07-22 » avec d'autres valeurs, et aucune alerte
// n'a sonné. Chaque jeu de cartes porte donc désormais un manifest.json daté,
// et ce gardien refuse un jeu plus vieux que les données qu'il illustre.
const ogSets = new Map();
for (const entry of await readdir(path.join(root, 'web_data'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  let raw;
  try {
    raw = await readFile(path.join(root, 'web_data', entry.name, 'latest.json'), 'utf8');
  } catch {
    continue;
  }
  // Parser 6 Mo de JSON à chaque build pour une clé absente de 41 desks sur 42
  // ne se justifie pas : le test texte coûte un balayage et tranche.
  if (!raw.includes('"social_cards"')) continue;
  const payload = JSON.parse(raw);
  for (const race of payload.races ?? []) {
    for (const cardPath of Object.values(race.social_cards ?? {})) {
      const [, , setName] = String(cardPath).split('/');
      if (!setName) continue;
      if (!ogSets.has(setName)) {
        ogSets.set(setName, { dataset: entry.name, runDate: payload.meta?.run_date ?? '', cards: new Set() });
      }
      ogSets.get(setName).cards.add(String(cardPath));
    }
  }
}

// Les cartes rendues au build par satori s'écrivent dans dist/og/<segment>/,
// et public/og/ y est recopié tel quel : un jeu du moteur qui porterait le nom
// d'un segment de route écraserait — ou serait écrasé par — ces cartes, sans
// un mot. Les segments sont lus sur le disque plutôt que recopiés ici, pour
// qu'une route ajoutée demain entre d'elle-même dans la comparaison.
const hubKeys = [...(await readFile(path.join(root, 'src/lib/polls-hubs.ts'), 'utf8'))
  .matchAll(/webKey:\s*'([^']+)'/g)].map((match) => match[1]);
const reservedOgSegments = new Set(
  (await readdir(path.join(root, 'src/pages/og'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => (entry.name === '[key]' ? hubKeys : [entry.name])),
);

const ogProblems = [];
for (const [setName, { dataset, runDate, cards }] of [...ogSets].sort(([a], [b]) => a.localeCompare(b))) {
  if (reservedOgSegments.has(setName)) {
    ogProblems.push(`${setName}: name collides with a built /og/${setName}/ route`);
  }
  let manifest;
  try {
    manifest = await load(`public/og/${setName}/manifest.json`);
  } catch {
    ogProblems.push(`${setName}: no manifest.json — cards cannot be dated`);
    continue;
  }
  if (!manifest.run_date || manifest.run_date < runDate) {
    ogProblems.push(
      `${setName}: cards are from ${manifest.run_date || 'an unknown run'}, ` +
        `${dataset} data is from ${runDate}`,
    );
  }
  if (manifest.card_count !== cards.size) {
    ogProblems.push(`${setName}: manifest counts ${manifest.card_count} cards, ${dataset} declares ${cards.size}`);
  }
  const absent = [];
  for (const cardPath of cards) {
    // stat, pas readFile : 642 cartes font ~26 Mo, et seule leur présence importe.
    try {
      await stat(path.join(root, 'public', cardPath.replace(/^\//, '')));
    } catch {
      absent.push(cardPath);
    }
  }
  if (absent.length) ogProblems.push(`${setName}: ${absent.length} declared card(s) missing, e.g. ${absent[0]}`);
}

if (ogProblems.length) {
  failed = true;
  console.error(`✗ social cards: ${ogProblems.join(', ')}`);
} else {
  const total = [...ogSets.values()].reduce((sum, set) => sum + set.cards.size, 0);
  console.log(`✓ social cards: ${ogSets.size} set(s), ${total} cards current with their data`);
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
