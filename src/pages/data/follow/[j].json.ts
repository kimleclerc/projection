/**
 * Résumé compact d'un scrutin pour « Mes courses » : parti en tête et probabilité
 * de chaque course, avec la date du calcul. Quelques kilo-octets au lieu du
 * fichier complet du modèle (1,8 Mo au fédéral). Un fichier par scrutin.
 */
import type { APIRoute } from 'astro';
import type { RidingData } from '../../../lib/riding-adapters/types';
import { getAllFederalRidings } from '../../../lib/riding-adapters/federal';
import { getAllQuebecRidings } from '../../../lib/riding-adapters/quebec';
import { getAllOntarioRidings } from '../../../lib/riding-adapters/ontario';
import { getAllBcRidings } from '../../../lib/riding-adapters/bc';
import { getAllUKRidings } from '../../../lib/riding-adapters/uk';
import { getAllUSHouseRidings } from '../../../lib/riding-adapters/us-house';
import { getAllUSSenateRaces } from '../../../lib/riding-adapters/us-senate';
import { getAllUSGovernorRaces } from '../../../lib/riding-adapters/us-governor';

const SOURCES: Record<string, () => RidingData[]> = {
  'federal-ca': getAllFederalRidings,
  quebec: getAllQuebecRidings,
  ontario: getAllOntarioRidings,
  'british-columbia': getAllBcRidings,
  uk: getAllUKRidings,
  'us-house': getAllUSHouseRidings,
  'us-senate': getAllUSSenateRaces,
  'us-governor': getAllUSGovernorRaces,
};

export function getStaticPaths() {
  return Object.keys(SOURCES).map((j) => ({ params: { j } }));
}

export const GET: APIRoute = ({ params }) => {
  const rows = SOURCES[params.j as string]();
  const races: Record<string, [string, number, 1?]> = {};
  let d = '';
  for (const r of rows) {
    // Après le scrutin, le résultat officiel remplace la projection.
    if (r.results) {
      races[r.id] = [r.results.winner, 1, 1];
      d = r.results.date ?? d;
    } else {
      races[r.id] = [r.projection.winner, Math.round(r.projection.p_winner * 1000) / 1000];
      d = r.runDate ?? d;
    }
  }
  return new Response(JSON.stringify({ d, races }), { headers: { 'Content-Type': 'application/json' } });
};
