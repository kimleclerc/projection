/**
 * Qui porte la part projetée d'un parti.
 *
 * POURQUOI CE MODULE EXISTE
 * La projection est faite PAR PARTI : `vote_mean` ne connaît que trois seaux
 * (us_dem / us_rep / us_oth). Le vainqueur de la primaire, lui, vivait dans
 * une tout autre section de la page — la barre disait « Républicain 62,8 % »
 * sans jamais nommer le républicain, alors que son nom était dans le même
 * payload. Ce module fait le rapprochement, et lui seul : il ne modélise
 * rien, il ne fait qu'attacher un nom à un seau déjà calculé.
 *
 * LA RÈGLE EST « EXACTEMENT UN, OU PERSONNE »
 * Un seau peut porter deux personnes. Dans une primaire top-two (CA, WA, AK),
 * deux démocrates se qualifient couramment pour novembre — 62 districts en
 * 2026 — et le seau `us_oth` rassemble par construction des partis
 * différents. Nommer l'un des deux désignerait un investi qui n'existe pas.
 * On ne nomme donc que lorsque le seau ne contient qu'une seule candidature
 * en lice.
 *
 * `runoff` est exclu à dessein : un second tour non tenu n'a pas d'investi, et
 * afficher le meneur du premier tour le ferait passer pour le nommé.
 *
 * LES JURIDICTIONS SANS PRIMAIRE PASSENT PAR LE MÊME CHEMIN
 * Au Québec le parti désigne son candidat : il n'y a pas d'issue de primaire à
 * consulter, et le slate ne porte donc pas ce champ. Une candidature sans
 * `primary_outcome` est par construction sur le bulletin — c'est ce que veut
 * dire l'absence du champ. La règle « exactement un » continue de faire le
 * travail : au Québec, seul le seau `qc_oth` en porte plusieurs (33 circos).
 */
import type { RidingNominee } from './types';

/** Issues de primaire qui mettent bel et bien la personne sur le bulletin. */
const ON_THE_BALLOT = new Set(['won', 'advanced', 'no_primary']);

/** Titres de civilité que le FEC range dans le champ du prénom. */
const HONORIFICS = new Set(['MR', 'MRS', 'MS', 'DR', 'MR.', 'MRS.', 'MS.', 'DR.']);

/**
 * « MCBRIDE, SARAH ELIZABETH » → « Sarah Elizabeth McBride ».
 *
 * Le FEC écrit tout en capitales et nom d'abord ; les registres officiels
 * d'État, eux, écrivent déjà « Sarah McBride ». Un nom qui n'est pas
 * intégralement en capitales est donc laissé tel quel — le recapitaliser
 * casserait justement les graphies que la source a soignées.
 *
 * Mc est recapitalisé, Mac ne l'est pas : « MACIAS » est Macias, pas MacIas.
 */
export function displayCandidateName(raw: string): string {
  const name = (raw ?? '').trim();
  if (!name) return '';

  const segments = name.split(',').map((s) => s.trim()).filter(Boolean);
  let ordered = name;
  if (segments.length >= 2) {
    // [nom, prénom] ou [nom, prénom, suffixe] — « CARL, JERRY LEE, JR ».
    // Le suffixe collé au nom (« WHALEN III, JOHN J ») reste dans le segment
    // du nom et se retrouve donc à la bonne place sans traitement séparé.
    const [surname, given, ...rest] = segments;
    const givenWords = given
      .split(/\s+/)
      .filter((w) => !HONORIFICS.has(w.toUpperCase()));
    ordered = [givenWords.join(' '), surname, ...rest].filter(Boolean).join(' ');
  }

  if (ordered !== ordered.toUpperCase()) return ordered;

  return ordered
    .toLowerCase()
    // Début de mot : après un espace, un trait d'union ou une apostrophe.
    // « ABU-GHAZALAH » → « Abu-Ghazalah », « D'ARRIGO » → « D'Arrigo ».
    .replace(/(^|[\s\-'’])([a-zà-ÿ])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/\bMc([a-z])/g, (_m, ch: string) => 'Mc' + ch.toUpperCase())
    .replace(/\b(Ii|Iii|Iv)\b/g, (m) => m.toUpperCase());
}

type CandidateLike = {
  name: string;
  party_code: string;
  party_raw?: string;
  /** Lettre du FEC : I sortant · C adversaire · O siège ouvert. */
  ici_status?: string;
  /** Statut déjà normalisé, quand le slate de la juridiction le porte. */
  status?: string;
  primary_outcome?: string;
};

/** Les deux slates n'écrivent pas le statut de la même façon : le FEC en
 *  lettre, le Québec déjà en clair. Ne lire qu'`ici_status` ferait passer
 *  les 73 sortants québécois pour des adversaires. */
function statusOf(c: CandidateLike): RidingNominee['status'] {
  const plain = String(c.status ?? '');
  if (plain === 'incumbent' || plain === 'challenger' || plain === 'open') return plain;
  if (c.ici_status === 'I') return 'incumbent';
  if (c.ici_status === 'O') return 'open';
  return c.ici_status ? 'challenger' : undefined;
}

/**
 * Investi par code de parti, pour une seule course.
 *
 * Rend un objet vide quand rien n'est tranché : l'appelant attache alors
 * `undefined` et la barre reste exactement ce qu'elle était.
 */
export function nomineesByParty(
  candidates: readonly CandidateLike[] | undefined,
): Record<string, RidingNominee> {
  if (!candidates || candidates.length === 0) return {};
  const byParty = new Map<string, CandidateLike[]>();
  for (const c of candidates) {
    // Champ absent = juridiction sans primaire, la candidature compte.
    // Champ présent = l'issue doit dire que la personne est au bulletin. Les
    // importeurs américains n'écrivent jamais de valeur vide (ils écrivent
    // « unknown » puis déduisent), la distinction est donc sans angle mort.
    const outcome = c.primary_outcome;
    if (outcome !== undefined && outcome !== '' && !ON_THE_BALLOT.has(String(outcome))) continue;
    const code = String(c.party_code ?? '');
    if (!code) continue;
    const bucket = byParty.get(code);
    if (bucket) bucket.push(c);
    else byParty.set(code, [c]);
  }
  const out: Record<string, RidingNominee> = {};
  for (const [code, bucket] of byParty) {
    if (bucket.length !== 1) continue;
    const c = bucket[0];
    out[code] = {
      name: displayCandidateName(c.name),
      party_raw: c.party_raw,
      status: statusOf(c),
    };
  }
  return out;
}
