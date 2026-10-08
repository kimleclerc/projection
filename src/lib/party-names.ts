/**
 * Nom d'un parti dans la langue de la page — UNE seule fonction pour tout le site.
 * Les données publiées (web_data) portent label_en et label_fr ; l'espagnol vient
 * d'ici quand la donnée n'a pas de label_es. Une page espagnole ne doit jamais
 * retomber sur le nom anglais.
 */
export const PARTY_ES: Record<string, string> = {
  // États-Unis
  us_dem: 'Demócrata', us_rep: 'Republicano', us_oth: 'Otro',
  // Canada fédéral
  lib: 'Liberal', con: 'Conservador', ndp: 'NPD', bq: 'Bloque Quebequés', grn: 'Verde', ppc: 'PPC',
  // Québec
  caq: 'CAQ', plq: 'PLQ', pq: 'PQ', qs: 'QS', pcq: 'PCQ', qc_oth: 'Otro',
  // Ontario
  on_pc: 'Progresista Conservador', on_lib: 'Liberal de Ontario', on_ndp: 'NPD de Ontario', on_grn: 'Verde de Ontario', on_oth: 'Otro',
  // Colombie-Britannique
  bc_con: 'Partido Conservador de la C. B.', bc_ndp: 'NPD de la C. B.', bc_grn: 'Verdes de la C. B.', bc_centre: 'CentreBC', bc_onebc: 'OneBC', bc_oth: 'Otro',
  // Royaume-Uni
  uk_lab: 'Laborista', uk_con: 'Conservador', uk_ld: 'Liberal Demócrata', uk_ref: 'Reform UK', uk_grn: 'Verde', uk_snp: 'SNP',
  uk_pc: 'Plaid Cymru', uk_dup: 'DUP', uk_sf: 'Sinn Féin', uk_sdlp: 'SDLP', uk_uup: 'UUP', uk_alliance: 'Alliance', uk_oth: 'Otro',
};

type Lang = 'en' | 'fr' | 'es';
interface Labeled { party?: string; key?: string; code?: string; label_en?: string; label_fr?: string; label_es?: string | null }

export function partyName(p: Labeled, lang: Lang): string {
  if (lang === 'fr') return p.label_fr ?? p.label_en ?? p.party ?? '';
  const code = p.party ?? p.key ?? p.code;
  if (lang === 'es') return p.label_es ?? (code ? PARTY_ES[code] : undefined) ?? p.label_fr ?? p.label_en ?? code ?? '';
  return p.label_en ?? p.party ?? '';
}
