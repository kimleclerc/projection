/**
 * Registre des marchés de prédiction attachés à une circonscription.
 *
 * Pourquoi un registre et pas un champ du moteur. Un marché Polymarket n'a
 * aucune existence dans le modèle : il n'entre dans aucun calcul, ne corrige
 * aucun a priori, et ne doit jamais le faire — Polymarket agrège des parieurs,
 * VoteScope produit une prévision, et diverger du marché est une position
 * assumée, pas un défaut à rattraper. Le lien est donc éditorial, il vit côté
 * site, à côté des autres registres (`polls-hubs.ts`).
 *
 * `kind` n'est pas décoratif. Polymarket sert tout depuis /market mais le
 * paramètre change : `?market=` pour une question oui/non unique, `?event=`
 * pour un événement à issues multiples. Un slug d'événement passé à `?market=`
 * renvoie un HTTP 200 portant une carte « Market not found » — l'embed ne
 * signale rien, seul l'œil le voit. Les partielles sont toutes des événements
 * (« qui gagne ? », une issue par candidat).
 *
 * `npm run check:polymarket` valide ces entrées auprès de l'API Gamma au même
 * titre que les `<PolymarketEmbed slug="…">` écrits en dur dans les pages :
 * un marché retiré, résolu ou renommé fait échouer le contrôle. Sans cela, un
 * slug rangé dans un registre serait précisément le genre d'entrée qui se
 * périme sans bruit.
 */

export interface PredictionMarket {
  /** Slug Polymarket. */
  slug: string;
  /** Nature du slug — voir l'en-tête. Les partielles sont des `event`. */
  kind: 'market' | 'event';
  /** URL canonique de l'événement, forme EN ; le composant la localise. */
  eventUrl: string;
}

/**
 * Clé : `<juridiction>:<riding_id>`, telle que le moteur écrit l'identifiant
 * (fédéral sur 5 chiffres, Ontario sur 5 avec zéros de tête).
 *
 * Une partielle sans marché n'a pas d'entrée : l'emplacement reste vide sur la
 * page plutôt que d'afficher un cadre creux.
 */
export const PREDICTION_MARKETS: Record<string, PredictionMarket> = {
  'fed:24018': {
    slug: 'chicoutimile-fjord-by-election-winner-20260729185915437',
    kind: 'event',
    eventUrl:
      'https://polymarket.com/event/chicoutimile-fjord-by-election-winner-20260729185915437',
  },
  'fed:59022': {
    slug: 'north-vancouvercapilano-by-election-winner-20260729185730213',
    kind: 'event',
    eventUrl:
      'https://polymarket.com/event/north-vancouvercapilano-by-election-winner-20260729185730213',
  },
  'on:00098': {
    slug: 'scarborough-southwest-provincial-by-election-winner-1785955561142',
    kind: 'event',
    eventUrl:
      'https://polymarket.com/event/scarborough-southwest-provincial-by-election-winner-1785955561142',
  },
};

/**
 * Juridiction déduite du dossier de données de la course. Les desks de
 * partielles (fédéral et ontarien partagent le même composant) ne portent pas
 * de champ « juridiction » : `dataPath` est ce qui les distingue, et il est
 * déjà là. Le déduire plutôt que l'écrire une deuxième fois dans chaque
 * config garde UN seul endroit à modifier pour attacher un marché — ce
 * registre.
 */
const JURISDICTION_BY_DATA_PREFIX: ReadonlyArray<[string, string]> = [
  ['canada-byelection-', 'fed'],
  ['ontario-byelection-', 'on'],
];

/** Le marché d'une course de partielle, d'après sa config de desk. */
export function marketForByelection(
  dataPath: string,
  ridingId: string,
): PredictionMarket | undefined {
  const match = JURISDICTION_BY_DATA_PREFIX.find(([prefix]) => dataPath.startsWith(prefix));
  return match ? marketForRiding(match[1], ridingId) : undefined;
}

/** Le marché d'une circonscription, ou `undefined` s'il n'y en a pas. */
export function marketForRiding(
  jurisdiction: string,
  ridingId: string,
): PredictionMarket | undefined {
  return PREDICTION_MARKETS[`${jurisdiction}:${ridingId}`];
}
