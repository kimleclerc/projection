# Vote-Scope — contrat de design

Contrat unique pour toutes les pages, en trois langues. Toute nouvelle page ou tout
nouveau composant part d'ici : d'abord le **gabarit** (§ 7), puis les composants (§ 5),
puis les styles. `npm run check:design` repère les motifs de code interdits ; il ne
remplace pas la relecture de la silhouette, de la hiérarchie et du texte (§ 11).

## 0. Signature : « Le bulletin »

Choisie par Kim Leclerc le 9 octobre 2026 (référence : B de `/essai-signature`).
Vote-Scope se présente comme un **quotidien électoral**, pas comme une application.

- **Symbole** : le cercle du bulletin de vote canadien, mi-bleu mi-rouge, coché d'une
  croix blanche (`BrandMark`). Il est le même partout : en-tête, onglet, pied de page,
  intégrations, images de partage. On ne le redessine pas, on ne le recolore pas.
- **Bandeau** : la date du jour et le prochain scrutin à gauche, le nom et le symbole
  au centre, les outils à droite. Dessous, le menu, sous un **filet noir de 6 px**.
  Seul le menu reste fixé au défilement.
- **Matière** : ce qui distingue le site, ce sont les tableaux, les cartes, les dates,
  les sources et la voix signée de Kim. Le décor n'ajoute rien à cette matière.

## 1. Principes

1. **La réponse d'abord.** Le chiffre, le tableau ou la carte qui répond à la question
   de la page arrive en premier, avec sa date, sa portée et son incertitude.
2. **Une hiérarchie, pas une grille.** Un élément principal par écran, puis des
   éléments secondaires plus petits. Jamais une rangée de blocs égaux par défaut.
3. **La couleur a un sens.** Les seules couleurs de remplissage sont celles des partis
   (et le jaune ou le gris d'une donnée explicitement codée). Le reste est noir, blanc, gris.
4. **Rien de décoratif** : pas d'ombre, de dégradé, d'animation, d'émoji ou d'icône
   qui n'apporte pas d'information.
5. **Une voix humaine et sobre** (§ 8).
6. **Le moteur en coulisse.** Méthode, modèle et nombre de simulations restent publics,
   mais dans la note de méthode, pas devant la réponse.

## 2. Couleurs

Jetons dans `src/styles/tokens.css` (clair et sombre). Ne jamais écrire une couleur en
dur dans un composant, sauf la couleur d'un parti venue des données.

| Jeton | Usage |
|---|---|
| `--paper` | fond de page (blanc) |
| `--paper-2` | fond d'un tableau de résultats ou d'un encadré |
| `--ink`, `--ink-2`, `--ink-3` | texte principal, texte courant, métadonnées (lisibles : ≥ 4,5:1) |
| `--rule`, `--rule-2` | filets |
| couleur du parti (`party.color`) | pastilles, barres de sièges, cartes, chiffres d'un parti |
| `--blue`, `--red` | liens actifs et alertes seulement, pas de décor |

**Interdits** : dégradés, fonds crème, accent terracotta, teintes pastel de remplissage,
transparences décoratives, verre dépoli, couleur d'accent posée sur un bloc « pour
l'habiller ».

## 3. Typographie

- **Barlow** pour tout le texte et les titres (`--sans`, `--serif`).
- **Barlow Condensed** pour les grands chiffres de résultats (`--numeric`).
- Chiffres tabulaires partout (déjà global).

| Élément | Taille | Poids |
|---|---|---|
| H1 de page | 34–56 | 700 |
| H2 de section | 24–32 | 700 |
| H3, titre de bloc | 19–22 | 700 |
| Texte courant | 17 | 400 |
| Texte secondaire | 15 | 400 |
| Métadonnées (dates, sources) | 13–14 | 600, `--ink-3` |
| Grand chiffre de résultat | 34–96 | 700 condensée |

**Précision affichée** : un score ou un pourcentage s'affiche à l'unité (66 %, 87/100),
sauf si la méthode justifie une décimale (part des voix d'un sondage : 32,1 %).

**Interdits** : majuscules espacées (sauf sigles réels : PQ, NPD, GOP et le nom du site
dans le symbole), police mono, interlettrage serré au-delà de −0,01 em, mot en italique
décoratif dans un titre, mot de titre en couleur.

## 4. Formes et espacement

- Coins : **0** par défaut, **2 px** maximum (boutons, champs).
- Filets : 1 px `--rule` entre les lignes ; 2 px `--ink` au-dessus d'un module ;
  4 px `--ink` au-dessus d'un tableau de résultats ; 6 px sous le bandeau du site.
- Espacements : 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px. Pas d'espace vide « pour
  respirer » sous un chiffre : un module a la hauteur de son contenu.
- Largeur de lecture : 72 caractères au plus pour le texte courant.

**Le filet de couleur** (4 px, couleur d'un parti ou d'une zone) n'est permis **que s'il
code une information lisible ailleurs sur la page** : le parti en tête d'une course, la
zone d'un indice affichée en clair. Jamais par habitude, jamais deux blocs voisins avec
le même filet coloré « pour faire joli ». Sinon : filet noir.

**Interdits** : ombres, pilules, arrondis de plus de 2 px, barres de couleur sur le
bord gauche (sauf citation : trait noir de 3 px), éléments flottants à ombre (contour
de 1 px à la place). Exception assumée : commentaire `design-ok` avec la raison.

## 5. Composants canoniques

Un seul composant par rôle. Si un besoin ne rentre dans aucun, on l'ajoute ici d'abord.

| Rôle | Composant | Usage |
|---|---|---|
| En-tête de page | `PageHeader` | titre, une phrase, réponse clé, actions |
| Résultats | `ResultsTable` | une ligne par parti, barre de sièges, seuil, source |
| Liste | `StoryList` | élections, pages, indices, outils : date, titre, une phrase |
| Bloc de texte | `.vs-block` | filet en haut, pas de boîte |
| Cadre de graphique | `.vs-figure` | 1 px, angles droits, autour d'un graphique ou d'une carte |
| Note signée | `KimNote` | texte de Kim, daté ; jamais un texte non approuvé |
| Bouton | `.vs-btn`, `.vs-btn-secondary` | libellé explicite, sans flèche |
| Lien d'action | `.vs-link` | souligné, dit où il mène |
| Métadonnées | `.vs-meta` | date, source, portée, sous l'élément décrit |

Toute nouvelle classe `*-card` doit être rattachée à `.vs-block` ou `.vs-figure`
dans `system.css`, sinon le build échoue.

## 6. Mise en page

**Interdits** :
- grille de 3 blocs égaux ou plus quand une liste ou un tableau ferait l'affaire ;
- rangée de « stats » en boîtes ;
- étiquette au-dessus du H1 ; étiquette de prestige (« vedette », « phare », « à la une »)
  qui ne dit rien du contenu ;
- succession de sections promotionnelles (présentation → appel → répertoire → appel) :
  une page a une fonction, pas un tunnel de vente ;
- teaser vide (cartes sans contenu, grande flèche) : on montre une vraie question ou un
  aperçu utilisable de l'outil ;
- deux grands titres qui se disputent la tête de page ;
- pied de page en colonnes, numérotation décorative, émojis d'interface ;
- animations d'apparition, décomptes, effets au survol autres qu'un soulignement.
  Permis : le point « en direct », le signal d'une circonscription qui bascule.

## 7. Gabarits

Chaque page appartient à un gabarit. Ordre de lecture de haut en bas ; chaque gabarit
prévoit ses **états** : avant le vote, dépouillement, résultats, données indisponibles.

### Une (accueil)
1. Bandeau du site. 2. Une ligne qui dit ce qu'est le site.
3. **La course principale** : question, réponse en une phrase, `ResultsTable`, accès.
4. **Les autres scrutins**, en liste par date (`ElectionsBand`, colonne de droite).
5. Signature de Kim. 6. Répertoire des prévisions (index sans boîtes). 7. Indices.
- Résultats : la course tranchée passe en tête avec « Résultats · date ».

### Fiche de scrutin (projection)
1. `PageHeader` : le scrutin et sa date ; la réponse en une phrase.
2. `ResultsTable` avec date, portée et seuil ; source sous le tableau.
3. `KimNote` si publiée. 4. Carte. 5. Courses serrées (liste).
6. Lecture de la course (texte daté). 7. Méthode et sources (modèle, simulations,
nombre de sondages, lien vers la méthodologie).
- Dépouillement : bandeau « en direct », résultats officiels avant la projection.
- Résultats : résultat officiel en tête, la projection devient « ce que nous avions prévu ».
- Données indisponibles : dire ce qui manque et depuis quand, sans tableau vide.

### Fiche de circonscription
1. Nom, province ou État, région. 2. Projection en tableau, avec date.
3. Candidats (noms, partis ; pas de biographie de campagne après le scrutin).
4. Historique, sondages locaux s'il y en a. 5. Circonscriptions voisines, retour au scrutin.
- Résultats : résultat officiel, écart avec la projection.

### Suivi de sondages
1. La moyenne du jour en une phrase. 2. Graphique de tendance (cadre).
3. Tableau des sondages : institut, dates de terrain, échantillon, source cliquable.
4. Méthode de la moyenne. Ne pas mélanger intentions de vote, baromètres d'opinion et
enquêtes auprès de populations différentes dans la même moyenne.

### Indice
1. Ce que l'indice mesure, en une phrase. 2. La valeur du jour (à l'unité) et sa zone.
3. Évolution (graphique). 4. Composantes en tableau. 5. Méthode et sources.

### Répertoire d'outils
1. Ce qu'on peut faire, en une phrase. 2. Les outils en **liste**, chacun avec ce qu'il
permet et, si possible, un aperçu réel ou une question concrète. Pas de vitrine.

## 8. Voix

Écrire ce que montre la page, ce qui a changé, d'où viennent les données et ce qu'on
ignore. Des phrases complètes, des chiffres et des dates.

**À éviter** :
- formules publicitaires (« Jouez avec la politique », « Toutes les prévisions, au même
  endroit », « Science en direct ») et petites accroches au-dessus de chaque section ;
- prestige gratuit (« capitale du G7 », « propriétaire », « exclusif », « moteur
  quantique » sans explication vérifiable) ;
- jargon interne (« run », « desk », « instrument », « hub », « live », noms de cycles) ;
- notes de conception publiées (« la page doit… », « pas de placeholders ») ;
- liens génériques (« Ouvrir l'indice ») quand le contexte ne dit pas où ils mènent.

**La voix de Kim** : seulement un texte rédigé ou approuvé par lui (`kim-notes.ts`,
`published: true`). Jamais une voix personnelle fabriquée en son nom.

**Langues** : jamais d'anglais sur une page FR/ES (`npm run check:lang`). Noms de
partis via `partyName()`, de lieux via `placeName()`.

## 9. Images de partage

Générées à la demande (`functions/og/live`) : même palette, Barlow, question en titre,
chiffre principal en condensée, symbole du bulletin, signature « Par Kim Leclerc ».
Respecter la limite de 20 000 fichiers du site : images générées à la volée, pas en lot.

## 10. Vérification avant publication

1. `npm run build` (contrôles de design et de langue inclus).
2. Quelques pages représentatives en FR, EN et ES, à 375 px et sur ordinateur, en clair
   et en sombre, avec des données abondantes et manquantes.
3. Relire la silhouette : la réponse est-elle au premier écran sur téléphone ?
   Un bloc a-t-il une fonction ? Un titre apporte-t-il une information ?
