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

let stale = false;
for (const [name, replacements] of Object.entries(files)) {
  const file = path.join(root, name);
  const original = await readFile(file, 'utf8');
  let rendered = original;
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(rendered)) throw new Error(`${name}: expected metadata pattern not found: ${pattern}`);
    rendered = rendered.replace(pattern, replacement);
  }
  if (rendered === original) continue;
  stale = true;
  if (!check) {
    await writeFile(file, rendered, 'utf8');
    console.log(`✓ Synced ${name} from qc-2026 canonical metadata`);
  } else {
    console.error(`✗ ${name} is stale; run npm run sync:machine-metadata`);
  }
}

if (check && stale) process.exit(1);
if (check) console.log(`✓ Machine-readable metadata aligned: Quebec ${total} seats, majority ${majority}`);
