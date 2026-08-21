/**
 * Moteur du jeu Vibe Match — bayésien, à deux étages.
 *
 *   a priori    la circonscription (projection régénérée chaque nuit) modulée
 *               par la langue de navigation ;
 *   cartes      chaque réponse est un rapport de vraisemblance mesuré, lu dans
 *               `web_data/quebec/vibe_calibration.json`.
 *
 * Rien n'est écrit à la main ici. Les poids viennent des tableaux croisés Léger
 * poolés par `export_vibe_match_calibration.py`, et se réactualisent à chaque
 * rapport mensuel. Une carte sans poids mesuré vaut zéro et ne fausse rien —
 * c'est ce qui permet d'ouvrir sur des cartes d'ambiance, et de leur donner un
 * poids plus tard si la boucle de calibration révèle qu'elles en méritent un.
 */

export type PartyId = 'pq' | 'plq' | 'caq' | 'pcq' | 'qs';
export type Answer = 'yes' | 'no' | 'skip';
export type Locale = 'fr' | 'en' | 'es';

export const PARTIES: readonly PartyId[] = ['pq', 'plq', 'caq', 'pcq', 'qs'];

export interface CalibratedCard {
  id: string;
  type: string;
  value: string;
  weights: Record<PartyId, number>;
  spread: number;
  n: number;
  polls: number;
  attenuation: number;
  source: string;
}

export interface Calibration {
  meta: {
    cycle: string;
    latest_poll: string;
    cards: number;
    judgements: Record<string, unknown>;
  };
  language_shares: Record<string, Record<PartyId, number>>;
  locale_priors: Record<Locale, { shares: Record<PartyId, number>; q: number }>;
  cards: CalibratedCard[];
}

export interface RidingLike {
  id: string;
  voteMean: Partial<Record<PartyId, number>>;
}

/** Une carte telle que le jeu la présente : le texte est éditorial, le poids mesuré. */
export interface Card {
  /** Identifiant de calibration (`sovereignty:pour`, `issue_salience:environnement`). */
  id: string;
  /** Forcée à l'ouverture, hors sélection adaptative. */
  warmup?: boolean;
  /** Sens de la carte : `-1` si répondre OUI va CONTRE l'attitude mesurée. */
  polarity?: 1 | -1;
}

const PLANCHER = 0.025;

/**
 * Répondre « non » n'est pas le miroir exact de « oui ».
 *
 * Un « oui » est une adhésion, un « non » souvent une simple non-adhésion :
 * ne pas citer l'environnement parmi ses priorités ne fait pas de quelqu'un un
 * adversaire de l'environnement. On amortit donc le sens négatif. La valeur
 * vient du jeu d'origine et reste un jugement — la boucle de calibration la
 * mesurera comme le reste.
 */
export const POIDS_NON = -0.72;

function logit(shares: Record<PartyId, number>): Record<PartyId, number> {
  const out = {} as Record<PartyId, number>;
  for (const p of PARTIES) out[p] = Math.log(Math.max(PLANCHER, shares[p] ?? PLANCHER));
  return out;
}

export function softmax(scores: Record<PartyId, number>): Record<PartyId, number> {
  const max = Math.max(...PARTIES.map((p) => scores[p]));
  const exp = PARTIES.map((p) => Math.exp(scores[p] - max));
  const total = exp.reduce((s, v) => s + v, 0);
  const out = {} as Record<PartyId, number>;
  PARTIES.forEach((p, i) => { out[p] = exp[i] / total; });
  return out;
}

/**
 * A priori : la circonscription, corrigée par la langue de navigation.
 *
 * La correction se fait en RAPPORT et non en remplacement : on applique à la
 * circonscription l'écart entre le profil linguistique et la moyenne
 * provinciale. Sans ça, un anglophone d'une circonscription péquiste hériterait
 * du profil anglophone provincial et perdrait toute l'information locale — or
 * c'est la circonscription qui porte le plus de signal (45,3 % de reconnaissance
 * à elle seule, contre 47,0 % une fois la langue ajoutée).
 */
export function priorScores(
  calibration: Calibration,
  locale: Locale,
  riding?: RidingLike,
): Record<PartyId, number> {
  const provincial = calibration.language_shares.provincial
    ?? moyenneDesLangues(calibration);
  const parLocale = calibration.locale_priors[locale]?.shares;

  const base = {} as Record<PartyId, number>;
  for (const p of PARTIES) {
    const local = riding?.voteMean?.[p];
    const depart = local !== undefined && local > 0
      ? local / 100
      : (parLocale?.[p] ?? provincial[p]);
    const ratio = parLocale && provincial[p] > 0 ? parLocale[p] / provincial[p] : 1;
    base[p] = Math.max(PLANCHER, (local !== undefined && local > 0)
      ? depart * ratio
      : depart);
  }
  const total = PARTIES.reduce((s, p) => s + base[p], 0);
  for (const p of PARTIES) base[p] /= total;
  return logit(base);
}

function moyenneDesLangues(calibration: Calibration): Record<PartyId, number> {
  const fr = calibration.language_shares.fr;
  const nf = calibration.language_shares.nonfr;
  const out = {} as Record<PartyId, number>;
  // Poids approximatifs de l'électorat québécois — sert seulement de repère
  // quand aucune moyenne provinciale n'est publiée avec la calibration.
  for (const p of PARTIES) out[p] = 0.78 * (fr?.[p] ?? 0.2) + 0.22 * (nf?.[p] ?? 0.2);
  return out;
}

/** Index des poids mesurés ; une carte absente vaut zéro partout. */
export function indexerCalibration(calibration: Calibration): Map<string, CalibratedCard> {
  return new Map(calibration.cards.map((c) => [c.id, c]));
}

export function poidsDe(
  index: Map<string, CalibratedCard>,
  carte: Card,
): Record<PartyId, number> {
  const mesure = index.get(carte.id);
  const out = {} as Record<PartyId, number>;
  const signe = carte.polarity ?? 1;
  for (const p of PARTIES) out[p] = (mesure?.weights[p] ?? 0) * signe;
  return out;
}

/** Applique les réponses à l'a priori. */
export function scoresDepuisReponses(
  prior: Record<PartyId, number>,
  answers: Record<string, Answer>,
  cartes: Card[],
  index: Map<string, CalibratedCard>,
): Record<PartyId, number> {
  const scores = { ...prior };
  for (const carte of cartes) {
    const reponse = answers[carte.id];
    if (!reponse || reponse === 'skip') continue;
    const poids = poidsDe(index, carte);
    const sens = reponse === 'yes' ? 1 : POIDS_NON;
    for (const p of PARTIES) scores[p] += poids[p] * sens;
  }
  return scores;
}

/**
 * Valeur d'une carte encore non posée : la variance de ses poids sous la
 * distribution courante — donc ce qu'elle peut encore séparer.
 *
 * Une carte sans poids mesuré a une variance nulle et ne sera jamais choisie
 * par ce critère : les cartes d'ambiance doivent être FORCÉES en ouverture,
 * ce que fait `choisirProchaine` via `warmup`.
 */
export function valeurDeCarte(
  poids: Record<PartyId, number>,
  probabilites: Record<PartyId, number>,
): number {
  const moyenne = PARTIES.reduce((s, p) => s + probabilites[p] * poids[p], 0);
  return PARTIES.reduce((s, p) => s + probabilites[p] * (poids[p] - moyenne) ** 2, 0);
}

/**
 * Choisit la carte suivante.
 *
 * Les cartes d'ambiance passent d'abord, dans l'ordre déclaré : elles posent le
 * ton, servent d'ancrage, et empêchent qu'on devine la suite pour orienter son
 * résultat. Ensuite le choix devient adaptatif — mais tiré au sort parmi les
 * `exploration` meilleures plutôt que strictement maximal. Un argmax rendait le
 * jeu déterministe : tout le monde recevait la même carte d'ouverture, et un
 * tiers du paquet n'était jamais posé.
 */
export function choisirProchaine(
  cartes: Card[],
  answers: Record<string, Answer>,
  scores: Record<PartyId, number>,
  index: Map<string, CalibratedCard>,
  options: { exploration?: number; alea?: () => number } = {},
): Card | null {
  const restantes = cartes.filter((c) => !answers[c.id]);
  if (!restantes.length) return null;

  const echauffement = restantes.filter((c) => c.warmup);
  if (echauffement.length) return echauffement[0];

  const exploration = options.exploration ?? 3;
  const alea = options.alea ?? Math.random;
  const probabilites = softmax(scores);
  const classees = [...restantes].sort(
    (a, b) => valeurDeCarte(poidsDe(index, b), probabilites)
            - valeurDeCarte(poidsDe(index, a), probabilites),
  );
  const tete = classees.slice(0, Math.max(1, Math.min(exploration, classees.length)));
  return tete[Math.floor(alea() * tete.length)];
}

/**
 * Le résultat est-il montrable?
 *
 * Deux conditions, et la seconde compte autant que la première : assez de
 * réponses, ET un écart net entre les deux premiers. Montrer un match dont les
 * deux têtes se tiennent à un point l'une de l'autre, c'est annoncer un
 * gagnant qui changera au prochain glissement.
 */
export function resultatPret(
  answers: Record<string, Answer>,
  probabilites: Record<PartyId, number>,
  options: { minimum?: number; maximum?: number; ecart?: number } = {},
): boolean {
  const minimum = options.minimum ?? 6;
  const maximum = options.maximum ?? 8;
  const ecartMin = options.ecart ?? 0.08;
  const repondues = Object.values(answers).filter((a) => a !== 'skip').length;
  if (repondues < minimum) return false;
  if (repondues >= maximum) return true;
  const tri = [...PARTIES].sort((a, b) => probabilites[b] - probabilites[a]);
  return probabilites[tri[0]] - probabilites[tri[1]] >= ecartMin;
}
