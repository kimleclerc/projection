# Vote-Scope — règles de design

Contrat unique pour toutes les pages, en trois langues. Toute nouvelle page ou tout
nouveau composant part d'ici. Le script `npm run check:design` signale les écarts.

Direction retenue (octobre 2026) : **la soirée électorale**. On s'inspire des objets
réels du domaine — bandeaux de résultats télé, sites de résultats officiels, une de
journal — et pas des gabarits web. Référence visuelle : section C de `/essai-polices`.

## 1. Principes

1. **Les données d'abord.** Le chiffre ou la carte qui répond à la question de la page
   est le premier élément visible, en grand.
2. **Une hiérarchie, pas une grille.** Un élément principal par écran, puis des
   éléments secondaires plus petits. Jamais une rangée de blocs égaux par défaut.
3. **Les seules couleurs sont celles des partis.** Le reste est noir, blanc, gris.
4. **Rien de décoratif** : pas d'ombre, de dégradé, d'animation, d'émoji ou d'icône
   qui n'apporte pas d'information.
5. **Une voix humaine** : des phrases, des faits datés, pas de slogans ni de jargon.

## 2. Couleurs

Jetons dans `src/styles/tokens.css` (clair et sombre). Ne jamais écrire une couleur en
dur dans un composant, sauf la couleur d'un parti venue des données.

| Jeton | Usage |
|---|---|
| `--paper` | fond de page (blanc) |
| `--paper-2` | fond d'un encadré de résultats ou d'une bande secondaire |
| `--ink`, `--ink-2`, `--ink-3` | texte principal, texte courant, métadonnées |
| `--rule`, `--rule-2` | filets |
| couleur du parti (`party.color`) | pastilles, barres de sièges, cartes, chiffres d'un parti |
| `--blue`, `--red` | liens actifs et alertes seulement, pas de décor |

**Interdits** : dégradés, fonds crème ou papier, accent terracotta, teintes pastel de
remplissage, transparences décoratives, verre dépoli (`backdrop-filter`).

## 3. Typographie

- **Barlow** pour tout le texte et les titres (`--sans`, `--serif`).
- **Barlow Condensed** pour les grands chiffres de résultats (`--numeric`).
- Chiffres tabulaires partout (déjà global).

Échelle (px) : 13 · 15 · 17 · 20 · 24 · 32 · 44 · 64. Poids : 400 (texte), 600
(étiquettes, emphase), 700 (titres, chiffres).

| Élément | Taille | Poids |
|---|---|---|
| H1 de page | 44–64 | 700 |
| H2 de section | 32 | 700 |
| H3, titre de bloc | 20–24 | 700 |
| Texte courant | 17 | 400 |
| Texte secondaire | 15 | 400 |
| Métadonnées (dates, sources) | 13 | 600, `--ink-3` |
| Grand chiffre de résultat | 44–96 | 700 condensée |

**Interdits** : majuscules espacées (sauf sigles réels : PQ, NPD, GOP), police mono,
interlettrage serré sur les titres (au-delà de −0,01 em), mot en italique décoratif
dans un titre, un mot de titre en couleur.

## 4. Formes et espacement

- Coins : **0** par défaut, **2 px** maximum (boutons, champs).
- Filets : 1 px `--rule`. Filet épais de 4 px `--ink` en haut d'un tableau de résultats.
- Espacements : 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px.
- Largeur de lecture : 72 caractères au plus pour le texte courant.

**Interdits** : ombres portées (`box-shadow`), pilules (`border-radius: 999px`),
arrondis de 8 px et plus, barres de couleur sur le bord gauche d'un bloc.

- Un bloc qui porte la couleur d'un parti ou d'une zone l'affiche en **filet de 4 px en
  haut**, comme l'en-tête d'un bloc de résultats télé. Sinon, filet noir de 3 px.
- Seule exception au bord gauche : la **citation**, trait noir de 3 px, sans fond.
- Les éléments flottants (menus, info-bulles) se détachent par un contour de 1 px, pas
  par une ombre.
- Exceptions assumées dans le code : commentaire `design-ok` sur la ligne, avec la raison.

## 5. Composants canoniques

Un seul style par rôle. Si un besoin ne rentre dans aucun, on l'ajoute ici d'abord.

- **Tableau de résultats** (`ResultsTable`) : une ligne par parti — pastille, nom,
  sièges, pourcentage — puis la barre de sièges avec le seuil de majorité. Remplace les
  rangées de « gros chiffres » en boîtes.
- **Liste de titres** (`StoryList`) : la manière normale de lister des élections, des
  pages ou des courses. Un élément principal, puis des lignes : date, titre, une phrase.
- **Carte** : seulement quand le contenu a une image ou une carte géographique. Fond
  `--paper`, filet 1 px, pas d'ombre, coins 0.
- **Bouton** : primaire (fond `--ink`, texte blanc) ou secondaire (contour 2 px). Libellé
  explicite, **sans flèche**.
- **Métadonnées** : une ligne de 13 px sous ou à côté de l'élément qu'elle décrit.
- **Carte géographique** : l'objet central d'une page d'élection quand elle existe.

## 6. Mise en page

À faire :
- Un élément principal en tête de page (tableau de résultats ou carte), puis le reste en
  ordre d'importance décroissante.
- Les listes de pages ou d'élections en liste de titres, avec une hiérarchie.
- La même structure pour toutes les pages d'un même type (section 7).

**Interdits** :
- grille de 3 blocs égaux ou plus, quand une liste ferait l'affaire ;
- rangée de « stats » en boîtes ;
- petite étiquette au-dessus du H1 (le contexte va dans le fil d'Ariane ou sous le titre) ;
- héros centré, sections empilées interchangeables (héros → cartes → stats → appel) ;
- pied de page en quatre colonnes ;
- numérotation décorative (01, 02, 03) ;
- émojis et icônes décoratives dans l'interface (les drapeaux dans le contenu restent permis) ;
- animations d'apparition, décomptes de chiffres, effets au survol autres qu'un soulignement.
  Permis : le bandeau défilant façon chaîne d'info, le point « en direct », le signal
  d'une circonscription qui bascule.

## 7. Pages-types

- **Accueil** : une de journal. La course principale du moment en grand (aujourd'hui le
  Sénat), puis les autres élections en liste par date, la signature de Kim Leclerc, les
  liens de fond.
- **Projection** : titre ; tableau de résultats ; carte ; courses serrées en liste ;
  lecture de la course ; méthode et sources.
- **Sondages** : tableau des sondages, moyenne, sources.
- **Circonscription** : résultat projeté en tableau, historique, candidats.

## 8. Rédaction

Des phrases complètes, des chiffres et des dates. Pas de slogans en trois temps, pas de
jargon interne (« run », « desk », « instrument », noms de cycles techniques). Les
étiquettes et les boutons disent ce qui se passe au clic.

## 9. Images de partage

Générées à la demande (`functions/og/live`) : même palette, Barlow, question en titre,
chiffre principal en condensée, signature « Par Kim Leclerc · @kimleclerc ».
