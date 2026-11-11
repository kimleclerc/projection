/**
 * Garde phase ↔ données (réfection Québec, 11 nov. 2026).
 *
 * La phase d'une juridiction est déclarée dans src/data/jurisdictions.ts ; ses
 * données arrivent par la nuit dans web_data/<dataPath>/. Les deux doivent
 * basculer ENSEMBLE : une phase « entre deux élections » posée sur la
 * projection de la veille de 2026 afficherait le passé comme une projection du
 * prochain scrutin, sans aucune erreur visible. Le build échoue à la place.
 */
import type { Jurisdiction } from '../data/jurisdictions';

export function assertPhaseData(
  jurisdiction: Pick<Jurisdiction, 'id' | 'phase' | 'expectedCycle'>,
  meta: { election_cycle?: string } | undefined,
  source: string,
): void {
  const expected = jurisdiction.expectedCycle;
  if (!expected) return;
  const actual = meta?.election_cycle;
  if (actual !== expected) {
    throw new Error(
      `[phase-guard] ${jurisdiction.id} est déclaré en phase « ${jurisdiction.phase} » ` +
      `pour le cycle ${expected}, mais ${source} porte ${actual ?? 'aucun cycle'}. ` +
      `Basculer la phase (src/data/jurisdictions.ts) et le desk du moteur dans le même lot.`,
    );
  }
}
