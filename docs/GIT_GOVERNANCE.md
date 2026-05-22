# Gouvernance Git et gestion des chantiers

Ce document fixe la discipline de travail du dépôt `electoral_projection copie`.
Objectif: garder `main` stable, éviter la prolifération de scripts jetables à la racine, et rendre les chantiers parallèles lisibles.

---

## 1. Rôles des zones du dépôt

### `main`

`main` est la ligne stable du projet.

On y garde:

- pipelines actifs
- pages publiques
- données versionnées utiles
- exports publiés dans `web_data/`
- snapshots d'analyse durables

On évite sur `main`:

- les gros refactors longs sans branche dédiée
- les prototypes produit encore mouvants
- les utilitaires jetables non classés

### `Beta test and Labs/`

Zone des prototypes produit, design et idées en exploration.

Règle:

- si un proto devient un produit sérieux ou un chantier multi-jour, il mérite une branche ou un worktree dédié;
- s'il reste expérimental, il peut vivre ici.

### `tmp_*`

Zone de transit:

- scrap
- ingestion brute
- debug ponctuel
- téléchargements temporaires

Tout ce qui est dans `tmp_*` est considéré comme non durable par défaut.

### `outputs/`, `results/`, `output/`

Artefacts intermédiaires de calcul.

Par défaut, ils ne sont pas versionnés.

Si une sortie doit être conservée:

- la promouvoir dans `web_data/` si elle alimente le site ou l'historique public;
- la promouvoir dans `analysis/` si elle capture un état analytique à conserver;
- éviter de dé-ignorer directement `outputs/`.

### `web_data/`

Historique publié et versionnable.

On y met:

- JSON/GeoJSON lus par le site
- historiques de runs web utiles
- sorties produits qui servent d'archive publique

### `analysis/`

Snapshots d'analyse durables.

On y met:

- comparatifs
- runs de scénario
- exports d'analyse qui ont une valeur de reprise

On n'y met pas:

- des bacs à sable temporaires;
- des sorties intermédiaires à faible valeur.

### `sandbox/`

Zone contrôlée pour tests et scripts à risque.

Usage recommandé:

- tester un import ou une logique sans toucher tout de suite aux outils durables;
- poser un script jetable avant de décider s'il faut l'intégrer;
- construire un petit prototype technique local.

Règle:

- si un script sandbox devient utile une deuxième fois, il doit être soit intégré, soit promu dans un module durable.

---

## 2. Politique scripts temporaires

Par défaut:

1. vérifier s'il existe déjà un script proche du besoin;
2. si oui, préférer l'étendre ou le factoriser;
3. si le besoin est exploratoire, autoriser un script en `sandbox/`;
4. si le besoin devient récurrent, promouvoir le script.

Promotion obligatoire quand un utilitaire:

- est relancé plusieurs fois;
- duplique un outil existant presque à l'identique;
- devient une dépendance implicite d'un workflow;
- produit une sortie que l'on consulte régulièrement.

La racine du dépôt n'est plus le parking naturel des scripts uniques.

---

## 3. Règles Git simples

### Branches

Chaque changement non trivial part sur une branche.

Conventions recommandées:

- `feature/...`
- `fix/...`
- `chore/...`
- `analysis/...`

Les noms peuvent être français ou anglais, mais doivent rester structurés.

Exemples:

- `feature/site-hub-identity`
- `feature/trump-duck-index`
- `fix/ontario-import`
- `analysis/qc-referendum-scenario`

### Commits

Un commit doit représenter une étape lisible.

Bon format:

- court
- impératif
- orienté résultat

Exemples:

- `Add baseline pipeline scripts`
- `Fix Quebec import fallback`
- `Refactor federal export step`

### Routine minimale

```bash
git status
git log --oneline --decorate -10
git checkout -b feature/nom-du-chantier
git add .
git commit -m "Message clair"
git checkout main
```

---

## 4. Quand créer un worktree

Créer un worktree si le chantier:

- dure plusieurs jours;
- touche plusieurs sous-systèmes;
- peut casser le flux régulier;
- mérite un espace de travail séparé.

Commande standard:

```bash
git worktree add ../votescope-nom-du-chantier -b feature/nom-du-chantier
```

Fermeture de chantier:

1. commit final sur la branche du worktree;
2. retour sur `main`;
3. suppression du worktree si le chantier est terminé.

---

## 5. Worktrees officiels

Ces worktrees correspondent à des chantiers déjà identifiés dans les documents du repo.

### Worktrees actifs à maintenir

- `../votescope-site-hub` → `feature/site-hub-identity`
- `../votescope-imports-cleanup` → `feature/rich-imports-cleanup`
- `../votescope-trump-duck` → `feature/trump-duck-index`
- `../votescope-bsts` → `feature/bsts-improvements`
- `../votescope-us-governors` → `feature/us-governors-2026`

### Correspondance documents → statut

- `PLAN_HUB_ET_IDENTITE_SITE.md` → worktree
- `PLAN_IMPORTS_RICHES_ET_NETTOYAGE.md` → worktree
- `PROJET_BSTS_AMELIORATIONS.md` → worktree
- `PROJET_GOVERNOR_US.md` → worktree
- `Beta test and Labs/Trump Duck Index` → worktree
- `MODELE_REFERENCE_2026-03-30.md` → note de reprise
- `ROADMAP.md` → document de pilotage
- `README.md` → documentation racine

---

## 6. Décision sur les outputs

### À versionner

- `web_data/`
- snapshots d'analyse utiles
- prototypes et labs qui ont une vraie valeur de reprise

### À ne pas versionner par défaut

- `outputs/`
- `results/`
- caches Python/R
- exports intermédiaires
- dossiers `output/` purement générés

Si une sortie devient importante, elle doit être promue vers un emplacement durable au lieu de vivre indéfiniment dans `outputs/`.
