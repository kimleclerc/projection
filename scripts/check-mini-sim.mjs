#!/usr/bin/env node
/* Gardien du mini-simulateur, côté site.
 *
 * Le simulateur est un dérivé du run : sa seule façon de mentir est de rester
 * en arrière. `web_data/<juridiction>/simulator.json` doit porter le même
 * run_date que `latest.json`, sinon la page affiche des sièges qui ne
 * correspondent à aucune projection publiée — sans rien signaler.
 *
 * Vérifie aussi, en important le vrai module de l'îlot, que le calcul livré au
 * navigateur reproduit la projection à l'ancre et conserve la chambre sur toute
 * la course des curseurs. Ce sont les mêmes propriétés que les gardiens Python
 * du moteur (tests/test_mini_simulator_guardians.py), appliquées ici à ce qui
 * est réellement servi.
 *
 * Branché sur `npm run prebuild` : une mise à jour oubliée casse le build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { simulate } from '../src/lib/mini-sim.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB = path.join(ROOT, 'web_data');
const SCHEMA_VERSION = 1;

const errors = [];
const notes = [];

function check(juris) {
  const dir = path.join(WEB, juris);
  const latestPath = path.join(dir, 'latest.json');
  const simPath = path.join(dir, 'simulator.json');
  if (!fs.existsSync(latestPath) || !fs.existsSync(simPath)) return false;

  const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  const doc = JSON.parse(fs.readFileSync(simPath, 'utf8'));

  if (doc.meta.schema_version !== SCHEMA_VERSION) {
    errors.push(`${juris} : schema_version ${doc.meta.schema_version}, attendu ${SCHEMA_VERSION}`);
    return true;
  }

  // 1) Fraîcheur — le gardien central.
  if (doc.meta.run_date !== latest.meta.run_date) {
    errors.push(
      `${juris} : simulator.json daté du ${doc.meta.run_date}, latest.json du ` +
      `${latest.meta.run_date}. Le simulateur afficherait un autre run.`,
    );
  }

  // 2) Curseurs au repos = projection publiée.
  const anchor = simulate(doc);
  for (const p of doc.parties) {
    const ecart = Math.abs(anchor[p.code] - p.seats_projected);
    if (ecart >= 0.5) {
      errors.push(
        `${juris}/${p.code} : ancre ${anchor[p.code].toFixed(1)} vs publié ${p.seats_projected}`,
      );
    }
  }

  // 3) La chambre est conservée jusqu'aux extrémités, et les sièges restent
  //    positifs et monotones.
  for (const p of doc.parties) {
    for (const signe of [-1, 1]) {
      const seats = simulate(doc, { [p.code]: signe * p.travel });
      const total = Object.values(seats).reduce((a, b) => a + b, 0);
      if (Math.abs(total - doc.meta.total_seats) >= 0.5) {
        errors.push(
          `${juris} : ${p.code} à fond (${signe > 0 ? '+' : '−'}${p.travel}) donne ` +
          `${total.toFixed(1)} sièges au lieu de ${doc.meta.total_seats}`,
        );
      }
      if (Object.values(seats).some((v) => v < 0)) {
        errors.push(`${juris} : ${p.code} produit des sièges négatifs`);
      }
    }
    if (p.seats_projected >= 1) {
      const haut = simulate(doc, { [p.code]: p.travel })[p.code];
      const bas = simulate(doc, { [p.code]: -p.travel })[p.code];
      if (!(haut > anchor[p.code] && anchor[p.code] >= bas)) {
        errors.push(
          `${juris}/${p.code} : curseur non monotone ` +
          `(${bas.toFixed(1)} / ${anchor[p.code].toFixed(1)} / ${haut.toFixed(1)})`,
        );
      }
    }
  }

  notes.push(
    `${juris} : ${doc.ridings.length} circos · ${doc.regions.length} régions · ` +
    `k=${doc.meta.softmax_k} · run ${doc.meta.run_date}`,
  );
  return true;
}

let found = 0;
for (const entry of fs.readdirSync(WEB, { withFileTypes: true })) {
  if (entry.isDirectory() && check(entry.name)) found++;
}

if (found === 0) {
  console.log('check-mini-sim : aucun simulator.json — rien à vérifier.');
  process.exit(0);
}

for (const n of notes) console.log(`  ✓ ${n}`);
if (errors.length) {
  console.error('\n✗ check-mini-sim a trouvé des problèmes :');
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`check-mini-sim : ${found} juridiction(s) OK.`);
