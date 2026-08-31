#!/usr/bin/env node
/* Gardien : aucun fond de carte tiers.
 *
 * Nos cartes ne servent QUE nos propres géométries. Un fond de tuiles
 * réintroduirait des toponymes qu'on ne contrôle pas : les étiquettes sont
 * cuites dans le raster et ne se surchargent pas. Le renommage du lac Ontario
 * en « Lake America » par le GNIS, répercuté par Google Maps selon le pays du
 * lecteur, a montré que le nom affiché n'est pas une donnée stable.
 *
 * OpenStreetMap avait tenu bon — il porte encore « Lake Ontario » et
 * « Golfo de México » — mais on ne veut pas dépendre de la bonne tenue d'un
 * tiers pour ce qui s'affiche sur nos cartes. Ce qu'on n'affiche pas ne peut
 * pas être renommé par quelqu'un d'autre.
 *
 * Branché sur `npm run prebuild` : la réintroduction casse le build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

// Hôtes de tuiles et fournisseurs de fonds de carte, y compris les styles
// vectoriels : ils portent les mêmes toponymes.
const INTERDITS = [
  /tile\.openstreetmap\.org/i,
  /[a-z0-9.-]*\.tile\.openstreetmap/i,
  /basemaps\.cartocdn\.com/i,
  /cartodb-basemaps/i,
  /api\.mapbox\.com/i,
  /tiles?\.mapbox\.com/i,
  /api\.maptiler\.com/i,
  /tiles\.openfreemap\.org/i,
  /tiles?\.stadiamaps\.com/i,
  /stamen-tiles/i,
  /server\.arcgisonline\.com/i,
  /tile\.thunderforest\.com/i,
  /mt\d?\.google\.com\/vt/i,
  /L\.tileLayer\s*\(/,
];

const fautes = [];
function marche(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { marche(p); continue; }
    if (!/\.(tsx?|jsx?|astro|css|mjs)$/.test(e.name)) continue;
    const texte = fs.readFileSync(p, 'utf8');
    texte.split('\n').forEach((ligne, i) => {
      if (ligne.trimStart().startsWith('*') || ligne.trimStart().startsWith('//')) return;
      for (const re of INTERDITS) {
        if (re.test(ligne)) {
          fautes.push(`${path.relative(SRC, p)}:${i + 1} — ${ligne.trim().slice(0, 100)}`);
          break;
        }
      }
    });
  }
}
marche(SRC);

if (fautes.length) {
  console.error('✗ fond de carte tiers réintroduit :');
  for (const f of fautes) console.error(`   ${f}`);
  console.error('\n  Nos cartes ne servent que nos propres géométries. Un fond de tuiles');
  console.error('  ramène des toponymes qu\'on ne contrôle pas — voir scripts/check-basemaps.mjs.');
  process.exit(1);
}
console.log('✓ fonds de carte : aucune source de tuiles tierce dans src/');
