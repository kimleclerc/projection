#!/usr/bin/env node
/**
 * publish-desk.mjs — garde-fou de publication d'un desk piloté par les données.
 *
 * Rôle : le moteur régénère un JSON de desk dans l'arbre de travail, puis
 * appelle `node scripts/publish-desk.mjs <desk>`. Ce script REFUSE de publier
 * un run cassé et SAUTE un run inchangé — sinon il valide, (optionnellement)
 * build, puis commit + push. C'est le patron MLB rendu sûr et réutilisable.
 *
 * Usage :
 *   node scripts/publish-desk.mjs federal              # valide → commit → push
 *   node scripts/publish-desk.mjs federal --dry-run    # valide seulement, rien d'écrit
 *   node scripts/publish-desk.mjs federal --no-build    # saute le build (gate rapide)
 *   node scripts/publish-desk.mjs federal --no-push     # commit local sans push
 *
 * Codes de sortie : 0 = publié OU sauté (run inchangé) ; 1 = validation/étape
 * échouée (rien de commité). Un cron peut donc traiter ≠0 comme « à regarder ».
 *
 * Règle prod : refuse de pousser sur `main` sans --allow-main (la promotion
 * prod attend un GO humain — cf. CLAUDE.md).
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── Registre des desks ────────────────────────────────────────────────────
// kind 'projection' = moteur à sièges (ProjectionEngine) ; kind 'mlb' = board.
const DESKS = {
  federal:     { label: 'Federal',   json: 'web_data/federal/latest.json',            kind: 'projection' },
  ontario:     { label: 'Ontario',   json: 'web_data/ontario/latest.json',            kind: 'projection' },
  quebec:      { label: 'Quebec',    json: 'web_data/quebec/latest.json',             kind: 'projection' },
  'us-house':  { label: 'US House',  json: 'web_data/us-house/latest.json',           kind: 'projection' },
  'us-senate': { label: 'US Senate', json: 'web_data/us-senate/latest.json',          kind: 'projection' },
  mlb:         { label: 'MLB',       json: 'web_data/sports/mlb2026_latest.json',      kind: 'mlb' },
};

// ── CLI ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--') && !a.includes('=')));
const kv = Object.fromEntries(
  argv.filter((a) => a.startsWith('--') && a.includes('=')).map((a) => a.slice(2).split(/=(.*)/s)),
);
const deskId = argv.find((a) => !a.startsWith('--'));
const opt = {
  // --json ne valide qu'un fichier alternatif : jamais de commit (le commit
  // viserait le chemin canonique, au contenu potentiellement différent).
  dryRun: flags.has('--dry-run') || Boolean(kv.json),
  build: !flags.has('--no-build'),
  push: !flags.has('--no-push'),
  editorial: !flags.has('--no-editorial'),
  allowMain: flags.has('--allow-main'),
};

const log = (m) => console.log(`[publish-desk] ${m}`);
const fail = (m) => { console.error(`[publish-desk] ✖ ${m}`); process.exit(1); };

if (!deskId || !DESKS[deskId]) {
  console.error(`Usage : node scripts/publish-desk.mjs <desk> [--dry-run] [--no-build] [--no-push] [--allow-main]`);
  console.error(`Desks : ${Object.keys(DESKS).join(', ')}`);
  process.exit(1);
}
const desk = DESKS[deskId];
// --json=<path> : valide un fichier alternatif (moteur : run stagé ailleurs ;
// tests : cas négatifs sans toucher aux vraies données). Le commit reste sur
// le chemin canonique du desk — l'override ne sert qu'à la lecture/validation.
const jsonPath = kv.json ? path.resolve(kv.json) : path.join(ROOT, desk.json);

// ── Lecture + parse ─────────────────────────────────────────────────────────
if (!existsSync(jsonPath)) fail(`JSON introuvable : ${desk.json}`);
let data;
try {
  data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
} catch (e) {
  fail(`JSON illisible (${desk.json}) : ${e.message}`);
}

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const inRange = (v, lo, hi) => finite(v) && v >= lo && v <= hi;
const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s);

/** Identifiant de run + liste d'erreurs de validation, selon le type de desk. */
function validate(desk, data) {
  const errors = [];
  let runId;

  if (desk.kind === 'projection') {
    const meta = data.meta ?? {};
    runId = meta.run_date;
    if (!isIsoDate(runId)) errors.push(`meta.run_date absent ou mal formé : ${JSON.stringify(runId)}`);
    // Date pas dans le futur (garde contre une date corrompue).
    if (isIsoDate(runId)) {
      const tomorrow = new Date(Date.now() + 36 * 3600 * 1000).toISOString().slice(0, 10);
      if (runId.slice(0, 10) > tomorrow) errors.push(`meta.run_date dans le futur : ${runId}`);
    }
    const total = meta.total_seats;
    if (!finite(total) || total <= 0) errors.push(`meta.total_seats invalide : ${JSON.stringify(total)}`);
    if (!finite(meta.n_polls) || meta.n_polls < 0) errors.push(`meta.n_polls invalide : ${JSON.stringify(meta.n_polls)}`);
    if (!finite(meta.n_simulations) || meta.n_simulations <= 0) errors.push(`meta.n_simulations invalide : ${JSON.stringify(meta.n_simulations)}`);

    const parties = data.parties;
    if (!Array.isArray(parties) || parties.length === 0) {
      errors.push('data.parties vide ou absent');
    } else {
      let seatSum = 0;
      for (const p of parties) {
        const who = p.party ?? p.label_en ?? '?';
        if (!finite(p.seats_mean)) errors.push(`${who}: seats_mean non fini (${JSON.stringify(p.seats_mean)})`);
        else seatSum += p.seats_mean;
        if (!inRange(p.vote_mean, 0, 100)) errors.push(`${who}: vote_mean hors [0,100] (${JSON.stringify(p.vote_mean)})`);
        if (p.p_majority != null && !inRange(p.p_majority, 0, 1)) errors.push(`${who}: p_majority hors [0,1] (${JSON.stringify(p.p_majority)})`);
      }
      // La somme des sièges moyens doit friser le total (arrondis → tolérance).
      if (finite(total) && Math.abs(seatSum - total) > 2) {
        errors.push(`somme seats_mean=${seatSum.toFixed(1)} s'écarte de total_seats=${total} (>2)`);
      }
    }
  } else if (desk.kind === 'mlb') {
    const bm = data.board_meta ?? {};
    runId = bm.data_fetched_at ?? data.generated_at;
    if (!runId) errors.push('board_meta.data_fetched_at / generated_at absent');
    if (!finite(bm.sims) || bm.sims <= 0) errors.push(`board_meta.sims invalide : ${JSON.stringify(bm.sims)}`);
    const board = data.board;
    if (!Array.isArray(board) || board.length === 0) errors.push('data.board vide ou absent');
    else for (const tm of board) {
      const who = tm.code ?? '?';
      for (const k of ['p_series', 'p_division', 'p_ws', 'p_pennant']) {
        if (!inRange(tm[k], 0, 1)) errors.push(`${who}: ${k} hors [0,1] (${JSON.stringify(tm[k])})`);
      }
    }
  }
  return { runId, errors };
}

const { runId, errors } = validate(desk, data);
if (errors.length) {
  console.error(`[publish-desk] ✖ ${desk.label} : ${errors.length} problème(s) — rien publié :`);
  for (const e of errors) console.error(`    · ${e}`);
  process.exit(1);
}
log(`${desk.label} : JSON valide (run ${runId}).`);

// ── Skip si run inchangé vs version commitée ────────────────────────────────
function committedRunId() {
  try {
    // maxBuffer élargi : certains JSON de desk (federal ~1,8 Mo) dépassent le
    // défaut 1 Mo d'execSync, ce qui ferait échouer silencieusement le git show.
    const raw = execSync(`git show HEAD:${desk.json}`, { cwd: ROOT, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const prev = JSON.parse(raw);
    return desk.kind === 'projection'
      ? prev.meta?.run_date
      : (prev.board_meta?.data_fetched_at ?? prev.generated_at);
  } catch {
    return null; // fichier non suivi / premier run
  }
}
const prevRun = committedRunId();
if (prevRun && String(prevRun) === String(runId)) {
  log(`run inchangé (${runId}) — rien à publier. ✓`);
  process.exit(0);
}
log(`nouveau run : ${prevRun ?? '(aucun)'} → ${runId}`);

// ── Garde branche prod ──────────────────────────────────────────────────────
const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();
if (branch === 'main' && !opt.allowMain) {
  fail(`sur 'main' : refus de publier sans --allow-main (la promotion prod attend un GO humain).`);
}

if (opt.dryRun) {
  log(`--dry-run : validations OK, aucun commit. (build ${opt.build ? 'aurait tourné' : 'sauté'}, push ${opt.push ? 'aurait tourné' : 'sauté'})`);
  process.exit(0);
}

// ── Gates : validate:editorial + build ──────────────────────────────────────
function run(cmd, args) {
  log(`$ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
}
try {
  if (opt.editorial) run('npm', ['run', 'validate:editorial']);
  if (opt.build) run('npm', ['run', 'build']);
} catch {
  fail(`gate échouée (${opt.build ? 'build' : 'validate:editorial'}) — rien commité.`);
}

// ── Commit + push ───────────────────────────────────────────────────────────
const msg = `${desk.label} data: nightly ${String(runId).slice(0, 10)}`;
try {
  execSync(`git add ${desk.json}`, { cwd: ROOT, stdio: 'inherit' });
  // Rien de stagé (ex. build a régénéré des fichiers non suivis) → on ne commit que le JSON.
  const staged = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf-8' }).trim();
  if (!staged) { log('aucun changement stagé sur le JSON — rien à commiter. ✓'); process.exit(0); }
  execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: ROOT, stdio: 'inherit' });
  log(`commit : ${msg}`);
  if (opt.push) {
    execSync(`git push origin ${branch}`, { cwd: ROOT, stdio: 'inherit' });
    log(`push → origin/${branch} ✓`);
  } else {
    log('--no-push : commit local conservé, pas de push.');
  }
} catch (e) {
  fail(`échec git : ${e.message}`);
}
log(`${desk.label} publié. ✓`);
