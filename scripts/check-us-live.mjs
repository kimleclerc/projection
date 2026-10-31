#!/usr/bin/env node
/* Gardien de l'îlot de direct des mi-mandat américaines (3 novembre 2026).
 *
 * Importe le vrai module de l'îlot (src/islands/usLive.ts) et le fait tourner
 * sur le live.json d'exemple (scripts/make-us-live-sample.mjs). Trois choses
 * ne doivent jamais arriver le soir :
 *
 *   1. une course d'un État sans flux, ou en saisie manuelle encore vide,
 *      affichée comme « 0 voix » ou comptée « en tête » ;
 *   2. la cote du marché (`desk`) rendue ou conservée par la page ;
 *   3. le prédicteur d'avant-dépouillement affiché à côté de bulletins comptés.
 *
 * Vérifie aussi que les 506 identifiants du direct (H-/S-/G- + riding_id)
 * correspondent aux courses publiées dans web_data.
 *
 * Branché sur `npm run prebuild`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveUsRows, exitPollKey, predictorVisible, sanitize, showsNumbers, stateNotices, tallyRows } from '../src/islands/usLive.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const SAMPLE = 'src/data/samples/us-2026-11-03.live.sample.json';
const raw = fs.readFileSync(path.join(ROOT, SAMPLE), 'utf8');
const sample = JSON.parse(raw);
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };

// ── 2. Le marché ne passe pas ─────────────────────────────────────────────
check(!('desk' in sample), `${SAMPLE} porte un desk : l'exemple doit être le payload PUBLIC`);
check(!/kalshi|polymarket|market_opinion/i.test(raw), `${SAMPLE} mentionne une cote de marché`);
const leaked = sanitize({ ...sample, desk: [{ riding_id: 'S-13000', market: { platform: 'kalshi', p: 0.61 } }] });
check(!('desk' in leaked), 'sanitize() ne retire pas desk');
const island = fs.readFileSync(path.join(ROOT, 'src/islands/UsMidtermsLive.tsx'), 'utf8');
check(!/\.desk\b|\bmarket\b/i.test(island.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), 'UsMidtermsLive.tsx lit desk ou une cote de marché');

// ── Identifiants : le direct et web_data parlent des mêmes courses ─────────
const PREFIX = { house: 'H-', senate: 'S-', governor: 'G-' };
const EXPECTED = { house: 435, senate: 35, governor: 36 };
const ids = new Set(sample.results.map((r) => r.riding_id));
for (const [chamber, prefix] of Object.entries(PREFIX)) {
  const published = load(`web_data/us-${chamber}/latest.json`).ridings.map((r) => `${prefix}${String(r.riding_id).padStart(5, '0')}`);
  check(published.length === EXPECTED[chamber], `${chamber} : ${published.length} courses publiées, ${EXPECTED[chamber]} attendues`);
  const missing = published.filter((id) => !ids.has(id));
  check(missing.length === 0, `${chamber} : absentes de l'exemple ${missing.slice(0, 5).join(' ')}`);
  check(sample.results.filter((r) => r.riding_id.startsWith(prefix)).length === published.length, `${chamber} : nombre de courses différent de web_data`);
}
for (const key of Object.keys(sample.exit_poll?.races ?? {})) {
  const [chamber, rid] = key.split(':');
  check(ids.has(`${PREFIX[chamber]}${rid}`), `exit_poll : course inconnue ${key}`);
}
check(exitPollKey('S-13000') === 'senate:13000' && exitPollKey('H-06013') === 'house:06013', 'exitPollKey() ne rend pas la clé de us_exit_poll.py');

// ── 1. Pas de « 0 voix » pour un État sans flux ───────────────────────────
const rows = ['house', 'senate', 'governor'].flatMap((c) => deriveUsRows(sample, c));
const byState = (s) => rows.filter((r) => r.state === s);
const statusOf = (s) => new Set(byState(s).map((r) => r.status));
check(byState('IA').length > 0 && [...statusOf('IA')].every((s) => s === 'state_unavailable'), `IA : attendu state_unavailable, lu ${[...statusOf('IA')]}`);
for (const s of ['PA', 'AZ']) check([...statusOf(s)].every((x) => x === 'transcribed_empty'), `${s} : attendu transcribed_empty, lu ${[...statusOf(s)]}`);
for (const s of ['NY', 'OH', 'MI']) check([...statusOf(s)].every((x) => x === 'transcribed'), `${s} : attendu transcribed, lu ${[...statusOf(s)]}`);
check([...statusOf('WI')].every((x) => x === 'regressed'), `WI : attendu regressed, lu ${[...statusOf('WI')]}`);
for (const r of rows) {
  if (!showsNumbers(r.status)) {
    check(r.votes === 0 && r.leader === null && r.reportedPct === null, `${r.id} (${r.status}) : des chiffres seraient affichés`);
    check(r.party === null || r.status === 'called', `${r.id} (${r.status}) : compté en tête sans décompte`);
  }
}
const notices = stateNotices(rows);
check(notices.unavailable.join() === 'IA', `bandeau « indisponible » : ${notices.unavailable}`);
check(notices.transcribed.join() === 'AZ,MI,NY,OH,PA', `bandeau « saisie manuelle » : ${notices.transcribed}`);
// Un État absent de source.states, alors que la table existe, n'est pas branché.
const unwired = structuredClone(sample);
delete unwired.source.states.GA;
check(deriveUsRows(unwired, 'senate').find((r) => r.id === 'S-13000')?.status === 'state_unavailable', 'GA non branché : pas lu comme indisponible');

// ── 3. Le prédicteur s'efface au premier bulletin ─────────────────────────
const withPoll = rows.filter((r) => sample.exit_poll.races[exitPollKey(r.id)]);
for (const r of withPoll) {
  const counted = sample.results.find((x) => x.riding_id === r.id).candidates.some((c) => c.votes > 0);
  if (counted && r.status !== 'state_unavailable') check(r.exitPoll === null, `${r.id} : prédicteur affiché malgré des bulletins comptés`);
  if (predictorVisible(r.status)) check(r.exitPoll !== null, `${r.id} (${r.status}) : prédicteur absent`);
}
check(withPoll.some((r) => r.exitPoll) && withPoll.some((r) => !r.exitPoll), 'exemple : il faut des prédicteurs visibles ET effacés');
const first = structuredClone(sample);
const ca = first.results.find((r) => r.riding_id === 'G-06000');
ca.candidates[0].votes = 1; ca.ballots_counted = 1;
check(deriveUsRows(first, 'governor').find((r) => r.id === 'G-06000')?.exitPoll === null, 'G-06000 : un seul bulletin ne fait pas disparaître le prédicteur');

// ── Sièges : les non renouvelés comptent, les courses sans chiffres non ───
const senate = tallyRows(deriveUsRows(sample, 'senate'), { us_dem: 34, us_rep: 31 });
check(senate.reduce((a, t) => a + t.holdover, 0) === 65, 'Sénat : 65 sièges hors scrutin attendus');

if (errors.length) {
  console.error(`✗ us-live : ${errors.length} écart(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const counts = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});
console.log(`✓ us-live : 506 courses alignées sur web_data, ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}`);
