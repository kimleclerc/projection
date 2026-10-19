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

// Un siège compétitif vérifie que le calcul répond aux curseurs et que leur
// signe est correct. Les vrais sièges peuvent rester constants sur toute la
// course : le résultat est arrondi au dixième, et un siège sûr reste sûr.
const competitive = {
  meta: { total_seats: 1, softmax_k: 0.1 },
  parties: [{ code: 'a', national: 50 }, { code: 'b', national: 50 }],
  regions: [{ id: 'r', anchor: [50, 50] }],
  ridings: [{ region: 'r', v: [50, 50] }],
  anchor_offset: [0, 0],
};
const competitiveLow = simulate(competitive, { a: -10 }).a;
const competitiveAnchor = simulate(competitive).a;
const competitiveHigh = simulate(competitive, { a: 10 }).a;
if (!(competitiveLow < competitiveAnchor && competitiveAnchor < competitiveHigh)) {
  errors.push('cas compétitif : curseur inversé ou sans effet');
}

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
    // Le curseur doit aller dans le BON SENS — c'est une inversion de signe
    // qu'on cherche, pas un gain garanti. Exiger `haut > ancre` était plus fort
    // que nécessaire et cassait sur un cas parfaitement sain : un parti qui
    // tient un seul siège très largement et dont la deuxième circonscription
    // est hors de portée sature vers le haut.
    //
    // Mesuré le 2026-09-07 : `ontario/on_oth` (0,0 / 1,0 / 1,0) a fait échouer
    // cinq desks d'affilée — le gardien est global, donc Ontario cassé bloque
    // tout ce qui passe après. La circonscription 00034 donne « autre » à
    // 64,1 %, et la suivante à 16,8 % derrière un NPD à 38,2 : +3,6 points de
    // curseur ne peuvent pas combler 21 points, et c'est bien ainsi.
    //
    // `haut >= ancre >= bas` accepte aussi une saturation sur toute la
    // course. Le 2026-10-16, on_oth restait à 1,0 siège aux trois positions :
    // sa marge variait de 8,8 à 60,4 points sans gain ni perte de siège.
    // Le cas compétitif ci-dessus exige séparément une réponse stricte.
    if (p.seats_projected >= 1) {
      const haut = simulate(doc, { [p.code]: p.travel })[p.code];
      const bas = simulate(doc, { [p.code]: -p.travel })[p.code];
      if (!(haut >= anchor[p.code] && anchor[p.code] >= bas)) {
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
