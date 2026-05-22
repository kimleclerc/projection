import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const latestPath = path.join(repoRoot, 'web_data/quebec/latest.json');
const geojsonPath = path.join(repoRoot, 'web_data/quebec/ridings.geojson');

function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' et ')
    .replace(/\b(sainte|ste)\b/g, 'saint')
    .replace(/\b(saint|st)\b/g, 'saint')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function compactName(value) {
  return normalizeName(value).replace(/\s+/g, '');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function similarity(a, b) {
  const left = compactName(a);
  const right = compactName(b);
  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) return 1;
  return 1 - levenshtein(left, right) / maxLength;
}

const [latest, geojson] = await Promise.all([
  readFile(latestPath, 'utf8').then(JSON.parse),
  readFile(geojsonPath, 'utf8').then(JSON.parse),
]);

const geoFeatures = geojson.features ?? [];
const geoByNormalizedName = new Map();
for (const feature of geoFeatures) {
  const props = feature.properties ?? {};
  const keys = new Set([
    normalizeName(props.NM_CEP),
    compactName(props.NM_CEP),
    normalizeName(props.NMTRI_CEP),
    compactName(props.NMTRI_CEP),
  ]);
  for (const key of keys) {
    if (key) geoByNormalizedName.set(key, feature);
  }
}

const matches = [];
const unmatched = [];

for (const riding of latest.ridings ?? []) {
  const nameCandidates = [riding.name_fr, riding.name_en].filter(Boolean);
  let feature = null;
  let method = 'none';
  let score = 0;

  for (const name of nameCandidates) {
    feature = geoByNormalizedName.get(normalizeName(name)) ?? geoByNormalizedName.get(compactName(name));
    if (feature) {
      method = 'normalized-name';
      score = 1;
      break;
    }
  }

  if (!feature) {
    const ranked = geoFeatures
      .map((candidate) => {
        const props = candidate.properties ?? {};
        const candidateScore = Math.max(
          ...nameCandidates.map((name) => similarity(name, props.NM_CEP)),
        );
        return { feature: candidate, score: candidateScore };
      })
      .sort((a, b) => b.score - a.score);

    if (ranked[0]?.score >= 0.92) {
      feature = ranked[0].feature;
      method = 'fuzzy-name';
      score = ranked[0].score;
    } else {
      unmatched.push({
        riding_id: riding.riding_id,
        name_en: riding.name_en,
        name_fr: riding.name_fr,
        best_guess: ranked[0]
          ? {
              CO_CEP: ranked[0].feature.properties?.CO_CEP,
              NM_CEP: ranked[0].feature.properties?.NM_CEP,
              score: Number(ranked[0].score.toFixed(3)),
            }
          : null,
      });
      continue;
    }
  }

  const props = feature.properties ?? {};
  matches.push({
    CO_CEP: props.CO_CEP,
    riding_id: riding.riding_id,
    name: riding.name_fr ?? riding.name_en,
    geo_name: props.NM_CEP,
    method,
    score: Number(score.toFixed(3)),
  });
}

const duplicateGeoIds = matches
  .map((match) => match.CO_CEP)
  .filter((coCep, index, all) => all.indexOf(coCep) !== index);

console.log(`Quebec riding mapping diagnostic`);
console.log(`latest ridings: ${latest.ridings?.length ?? 0}`);
console.log(`geojson features: ${geoFeatures.length}`);
console.log(`matched: ${matches.length}`);
console.log(`unmatched: ${unmatched.length}`);
console.log(`duplicate CO_CEP matches: ${new Set(duplicateGeoIds).size}`);
console.log('');

console.log('Proposed mapping (CO_CEP -> riding_id):');
console.log(JSON.stringify(
  Object.fromEntries(
    matches
      .slice()
      .sort((a, b) => Number(a.CO_CEP) - Number(b.CO_CEP))
      .map((match) => [String(match.CO_CEP), match.riding_id]),
  ),
  null,
  2,
));

if (unmatched.length > 0) {
  console.log('');
  console.log('Unmatched ridings with best guesses:');
  console.log(JSON.stringify(unmatched, null, 2));
}
