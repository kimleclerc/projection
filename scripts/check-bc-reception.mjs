#!/usr/bin/env node
/**
 * Réception du desk britanno-colombien — vérifie le SITE BÂTI, pas les sources.
 *
 * Un gabarit peut compiler et produire une page fausse : lien mort, alternante
 * qui pointe dans le vide, titre d'une autre langue, candidatures de 2024
 * présentées comme celles du prochain scrutin. Ce script lit `dist/` et refuse
 * la réception si l'un de ces cas est présent.
 *
 *   node scripts/check-bc-reception.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const LANGS = {
  fr: { jur: 'colombie-britannique', ridings: 'circonscriptions', polls: 'sondages', unc: 'incertitude',
        mustSay: ['Colombie-Britannique'], mustNotSay: ['British Columbia Forecast', 'Pronóstico'] },
  en: { jur: 'british-columbia', ridings: 'ridings', polls: 'polls', unc: 'uncertainty',
        mustSay: ['British Columbia'], mustNotSay: ['Colombie-Britannique', 'Columbia Británica'] },
  es: { jur: 'columbia-britanica', ridings: 'distritos', polls: 'sondeos', unc: 'incertidumbre',
        mustSay: ['Columbia Británica'], mustNotSay: ['Colombie-Britannique'] },
};
const SEATS = 93;

const problems = [];
const note = (m) => problems.push(m);
const page = (p) => (existsSync(join(DIST, p, 'index.html'))
  ? readFileSync(join(DIST, p, 'index.html'), 'utf8') : null);

/** Texte VISIBLE d'une page.
 *
 * Indispensable : les îlots Astro sérialisent leurs props dans des attributs,
 * si bien qu'un code de parti (`bc_centre`) apparaît dans le HTML sans jamais
 * être affiché. Chercher dans la source brute rendait donc un faux positif sur
 * les trois langues. */
const visible = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ');

for (const [lang, cfg] of Object.entries(LANGS)) {
  const base = `${lang}/canada/${cfg.jur}`;

  // ── 1. les cinq familles de routes existent ──────────────────────────────
  for (const [label, path] of [
    ['projection', base],
    ['index des circonscriptions', `${base}/${cfg.ridings}`],
    ['sondages', `${base}/${cfg.polls}`],
    ['incertitude', `${base}/${cfg.unc}`],
  ]) {
    if (!page(path)) note(`${lang} : ${label} absent (${path})`);
  }

  // ── 2. 93 fiches de circonscription ─────────────────────────────────────
  const dir = join(DIST, base, cfg.ridings);
  const seats = existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).length : 0;
  if (seats !== SEATS) note(`${lang} : ${seats} fiches de circonscription au lieu de ${SEATS}`);

  // ── 3. langue de la page, titre et description ──────────────────────────
  const html = page(base);
  if (html) {
    if (!/<html[^>]+lang="/.test(html) || !html.includes(`lang="${lang}"`)) {
      note(`${lang} : attribut lang absent ou incorrect sur la projection`);
    }
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    if (!title.trim()) note(`${lang} : titre vide`);
    if (desc.trim().length < 80) note(`${lang} : description trop courte (${desc.length})`);
    for (const mot of cfg.mustSay) {
      if (!title.includes(mot)) note(`${lang} : le titre ne nomme pas « ${mot} » — ${title}`);
    }
    for (const mot of cfg.mustNotSay) {
      if (title.includes(mot)) note(`${lang} : le titre contient « ${mot} », d'une autre langue`);
    }
    if (!html.includes('"@type":"Dataset"')) note(`${lang} : données structurées Dataset absentes`);

    // ── 4. alternantes : chaque hreflang doit exister dans dist ───────────
    for (const m of html.matchAll(/<link rel="alternate" hreflang="([a-z-]+)" href="([^"]+)"/g)) {
      const [, hl, href] = m;
      if (hl === 'x-default') continue;
      const rel = href.replace('https://vote-scope.com/', '').replace(/\/$/, '');
      if (!page(rel)) note(`${lang} : alternante ${hl} pointe dans le vide (${href})`);
    }
  }

  // ── 5. le hub Canada mène au desk ───────────────────────────────────────
  const hub = page(`${lang}/canada`);
  if (!hub) note(`${lang} : hub Canada introuvable`);
  else if (!hub.includes(`/${lang}/canada/${cfg.jur}/`)) {
    note(`${lang} : le hub Canada ne lie pas le desk britanno-colombien`);
  }

  // ── 6. candidatures HISTORIQUES vs député ACTUEL ────────────────────────
  const seatDir = existsSync(dir) ? readdirSync(dir).find((n) => n.includes('abbotsford-south')) : null;
  const fiche = seatDir ? page(`${base}/${cfg.ridings}/${seatDir}`) : null;
  if (!fiche) note(`${lang} : fiche témoin introuvable`);
  else {
    const texte = visible(fiche);
    if (!/2024/.test(texte)) note(`${lang} : la fiche ne date pas les candidatures de 2024`);
    const brut = texte.match(/\bbc_[a-z]+\b/);
    if (brut) note(`${lang} : code de parti brut affiché sur la fiche (${brut[0]})`);
    if (/\bnan\b/i.test(texte)) note(`${lang} : « nan » affiché sur la fiche`);
    if (/Circonscription fédérale|Federal riding|Distrito federal/.test(texte)) {
      note(`${lang} : la fiche se présente comme fédérale`);
    }
  }
}

if (problems.length) {
  console.error(`✖ réception BC : ${problems.length} problème(s)`);
  for (const p of problems) console.error('   · ' + p);
  process.exit(1);
}
console.log(`✓ réception BC : ${Object.keys(LANGS).length} langues × ` +
            `(projection, ${SEATS} circonscriptions, sondages, incertitude, hub) — rien à signaler.`);
