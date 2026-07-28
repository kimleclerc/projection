# Publication automatisée d'un desk — `scripts/publish-desk.mjs`

Garde-fou qui transforme un run de moteur en publication sûre, sur le patron
MLB (données fraîches → commit → push → rebuild Cloudflare), mais **capable de
refuser un run cassé et de sauter un run inchangé**.

## Principe

Un desk est auto-publiable quand sa page est une **pure fonction de son JSON** :
aucune prose écrite à la main ne devient fausse quand les chiffres bougent. Les
desks à sièges (`ProjectionEngine`) et MLB le sont. Le narratif éditorial des
desks à sièges (`src/data/raceEditorial.ts`) a été rendu **evergreen** — les
chiffres du run vivent dans les tables du moteur, pas dans la prose.

## Contrat

```
node scripts/publish-desk.mjs <desk> [options]
```

Le script, dans l'ordre :

1. **Valide** le JSON de l'arbre de travail (schéma, valeurs finies, probabilités
   dans `[0,1]`, votes dans `[0,100]`, somme des sièges ≈ `total_seats`,
   `run_date` présent et pas dans le futur). Un seul problème → **exit 1, rien
   n'est commité**, les problèmes sont listés.
2. **Saute** si le `run_date` (ou `data_fetched_at` pour MLB) est identique à la
   version commitée → **exit 0, pas de commit vide**.
3. **Refuse `main`** sans `--allow-main` (la promotion prod attend un GO humain).
4. Lance les gates : `validate:editorial` puis `npm run build`.
5. `git add` le JSON canonique, commit `<Label> data: nightly <run_date>`, push
   sur la branche courante.

Codes de sortie : `0` = publié **ou** sauté ; `1` = validation/étape échouée. Un
cron peut donc traiter tout `≠0` comme « à regarder ».

## Options

| Option | Effet |
|---|---|
| `--dry-run` | Valide et rapporte, n'écrit rien. |
| `--no-build` | Saute `npm run build` (gate rapide : validation données + éditorial seulement). |
| `--no-push` | Commit local sans push. |
| `--no-editorial` | Saute `validate:editorial`. |
| `--allow-main` | Autorise le push sur `main` (à n'utiliser que sur GO explicite). |
| `--json=<path>` | Valide un fichier alternatif (force `--dry-run`) — pour un run stagé ailleurs ou un test. |

## Desks enregistrés

`federal`, `ontario`, `quebec`, `us-house`, `us-senate` (kind `projection`),
`france` (kind `france-pres` — desk par scénarios : valide `run_date`, le
scénario par défaut, sa somme de 1er tour ≈ 100 % et les `p_top2`), `mlb`
(kind `mlb`). Ajouter un desk = une ligne dans le registre `DESKS` en tête du
script (et un bloc dans `validate()` si le schéma diffère).

## Branchement moteur (pilote : Federal)

Le moteur régénère `web_data/federal/latest.json` dans un checkout **sur `dev`**,
puis, au lieu de commit/push manuel :

```bash
cd /chemin/vers/votescope-web
node scripts/publish-desk.mjs federal
```

- Run inchangé → sortie propre, aucun commit.
- Run cassé → exit 1, le mainteneur est alerté, prod intacte.
- Run neuf et sain → commit + push sur `dev`, Cloudflare rebuild.

`main` reste promu à la main sur GO (cf. `GIT_GOVERNANCE.md`). Cadence libre par
desk : France ou UK national tournent aux sondages, pas chaque nuit — le skip
sur `run_date` inchangé gère ça sans configuration.

## Branchement cron (côté moteur)

La passerelle `../models/publish_gate.sh <desk> [juris]` enchaîne
`publish_web.py` + ce garde-fou après un run moteur. Le patron cron par desk
(heures échelonnées, commandes de run à confirmer) est dans
`../models/PUBLISH_CRON.md`. Le nightly MLB (`../models/mlb/update_nightly_mlb.sh`)
l'utilise déjà. UK reste manuel (desk Tier B, hors registre auto).

## Vérifié

- Skip sur run inchangé (federal, mlb).
- Refus sur `p_majority` hors bornes, `seats_mean` non fini, somme de sièges
  dérivante.
- Détection d'un nouveau `run_date` → passage aux gates.
- `maxBuffer` élargi pour les gros JSON (federal ~1,8 Mo).
