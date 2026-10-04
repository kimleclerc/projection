import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const manifest = JSON.parse(await readFile(path.join(root, 'web_data/public-api/latest.json'), 'utf8'));
const quebec = manifest.datasets.find((dataset) => dataset.id === 'qc-2026');
if (!quebec?.total_seats || !quebec?.majority_seats) {
  throw new Error('qc-2026 total_seats/majority_seats missing from public manifest');
}

const total = String(quebec.total_seats);
const majority = String(quebec.majority_seats);
const files = {
  'llms.txt': [
    [/provinciales du Québec \(\d+\)/, `provinciales du Québec (${total})`],
    [/Assemblée nationale — \d+ sièges/, `Assemblée nationale — ${total} sièges`],
    [/Les \d+ circonscriptions provinciales québécoises/, `Les ${total} circonscriptions provinciales québécoises`],
  ],
  'llms-long.txt': [
    [/\| Québec provincial \| ([^\n]*?) \| \d+ \|/, `| Québec provincial | $1 | ${total} |`],
    [/- Québec : \d+ sièges/, `- Québec : ${majority} sièges`],
  ],
  'llms-full.txt': [
    [/\| Québec \| ([^\n]*?) \| \d+ \|/, `| Québec | $1 | ${total} |`],
    [/Canada 172 · Québec \d+ ·/, `Canada 172 · Québec ${majority} ·`],
  ],
};

// ── Valeurs courantes ────────────────────────────────────────────────────
// Bloc régénéré à chaque build entre deux balises, dans les trois fichiers
// pour agents. Il lit les mêmes JSON que le site : aucune valeur à la main,
// donc pas d'instantané périmé. Le manifeste de l'API reste la référence.
const START = '<!-- valeurs-courantes:debut -->';
const END = '<!-- valeurs-courantes:fin -->';
const readJson = async (rel) => {
  try { return JSON.parse(await readFile(path.join(root, 'web_data', rel), 'utf8')); } catch { return null; }
};
const fr1 = (v) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
const pctFr = (p) => (p == null ? '—' : p > 0.99 ? '> 99 %' : p < 0.01 ? '< 1 %' : `${Math.round(p * 100)} %`);
const FORECASTS = [
  ['federal', 'Canada fédéral (343 sièges)'],
  ['quebec', 'Québec (127 sièges)'],
  ['ontario', 'Ontario (124 sièges)'],
  ['british-columbia', 'Colombie-Britannique (93 sièges)'],
  ['us-house', 'Chambre des représentants US (435 sièges)'],
  ['us-senate', 'Sénat US (100 sièges)'],
  ['us-governor', 'Gouverneurs US (50 postes)'],
  ['uk', 'Royaume-Uni (650 sièges)'],
];
const rows = [];
let newest = '';
for (const [key, label] of FORECASTS) {
  const d = await readJson(`${key}/latest.json`);
  if (!d?.parties?.length) continue;
  const seats = (p) => p.seats_projected ?? p.seats_mean;
  const ranked = [...d.parties]
    .filter((p) => !/_oth$/.test(p.party))
    .sort((a, b) => (seats(b) ?? -1) - (seats(a) ?? -1) || (b.p_majority ?? 0) - (a.p_majority ?? 0) || (b.vote_mean ?? 0) - (a.vote_mean ?? 0));
  const [a, b] = ranked;
  const fmt = (p) => `${p.label_fr ?? p.party}${seats(p) != null ? ` ${Math.round(seats(p))}` : ''}`;
  const date = d.meta?.run_date ?? '';
  if (date > newest) newest = date;
  rows.push(`| ${label} | ${date} | ${fmt(a)} | ${b ? fmt(b) : '—'} | ${pctFr(a.p_majority)} |`);
}
const es = await readJson('spain/latest.json');
if (es?.national && es?.blocs) {
  const n = es.national;
  rows.push(`| Espagne, Congrès (350 sièges) | ${es.meta.run_date} | PP ${n.pp.seats_median} | PSOE ${n.psoe.seats_median} | bloc PP+Vox ${es.blocs.pp_vox.median} sièges : ${pctFr(es.blocs.pp_vox.p_majority)} |`);
  if (es.meta.run_date > newest) newest = es.meta.run_date;
}
const indexLines = [];
const idx = async (rel, key, name, unit = '/100') => {
  const d = await readJson(rel);
  const v = d?.[key];
  if (!v || v.score == null) return;
  indexLines.push(`- ${name} : ${fr1(v.score)}${unit}${v.label_fr ? ` (${v.label_fr})` : ''} — données du ${d.meta?.run_date ?? d.meta?.as_of_date ?? '—'}`);
};
await idx('us-lame-duck/latest.json', 'ldi', 'Lame-Duck Index (déclin du pouvoir présidentiel)');
await idx('ca-canada-goose/latest.json', 'cgi', 'Canada Goose Index');
await idx('fr-barrage/latest.json', 'bfi', 'Indice Barrage (solidité du front contre l’extrême droite)');
await idx('on-fraser-interim/latest.json', 'index', 'Indice Fraser intérimaire', '');
const cusmaD = await readJson('cusma-showdown/latest.json');
if (cusmaD?.showdown?.gap != null) {
  const g = cusmaD.showdown.gap;
  indexLines.push(`- Duel ACEUM / CUSMA (écart de levier Canada–É.-U.) : ${g > 0 ? '+' : ''}${fr1(g)}${cusmaD.showdown.label_fr ? ` (${cusmaD.showdown.label_fr})` : ''} — données du ${cusmaD.meta?.as_of_date ?? cusmaD.meta?.run_date ?? '—'}`);
}
const valuesBlock = [
  START,
  `### Instantané au ${newest} (régénéré automatiquement à chaque publication)`,
  '',
  'Premier et deuxième partis en sièges projetés (médiane ou moyenne selon la juridiction), et probabilité que le premier obtienne la majorité. Pour une valeur à citer, lire le `latest_url` du manifeste `/api/v1/manifest.json`.',
  '',
  '| Élection | Données au | Premier | Deuxième | Probabilité de majorité |',
  '|---|---|---|---|---|',
  ...rows,
  '',
  'Indices maison :',
  ...indexLines,
  END,
].join('\n');

let stale = false;
for (const [name, replacements] of Object.entries(files)) {
  const file = path.join(root, name);
  const original = await readFile(file, 'utf8');
  let rendered = original;
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(rendered)) throw new Error(`${name}: expected metadata pattern not found: ${pattern}`);
    rendered = rendered.replace(pattern, replacement);
  }
  const a = rendered.indexOf(START);
  const b = rendered.indexOf(END);
  if (a < 0 || b < a) throw new Error(`${name}: balises ${START} / ${END} absentes`);
  rendered = rendered.slice(0, a) + valuesBlock + rendered.slice(b + END.length);
  if (rendered === original) continue;
  stale = true;
  if (!check) {
    await writeFile(file, rendered, 'utf8');
    console.log(`✓ Synced ${name} (Québec + valeurs courantes au ${newest})`);
  } else {
    console.error(`✗ ${name} is stale; run npm run sync:machine-metadata`);
  }
}

if (check && stale) process.exit(1);
if (check) console.log(`✓ Machine-readable metadata aligned: Quebec ${total} seats, majority ${majority}`);
