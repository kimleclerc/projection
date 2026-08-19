import { readFile } from 'node:fs/promises';
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

let failed = false;

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

if (failed) process.exit(1);
