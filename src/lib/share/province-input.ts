/** Province espagnole → entrée de la carte de partage. */
import { partyMeta } from '../riding-adapters/parties';
import type { SpainProvince } from '../spain-provinces';
import type { ProvinceCardInput } from './cards';

export function provinceCardInput(p: SpainProvince, runDate: string): ProvinceCardInput {
  const head = (party: string) => p.lists.find((l) => l.party === party)?.titulares[0];
  const rows = Object.entries(p.projection)
    .filter(([, v]) => v.seats_median > 0 || v.p_at_least_one >= 0.05)
    .sort((a, b) => b[1].seats_median - a[1].seats_median || b[1].vote_mean - a[1].vote_mean)
    .map(([k, v]) => ({
      label: partyMeta('spain', k).label_en,
      color: partyMeta('spain', k).color,
      seats: v.seats_median,
      vote: v.vote_mean,
      pOne: v.p_at_least_one,
      s2023: p.seats2023[k] ?? 0,
      head: head(k),
    }));
  return { name: p.name, seats: p.seats, rows, runDate };
}
