/**
 * Troisième rail : lire le DGEQ DIRECTEMENT depuis le navigateur.
 *
 * Pourquoi il existe. Nos deux autres chemins sont chez Cloudflare (Pages
 * statique, puis le Worker), et ils dépendent tous deux d'un collecteur qui
 * tourne sur UNE machine, sur une connexion domestique, un soir donné. Une
 * panne de courant à 20 h 30 fige la page pendant la soirée la plus fréquentée
 * de l'année. Ce module retire cette dépendance du chemin de lecture : tant que
 * le DGEQ publie, la page affiche le dépouillement.
 *
 * Ce qu'il donne, et ce qu'il ne donne pas. Il donne les voix, les bureaux
 * dépouillés et le meneur — les faits officiels. Il ne donne NI nos appels NI
 * nos projections : ils naissent du moteur, et le moteur est justement ce qui
 * est tombé si on en est là. Une page en mode direct doit le dire.
 *
 * Le DGEQ sert `access-control-allow-origin: *` depuis AmazonS3 avec
 * `cache-control: public, max-age=120` (vérifié le 2026-09-20). Le format
 * ci-dessous est dérivé de l'enregistrement de la simulation du même jour
 * (`models/fastest_call/config/calibration/qc-2026-09-20-simulation/`).
 */

export const DGEQ_RESULTS_URL =
  'https://donnees.electionsquebec.qc.ca/production/provincial/resultats/resultats.json';

type DgeqCandidate = {
  nom?: string; prenom?: string;
  numeroPartiPolitique?: number;
  abreviationPartiPolitique?: string;
  nbVoteTotal?: number; tauxVote?: number;
};
type DgeqRiding = {
  numeroCirconscription?: number; nomCirconscription?: string;
  iso8601DateMAJ?: string; isResultatsFinaux?: boolean;
  nbBureauComplete?: number; nbBureauTotal?: number;
  nbVoteValide?: number;
  candidats?: DgeqCandidate[];
};

/** `689` → `"00689"`. Le flux envoie un entier ; toute jointure tient sur 5 chiffres. */
function ridingId(value: number | undefined): string {
  return typeof value === 'number' ? String(value).padStart(5, '0') : '';
}

/**
 * `2026-09-20T14:01:17,413-04:00` → ISO UTC.
 *
 * Le DGEQ sépare les fractions de seconde par une VIRGULE. `new Date()` rend
 * `Invalid Date` tel quel — le piège est documenté dans `elections_quebec.py`.
 * On rend null plutôt qu'une approximation : une heure illisible ne doit jamais
 * devenir une heure d'apparence fraîche.
 */
export function normalizeStamp(value: string | undefined | null): string | null {
  if (!value) return null;
  const parsed = new Date(value.trim().replace(/,(\d+)/, '.$1'));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** L'abréviation du DGEQ suffit à l'affichage : pas de registre côté client. */
function partyCode(candidate: DgeqCandidate): string {
  const abbreviation = (candidate.abreviationPartiPolitique || '').trim();
  if (abbreviation) return abbreviation.toLowerCase();
  return candidate.numeroPartiPolitique === 0 ? 'ind' : 'qc_oth';
}

function fullName(candidate: DgeqCandidate): string {
  return [candidate.prenom, candidate.nom].filter(Boolean).join(' ').trim();
}

export type DirectReading = {
  results: Array<{
    riding_id: string; name?: string;
    polls?: { reported?: number | null; total?: number | null; pct?: number | null };
    ballots_counted?: number;
    candidates: Array<{ candidate_name: string; party_code: string; votes: number; vote_pct: number }>;
  }>;
  sourceUpdatedAt: string | null;
  complete: boolean;
};

export function parseDgeq(payload: unknown): DirectReading {
  const ridings = ((payload as { circonscriptions?: DgeqRiding[] } | null)?.circonscriptions) ?? [];
  if (!Array.isArray(ridings)) throw new Error('flux DGEQ inattendu');

  let latest: string | null = null;
  let allFinal = ridings.length > 0;

  const results = ridings.map((riding) => {
    const stamp = normalizeStamp(riding.iso8601DateMAJ);
    // L'heure de la DONNÉE, pas celle du téléchargement : on garde la plus récente.
    if (stamp && (!latest || stamp > latest)) latest = stamp;
    if (!riding.isResultatsFinaux) allFinal = false;

    const reported = riding.nbBureauComplete ?? null;
    const total = riding.nbBureauTotal ?? null;
    const candidates = (riding.candidats ?? [])
      .map((candidate) => ({
        candidate_name: fullName(candidate),
        party_code: partyCode(candidate),
        votes: candidate.nbVoteTotal ?? 0,
        vote_pct: candidate.tauxVote ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    return {
      riding_id: ridingId(riding.numeroCirconscription),
      name: riding.nomCirconscription,
      polls: {
        reported, total,
        pct: reported !== null && total ? Math.round((1000 * reported) / total) / 10 : null,
      },
      ballots_counted: riding.nbVoteValide ?? 0,
      candidates,
    };
  }).filter((r) => r.riding_id);

  return { results, sourceUpdatedAt: latest, complete: allFinal };
}

export async function readDgeqDirect(signal?: AbortSignal): Promise<DirectReading> {
  const response = await fetch(DGEQ_RESULTS_URL, { cache: 'default', signal });
  // 403 AVANT l'ouverture des bureaux est l'état normal du flux, pas une panne.
  if (!response.ok) throw new Error(`dgeq http ${response.status}`);
  return parseDgeq(await response.json());
}
