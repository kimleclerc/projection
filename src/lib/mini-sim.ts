/* Mini-simulateur — types et calcul.
 *
 * Miroir TypeScript de `simulate()` dans models/web_simulator.py, qui est la
 * spécification. Le gardien tests/test_mini_simulator_guardians.py épingle la
 * version Python ; si la règle change, elle change là-bas d'abord.
 *
 * Ce n'est pas le modèle : c'est un dérivé de premier ordre du run, ancré sur
 * lui. Curseurs au repos = projection publiée, exactement.
 */

export interface SimParty {
  code: string;
  label_fr: string;
  label_en: string;
  color: string;
  /** Part nationale du run — le point d'ancrage du curseur. */
  national: number;
  sd: number;
  /** Course du curseur en points, ±3σ du posterior national. */
  travel: number;
  seats_projected: number;
}

export interface SimRegion {
  id: string;
  label_fr: string;
  label_en: string;
  label_es: string;
  n_ridings: number;
  /** Niveau moyen de chaque parti dans la région, dans l'ordre de `parties`. */
  anchor: number[];
}

export interface SimRiding {
  id: string;
  name_fr: string;
  name_en: string;
  region: string;
  /** Parts projetées, dans l'ordre de `parties`. */
  v: number[];
}

export interface SimDoc {
  meta: {
    schema_version: number;
    run_date: string;
    election_cycle: string;
    total_seats: number;
    majority_threshold: number;
    softmax_k: number;
    softmax_mae: number;
  };
  parties: SimParty[];
  regions: SimRegion[];
  anchor_offset: number[];
  ridings: SimRiding[];
}

/** Décalage national par parti, en points. */
export type NationalDelta = Record<string, number>;
/** Décalage régional additif : region → parti → points. */
export type RegionalDelta = Record<string, Record<string, number>>;

export type SeatResult = Record<string, number>;

export interface SimRidingState {
  id: string;
  name: string;
  region: string;
  baselineWinner: string;
  winner: string;
  baselineMargin: number;
  margin: number;
  shares: Record<string, number>;
  changed: boolean;
}

function buildMultipliers(
  doc: SimDoc,
  nationalDelta: NationalDelta,
  regionalDelta: RegionalDelta,
): Map<string, Float64Array> {
  const codes = doc.parties.map((p) => p.code);
  const mult = new Map<string, Float64Array>();
  for (const region of doc.regions) {
    const row = new Float64Array(codes.length);
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const baseNat = doc.parties[i].national;
      const scale = baseNat > 0 ? (baseNat + (nationalDelta[code] ?? 0)) / baseNat : 1;
      const anchor = region.anchor[i];
      const target = anchor * scale + (regionalDelta[region.id]?.[code] ?? 0);
      row[i] = anchor > 0 ? target / anchor : 1;
    }
    mult.set(region.id, row);
  }
  return mult;
}

function normalizedShares(values: number[], multiplier: Float64Array): number[] {
  const adjusted = values.map((value, index) => Math.max(0, value * multiplier[index]));
  const total = adjusted.reduce((sum, value) => sum + value, 0) || 1;
  return adjusted.map((value) => (value * 100) / total);
}

function leadingPair(shares: number[]): [number, number, number] {
  let first = 0;
  let second = shares.length > 1 ? 1 : 0;
  if ((shares[second] ?? 0) > (shares[first] ?? 0)) [first, second] = [second, first];
  for (let i = 2; i < shares.length; i++) {
    if (shares[i] > shares[first]) {
      second = first;
      first = i;
    } else if (shares[i] > shares[second]) {
      second = i;
    }
  }
  return [first, second, (shares[first] ?? 0) - (shares[second] ?? 0)];
}

/** État cartographique déterministe associé au même déplacement que les sièges. */
export function simulateRidings(
  doc: SimDoc,
  nationalDelta: NationalDelta = {},
  regionalDelta: RegionalDelta = {},
  locale = 'fr',
): SimRidingState[] {
  const codes = doc.parties.map((party) => party.code);
  const neutral = buildMultipliers(doc, {}, {});
  const scenario = buildMultipliers(doc, nationalDelta, regionalDelta);

  return doc.ridings.map((riding) => {
    const baseShares = normalizedShares(riding.v, neutral.get(riding.region) ?? new Float64Array(codes.length).fill(1));
    const nextShares = normalizedShares(riding.v, scenario.get(riding.region) ?? new Float64Array(codes.length).fill(1));
    const [baseFirst, , baselineMargin] = leadingPair(baseShares);
    const [nextFirst, , margin] = leadingPair(nextShares);
    const shares = Object.fromEntries(codes.map((code, index) => [code, nextShares[index]]));
    return {
      id: riding.id,
      name: locale === 'fr' ? riding.name_fr : riding.name_en,
      region: riding.region,
      baselineWinner: codes[baseFirst],
      winner: codes[nextFirst],
      baselineMargin,
      margin,
      shares,
      changed: baseFirst !== nextFirst,
    };
  });
}

/**
 * Sièges espérés pour un vote déplacé.
 *
 * Le curseur national met tout à l'échelle proportionnellement ; un curseur
 * régional ajoute ensuite des points par-dessus, à l'intérieur de sa région.
 * Les parts sont renormalisées par circonscription, converties en sièges par
 * softmax, puis le décalage d'ancrage est appliqué pour que le repos reproduise
 * exactement la projection publiée.
 */
export function simulate(
  doc: SimDoc,
  nationalDelta: NationalDelta = {},
  regionalDelta: RegionalDelta = {},
): SeatResult {
  const codes = doc.parties.map((p) => p.code);
  const n = codes.length;
  const k = doc.meta.softmax_k;
  const totalSeats = doc.meta.total_seats;
  const offset = doc.anchor_offset ?? new Array(n).fill(0);

  // Multiplicateur par (région, parti) : mise à l'échelle nationale, puis
  // l'appoint régional. Calculé une fois, réutilisé sur chaque circonscription.
  const mult = buildMultipliers(doc, nationalDelta, regionalDelta);

  const seats = new Float64Array(n);
  const shares = new Float64Array(n);
  const exps = new Float64Array(n);

  for (const riding of doc.ridings) {
    const m = mult.get(riding.region);
    if (!m) continue;

    let tot = 0;
    for (let i = 0; i < n; i++) {
      const s = Math.max(0, riding.v[i] * m[i]);
      shares[i] = s;
      tot += s;
    }
    if (tot <= 0) tot = 1;

    let etot = 0;
    for (let i = 0; i < n; i++) {
      const e = Math.exp((k * shares[i] * 100) / tot);
      exps[i] = e;
      etot += e;
    }
    if (etot <= 0) etot = 1;
    for (let i = 0; i < n; i++) seats[i] += exps[i] / etot;
  }

  // Remise à l'échelle de la chambre, décalage d'ancrage, puis remise à
  // l'échelle à nouveau pour que le total soit exact jusqu'aux extrémités.
  let sum = 0;
  for (let i = 0; i < n; i++) sum += seats[i];
  if (sum <= 0) sum = 1;

  let sum2 = 0;
  for (let i = 0; i < n; i++) {
    seats[i] = Math.max(0, (seats[i] / sum) * totalSeats + offset[i]);
    sum2 += seats[i];
  }
  if (sum2 <= 0) sum2 = 1;

  const out: SeatResult = {};
  for (let i = 0; i < n; i++) {
    out[codes[i]] = Math.round(((seats[i] / sum2) * totalSeats) * 10) / 10;
  }
  return out;
}

/** Libellé d'un parti dans la locale (l'espagnol retombe sur l'anglais). */
export function partyLabel(p: SimParty, locale: string): string {
  return locale === 'fr' ? p.label_fr : p.label_en;
}

/** Libellé d'une région dans la locale. */
export function regionLabel(r: SimRegion, locale: string): string {
  if (locale === 'fr') return r.label_fr;
  if (locale === 'es') return r.label_es;
  return r.label_en;
}

/** Le parti mène-t-il assez pour une majorité ? */
export function isMajority(seats: number, doc: SimDoc): boolean {
  return seats >= doc.meta.majority_threshold;
}
