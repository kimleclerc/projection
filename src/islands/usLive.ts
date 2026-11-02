/**
 * Soirée de mi-mandat américaine du 3 novembre 2026 : la logique pure de
 * l'îlot de direct, sans Preact, pour que `scripts/check-us-live.mjs` la
 * vérifie au build sur les données d'exemple.
 *
 * Un seul live.json porte les 506 courses (435 Chambre, 35 Sénat, 36
 * gouverneurs) ; chaque page filtre la sienne par le préfixe de l'identifiant
 * (`H-13006`, `S-13000`, `G-13000`).
 *
 * DEUX RÈGLES QUE CE MODULE EXISTE POUR TENIR
 *
 * 1. Une course sans flux n'a pas « 0 voix ». Le collecteur ne publie pas le
 *    détail des anomalies (il va dans `desk`, retiré par le Worker), mais il
 *    publie l'état de chaque État dans `source.states` :
 *      { ok: false, error }            → flux de l'État indisponible : le
 *                                        collecteur remplit alors les candidats
 *                                        avec `votes: 0`, qu'il ne faut JAMAIS
 *                                        afficher comme un décompte ;
 *      { ok: false, regressed_cycles } → la source a reculé : les derniers
 *                                        chiffres publiés sont conservés ;
 *      { ok: true, family: 'transcription' } → saisie manuelle (NY, PA, AZ,
 *                                        OH, MI) : jamais un flux officiel.
 *    Un État absent de `source.states` alors que la table existe n'est pas
 *    branché : indisponible, lui aussi.
 *
 * 2. La cote du marché n'apparaît jamais. Elle vit dans `desk`, que le Worker
 *    retire ; `sanitize` le retire une seconde fois avant tout rendu ou toute
 *    écriture locale, au cas où un rail le laisserait passer.
 */
import type { Call, Candidate, LivePayload, Result } from './qcLiveBus';

export type Chamber = 'house' | 'senate' | 'governor';
export const CHAMBER_PREFIX: Record<Chamber, string> = { house: 'H-', senate: 'S-', governor: 'G-' };

export type StateStatus = {
  ok?: boolean; error?: string | null; family?: string | null; as_of?: string | null;
  races?: number; votes?: number; regressed_cycles?: number;
};

export type UsResult = Result & { chamber?: Chamber; state?: string; region?: string };

/** Une ligne de la sortie de `fastest_call/us_exit_poll.py` (schéma fastest-call.us-exit-poll.v1). */
export type ExitPollEntry = {
  kind: 'nep_initial' | 'votecast' | 'nep_weighted' | string;
  observed_margin: number; exit_poll_weight: number;
  prior: { margin: number; sd: number; p_dem: number };
  posterior: { margin: number; sd: number; p_dem: number; p_rep: number;
    margin_quantiles?: Partial<Record<'q05' | 'q25' | 'q50' | 'q75' | 'q95', number>> };
  source?: string; as_of?: string; display_only?: boolean;
};
export type ExitPollFile = {
  schema_version?: string; generated_at?: string; label_fr?: string; label_en?: string;
  /** Clé `<chamber>:<riding_id du site>`, p. ex. `senate:13000`. */
  races: Record<string, ExitPollEntry[]>;
};

/**
 * Lecture de vague calculée par le moteur (fastest_call/wave.py) : moyenne
 * PAR ÉTAT puis entre États, États à long dépouillement (CA, NV, AZ, WA, OR,
 * AK) exclus. Absente d'un vieux payload : la jauge retombe sur son calcul local.
 */
export type EngineWaveAggregate = { dem_vs_model: number; median_state: number; n_races: number; n_states: number; by_state: Record<string, number> };
export type EngineWave = {
  status: 'waiting' | 'provisional' | 'mature'; dem_vs_model: number | null;
  by_chamber?: Partial<Record<Chamber, EngineWaveAggregate | null>>;
  excluded_states?: string[];
  rules?: { min_pct?: number; min_states?: number };
};

export type UsLivePayload = Omit<LivePayload, 'results' | 'source'> & {
  results: UsResult[];
  source?: LivePayload['source'] & { states?: Record<string, StateStatus> };
  /** Sortie de us_exit_poll.py, jointe telle quelle au live.json par le collecteur. */
  exit_poll?: ExitPollFile | null;
  wave?: EngineWave | null;
  desk?: unknown;
};

/**
 * - `called`            : gagnant annoncé par Vote-Scope ;
 * - `counting`          : des bulletins sont comptés, flux officiel ;
 * - `transcribed`       : chiffres saisis à la main depuis la page de l'État ;
 * - `transcribed_empty` : saisie manuelle, rien de saisi encore ;
 * - `regressed`         : la source a reculé, derniers chiffres conservés ;
 * - `state_unavailable` : pas de flux lisible pour cet État ;
 * - `awaiting`          : flux lisible, aucun bulletin compté.
 */
export type RaceStatus = 'called' | 'counting' | 'transcribed' | 'transcribed_empty' | 'regressed' | 'state_unavailable' | 'awaiting';

export function sanitize<T extends { desk?: unknown }>(payload: T): T {
  if (payload && typeof payload === 'object' && 'desk' in payload) {
    const copy = { ...payload };
    delete copy.desk;
    return copy;
  }
  return payload;
}

export function chamberOf(raceId: string): Chamber | null {
  return raceId.startsWith('H-') ? 'house' : raceId.startsWith('S-') ? 'senate' : raceId.startsWith('G-') ? 'governor' : null;
}

/** L'État d'une course : le champ publié, sinon le FIPS de l'identifiant. */
const FIPS_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE', '12': 'FL', '13': 'GA',
  '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ',
  '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC',
  '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY',
};
export function stateOf(result: UsResult): string | null {
  return result.state ?? FIPS_STATE[result.riding_id.slice(2, 4)] ?? null;
}

export function votesCounted(result: UsResult): number {
  const sum = (result.candidates ?? []).reduce((acc: number, c: Candidate) => acc + (c.votes ?? 0), 0);
  return Math.max(sum, result.ballots_counted ?? 0);
}

export function raceStatus(result: UsResult, payload: UsLivePayload | null, call: Call | null): RaceStatus {
  const states = payload?.source?.states;
  const state = stateOf(result);
  const status = states && state ? states[state] : undefined;
  const counted = votesCounted(result) > 0;
  if (call) return 'called';
  if (states && !status) return 'state_unavailable';
  if (status && status.ok === false) {
    // Un recul garde les derniers chiffres publiés : ils restent lisibles, signalés.
    if (status.regressed_cycles && counted) return 'regressed';
    return 'state_unavailable';
  }
  if (status?.family === 'transcription') return counted ? 'transcribed' : 'transcribed_empty';
  return counted ? 'counting' : 'awaiting';
}

/** Les chiffres d'une course sont-ils affichables ? Jamais pour un État sans flux. */
export function showsNumbers(status: RaceStatus): boolean {
  return status === 'counting' || status === 'transcribed' || status === 'regressed' || status === 'called';
}

/** La clé de us_exit_poll.py (identifiant du site, sans préfixe) : `H-13006` donne `house:13006`. */
export function exitPollKey(raceId: string): string | null {
  const chamber = chamberOf(raceId);
  return chamber ? `${chamber}:${raceId.slice(2)}` : null;
}

/** La lecture la plus récente du sondage de sortie pour une course, s'il y en a une. */
export function exitPollFor(payload: UsLivePayload | null, raceId: string): ExitPollEntry | null {
  const key = exitPollKey(raceId);
  const entries = key ? payload?.exit_poll?.races?.[key] : undefined;
  if (!entries?.length) return null;
  return [...entries].sort((a, b) => (a.as_of ?? '').localeCompare(b.as_of ?? '')).at(-1) ?? null;
}

/**
 * Le prédicteur d'avant-dépouillement s'efface au premier bulletin compté
 * d'une course, ou dès qu'elle est appelée. Une course dont l'État n'a pas de
 * flux le garde, avec la mention de l'État : on ne sait pas si le décompte a
 * commencé, et rien n'autorise à le présenter comme un résultat.
 */
export function predictorVisible(status: RaceStatus): boolean {
  return status === 'awaiting' || status === 'transcribed_empty' || status === 'state_unavailable';
}

export type UsRow = {
  id: string; name: string; state: string | null; status: RaceStatus;
  leader: Candidate | null; runnerUp: Candidate | null; call: Call | null;
  /** Parti appelé, sinon parti en tête — seulement si les chiffres sont affichables. */
  party: string | null; margin: number | null; reportedPct: number | null; votes: number;
  exitPoll: ExitPollEntry | null;
};

export function deriveUsRows(payload: UsLivePayload | null, chamber: Chamber): UsRow[] {
  const prefix = CHAMBER_PREFIX[chamber];
  const calls = new Map((payload?.calls ?? []).map((c) => [c.riding_id, c]));
  return (payload?.results ?? []).filter((r) => r.riding_id.startsWith(prefix)).map((r) => {
    const call = calls.get(r.riding_id) ?? null;
    const status = raceStatus(r, payload, call);
    const numbers = showsNumbers(status);
    const sorted = [...(r.candidates ?? [])].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    const leader = numbers && sorted[0] && (sorted[0].votes ?? 0) > 0 ? sorted[0] : null;
    const runnerUp = leader && sorted[1] ? sorted[1] : null;
    return {
      id: r.riding_id, name: r.name ?? r.riding_id, state: stateOf(r), status, call,
      leader, runnerUp, party: call?.party_code ?? leader?.party_code ?? null,
      margin: leader && runnerUp ? (leader.vote_pct ?? 0) - (runnerUp.vote_pct ?? 0) : null,
      reportedPct: numbers ? (r.polls?.pct ?? null) : null,
      votes: numbers ? votesCounted(r) : 0,
      exitPoll: predictorVisible(status) ? exitPollFor(payload, r.riding_id) : null,
    };
  });
}

export type Tally = { code: string; holdover: number; called: number; leading: number; total: number };

/** Sièges par parti : non renouvelés + appelés + en tête (chiffres affichables seulement). */
export function tallyRows(rows: UsRow[], holdovers: Record<string, number> = {}): Tally[] {
  const acc = new Map<string, Tally>();
  const get = (code: string) => acc.get(code) ?? { code, holdover: 0, called: 0, leading: 0, total: 0 };
  for (const [code, n] of Object.entries(holdovers)) acc.set(code, { ...get(code), holdover: n });
  for (const row of rows) {
    if (!row.party) continue;
    const t = get(row.party);
    if (row.call) t.called += 1; else t.leading += 1;
    acc.set(row.party, t);
  }
  return [...acc.values()].map((t) => ({ ...t, total: t.holdover + t.called + t.leading }))
    .sort((a, b) => b.total - a.total || b.called - a.called);
}

/** États sans décompte lisible, et États en saisie manuelle, pour le bandeau. */
export function stateNotices(rows: UsRow[]): { unavailable: string[]; transcribed: string[]; regressed: string[] } {
  const pick = (want: RaceStatus[]) => [...new Set(rows.filter((r) => want.includes(r.status) && r.state).map((r) => r.state!))].sort();
  return {
    unavailable: pick(['state_unavailable']),
    transcribed: pick(['transcribed', 'transcribed_empty']),
    regressed: pick(['regressed']),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Jauge de majorité : qui contrôle la chambre
// ─────────────────────────────────────────────────────────────────────────────

/** Les trois seaux du collecteur, dans l'ordre de la jauge (démocrates à gauche). */
export const GAUGE_ORDER = ['us_dem', 'us_oth', 'us_rep'] as const;

export type ChamberParty = {
  code: string;
  /** Sièges non renouvelés cette année (Sénat, gouverneurs). */
  holdover: number;
  /** Courses appelées par Vote-Scope ce soir. */
  called: number;
  /** Courses où le parti mène sans appel (chiffres affichables seulement). */
  leading: number;
  /** Acquis : non renouvelés + appelés. */
  secured: number;
  /** Acquis + en tête. */
  total: number;
};

export type ChamberSummary = {
  seats: number;
  majority: number | null;
  parties: ChamberParty[];
  /** Sièges ni acquis ni en tête : aucun bulletin compté, ou pas de chiffres lisibles. */
  unassigned: number;
  /**
   * - `secured` : un parti a la majorité en sièges acquis (non renouvelés + appelés) ;
   * - `ahead`   : un parti atteint la majorité en comptant les courses où il mène ;
   * - `short`   : personne ne l'atteint encore, même en comptant les meneurs ;
   * - `none`    : aucune course n'a d'appel ni de meneur.
   */
  state: 'secured' | 'ahead' | 'short' | 'none';
  /** Le parti qui a le plus de sièges (acquis + en tête), à égalité celui qui a le plus d'acquis. */
  leader: ChamberParty | null;
  runnerUp: ChamberParty | null;
};

export function chamberSummary(rows: UsRow[], holdovers: Record<string, number>, seats: number, majority: number | null): ChamberSummary {
  const parties = tallyRows(rows, holdovers).map((t) => ({ ...t, secured: t.holdover + t.called }));
  const sorted = [...parties].sort((a, b) => b.total - a.total || b.secured - a.secured);
  const leader = sorted[0] && sorted[0].called + sorted[0].leading > 0 ? sorted[0] : null;
  const runnerUp = leader ? sorted[1] ?? null : null;
  const assigned = parties.reduce((acc, p) => acc + p.total, 0);
  const anyRace = parties.some((p) => p.called + p.leading > 0);
  let state: ChamberSummary['state'] = 'none';
  if (anyRace && majority) {
    const securedLeader = [...parties].sort((a, b) => b.secured - a.secured)[0];
    state = securedLeader && securedLeader.secured >= majority ? 'secured'
      : leader && leader.total >= majority ? 'ahead' : 'short';
  } else if (anyRace) state = 'short';
  // Un parti qui a acquis la majorité est le « meneur », même si l'autre compte plus de meneurs.
  const top = state === 'secured' ? [...parties].sort((a, b) => b.secured - a.secured)[0] : leader;
  return {
    seats, majority, parties: GAUGE_ORDER.map((c) => parties.find((p) => p.code === c)).filter((p): p is ChamberParty => !!p)
      .concat(parties.filter((p) => !(GAUGE_ORDER as readonly string[]).includes(p.code))),
    unassigned: Math.max(0, seats - assigned), state,
    leader: anyRace ? top ?? null : null,
    runnerUp: anyRace ? sorted.find((p) => p.code !== top?.code) ?? null : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Jauge de vague : le décompte face à la projection publiée
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Taux de dépouillement à partir duquel une course entre dans la lecture.
 * ATTENTION : `polls.pct` compte ce que l'État compte (bureaux, localités ou
 * comtés selon la source), pas une part des voix attendues. C'est le seul
 * indicateur publié par live.json ; voir la demande au moteur dans la PR.
 */
export const WAVE_MIN_REPORTED_PCT = 50;
/** En dessous, la moyenne dépend de quelques courses et des premiers comtés : on ne l'affiche pas. */
export const WAVE_MIN_RACES: Record<Chamber, number> = { house: 20, senate: 5, governor: 5 };

export type WaveRace = { id: string; live: number; projected: number; shift: number };
export type WaveReading = {
  /** Courses qui ont des chiffres affichables, deux grands partis et une projection publiée. */
  measurable: number;
  /** Parmi elles, celles dépouillées à WAVE_MIN_REPORTED_PCT % ou plus. */
  races: WaveRace[];
  minRaces: number;
  /** Écart moyen (points, démocrates moins républicains) ; null si trop peu de courses. */
  mean: number | null;
  /** Moyenne du moteur (par État, puis entre États) ; sinon moyenne locale des courses. */
  source: 'engine' | 'local';
  /** États laissés de côté parce que leur soirée ne compte qu'une partie du postal. */
  excludedStates: string[];
  towardDem: number; towardRep: number;
};

/** Écart démocrates moins républicains, en points de pourcentage. */
function demMinusRep(cands: { party_code: string; vote_pct?: number; mean?: number | null }[], key: 'vote_pct' | 'mean'): number | null {
  const d = cands.find((c) => c.party_code === 'us_dem');
  const r = cands.find((c) => c.party_code === 'us_rep');
  const dv = d?.[key]; const rv = r?.[key];
  if (typeof dv !== 'number' || typeof rv !== 'number') return null;
  return dv - rv;
}

export function waveReading(payload: UsLivePayload | null, rows: UsRow[], chamber: Chamber): WaveReading {
  const results = new Map((payload?.results ?? []).map((r) => [r.riding_id, r]));
  const projections = new Map((payload?.projections ?? []).map((p) => [p.riding_id, p]));
  const races: WaveRace[] = [];
  const engine = payload?.wave ?? null;
  const excluded = new Set(engine?.excluded_states ?? []);
  const minPct = engine?.rules?.min_pct ?? WAVE_MIN_REPORTED_PCT;
  let measurable = 0;
  for (const row of rows) {
    if (row.state && excluded.has(row.state)) continue;
    // Un appel sans chiffres (source indisponible) ne dit rien de l'écart.
    if (!showsNumbers(row.status) || row.votes <= 0) continue;
    const proj = projections.get(row.id)?.candidates as { party_code: string; mean?: number | null }[] | undefined;
    const res = results.get(row.id);
    if (!proj || !res) continue;
    const projected = demMinusRep(proj, 'mean');
    const live = demMinusRep(res.candidates ?? [], 'vote_pct');
    // Sans les deux grands partis des deux côtés (course sans adversaire), pas d'écart à lire.
    if (projected === null || live === null) continue;
    const pd = proj.find((c) => c.party_code === 'us_dem')?.mean ?? 0;
    const pr = proj.find((c) => c.party_code === 'us_rep')?.mean ?? 0;
    if (pd <= 0 || pr <= 0) continue;
    measurable += 1;
    if ((row.reportedPct ?? 0) < minPct) continue;
    races.push({ id: row.id, live, projected, shift: live - projected });
  }
  const minRaces = WAVE_MIN_RACES[chamber];
  const agg = engine?.by_chamber?.[chamber];
  const engineReady = !!agg && agg.n_states >= (engine?.rules?.min_states ?? 3);
  const local = races.length >= minRaces ? races.reduce((a, r) => a + r.shift, 0) / races.length : null;
  // Le moteur pèse chaque État une fois (quarante districts du Texas ne font pas
  // quarante observations) ; il ne parle qu'une fois les courses assez nombreuses ici aussi.
  const mean = races.length >= minRaces ? (engineReady ? agg!.dem_vs_model : local) : null;
  return { measurable, races, minRaces, mean, source: engineReady ? 'engine' : 'local', excludedStates: [...excluded].sort(),
    towardDem: races.filter((r) => r.shift > 0).length, towardRep: races.filter((r) => r.shift < 0).length };
}

// ─────────────────────────────────────────────────────────────────────────────
// Carte : un état par course, jamais « 0 voix »
// ─────────────────────────────────────────────────────────────────────────────

export type MapState = 'called' | 'leading' | 'awaiting' | 'transcribed_empty' | 'unavailable';

export function mapState(row: UsRow): MapState {
  if (row.call) return 'called';
  if (row.status === 'state_unavailable') return 'unavailable';
  if (row.status === 'transcribed_empty') return 'transcribed_empty';
  if (row.leader) return 'leading';
  return 'awaiting';
}

/** Identifiant de course → clé de geomap.json (FIPS à cinq chiffres, sans préfixe). */
export const geoKeyOf = (raceId: string) => raceId.slice(2);
/** Une ancre de course valide : `H-13006`, `S-13000`, `G-13000`. */
export const RACE_ANCHOR = /^[HSG]-\d{5}$/;
