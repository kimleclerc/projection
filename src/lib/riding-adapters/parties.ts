/**
 * Party metadata (labels EN/FR, brand colors) for all jurisdictions.
 * Used by adapters to map raw party codes → display-ready RidingParty objects.
 *
 * `mention_fr` / `mention_en` carry the natural-language party reference used
 * in editorial prose ("du Parti libéral", "de la CAQ", "du PQ"). When absent,
 * blurb falls back to a generic "Party X" / "Parti X" pattern.
 */

export interface PartyMeta {
  label_en: string;
  label_fr: string;
  color: string;
  /** Full official party name (surfaced in legends / logo alt text). Optional —
   *  falls back to the label when absent. */
  full_fr?: string;
  full_en?: string;
  /** Official logo filename in /public/party-logos/ (e.g. "qc-caq.svg").
   *  Rendered by CandidateSlate / legends; falls back
   *  to the colour swatch when absent. */
  logo?: string;
  /** Editorial reference, French — genitive form ("du PQ", "de la CAQ"). */
  mention_fr?: string;
  /** Editorial reference, English — usually "the X Party" or "X". */
  mention_en?: string;
  /** Editorial reference, Spanish — subject/nominative form with its article
   *  ("el PLQ", "la CAQ", "los Demócratas", "Québec solidaire"). Contractions
   *  with a/de (al/del) are derived at use-site via aEs()/deEs(). */
  mention_es?: string;
}

export const CA_FEDERAL_PARTIES: Record<string, PartyMeta> = {
  lib:     { label_en: 'Liberal',      label_fr: 'Libéral',       color: '#D71920', logo: 'ca-lib.svg', mention_fr: 'du Parti libéral',      mention_en: 'the Liberal Party',      mention_es: 'el Partido Liberal' },
  con:     { label_en: 'Conservative', label_fr: 'Conservateur',  color: '#1A4782', logo: 'ca-con.svg', mention_fr: 'du Parti conservateur', mention_en: 'the Conservative Party', mention_es: 'el Partido Conservador' },
  ndp:     { label_en: 'NDP',          label_fr: 'NPD',           color: '#F37021', logo: 'ca-ndp.svg', mention_fr: 'du NPD',                mention_en: 'the NDP',                mention_es: 'el NPD' },
  bq:      { label_en: 'Bloc',         label_fr: 'Bloc',          color: '#33B2CC', logo: 'ca-bq.svg', mention_fr: 'du Bloc québécois',     mention_en: 'the Bloc Québécois',     mention_es: 'el Bloque Quebequés' },
  grn:     { label_en: 'Green',        label_fr: 'Vert',          color: '#3D9B35', logo: 'ca-grn.svg', mention_fr: 'du Parti vert',         mention_en: 'the Green Party',        mention_es: 'el Partido Verde' },
  ppc:     { label_en: 'PPC',          label_fr: 'PPC',           color: '#4B306A', logo: 'ca-ppc.svg', mention_fr: 'du PPC',                mention_en: 'the PPC',                mention_es: 'el PPC' },
  ind:     { label_en: 'Independent',  label_fr: 'Indépendant·e', color: '#888888', mention_fr: 'indépendant·e',         mention_en: 'an independent',         mention_es: 'una candidatura independiente' },
  fed_oth: { label_en: 'Other',        label_fr: 'Autre',         color: '#999999', mention_fr: "d'un autre parti",      mention_en: 'another party',          mention_es: 'otro partido' },
};

export const ON_PARTIES: Record<string, PartyMeta> = {
  on_pc:  { label_en: 'PC',  label_fr: 'PC',  color: '#0F4C81', logo: 'on-pc.svg', mention_fr: 'du PC',              mention_en: 'the PC Party',         mention_es: 'el PC' },
  on_olp: { label_en: 'OLP', label_fr: 'OLP', color: '#ED1C24', logo: 'on-lib.svg', mention_fr: 'du PLO',             mention_en: 'the Ontario Liberals', mention_es: 'los Liberales de Ontario' },
  on_lib: { label_en: 'OLP', label_fr: 'OLP', color: '#ED1C24', logo: 'on-lib.svg', mention_fr: 'du PLO',             mention_en: 'the Ontario Liberals', mention_es: 'los Liberales de Ontario' },
  on_ndp: { label_en: 'NDP', label_fr: 'NPD', color: '#F37021', logo: 'on-ndp.svg', mention_fr: 'du NPD',             mention_en: 'the NDP',              mention_es: 'el NPD' },
  on_grn: { label_en: 'GP',  label_fr: 'PV',  color: '#3D9B35', logo: 'on-grn.png', mention_fr: 'du Parti vert',      mention_en: 'the Green Party',      mention_es: 'el Partido Verde' },
  on_ind: { label_en: 'IND', label_fr: 'IND', color: '#888888', mention_fr: 'indépendant·e',      mention_en: 'an independent',       mention_es: 'una candidatura independiente' },
  on_oth: { label_en: 'OTH', label_fr: 'AUT', color: '#999999', mention_fr: "d'un autre parti",   mention_en: 'another party',        mention_es: 'otro partido' },
};

export const QC_PARTIES: Record<string, PartyMeta> = {
  caq:    { label_en: 'CAQ',          label_fr: 'CAQ',  color: '#03A9F4', logo: 'qc-caq.png', full_fr: 'Équipe Christine Fréchette – Coalition avenir Québec', full_en: 'Équipe Christine Fréchette – Coalition Avenir Québec', mention_fr: 'de la CAQ',           mention_en: 'the CAQ',                  mention_es: 'la CAQ' },
  plq:    { label_en: 'QLP',          label_fr: 'PLQ',  color: '#D71920', logo: 'qc-plq.svg', full_fr: 'Parti libéral du Québec', full_en: 'Quebec Liberal Party',          mention_fr: 'du PLQ',              mention_en: 'the Quebec Liberals',      mention_es: 'el PLQ' },
  pq:     { label_en: 'PQ',           label_fr: 'PQ',   color: '#004C9D', logo: 'qc-pq.svg', full_fr: 'Parti Québécois', full_en: 'Parti Québécois',                     mention_fr: 'du PQ',               mention_en: 'the PQ',                   mention_es: 'el PQ' },
  qs:     { label_en: 'QS',           label_fr: 'QS',   color: '#F47C24', logo: 'qc-qs.svg', full_fr: 'Québec solidaire', full_en: 'Québec solidaire',                   mention_fr: 'de Québec solidaire', mention_en: 'Québec solidaire',         mention_es: 'Québec solidaire' },
  pcq:    { label_en: 'PCQ',          label_fr: 'PCQ',  color: '#1F3864', logo: 'qc-pcq.svg', full_fr: 'Parti conservateur du Québec', full_en: 'Conservative Party of Quebec', mention_fr: 'du PCQ',              mention_en: 'the Quebec Conservatives', mention_es: 'el PCQ' },
  qc_ind: { label_en: 'Independent',  label_fr: 'Indépendant·e', color: '#888888', mention_fr: 'indépendant·e',  mention_en: 'an independent',         mention_es: 'una candidatura independiente' },
  qc_oth: { label_en: 'Other',        label_fr: 'Autre',         color: '#999999', mention_fr: "d'un autre parti", mention_en: 'another party',          mention_es: 'otro partido' },
};

/**
 * UK Westminster palette. Mainland projection buckets (uk_con/lab/ld/ref/grn/
 * snp/pc/oth) come straight from the model, plus uk_ind / uk_spk for the
 * member table. Northern Ireland is bucketed into uk_oth by the projection
 * model, but the export remaps party_current_raw / party_name_raw to ni_*
 * slugs so the sitting MP and 2024 candidates list keep their real identity.
 */
export const UK_PARTIES: Record<string, PartyMeta> = {
  // Britain mainland
  uk_lab: { label_en: 'Labour',       label_fr: 'Travailliste',         color: '#E4003B', logo: 'uk-lab.svg', mention_fr: 'des Travaillistes',        mention_en: 'Labour',                mention_es: 'los Laboristas' },
  uk_con: { label_en: 'Conservative', label_fr: 'Conservateur',         color: '#0087DC', logo: 'uk-con.svg', mention_fr: 'des Conservateurs',        mention_en: 'the Conservatives',     mention_es: 'los Conservadores' },
  uk_ld:  { label_en: 'Lib Dems',     label_fr: 'Libéraux-démocrates',  color: '#FAA61A', logo: 'uk-ld.svg', mention_fr: 'des Libéraux-démocrates',  mention_en: 'the Lib Dems',          mention_es: 'los Liberaldemócratas' },
  uk_ref: { label_en: 'Reform UK',    label_fr: 'Reform UK',            color: '#12B6CF', logo: 'uk-ref.svg', mention_fr: 'de Reform UK',             mention_en: 'Reform UK',             mention_es: 'Reform UK' },
  uk_grn: { label_en: 'Green',        label_fr: 'Vert·e·s',             color: '#6AB023', logo: 'uk-grn.jpg', mention_fr: 'des Vert·e·s',             mention_en: 'the Green Party',       mention_es: 'los Verdes' },
  uk_snp: { label_en: 'SNP',          label_fr: 'SNP',                  color: '#FFF95D', logo: 'uk-snp.svg', mention_fr: 'du SNP',                   mention_en: 'the SNP',               mention_es: 'el SNP' },
  uk_pc:  { label_en: 'Plaid Cymru',  label_fr: 'Plaid Cymru',          color: '#005B54', logo: 'uk-pc.svg', mention_fr: 'du Plaid Cymru',           mention_en: 'Plaid Cymru',           mention_es: 'el Plaid Cymru' },
  uk_ind: { label_en: 'Independent',  label_fr: 'Indépendant·e',        color: '#888888', mention_fr: 'indépendant·e',            mention_en: 'an independent',        mention_es: 'una candidatura independiente' },
  uk_spk: { label_en: 'Speaker',      label_fr: 'Speaker',              color: '#444444', mention_fr: 'du président de la Chambre', mention_en: 'the Speaker',         mention_es: 'el presidente de la Cámara' },
  uk_oth: { label_en: 'Other',        label_fr: 'Autre',                color: '#999999', mention_fr: "d'un autre parti",         mention_en: 'another party',         mention_es: 'otro partido' },
  // Northern Ireland (remapped from uk_oth via party_raw)
  ni_dup:   { label_en: 'DUP',         label_fr: 'DUP',                 color: '#D46A4C', logo: 'ni-dup.svg', mention_fr: 'du DUP',                   mention_en: 'the DUP',               mention_es: 'el DUP' },
  ni_sf:    { label_en: 'Sinn Féin',   label_fr: 'Sinn Féin',           color: '#326760', logo: 'ni-sf.svg', mention_fr: 'du Sinn Féin',             mention_en: 'Sinn Féin',             mention_es: 'el Sinn Féin' },
  ni_sdlp:  { label_en: 'SDLP',        label_fr: 'SDLP',                color: '#2AA82C', logo: 'ni-sdlp.svg', mention_fr: 'du SDLP',                  mention_en: 'the SDLP',              mention_es: 'el SDLP' },
  ni_apni:  { label_en: 'Alliance',    label_fr: 'Alliance',            color: '#F6CB2F', logo: 'ni-apni.svg', mention_fr: 'de l’Alliance',            mention_en: 'the Alliance Party',    mention_es: 'la Alianza' },
  ni_uup:   { label_en: 'UUP',         label_fr: 'UUP',                 color: '#48A5EE', logo: 'ni-uup.png', mention_fr: 'de l’UUP',                 mention_en: 'the UUP',               mention_es: 'el UUP' },
  ni_tuv:   { label_en: 'TUV',         label_fr: 'TUV',                 color: '#0095B6', logo: 'ni-tuv.svg', mention_fr: 'du TUV',                   mention_en: 'TUV',                   mention_es: 'el TUV' },
  ni_aontu: { label_en: 'Aontú',       label_fr: 'Aontú',               color: '#44532A', logo: 'ni-aontu.webp', mention_fr: 'd’Aontú',                  mention_en: 'Aontú',                 mention_es: 'Aontú' },
};

/**
 * US House palette. Projection model uses us_dem / us_rep / us_oth.
 * Editorial display preserves raw FEC party codes (GRE, LIB, IND, …) so
 * minor-party candidates keep their identity in the candidates table.
 */
export const US_HOUSE_PARTIES: Record<string, PartyMeta> = {
  us_dem: { label_en: 'Democrat',    label_fr: 'Démocrate',     color: '#1375B7', logo: 'us-dem.svg', mention_fr: 'des Démocrates',    mention_en: 'the Democrats',    mention_es: 'los Demócratas' },
  us_rep: { label_en: 'Republican',  label_fr: 'Républicain',   color: '#D2222D', logo: 'us-rep.svg', mention_fr: 'des Républicains',  mention_en: 'the Republicans',  mention_es: 'los Republicanos' },
  us_ind: { label_en: 'Independent', label_fr: 'Indépendant·e', color: '#888888', mention_fr: 'indépendant·e',     mention_en: 'an independent',   mention_es: 'una candidatura independiente' },
  us_grn: { label_en: 'Green',       label_fr: 'Vert·e·s',      color: '#3D9B35', logo: 'us-grn.svg', mention_fr: 'des Vert·e·s',      mention_en: 'the Greens',       mention_es: 'los Verdes' },
  us_lib: { label_en: 'Libertarian', label_fr: 'Libertarien',   color: '#FED105', logo: 'us-lib.svg', mention_fr: 'des Libertariens',  mention_en: 'the Libertarians', mention_es: 'los Libertarios' },
  us_oth: { label_en: 'Other',       label_fr: 'Autre',         color: '#999999', mention_fr: "d'un autre parti",  mention_en: 'another party',    mention_es: 'otro partido' },
};

/**
 * France législatives — BLOCS, pas partis : le modèle projette les huit blocs
 * VoteScope (mêmes couleurs que FranceDesk, convention politique française
 * validée dataviz). Les nuances ministère individuelles restent visibles via
 * party_raw dans la table des candidats.
 */
export const FR_LEG_PARTIES: Record<string, PartyMeta> = {
  far_right:    { label_en: 'RN and allies',   label_fr: 'RN et alliés',      color: '#2b4f8c', mention_fr: 'du RN et ses alliés',      mention_en: 'the RN and its allies', mention_es: 'el RN y sus aliados' },
  left:         { label_en: 'Left (NFP)',      label_fr: 'Gauche (NFP)',      color: '#b0202a', mention_fr: 'de la gauche unie',        mention_en: 'the united left',       mention_es: 'la izquierda unida' },
  centre:       { label_en: 'Centre (Ensemble)', label_fr: 'Centre (Ensemble)', color: '#b7860f', mention_fr: 'du bloc central',        mention_en: 'the centrist bloc',     mention_es: 'el bloque central' },
  right:        { label_en: 'LR and allies',   label_fr: 'LR et divers droite', color: '#3f82d6', mention_fr: 'de la droite LR',        mention_en: 'the LR right',          mention_es: 'la derecha LR' },
  far_left:     { label_en: 'Far left',        label_fr: 'Extrême gauche',    color: '#6b1f2e', mention_fr: "de l'extrême gauche",      mention_en: 'the far left',          mention_es: 'la extrema izquierda' },
  greens:       { label_en: 'Greens',          label_fr: 'Écologistes',       color: '#4a9d5b', mention_fr: 'des écologistes',          mention_en: 'the Greens',            mention_es: 'los ecologistas' },
  sovereignist: { label_en: 'Sovereignists',   label_fr: 'Souverainistes',    color: '#6d4c8a', mention_fr: 'des souverainistes',       mention_en: 'the sovereignists',     mention_es: 'los soberanistas' },
  other:        { label_en: 'Others',          label_fr: 'Autres',            color: '#999999', mention_fr: "d'un autre bloc",          mention_en: 'another bloc',          mention_es: 'otro bloque' },
};

const PALETTES: Record<string, Record<string, PartyMeta>> = {
  'federal-ca': CA_FEDERAL_PARTIES,
  'quebec': QC_PARTIES,
  'ontario': ON_PARTIES,
  'uk': UK_PARTIES,
  'us-house': US_HOUSE_PARTIES,
  'us-senate': US_HOUSE_PARTIES,  // same Dem/Rep palette
  // Gouverneurs : mêmes couleurs, mais l'indépendant y est un VAINQUEUR
  // possible et pas un résidu — le modèle lui donne une probabilité de gagner,
  // ce que la palette doit pouvoir nommer (us_ind / us_oth y sont déjà).
  'us-governor': US_HOUSE_PARTIES,
  'france': FR_LEG_PARTIES,
};

export function partyMeta(jurisdiction: string, code: string): PartyMeta {
  const palette = PALETTES[jurisdiction] ?? CA_FEDERAL_PARTIES;
  return palette[code] ?? { label_en: code.toUpperCase(), label_fr: code.toUpperCase(), color: '#999' };
}

/**
 * Turn a genitive `mention_fr` ("du PLQ", "de la CAQ", "de Québec solidaire")
 * into a subject form with the correct definite article ("le PLQ", "la CAQ",
 * "Québec solidaire"). The genitive already encodes the party's gender and
 * number, so reverting it to the nominative is mechanical — this is NOT the
 * contextual du/de la/des choice, which is stored upstream in the palette.
 * Shared across every jurisdiction via `mention_fr`.
 */
export function subjectFr(genitive: string): string {
  if (genitive.startsWith('du '))    return 'le ' + genitive.slice(3);
  if (genitive.startsWith('de la ')) return 'la ' + genitive.slice(6);
  if (genitive.startsWith('de l’'))  return 'l’' + genitive.slice(5);
  if (genitive.startsWith("de l'"))  return "l'" + genitive.slice(5);
  if (genitive.startsWith('des '))   return 'les ' + genitive.slice(4);
  if (genitive.startsWith('de '))    return genitive.slice(3);
  if (genitive.startsWith('d’'))     return genitive.slice(2);
  if (genitive.startsWith("d'"))     return genitive.slice(2);
  if (genitive === 'indépendant·e')  return 'une candidature indépendante';
  return genitive;
}

/**
 * Dative form for verbs that take "à" ("succéder à", "faire face à"). Builds on
 * `subjectFr` then contracts the article: à + le → au, à + les → aux.
 */
export function datifFr(genitive: string): string {
  const subj = subjectFr(genitive);
  if (subj.startsWith('le '))  return 'au ' + subj.slice(3);
  if (subj.startsWith('les ')) return 'aux ' + subj.slice(4);
  return 'à ' + subj; // la / l' / proper noun / "une candidature indépendante"
}

/**
 * Spanish "a" + subject `mention_es`, contracting only the masculine singular
 * article: "a el" → "al" ("al PLQ"); "a la"/"a los"/"a las" stay uncontracted.
 */
export function aEs(subjectEs: string): string {
  if (subjectEs.startsWith('el ')) return 'al ' + subjectEs.slice(3);
  return 'a ' + subjectEs;
}

/**
 * Spanish "de" + subject `mention_es`, contracting only the masculine singular
 * article: "de el" → "del" ("del PLQ"); "de la"/"de los"/"de las" stay as-is.
 */
export function deEs(subjectEs: string): string {
  if (subjectEs.startsWith('el ')) return 'del ' + subjectEs.slice(3);
  return 'de ' + subjectEs;
}

/**
 * Subject-verb agreement for a party used as the grammatical subject in French.
 * Derives gender and number from the genitive `mention_fr` (which already
 * encodes both): du → il, de la → elle, des → ils, de l' → elle (Alliance is
 * the dominant case), proper nouns → il. Used to inflect "conserve-t-il" /
 * "perd-il" into the right pronoun and number across every jurisdiction.
 */
export function agreementFr(genitive: string): { pron: 'il' | 'elle' | 'ils' | 'elles'; plural: boolean } {
  if (genitive.startsWith('des '))  return { pron: 'ils', plural: true };
  if (genitive.startsWith('du '))   return { pron: 'il', plural: false };
  if (genitive.startsWith('de la '))return { pron: 'elle', plural: false };
  if (genitive.startsWith('de l’') || genitive.startsWith("de l'")) return { pron: 'elle', plural: false };
  if (genitive === 'indépendant·e') return { pron: 'elle', plural: false }; // "une candidature"
  return { pron: 'il', plural: false }; // de X / d'X proper nouns (Québec solidaire, Reform UK…)
}

/** True when a Spanish subject `mention_es` is plural (los/las …), for verb
 *  number agreement ("Podrá" → "Podrán", "perderá" → "perderán"). */
export function isPluralEs(subjectEs: string): boolean {
  return subjectEs.startsWith('los ') || subjectEs.startsWith('las ');
}
