#!/usr/bin/env node
/* Un live.json d'EXEMPLE pour la soirée américaine du 3 novembre 2026.
 *
 *   node scripts/make-us-live-sample.mjs
 *
 * Écrit src/data/samples/us-2026-11-03.live.sample.json : les 506 courses
 * (435 + 35 + 36) au format public `fastest-call.live.v2` — ce que le Worker
 * et le rail Pages servent, donc SANS `desk` — figées à 23 h 20 HNE. Les
 * chiffres sont synthétiques (projection publiée + bruit déterministe) ; ce ne
 * sont pas des résultats. La graine est fixe : deux exécutions donnent le même
 * fichier.
 *
 * Le fichier couvre chaque état que l'îlot doit savoir dire :
 *   - États de l'Est et du Centre au décompte, avec des appels ;
 *   - IA : flux injoignable (`state_unavailable`) — candidats à 0 voix dans le
 *     payload, que la page ne doit JAMAIS afficher comme un décompte ;
 *   - NY, OH, MI : saisie manuelle avec chiffres ; PA, AZ : saisie manuelle
 *     encore vide (`transcribed`) ;
 *   - WI : source en recul, derniers chiffres conservés ;
 *   - l'Ouest (CA, OR, WA, NV, AK, HI, ID, MT, UT) : fermé ou presque, aucun
 *     bulletin compté — c'est là que le prédicteur d'avant-dépouillement vit ;
 *   - `exit_poll` : la sortie réelle de fastest_call/us_exit_poll.py (predict)
 *     sur us-2026-11-03.exit-polls.sample.csv, jointe telle quelle.
 *
 * Vérifié au build par scripts/check-us-live.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/samples/us-2026-11-03.live.sample.json');
const EXIT = path.join(ROOT, 'src/data/samples/us-2026-11-03.exit-poll.sample.json');
const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const NOW = '2026-11-04T04:20:00Z';
const UNAVAILABLE = new Set(['IA']);
const TRANSCRIBED = { NY: 0.55, OH: 0.7, MI: 0.45, PA: 0, AZ: 0 };
const REGRESSED = new Set(['WI']);
const NOT_YET = new Set(['CA', 'OR', 'WA', 'NV', 'AK', 'HI', 'ID', 'MT', 'UT']);
const PREFIX = { house: 'H-', senate: 'S-', governor: 'G-' };
const SUFFIX = { senate: ' (Sénat)', governor: ' (gouverneur)' };

// mulberry32 : déterministe, sans dépendance.
let seed = 20261103;
const rand = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());

const results = [], projections = [], calls = [];
const stateVotes = {};
const colors = { us_dem: '#1375B7', us_rep: '#D2222D', us_oth: '#999999' };

for (const chamber of ['house', 'senate', 'governor']) {
  const desk = load(`web_data/us-${chamber}/latest.json`);
  for (const r of desk.ridings) {
    const id = `${PREFIX[chamber]}${String(r.riding_id).padStart(5, '0')}`;
    const state = r.province;
    const mean = r.projection?.vote_mean ?? { us_dem: 50, us_rep: 50 };
    const nominees = r.nominees ?? {};
    const name = (code, fallback) => (nominees[code] && nominees[code] !== 'nan' ? nominees[code] : fallback);
    const label = r.name_en;
    const base = [
      { candidate_name: name('us_dem', `Démocrate — ${label}`), party_code: 'us_dem' },
      { candidate_name: name('us_rep', `Républicain — ${label}`), party_code: 'us_rep' },
    ];
    // Fraction comptée : nulle à l'Ouest et pour les saisies vides, partielle ailleurs.
    let fraction;
    if (NOT_YET.has(state)) fraction = 0;
    else if (state in TRANSCRIBED) fraction = TRANSCRIBED[state] * (0.7 + 0.3 * rand());
    else fraction = Math.min(1, 0.25 + 0.75 * rand());
    const unavailable = UNAVAILABLE.has(state);
    const expected = chamber === 'house' ? 300000 : 2500000 * (0.5 + rand());
    const swing = gauss() * 3;
    const demShare = Math.max(5, Math.min(95, (mean.us_dem ?? 50) + swing));
    const counted = unavailable ? 0 : Math.round(expected * fraction);
    const dem = Math.round(counted * demShare / 100);
    const rep = counted - dem;
    const candidates = base.map((c) => {
      const votes = c.party_code === 'us_dem' ? dem : rep;
      return { ...c, votes, vote_pct: counted ? Math.round(10000 * votes / counted) / 100 : 0 };
    }).sort((a, b) => b.votes - a.votes);
    const precincts = chamber === 'house' ? 300 : 2500;
    const reported = Math.round(precincts * Math.min(1, fraction * 1.1));
    results.push({
      riding_id: id, slug: `${chamber}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: (r.name_fr || label) + (SUFFIX[chamber] ?? ''), province: state,
      source_url: null, registered_electors: null,
      polls: unavailable || !counted ? { reported: unavailable ? null : 0, total: unavailable ? null : precincts, pct: unavailable ? null : 0 }
        : { reported, total: precincts, pct: Math.round(10000 * reported / precincts) / 100 },
      ballots_counted: counted, candidates, chamber, state, region: state,
    });
    projections.push({ riding_id: id, candidates: base.map((c) => ({
      party_code: c.party_code, candidate_name: c.candidate_name, color: colors[c.party_code],
      mean: mean[c.party_code] ?? 0, pwin: r.projection?.win_prob?.[c.party_code] ?? 0,
    })) });
    stateVotes[state] = (stateVotes[state] ?? 0) + counted;
    // Appels : marge large, plus de la moitié compté, flux officiel (pas de saisie, pas de recul).
    const margin = Math.abs(demShare - (100 - demShare));
    if (counted && fraction > 0.5 && margin > 14 && !(state in TRANSCRIBED) && !REGRESSED.has(state)) {
      const winner = candidates[0];
      const minute = String(Math.floor(rand() * 59)).padStart(2, '0');
      calls.push({ riding_id: id, party_code: winner.party_code, candidate_name: winner.candidate_name,
        called_at: `2026-11-04T0${1 + Math.floor(rand() * 3)}:${minute}:00Z`, status: 'published',
        approved_by: rand() < 0.6 ? 'auto' : 'operator', basis: 'model' });
    }
  }
}

const allStates = [...new Set(results.map((r) => r.state))].sort();
const states = {};
for (const s of allStates) {
  if (UNAVAILABLE.has(s)) states[s] = { ok: false, error: 'URLError: <urlopen error timed out>', high_water: {} };
  else if (REGRESSED.has(s)) states[s] = { ok: false, family: 'enhanced_voting', regressed_cycles: 1,
    high_water: { as_of: '2026-11-04T04:12:00Z', votes: stateVotes[s] }, regressed_to: { as_of: '2026-11-04T03:58:00Z', votes: Math.round(stateVotes[s] * 0.9) } };
  else if (s in TRANSCRIBED) states[s] = { ok: true, family: 'transcription', as_of: TRANSCRIBED[s] ? '2026-11-04T04:05:00Z' : null,
    races: results.filter((r) => r.state === s).length, votes: stateVotes[s] };
  else states[s] = { ok: true, family: s === 'CO' || s === 'IA' ? 'clarity' : 'enhanced_voting', as_of: NOT_YET.has(s) ? null : '2026-11-04T04:18:00Z',
    races: results.filter((r) => r.state === s).length, votes: stateVotes[s] };
}

const exitPoll = JSON.parse(fs.readFileSync(EXIT, 'utf8'));
const payload = {
  schema_version: 'fastest-call.live.v2',
  event: { id: 'us-2026-11-03-demo', name_fr: 'Mi-mandat américaines du 3 novembre 2026 — EXEMPLE SYNTHÉTIQUE',
    election_date: '2026-11-03', mode: 'demo', jurisdiction: 'united_states_general' },
  source: { url: null, machine_feed_url: null, official_renderings: 1, role: 'official_results_only',
    fetched_at: NOW, source_updated_at: '2026-11-04T04:18:00Z', healthy: true, demo: true,
    // Le collecteur compte chaque course en saisie manuelle : ce total n'est pas une panne.
    anomaly_count: results.filter((r) => UNAVAILABLE.has(r.state) || r.state in TRANSCRIBED || REGRESSED.has(r.state)).length,
    states },
  results, projections,
  calls: calls.sort((a, b) => a.called_at.localeCompare(b.called_at)),
  calls_provider: 'vote-scope',
  exit_poll: exitPoll,
  generated_at: NOW,
  sequence: 412,
};
const body = { ...payload }; delete body.generated_at; delete body.sequence;
payload.content_hash = createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 16);
fs.writeFileSync(OUT, JSON.stringify(payload) + '\n');
console.log(`✓ ${path.relative(ROOT, OUT)} : ${results.length} courses, ${calls.length} appels, ${Object.keys(exitPoll.races).length} sondages de sortie`);
