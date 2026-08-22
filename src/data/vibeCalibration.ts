/**
 * Interrupteur de la collecte de calibration du jeu Vibe Match.
 *
 * Même motif que `ads.ts` : une constante committée plutôt qu'une variable
 * d'environnement du tableau de bord. Un réglage qui décide si des réponses
 * quittent le navigateur ne doit pas vivre dans une interface où personne ne
 * le relit — ici il passe par un commit, donc par une revue et un historique.
 *
 * Ce qui part quand c'est `true`, et rien d'autre : les réponses aux cartes,
 * le parti proposé par le modèle, le parti nommé par la personne, son
 * appréciation, la langue du site, la circonscription si elle en a choisi une,
 * et la date. Aucune adresse IP, aucun courriel, aucun identifiant de session.
 * Le code postal ne voyage jamais — il devient une circonscription DANS le
 * navigateur.
 *
 * Avant de repasser à `false` : ce n'est pas une urgence en soi, la collecte
 * est anonyme et documentée. Mais si le Worker ou la base venaient à mal se
 * comporter, c'est ici qu'on coupe, et le déploiement suivant suffit.
 *
 * La contrepartie serveur vit dans `models/workers/vibe-calibration/` :
 * l'endpoint refuse toute origine autre que vote-scope.com, purge à 90 jours,
 * et expose sa santé sur /api/v1/vibe-calibration/health — qui répond 503 si
 * une réponse a dépassé son délai ou si la purge n'a pas tourné depuis 48 h.
 */

export interface VibeCalibrationConfig {
  /** Rien ne quitte le navigateur tant que ceci vaut `false`. */
  enabled: boolean;
  /** Chemin de collecte, servi par le Worker sur la zone. */
  endpoint: string;
  /** Écrit dans chaque enregistrement, pour qu'un changement de règles se voie. */
  consentVersion: string;
}

export const vibeCalibration: VibeCalibrationConfig = {
  enabled: true,
  endpoint: '/api/v1/vibe-calibration',
  consentVersion: 'calibration-v1',
};
