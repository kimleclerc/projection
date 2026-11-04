/** Appels de majorité publiés par Vote-Scope (`national_calls` du live.json), un par chambre, le plus tôt. */
type NationalCall = { kind?: string; party?: string | null; chamber?: string | null; called_at?: string };
const CHAMBERS = ['house', 'senate'] as const;
type Ch = (typeof CHAMBERS)[number];
type Side = 'dem' | 'rep';

function sideOf(party?: string | null): Side | null {
  if (party === 'us_dem') return 'dem';
  if (party === 'us_rep') return 'rep';
  return null;
}

/** Ne garde que les appels de majorité lisibles, un par chambre (le plus tôt), Chambre d'abord. */
export function majorityCalls(raw: unknown): { chamber: Ch; side: Side; at: string }[] {
  const list = Array.isArray(raw) ? (raw as NationalCall[]) : [];
  const out = new Map<Ch, { chamber: Ch; side: Side; at: string }>();
  for (const c of list) {
    const chamber = c?.chamber as Ch;
    const side = sideOf(c?.party);
    if (c?.kind !== 'majority' || !CHAMBERS.includes(chamber) || !side || typeof c.called_at !== 'string') continue;
    const prev = out.get(chamber);
    if (!prev || c.called_at < prev.at) out.set(chamber, { chamber, side, at: c.called_at });
  }
  return CHAMBERS.flatMap((ch) => (out.has(ch) ? [out.get(ch)!] : []));
}

