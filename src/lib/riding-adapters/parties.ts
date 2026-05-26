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
  /** Editorial reference, French — genitive form ("du PQ", "de la CAQ"). */
  mention_fr?: string;
  /** Editorial reference, English — usually "the X Party" or "X". */
  mention_en?: string;
}

export const CA_FEDERAL_PARTIES: Record<string, PartyMeta> = {
  lib:     { label_en: 'Liberal',      label_fr: 'Libéral',       color: '#D71920', mention_fr: 'du Parti libéral',      mention_en: 'the Liberal Party' },
  con:     { label_en: 'Conservative', label_fr: 'Conservateur',  color: '#1A4782', mention_fr: 'du Parti conservateur', mention_en: 'the Conservative Party' },
  ndp:     { label_en: 'NDP',          label_fr: 'NPD',           color: '#F37021', mention_fr: 'du NPD',                mention_en: 'the NDP' },
  bq:      { label_en: 'Bloc',         label_fr: 'Bloc',          color: '#33B2CC', mention_fr: 'du Bloc québécois',     mention_en: 'the Bloc Québécois' },
  grn:     { label_en: 'Green',        label_fr: 'Vert',          color: '#3D9B35', mention_fr: 'du Parti vert',         mention_en: 'the Green Party' },
  ppc:     { label_en: 'PPC',          label_fr: 'PPC',           color: '#4B306A', mention_fr: 'du PPC',                mention_en: 'the PPC' },
  ind:     { label_en: 'Independent',  label_fr: 'Indépendant·e', color: '#888888', mention_fr: 'indépendant·e',         mention_en: 'an independent' },
  fed_oth: { label_en: 'Other',        label_fr: 'Autre',         color: '#999999', mention_fr: "d'un autre parti",      mention_en: 'another party' },
};

export const ON_PARTIES: Record<string, PartyMeta> = {
  on_pc:  { label_en: 'PC',  label_fr: 'PC',  color: '#0F4C81', mention_fr: 'du PC',              mention_en: 'the PC Party' },
  on_olp: { label_en: 'OLP', label_fr: 'OLP', color: '#ED1C24', mention_fr: 'du PLO',             mention_en: 'the Ontario Liberals' },
  on_lib: { label_en: 'OLP', label_fr: 'OLP', color: '#ED1C24', mention_fr: 'du PLO',             mention_en: 'the Ontario Liberals' },
  on_ndp: { label_en: 'NDP', label_fr: 'NPD', color: '#F37021', mention_fr: 'du NPD',             mention_en: 'the NDP' },
  on_grn: { label_en: 'GP',  label_fr: 'PV',  color: '#3D9B35', mention_fr: 'du Parti vert',      mention_en: 'the Green Party' },
  on_ind: { label_en: 'IND', label_fr: 'IND', color: '#888888', mention_fr: 'indépendant·e',      mention_en: 'an independent' },
  on_oth: { label_en: 'OTH', label_fr: 'AUT', color: '#999999', mention_fr: "d'un autre parti",   mention_en: 'another party' },
};

export const QC_PARTIES: Record<string, PartyMeta> = {
  caq:    { label_en: 'CAQ',          label_fr: 'CAQ',  color: '#03A9F4', mention_fr: 'de la CAQ',           mention_en: 'the CAQ' },
  plq:    { label_en: 'PLQ',          label_fr: 'PLQ',  color: '#D71920', mention_fr: 'du PLQ',              mention_en: 'the Quebec Liberals' },
  pq:     { label_en: 'PQ',           label_fr: 'PQ',   color: '#004C9D', mention_fr: 'du PQ',               mention_en: 'the PQ' },
  qs:     { label_en: 'QS',           label_fr: 'QS',   color: '#F47C24', mention_fr: 'de Québec solidaire', mention_en: 'Québec solidaire' },
  pcq:    { label_en: 'PCQ',          label_fr: 'PCQ',  color: '#1F3864', mention_fr: 'du PCQ',              mention_en: 'the Quebec Conservatives' },
  qc_ind: { label_en: 'Independent',  label_fr: 'Indépendant·e', color: '#888888', mention_fr: 'indépendant·e',  mention_en: 'an independent' },
  qc_oth: { label_en: 'Other',        label_fr: 'Autre',         color: '#999999', mention_fr: "d'un autre parti", mention_en: 'another party' },
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
  uk_lab: { label_en: 'Labour',       label_fr: 'Travailliste',         color: '#E4003B', mention_fr: 'des Travaillistes',        mention_en: 'Labour' },
  uk_con: { label_en: 'Conservative', label_fr: 'Conservateur',         color: '#0087DC', mention_fr: 'des Conservateurs',        mention_en: 'the Conservatives' },
  uk_ld:  { label_en: 'Lib Dems',     label_fr: 'Libéraux-démocrates',  color: '#FAA61A', mention_fr: 'des Libéraux-démocrates',  mention_en: 'the Lib Dems' },
  uk_ref: { label_en: 'Reform UK',    label_fr: 'Reform UK',            color: '#12B6CF', mention_fr: 'de Reform UK',             mention_en: 'Reform UK' },
  uk_grn: { label_en: 'Green',        label_fr: 'Vert·e·s',             color: '#6AB023', mention_fr: 'des Vert·e·s',             mention_en: 'the Green Party' },
  uk_snp: { label_en: 'SNP',          label_fr: 'SNP',                  color: '#FFF95D', mention_fr: 'du SNP',                   mention_en: 'the SNP' },
  uk_pc:  { label_en: 'Plaid Cymru',  label_fr: 'Plaid Cymru',          color: '#005B54', mention_fr: 'du Plaid Cymru',           mention_en: 'Plaid Cymru' },
  uk_ind: { label_en: 'Independent',  label_fr: 'Indépendant·e',        color: '#888888', mention_fr: 'indépendant·e',            mention_en: 'an independent' },
  uk_spk: { label_en: 'Speaker',      label_fr: 'Speaker',              color: '#444444', mention_fr: 'du président de la Chambre', mention_en: 'the Speaker' },
  uk_oth: { label_en: 'Other',        label_fr: 'Autre',                color: '#999999', mention_fr: "d'un autre parti",         mention_en: 'another party' },
  // Northern Ireland (remapped from uk_oth via party_raw)
  ni_dup:   { label_en: 'DUP',         label_fr: 'DUP',                 color: '#D46A4C', mention_fr: 'du DUP',                   mention_en: 'the DUP' },
  ni_sf:    { label_en: 'Sinn Féin',   label_fr: 'Sinn Féin',           color: '#326760', mention_fr: 'du Sinn Féin',             mention_en: 'Sinn Féin' },
  ni_sdlp:  { label_en: 'SDLP',        label_fr: 'SDLP',                color: '#2AA82C', mention_fr: 'du SDLP',                  mention_en: 'the SDLP' },
  ni_apni:  { label_en: 'Alliance',    label_fr: 'Alliance',            color: '#F6CB2F', mention_fr: 'de l’Alliance',            mention_en: 'the Alliance Party' },
  ni_uup:   { label_en: 'UUP',         label_fr: 'UUP',                 color: '#48A5EE', mention_fr: 'de l’UUP',                 mention_en: 'the UUP' },
  ni_tuv:   { label_en: 'TUV',         label_fr: 'TUV',                 color: '#0095B6', mention_fr: 'du TUV',                   mention_en: 'TUV' },
  ni_aontu: { label_en: 'Aontú',       label_fr: 'Aontú',               color: '#44532A', mention_fr: 'd’Aontú',                  mention_en: 'Aontú' },
};

/**
 * US House palette. Projection model uses us_dem / us_rep / us_oth.
 * Editorial display preserves raw FEC party codes (GRE, LIB, IND, …) so
 * minor-party candidates keep their identity in the candidates table.
 */
export const US_HOUSE_PARTIES: Record<string, PartyMeta> = {
  us_dem: { label_en: 'Democrat',    label_fr: 'Démocrate',     color: '#1375B7', mention_fr: 'des Démocrates',    mention_en: 'the Democrats' },
  us_rep: { label_en: 'Republican',  label_fr: 'Républicain',   color: '#D2222D', mention_fr: 'des Républicains',  mention_en: 'the Republicans' },
  us_ind: { label_en: 'Independent', label_fr: 'Indépendant·e', color: '#888888', mention_fr: 'indépendant·e',     mention_en: 'an independent' },
  us_grn: { label_en: 'Green',       label_fr: 'Vert·e·s',      color: '#3D9B35', mention_fr: 'des Vert·e·s',      mention_en: 'the Greens' },
  us_lib: { label_en: 'Libertarian', label_fr: 'Libertarien',   color: '#FED105', mention_fr: 'des Libertariens',  mention_en: 'the Libertarians' },
  us_oth: { label_en: 'Other',       label_fr: 'Autre',         color: '#999999', mention_fr: "d'un autre parti",  mention_en: 'another party' },
};

const PALETTES: Record<string, Record<string, PartyMeta>> = {
  'federal-ca': CA_FEDERAL_PARTIES,
  'quebec': QC_PARTIES,
  'ontario': ON_PARTIES,
  'uk': UK_PARTIES,
  'us-house': US_HOUSE_PARTIES,
};

export function partyMeta(jurisdiction: string, code: string): PartyMeta {
  const palette = PALETTES[jurisdiction] ?? CA_FEDERAL_PARTIES;
  return palette[code] ?? { label_en: code.toUpperCase(), label_fr: code.toUpperCase(), color: '#999' };
}
