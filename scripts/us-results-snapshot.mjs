#!/usr/bin/env node
/**
 * Copie de repli des résultats du 3 novembre 2026 : live.json du moteur,
 * réduit aux champs que lisent les pages de course, l'accueil US et l'accueil
 * du site (résultats, appels, projection, appels de majorité). Les pages la
 * rendent au build ; dans le navigateur, le live.json la remplace dès qu'il
 * répond. Aucun champ n'est inventé : on retire, on ne calcule rien.
 *
 *   node scripts/us-results-snapshot.mjs            # rail Pages, puis Worker
 *   node scripts/us-results-snapshot.mjs fichier.json
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('../src/data/us-results-snapshot.json', import.meta.url);
const PATH = '/api/v1/elections/us-2026-11-03/live.json';
const BASES = ['https://votescope-live.pages.dev', 'https://vote-scope.com'];

async function load() {
  const file = process.argv[2];
  if (file) return JSON.parse(readFileSync(file, 'utf8'));
  for (const base of BASES) {
    try {
      const r = await fetch(base + PATH, { headers: { 'user-agent': 'vote-scope-build' } });
      if (r.ok) return await r.json();
    } catch { /* base suivante */ }
  }
  throw new Error('live.json injoignable');
}

const p = await load();
if (!Array.isArray(p.results)) throw new Error('live.json sans results');

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o?.[k] !== undefined).map((k) => [k, o[k]]));
const states = {};
for (const [k, s] of Object.entries(p.source?.states ?? {})) states[k] = pick(s, ['ok', 'family', 'regressed_cycles']);

const out = {
  event: p.event,
  generated_at: p.generated_at,
  sequence: p.sequence,
  source: { source_updated_at: p.source?.source_updated_at ?? null, healthy: p.source?.healthy, states },
  results: p.results.map((r) => ({
    ...pick(r, ['riding_id', 'name', 'state', 'chamber', 'source_url', 'ballots_counted']),
    polls: pick(r.polls, ['pct']),
    candidates: (r.candidates ?? []).map((c) => pick(c, ['candidate_name', 'party_code', 'votes', 'vote_pct'])),
  })),
  calls: (p.calls ?? []).map((c) => pick(c, ['riding_id', 'party_code', 'candidate_name', 'called_at', 'status'])),
  projections: (p.projections ?? []).map((x) => ({
    riding_id: x.riding_id,
    candidates: (x.candidates ?? []).map((c) => pick(c, ['party_code', 'candidate_name', 'mean'])),
  })),
  national_calls: p.national_calls ?? [],
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`✓ copie de repli : ${out.results.length} courses, ${out.calls.length} appels, ${out.national_calls.length} appels de majorité (${out.generated_at})`);
