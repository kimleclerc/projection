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

const PALETTES: Record<string, Record<string, PartyMeta>> = {
  'federal-ca': CA_FEDERAL_PARTIES,
  'quebec': QC_PARTIES,
  'ontario': ON_PARTIES,
};

export function partyMeta(jurisdiction: string, code: string): PartyMeta {
  const palette = PALETTES[jurisdiction] ?? CA_FEDERAL_PARTIES;
  return palette[code] ?? { label_en: code.toUpperCase(), label_fr: code.toUpperCase(), color: '#999' };
}
