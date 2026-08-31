# Design QA — cartes électorales VoteScope

## Cible produit

- Deux vues clairement nommées : carte proportionnelle et carte des circonscriptions.
- Une présentation propre à VoteScope, sans reproduire l’habillage d’un média tiers.
- Même hiérarchie d’information sur ordinateur et mobile.

## Carte proportionnelle

- [x] Une tuile carrée par siège, sans surface variable.
- [x] États/provinces/régions disposés dans une forme territoriale reconnaissable.
- [x] Alaska et Hawaii ne compriment plus le territoire continental.
- [x] Toile US mobile ramenée de 59,49 × 25,64 à 44,07 × 28,80 unités.
- [x] Ontario dispose maintenant de six blocs régionaux.
- [x] Bascule de parti visible par hachure, indépendamment de la couleur.
- [x] Fiche de siège stable en superposition, refermable au toucher.

## Carte des circonscriptions

- [x] Projection conique locale en SVG, sans Mercator ni fond de tuiles.
- [x] Encarts automatiques pour Alaska, Hawaii et territoires français éloignés.
- [x] Circonscriptions accessibles au clavier et étiquetées pour les lecteurs d’écran.
- [x] Fiche détaillée stable en superposition.
- [x] Mise à jour réactive du simulateur sans reconstruire une carte tierce.

## Résilience

- [x] Compilation Astro complète.
- [x] Validation des 435 circonscriptions US et 124 circonscriptions ontariennes.
- [x] Aucun fournisseur de fond cartographique tiers détecté.
- [ ] Revue tactile finale sur plusieurs appareils physiques après publication de prévisualisation.
