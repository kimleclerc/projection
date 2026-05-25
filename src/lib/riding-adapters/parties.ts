/**
 * Party metadata (labels EN/FR, brand colors) for all jurisdictions.
 * Used by adapters to map raw party codes → display-ready RidingParty objects.
 */

export interface PartyMeta {
  label_en: string;
  label_fr: string;
  color: string;
}

export const CA_FEDERAL_PARTIES: Record<string, PartyMeta> = {
  lib:     { label_en: 'Liberal',      label_fr: 'Libéral',       color: '#D71920' },
  con:     { label_en: 'Conservative', label_fr: 'Conservateur',  color: '#1A4782' },
  ndp:     { label_en: 'NDP',          label_fr: 'NPD',           color: '#F37021' },
  bq:      { label_en: 'Bloc',         label_fr: 'Bloc',          color: '#33B2CC' },
  grn:     { label_en: 'Green',        label_fr: 'Vert',          color: '#3D9B35' },
  ppc:     { label_en: 'PPC',          label_fr: 'PPC',           color: '#4B306A' },
  ind:     { label_en: 'Independent',  label_fr: 'Indépendant·e', color: '#888888' },
  fed_oth: { label_en: 'Other',        label_fr: 'Autre',         color: '#999999' },
};

export function partyMeta(jurisdiction: string, code: string): PartyMeta {
  const palette = jurisdiction === 'federal-ca' ? CA_FEDERAL_PARTIES : CA_FEDERAL_PARTIES;
  return palette[code] ?? { label_en: code.toUpperCase(), label_fr: code.toUpperCase(), color: '#999' };
}
