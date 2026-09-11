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
 * (fédéral sur 5 chiffres, Québec et Ontario sur 5 avec zéros de tête).
 *
 * Une course sans marché n'a pas d'entrée : l'emplacement reste vide sur la
 * page plutôt que d'afficher un cadre creux.
 *
 * 2026-09-11 — les trois partielles qui peuplaient ce registre ont été retirées :
 * Chicoutimi–Le Fjord et North Vancouver–Capilano ont voté le 31 août,
 * Scarborough-Sud-Ouest le 3 septembre, et leurs marchés sont résolus depuis.
 * Aucune des six partielles fédérales en attente ne les remplace : elles sont
 * toutes `vacant_pending_writ` ou `expected`, sans date de scrutin, et
 * Polymarket n'ouvre pas de marché avant le bref. Ce qui les remplace vient
 * d'ailleurs : Polymarket a ouvert 21 marchés de CIRCONSCRIPTION pour la
 * générale québécoise du 5 octobre, un par circonscription, sur les 127 que
 * compte la carte. Ils couvrent quatre des cinq courses les plus serrées de
 * notre propre projection — Drummond–Bois-Francs, Maskinongé,
 * Laviolette–Saint-Maurice, Charlesbourg.
 *
 * Les 106 autres circonscriptions n'ont pas d'entrée et n'affichent rien. Ce
 * silence est correct : il dit qu'aucun parieur ne cote cette course, pas que
 * la course est jouée.
 */
export const PREDICTION_MARKETS: Record<string, PredictionMarket> = {
  // Holborn and St Pancras — siège quitté par Keir Starmer le 1er septembre.
  // Ni writ ni date : le marché ouvre quand même, et il est le SEUL marché de
  // partielle vivant au moment où les trois précédents sont morts. Le desk de
  // la course lit `web_data/uk-holborn-special`, dont le champ `markets` porte
  // encore « aucun marché ouvert au 2026-09-01 » — un constat du moteur, daté
  // d'avant l'ouverture. Ce registre, lui, est à jour : la page de
  // circonscription affiche donc le marché que le desk ignore encore.
  'uk:E14001290': {
    slug: 'holborn-and-st-pancras-by-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/holborn-and-st-pancras-by-election-winner',
  },

  // Drummond–Bois-Francs — 1.2 pt de marge projetée
  'qc:00141': {
    slug: 'drummond-bois-francs-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/drummond-bois-francs-quebec-national-assembly-election-winner',
  },
  // Maskinongé — 1.4 pt de marge projetée
  'qc:00693': {
    slug: 'maskinonge-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/maskinonge-quebec-national-assembly-election-winner',
  },
  // Laviolette–Saint-Maurice — 1.5 pt de marge projetée
  'qc:00697': {
    slug: 'laviolette-saint-maurice-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/laviolette-saint-maurice-quebec-national-assembly-election-winner',
  },
  // Charlesbourg — 1.6 pt de marge projetée
  'qc:00767': {
    slug: 'charlesbourg-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/charlesbourg-quebec-national-assembly-election-winner',
  },
  // Vanier-Les Rivières — 3.1 pt de marge projetée
  'qc:00749': {
    slug: 'vanier-les-rivieres-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/vanier-les-rivieres-quebec-national-assembly-election-winner',
  },
  // Louis-Hébert — 3.5 pt de marge projetée
  'qc:00709': {
    slug: 'louis-hebert-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/louis-hebert-quebec-national-assembly-election-winner',
  },
  // Nicolet-Bécancour — 3.8 pt de marge projetée
  'qc:00151': {
    slug: 'nicolet-becancour-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/nicolet-becancour-quebec-national-assembly-election-winner',
  },
  // Saint-François — 4.2 pt de marge projetée
  'qc:00119': {
    slug: 'saint-francois-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/saint-francois-quebec-national-assembly-election-winner',
  },
  // Côte-du-Sud — 4.3 pt de marge projetée
  'qc:00799': {
    slug: 'cote-du-sud-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/cote-du-sud-quebec-national-assembly-election-winner',
  },
  // Jean-Lesage — 4.3 pt de marge projetée
  'qc:00757': {
    slug: 'jean-lesage-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/jean-lesage-quebec-national-assembly-election-winner',
  },
  // Richmond — 4.5 pt de marge projetée
  'qc:00137': {
    slug: 'richmond-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/richmond-quebec-national-assembly-election-winner',
  },
  // Groulx — 4.5 pt de marge projetée
  'qc:00577': {
    slug: 'groulx-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/groulx-quebec-national-assembly-election-winner',
  },
  // Lévis — 4.9 pt de marge projetée
  'qc:00791': {
    slug: 'levis-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/levis-quebec-national-assembly-election-winner',
  },
  // Beauharnois — 6.2 pt de marge projetée
  'qc:00179': {
    slug: 'beauharnois-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/beauharnois-quebec-national-assembly-election-winner',
  },
  // Hochelaga-Maisonneuve — 6.3 pt de marge projetée
  'qc:00352': {
    slug: 'hochelaga-maisonneuve-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/hochelaga-maisonneuve-quebec-national-assembly-election-winner',
  },
  // Montarville — 7.1 pt de marge projetée
  'qc:00227': {
    slug: 'montarville-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/montarville-quebec-national-assembly-election-winner',
  },
  // La Prairie — 8.4 pt de marge projetée
  'qc:00199': {
    slug: 'la-prairie-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/la-prairie-quebec-national-assembly-election-winner',
  },
  // Rosemont — 9.7 pt de marge projetée
  'qc:00319': {
    slug: 'rosemont-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/rosemont-quebec-national-assembly-election-winner',
  },
  // Taschereau — 13.5 pt de marge projetée
  'qc:00751': {
    slug: 'taschereau-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/taschereau-quebec-national-assembly-election-winner',
  },
  // Laurier-Dorion — 14.1 pt de marge projetée
  'qc:00344': {
    slug: 'laurier-dorion-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/laurier-dorion-quebec-national-assembly-election-winner',
  },
  // Saint-Henri–Sainte-Anne — 21.1 pt de marge projetée
  'qc:00281': {
    slug: 'saint-henri-sainte-anne-quebec-national-assembly-election-winner',
    kind: 'event',
    eventUrl: 'https://polymarket.com/event/saint-henri-sainte-anne-quebec-national-assembly-election-winner',
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
