/**
 * Présidentielle 2027 : « Qui affrontera le favori au second tour ? »
 *
 * Tant que les candidatures ne sont pas arrêtées, le moteur calcule chaque liste
 * de candidats testée par les instituts à part. Ici, on les réunit : chaque liste
 * pèse le nombre de sondages récents qui l'ont testée, et chacune apporte ses
 * probabilités de duel. Le favori (aujourd'hui Le Pen) est celui qui se qualifie
 * le plus souvent ; tout suit les données, rien n'est codé en dur.
 *
 * Sans dépendance Node : lu au build (images, page) comme dans le navigateur.
 */
import { blocHex } from '../fr-pres';

export interface FaceRow { id: string; name: string; bloc: string; color: string; p: number; runoff: number | null }
export interface FaceOff {
  favourite: { id: string; name: string; p: number };
  rows: FaceRow[];        // adversaires, du plus probable au moins probable
  other: number;          // duels sans le favori
  nCastings: number;      // listes de candidats prises en compte
  nPolls: number;         // sondages récents sur ces listes
}

export function faceOff(latest: any): FaceOff | null {
  const castings = (latest.scenarios ?? []).filter((s: any) => s.scenario?.featured && (s.scenario.n_polls_recent ?? 0) > 0);
  const W = castings.reduce((a: number, s: any) => a + s.scenario.n_polls_recent, 0);
  if (!W) return null;

  const who: Record<string, { name: string; bloc: string }> = {};
  const top2: Record<string, number> = {};
  for (const s of castings) {
    const w = s.scenario.n_polls_recent / W;
    for (const q of s.qualification ?? []) {
      who[q.candidate_id] = { name: q.candidate_name, bloc: q.bloc };
      top2[q.candidate_id] = (top2[q.candidate_id] ?? 0) + w * (q.p_top2 ?? 0);
    }
  }
  const favId = Object.keys(top2).sort((a, b) => top2[b] - top2[a])[0];

  const p: Record<string, number> = {};
  const share: Record<string, number> = {};   // part du second tour de l'adversaire, pondérée
  const shareW: Record<string, number> = {};
  let other = 0;
  for (const s of castings) {
    const w = s.scenario.n_polls_recent / W;
    let seen = 0;
    for (const d of s.duels ?? []) {
      const pd = d.p_duel ?? 0;
      seen += pd;
      const opp = d.duel_left_id === favId ? d.duel_right_id : d.duel_right_id === favId ? d.duel_left_id : null;
      if (!opp) { other += w * pd; continue; }
      p[opp] = (p[opp] ?? 0) + w * pd;
      const oppShare = d.duel_left_id === opp ? d.left_share_expressed_mean : d.right_share_expressed_mean;
      if (typeof oppShare === 'number') {
        share[opp] = (share[opp] ?? 0) + w * pd * oppShare;
        shareW[opp] = (shareW[opp] ?? 0) + w * pd;
      }
    }
    // Duels trop rares pour être listés par le moteur.
    other += w * Math.max(0, 1 - seen);
  }

  const rows = Object.keys(p)
    .map((id) => ({ id, name: who[id]?.name ?? id, bloc: who[id]?.bloc ?? 'other', color: blocHex(who[id]?.bloc ?? 'other'), p: p[id], runoff: shareW[id] ? share[id] / shareW[id] : null }))
    .sort((a, b) => b.p - a.p);
  return {
    favourite: { id: favId, name: who[favId]?.name ?? favId, p: top2[favId] },
    rows, other, nCastings: castings.length, nPolls: W,
  };
}

/**
 * Les sondages du premier tour mis à la forme d'un latest.json (parties,
 * polls_history), pour le graphique commun des images de partage. Les quatre
 * candidats en tête des 15 derniers sondages ; un candidat absent d'une liste
 * testée n'a simplement pas de point ce jour-là.
 */
export function pollsAsLatest(latest: any, polls: any, sheets: any): any {
  const rows: any[] = [...(polls.first_round ?? [])]
    .filter((r) => r.field_end)
    .sort((a, b) => (a.field_end < b.field_end ? -1 : 1));
  const recent = rows.slice(-15);
  const sum: Record<string, number> = {};
  const cnt: Record<string, number> = {};
  for (const r of recent) for (const e of r.entries ?? []) {
    sum[e.id] = (sum[e.id] ?? 0) + e.share;
    cnt[e.id] = (cnt[e.id] ?? 0) + 1;
  }
  const sheet: Record<string, any> = Object.fromEntries((sheets.candidates ?? []).map((c: any) => [c.candidate_id, c]));
  const used = new Set<string>();
  const parties = Object.keys(sum)
    .map((id) => ({ id, v: sum[id] / cnt[id] }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 4)
    .map(({ id, v }) => {
      // Deux candidats du même bloc (Philippe, Attal) : le second en plus clair.
      let color = blocHex(sheet[id]?.bloc ?? 'other');
      if (used.has(color)) color = lighten(color);
      used.add(color);
      // Nom court : la marge du graphique n'accueille pas « Jean-Luc Mélenchon ».
      const name = sheet[id]?.short_label ?? sheet[id]?.candidate_name ?? id;
      return { party: id, color, label_fr: name, label_en: name, vote_mean: v };
    });
  return {
    meta: { run_date: latest.meta.run_date },
    parties,
    polls_history: rows.map((r) => ({ date: String(r.field_end).slice(0, 10), ...Object.fromEntries((r.entries ?? []).map((e: any) => [e.id, e.share])) })),
  };
}

function lighten(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.45).toString(16).padStart(2, '0');
  return `#${mix((n >> 16) & 255)}${mix((n >> 8) & 255)}${mix(n & 255)}`;
}
