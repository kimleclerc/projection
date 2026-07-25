// scripts/ingest-budget.mjs
// Ingère les analyses de budget (repos legacy budget_CA/ON/QC) vers un schéma
// unifié anglais-clé, prose en {en,fr,es}. CA/ON = bilingues (fichiers en+fr) ;
// QC = FR seul (plus ancienne, schéma réduit) → en/es vides, remplis par Haiku.
// Les nombres / id / tags / direction / priorité ne sont JAMAIS traduits.
//
//   node scripts/ingest-budget.mjs
// → web_data/budget/{canada/2025, ontario/2026, quebec/2026}.json
//
// Budget suivant = déposer une nouvelle source (ou écrire le JSON directement
// selon ce schéma) et ré-exécuter. On n'écrase jamais : chaque année = 1 fichier.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'budget-sources');
const OUT = path.join(ROOT, 'web_data', 'budget');

function loadVar(file, varname) {
  const code = fs.readFileSync(path.join(SRC, file), 'utf8');
  // Les sources déclarent `const BUDGET_EN = {…}` etc. On les évalue et on
  // renvoie la variable via une expression finale dans le même scope d'eval.
  // eslint-disable-next-line no-eval
  return eval(code + '\n;' + varname);
}

// Prose → {en, fr, es}. `es` (et `en` pour QC) laissés vides pour Haiku.
const P = (en, fr) => ({ en: en ?? '', fr: fr ?? '', es: '' });
const asArr = (v) => (Array.isArray(v) ? v : []);

// Aligne deux tableaux d'objets par INDEX. Les jumeaux en/fr préservent l'ordre,
// et les `id` sont traduits côté FR (tariff-response → reponse-tarifs), donc un
// appariement par id casserait. L'id EN sert d'ancre canonique en sortie.
function align(enArr, frArr) {
  enArr = asArr(enArr); frArr = asArr(frArr);
  return enArr.map((e, i) => [e, frArr[i] ?? {}]);
}
// Pour QC (fr seul) : produit les paires [ {}, frItem ] pour réutiliser la même
// logique (en vide, fr rempli).
function alignSolo(frArr) {
  return asArr(frArr).map((f) => [{}, f]);
}

function mapNumbers(pairs) {
  return pairs.map(([e, f]) => ({
    label: P(e.label, f.label),
    value: e.valeur ?? f.valeur ?? '',
    note: P(e.note, f.note),
    change: P(e.variation, f.variation),
    direction: e.direction ?? f.direction ?? '',
  }));
}
function mapSectors(pairs) {
  return pairs.map(([e, f]) => ({
    id: e.id ?? f.id ?? '',
    priority: e.priorite ?? f.priorite ?? '',
    tags: e.tags ?? f.tags ?? [],
    title: P(e.titre, f.titre),
    spending: P(e.depenses, f.depenses),
    change: P(e.variation, f.variation),
    summary: P(e.resume, f.resume),
    points: alignList(e.points, f.points),
  }));
}
function mapAudiences(pairs) {
  return pairs.map(([e, f]) => ({
    id: e.id ?? f.id ?? '',
    priority: e.priorite ?? f.priorite ?? '',
    tags: e.tags ?? f.tags ?? [],
    title: P(e.titre, f.titre),
    summary: P(e.resume, f.resume),
    measures: align(e.mesures, f.mesures).map(([em, fm]) => ({
      label: P(em.label, fm.label),
      value: em.valeur ?? fm.valeur ?? '',
      note: P(em.note, fm.note),
    })),
  }));
}
function mapStakeholders(pairs) {
  return pairs.map(([e, f]) => ({
    id: e.id ?? f.id ?? '',
    priority: e.priorite ?? f.priorite ?? '',
    tags: e.tags ?? f.tags ?? [],
    title: P(e.titre, f.titre),
    summary: P(e.resume, f.resume),
    issues: alignList(e.enjeux, f.enjeux),
  }));
}
// Aligne deux listes de chaînes (points/enjeux) par index → [{en,fr,es}].
function alignList(en, fr) {
  en = asArr(en); fr = asArr(fr);
  const n = Math.max(en.length, fr.length);
  return Array.from({ length: n }, (_, i) => P(en[i], fr[i]));
}
function mapGlossary(pairs) {
  return pairs.map(([e, f]) => ({
    term: P(e.terme, f.terme),
    definition: P(e.def, f.def),
  }));
}
function mapComparison(en, fr) {
  const e = en ?? {}; const f = fr ?? {};
  if (!e.elements && !f.elements) return null;
  return {
    previous_year: e.annee_precedente ?? f.annee_precedente ?? '',
    items: align(e.elements, f.elements).map(([ee, ff]) => ({
      label: P(ee.label, ff.label),
      before: P(ee.avant, ff.avant),
      after: P(ee.apres, ff.apres),
      direction: ee.direction ?? ff.direction ?? '',
    })),
  };
}

function build({ slug, year, edition, type, season, en, fr }) {
  const has = (o, k) => o && o[k] != null;
  const quote = (en && en.quote) || (fr && fr.quote)
    ? {
        text: P(en?.quote?.texte, fr?.quote?.texte),
        author: en?.quote?.auteur ?? fr?.quote?.auteur ?? '',
        role: P(en?.quote?.titre, fr?.quote?.titre),
      }
    : null;
  const notebook = (en && en.notebook) || (fr && fr.notebook)
    ? {
        url: en?.notebook?.url ?? fr?.notebook?.url ?? '',
        label: P(en?.notebook?.label, fr?.notebook?.label),
        note: P(en?.notebook?.note, fr?.notebook?.note),
      }
    : null;
  const sources = (en && en.sources) || (fr && fr.sources)
    ? { plan: en?.sources?.plan ?? fr?.sources?.plan ?? '', brief: en?.sources?.bref ?? fr?.sources?.bref ?? '' }
    : null;

  return {
    jurisdiction: slug,
    slug,
    year,
    // `edition` = segment d'URL, unique par juridiction. = year pour un budget
    // standard ; disambiguïsé (ex. "2026-spring") si un 2e événement fiscal
    // tombe la même année. `type` distingue budget d'automne vs mise à jour éco
    // de printemps (fédéral depuis 2025). Le modèle est event-scopé, pas
    // year-scopé — un événement = une page permanente.
    edition,
    type,       // 'budget' | 'economic_update'
    season,     // 'fall' | 'spring'
    fiscal_year: en?.annee ?? fr?.annee ?? '',
    status: 'archived',
    title: P(en?.titre, fr?.titre),
    title_full: P(en?.titre_complet, fr?.titre_complet),
    date_tabled: P(en?.date_depot, fr?.date_depot),
    minister: en?.ministre ?? fr?.ministre ?? '',
    premier: en?.premier_ministre ?? fr?.premier_ministre ?? '',
    quote,
    key_numbers: mapNumbers(en ? align(en.chiffres, fr?.chiffres) : alignSolo(fr?.chiffres)),
    sectors: mapSectors(en ? align(en.secteurs, fr?.secteurs) : alignSolo(fr?.secteurs)),
    audiences: mapAudiences(en ? align(en.audiences, fr?.audiences) : alignSolo(fr?.audiences)),
    stakeholders: mapStakeholders(en ? align(en.parties_prenantes, fr?.parties_prenantes) : alignSolo(fr?.parties_prenantes)),
    glossary: mapGlossary(en ? align(en.glossaire, fr?.glossaire) : alignSolo(fr?.glossaire)),
    comparison: en ? mapComparison(en.comparaison, fr?.comparaison) : mapComparison(null, fr?.comparaison),
    sources,
    notebook,
    meta: {
      analyst: 'Kim Leclerc',
      org: 'AUCOIN Stratégie & Communication',
      source: 'Migrated from legacy budget_* GitHub Pages repos',
      ingested_at: new Date().toISOString().slice(0, 10),
      needs_translation: en ? ['es'] : ['en', 'es'],
    },
  };
}

// type: 'budget' (automne fédéral / printemps provincial) | 'economic_update'.
// edition défaut = year ; à disambiguïser pour un 2e événement (ex. mise à jour
// éco fédérale de printemps → edition '2026-spring').
const JURISDICTIONS = [
  { slug: 'canada', year: '2025', edition: '2025', type: 'budget', season: 'fall', enFile: ['ca-en.js', 'BUDGET_EN'], frFile: ['ca-fr.js', 'BUDGET_FR'] },
  { slug: 'ontario', year: '2026', edition: '2026', type: 'budget', season: 'spring', enFile: ['on-en.js', 'BUDGET_EN'], frFile: ['on-fr.js', 'BUDGET_FR'] },
  { slug: 'quebec', year: '2026', edition: '2026', type: 'budget', season: 'spring', frFile: ['qc-fr.js', 'BUDGET'] }, // FR only, older schema
];

for (const j of JURISDICTIONS) {
  const en = j.enFile ? loadVar(...j.enFile) : null;
  const fr = j.frFile ? loadVar(...j.frFile) : null;
  const out = build({ slug: j.slug, year: j.year, edition: j.edition, type: j.type, season: j.season, en, fr });
  const dir = path.join(OUT, j.slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${j.edition}.json`); // fichier = edition (clé d'URL)
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  const proseCount = JSON.stringify(out).match(/"en":/g)?.length ?? 0;
  console.log(`✓ ${j.slug}/${j.year}.json — ${out.sectors.length} secteurs, ${out.audiences.length} audiences, ${out.stakeholders.length} parties prenantes, ${out.glossary.length} glossaire (${proseCount} champs prose, needs ${out.meta.needs_translation.join('+')})`);
}
