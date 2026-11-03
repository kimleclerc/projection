/**
 * Heures de fermeture des bureaux, 3 novembre 2026, en heure de l'Est (HNE,
 * UTC−5). L'heure retenue pour un État est celle où ferme la MAJORITÉ de ses
 * bureaux ; certains États ferment en deux temps (fuseaux), notés `split`. Calendrier
 * public des États, pas un champ du moteur : le profil us-2026-11-03 ne porte
 * que la première fermeture (23 h UTC).
 */
export type ClosingWave = { et: string; utc: string; states: string[]; split?: string[] };

export const US_POLL_CLOSINGS: ClosingWave[] = [
  { et: '18:00', utc: '2026-11-03T23:00:00Z', states: ['IN', 'KY'], split: ['IN', 'KY'] },
  { et: '19:00', utc: '2026-11-04T00:00:00Z', states: ['FL', 'GA', 'NH', 'SC', 'VT', 'VA'], split: ['FL', 'NH'] },
  { et: '19:30', utc: '2026-11-04T00:30:00Z', states: ['NC', 'OH', 'WV'] },
  { et: '20:00', utc: '2026-11-04T01:00:00Z', states: ['AL', 'CT', 'DE', 'DC', 'IL', 'ME', 'MD', 'MA', 'MI', 'MS', 'MO', 'NJ', 'OK', 'PA', 'RI', 'TN', 'TX', 'KS', 'SD'], split: ['MI', 'TX', 'KS', 'SD'] },
  { et: '20:30', utc: '2026-11-04T01:30:00Z', states: ['AR'] },
  { et: '21:00', utc: '2026-11-04T02:00:00Z', states: ['AZ', 'CO', 'IA', 'LA', 'MN', 'NE', 'NM', 'NY', 'ND', 'WI', 'WY'], split: ['ND'] },
  { et: '22:00', utc: '2026-11-04T03:00:00Z', states: ['MT', 'NV', 'UT', 'ID'], split: ['ID'] },
  { et: '23:00', utc: '2026-11-04T04:00:00Z', states: ['CA', 'OR', 'WA'] },
  { et: '00:00', utc: '2026-11-04T05:00:00Z', states: ['AK', 'HI'], split: ['AK'] },
];

/** Premières fermetures : rien ne peut être compté avant (profil du moteur). */
export const US_FIRST_CLOSE_UTC = US_POLL_CLOSINGS[0].utc;
