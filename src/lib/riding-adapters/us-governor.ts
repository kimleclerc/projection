/**
 * US governors adapter — the 36 states electing a governor in 2026.
 *
 * Reads:
 *   web_data/us-governor/latest.json           per-state projection: vote_mean,
 *                                              win_prob, rating, fundamentals
 *   web_data/us-governor/members.json          sitting governor (incl. those
 *                                              not on the ballot)
 *   web_data/us-governor/candidates_2026.json  November nominees
 *   web_data/us-governor/history/index.json    per-state projection history
 *
 * Deux choses distinguent cet adaptateur de celui du Sénat, et elles viennent
 * du modèle, pas de la mise en page :
 *
 *   · SIÈGE OUVERT — dix-huit des trente-six sortants ne sont pas sur le
 *     bulletin. `member.seat_status` vaut alors 'retiring', et l'ancre du
 *     modèle bascule du résultat précédent vers le PVI de l'État. La page doit
 *     pouvoir le dire : c'est la principale raison qu'une course ait l'air
 *     imprévisible alors que l'État vote toujours du même bord.
 *
 *   · ANNÉE DE RÉFÉRENCE VARIABLE — le New Hampshire et le Vermont élisent
 *     leur gouverneur tous les deux ans, donc leur course précédente est celle
 *     de 2024 quand les 34 autres remontent à 2022. `baseline.cycle` porte
 *     l'année réelle ; l'afficher en dur serait faux deux fois sur trente-six.
 *
 * Le total affiché est 50, pas 36 : les quatorze États qui ne votent pas cette
 * année gardent leur gouverneur, et c'est la composition des cinquante que la
 * projection tranche.
 */
import type {
  RidingData, RidingMember, DeclaredCandidate, RidingNeighbor,
} from './types';
import { ridingSlug } from './types';
import { partyMeta } from './parties';
import latestSource from '../../../web_data/us-governor/latest.json';
import membersSource from '../../../web_data/us-governor/members.json';
import candidatesSource from '../../../web_data/us-governor/candidates_2026.json';
import historyIndex from '../../../web_data/us-governor/history/index.json';

type RawRace = {
  riding_id: string;
  name_en: string;
  name_fr: string;
  province: string;
  region: string;
  incumbent_party?: string;
  is_special?: boolean;
  poll_count?: number;
  recent_poll_count?: number;
  open_seat?: boolean;
  incumbent_name?: string;
  incumbent_status?: string;
  baseline_cycle?: string;
  projection: {
    winner: string;
    p_winner: number;
    mean_margin: number;
    p_close_race: number;
    vote_mean: Record<string, number>;
    win_prob: Record<string, number>;
    projection_cycle: string;
    rating?: { code: string; label_en: string; label_fr: string };
  };
  baseline_result?: {
    cycle?: string;
    winner?: string;
    margin?: number;
    [key: string]: number | string | undefined;
  };
};

const races = (latestSource as { ridings: RawRace[] }).ridings;
const META = (latestSource as { meta: { run_date: string } }).meta;
const members = membersSource as Record<string, RidingMember | undefined>;
type RawCandidate = {
  name: string; party_code: string; party_raw: string;
  ici_status: string; filing_status: string; primary_outcome: string;
};
const candidatesByRace = candidatesSource as Record<string, RawCandidate[] | undefined>;
const RACES_WITH_HISTORY = new Set(
  (historyIndex as { ridings_with_history: string[] }).ridings_with_history,
);

/** Moyenne non pondérée des parts projetées sur les 36 courses — le repère
 *  « national » d'une page d'État. Il n'y a pas de vote populaire national
 *  pour trente-six scrutins d'États distincts, et c'est pour ça que c'est une
 *  moyenne et non un total. */
const NATIONAL_VOTE_MEAN: Record<string, number> = (() => {
  const buckets: Record<string, { sum: number; n: number }> = {};
  for (const r of races) {
    for (const [code, v] of Object.entries(r.projection?.vote_mean ?? {})) {
      if (typeof v !== 'number' || v <= 0) continue;
      buckets[code] ??= { sum: 0, n: 0 };
      buckets[code].sum += v;
      buckets[code].n += 1;
    }
  }
  const out: Record<string, number> = {};
  for (const [code, { sum, n }] of Object.entries(buckets)) out[code] = sum / n;
  return out;
})();

function projectionTone(p: { p_winner: number; p_close_race: number }): RidingNeighbor['tone'] {
  if (p.p_close_race >= 0.35) return 'tossup';
  if (p.p_close_race >= 0.15) return 'competitive';
  if (p.p_winner >= 0.85) return 'safe';
  return 'leaning';
}

/** Les six autres courses les PLUS SERRÉES, pas les six premières de
 *  l'alphabet. Le gabarit du Sénat groupe par région, mais chaque course
 *  gubernatoriale est seule dans la sienne (`us_gov_mi`) : le groupement ne
 *  rendait donc rien, et le bloc affichait Alaska, Alabama, Arkansas — les
 *  trois premiers États du fichier. Sur une carte d'États, « à côté » ne veut
 *  rien dire ; « encore en jeu » veut dire quelque chose. */
function buildNeighbors(raceId: string): RidingNeighbor[] {
  const pool = races
    .filter((r) => r.riding_id !== raceId)
    .slice()
    .sort((a, b) => a.projection.mean_margin - b.projection.mean_margin)
    .slice(0, 6);
  return pool.map((r) => {
    const slug = ridingSlug(r.riding_id, r.name_en || r.name_fr);
    return {
      id: r.riding_id,
      slug,
      name_en: r.name_en,
      name_fr: r.name_fr,
      href_en: `/en/us/governors/races/${slug}/`,
      href_fr: `/fr/us/gouverneurs/courses/${slug}/`,
      href_es: `/es/us/gobernadores/carreras/${slug}/`,
      tone: projectionTone(r.projection),
      tone_party: r.projection.winner,
    };
  });
}

function adaptDeclared(raceId: string): DeclaredCandidate[] | undefined {
  const list = candidatesByRace[raceId];
  if (!list || list.length === 0) return undefined;
  // Aucune primaire gubernatoriale n'est importée : la liste EST celle des
  // nommés de novembre, donc rien à filtrer. Le statut vient du siège —
  // 'open' quand le sortant n'est pas sur le bulletin.
  return list.map((c) => ({
    name: c.name,
    party_code: c.party_code,
    party_raw: c.party_raw,
    status: c.ici_status === 'I' ? 'incumbent' : c.ici_status === 'O' ? 'open' : 'challenger',
  }));
}

function adaptOne(raw: RawRace): RidingData {
  const slug = ridingSlug(raw.riding_id, raw.name_en || raw.name_fr);
  const parties = Object.keys(raw.projection.vote_mean)
    .map((code) => {
      const meta = partyMeta('us-governor', code);
      return {
        code,
        label_en: meta.label_en,
        label_fr: meta.label_fr,
        color: meta.color,
        vote_mean_pct: raw.projection.vote_mean[code] ?? 0,
        win_prob: raw.projection.win_prob[code] ?? 0,
      };
    })
    .filter((p) => p.vote_mean_pct > 0)
    .sort((a, b) => b.vote_mean_pct - a.vote_mean_pct);

  const baselinePcts: Record<string, number> = {};
  if (raw.baseline_result) {
    for (const [k, v] of Object.entries(raw.baseline_result)) {
      const m = /^(.+)_pct$/.exec(k);
      if (m && typeof v === 'number' && v > 0) baselinePcts[m[1]] = v;
    }
  }
  const baselineCycle = raw.baseline_cycle ?? raw.baseline_result?.cycle;
  const baseline = baselineCycle && raw.baseline_result
    ? {
        cycle: String(baselineCycle),
        winner: String(raw.baseline_result.winner ?? ''),
        margin: Number(raw.baseline_result.margin ?? 0),
        party_pcts: baselinePcts,
      }
    : undefined;

  return {
    id: raw.riding_id,
    slug,
    jurisdiction: 'us-governor',
    cycle: raw.projection.projection_cycle,
    name: { en: raw.name_en, fr: raw.name_fr || raw.name_en },
    province: raw.province,
    // `region` reste dans les données brutes (il sert à grouper les courses
    // voisines) mais n'est PAS remonté ici : le héros l'affiche tel quel, et
    // « Us Gov Ga » n'apprend rien à personne. Une course d'État n'a pas de
    // région sous l'État.
    parties,
    projection: {
      winner: raw.projection.winner,
      p_winner: raw.projection.p_winner,
      mean_margin: raw.projection.mean_margin,
      p_close_race: raw.projection.p_close_race,
      cycle: raw.projection.projection_cycle,
    },
    baseline,
    member: members[raw.riding_id],
    declaredCandidates: adaptDeclared(raw.riding_id),
    runDate: META.run_date,
    hasProjectionHistory: RACES_WITH_HISTORY.has(raw.riding_id),
    neighbors: buildNeighbors(raw.riding_id),
    isByelection: false,
    regionalContext: {
      province: {},
      national: NATIONAL_VOTE_MEAN,
      // 36, pas 50 : ce nombre légende la moyenne affichée juste au-dessus,
      // et cette moyenne porte sur les courses projetées — les quatorze
      // gouverneurs non sortants n'y entrent pas.
      totalSeats: races.length,
    },
  };
}

export function getAllUSGovernorRaces(): RidingData[] {
  return races.map(adaptOne);
}

export function getUSGovernorRace(id: string): RidingData | undefined {
  const raw = races.find((r) => r.riding_id === id);
  return raw ? adaptOne(raw) : undefined;
}

/** Les 36 courses, avec les champs propres au cycle gubernatorial que
 *  `RidingData` ne porte pas (siège ouvert, sortant, nombre de sondages
 *  récents). Sert aux pages d'index, qui trient et classent par notation. */
export function getGovernorRaceSummaries() {
  return races.map((r) => ({
    id: r.riding_id,
    slug: ridingSlug(r.riding_id, r.name_en || r.name_fr),
    name: { en: r.name_en, fr: r.name_fr || r.name_en },
    province: r.province,
    openSeat: !!r.open_seat,
    incumbentName: r.incumbent_name ?? '',
    incumbentParty: r.incumbent_party ?? '',
    pollCount: r.poll_count ?? 0,
    recentPollCount: r.recent_poll_count ?? 0,
    winner: r.projection.winner,
    pWinner: r.projection.p_winner,
    meanMargin: r.projection.mean_margin,
    rating: r.projection.rating,
  }));
}
