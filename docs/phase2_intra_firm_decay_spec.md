# Phase 2 — Decay intra-firme : spec figée

**Status** : spec'é, non implémenté. Reprendre à l'implémentation directe.

## Synthèse littérature (recherche Grok 2026-04-24)

Trois règles empiriques convergentes dans les modèles publics reconnus :

| Source | Règle | Numérique |
|---|---|---|
| 538 / ABC-GMA | k sondages d'une firme dans 14j → chacun × √(1/k) | k=2→0.71 ; k=3→0.57 ; k=4→0.50 |
| Bonham (AU) | decay ×0.618 (=1/φ) par semaine, max 2 rétentions | rank-based agressif |
| N_eff rolling 75% overlap | N_eff ≈ 0.25×N → poids × √0.25 | rolling × 0.5 additionnel |

**Sources** :
- 538 méthodologie : https://fivethirtyeight.com/methodology/how-our-polling-averages-work/
- ABC/GMA : https://www.goodmorningamerica.com/news/story/trump-approval-polling-average-works-117999010
- Bonham : https://voteguide.com.au/opinion-polls/poll-tracking-and-forecasting
- Jackman 2005 (state-space baseline) : https://uh.edu/hobby/eitm/_docs/past-lectures/2015-lectures/harold-clarke/pooling-the-polls-over-an-election-campaign.pdf
- Montalvo 2016 (covariance formelle, pour Phase 3.1C future) : https://arxiv.org/abs/1612.03073

## Spec finale

```python
# election_config.py
INTRA_FIRM_DECAY = {
    'enabled':             True,
    'window_days':         14,     # 538/ABC-GMA standard empirique
    'rank_base':           0.618,  # Bonham, golden ratio (1/φ)
    'rank_floor':          0.30,   # plancher absolu
    'rolling_multiplier':  0.5,    # N_eff √(1-overlap) pour rolling 75%
}
```

## Formule

Pour chaque `(election_cycle, firm)` :
1. Trier sondages par `field_end` DESC
2. Rank 1 (le plus récent) : facteur `1.0` — **préservé**
3. Rank k ≥ 2 :
   - Si `|field_end(k) - field_end(1)| ≤ 14j` : facteur `max(0.618^(k-1), 0.30)`
   - Sinon : facteur `1.0` (hors fenêtre, pas de pénalité)
4. Bonus rolling : si `rolling_sample == True` pour ce sondage, multiplier par `0.5` sur le facteur ci-dessus (quel que soit le rang)

Facteur final appliqué **multiplicativement** sur le `time_weight` existant dans preprocessor (ne remplace rien).

## Implémentation

**Fichiers à toucher :**
- `data/polls.csv` : ajouter colonne `rolling_sample` (bool, défaut `False`)
- `preprocessor.py` : nouvelle fonction `_apply_intra_firm_decay(polls_df, config)` appelée après `time_weight`
- `election_config.py` : bloc `INTRA_FIRM_DECAY` ci-dessus
- Scripts d'import (`import_fed_liaison_nanos_apr2026.py`, autres rolling connus) : ajouter `"rolling_sample": "True"` pour nanos, liaison

**Logging audit (exigé par user)** :
```
[intra-firm decay] cycle=<X> — N sondages, poids total A → B (Δ%)
  Par firme affectée :
    <firm> : k sondages / N total, facteurs × {1.00, 0.62, 0.38, ...}
  Top pénalités :
    <firm> <date> → rang k @ Δj → facteur F [rolling: yes/no]
```

## Classification rolling

**Principe** : métadonnée par sondage, jamais par firme (user explicite).
Défaut `False` ; `True` seulement si le communiqué/PDF le dit explicitement.

**Candidats connus actuellement imports (Apr 2026)** :
- `nanos_20260417` : "Four-week rolling telephone tracker" → `True`
- `liaison_20260420` : "Sample evenly split between April 6-11 and April 12-18" → `True`
- Historique : tous `False` par défaut (conservateur)

## Validation prévue

4 cycles, date 2026-04-24, sans `--publish-web` :
- fed_46, qc_2026, on_2029, us_house_2026
- Logs audit capturés par cycle
- **Pause + explication** si Δ > 3 sièges sur parti principal d'un cycle
- Baseline comparative :
  - fed_46 : LIB 216 / CON 99 / BQ 22 / NDP 3 / GRN 2 / PPC 0
  - qc_2026 : PQ 66 maj 92.7% / PLQ 44 / PCQ 10 / QS 5 / CAQ 0
  - on_2029 : ON_PC 64 maj 57.6% / ON_LIB 28 / ON_NDP 28 / ON_GRN 3 / ON_OTH 1
  - us_house_2026 : US_DEM 230 maj 92.2% / US_REP 205 / US_OTH 0

## Différé hors Phase 2

- Calibrateur statistique (Phase 2-bis) : `calibrators/intra_firm_decay.py` grid-search sur historique pour affiner window/base/floor → user explicite : "pas de calibrateur Phase 2-bis tout de suite"
- Multivariate BSTS avec covariance d'observation (Phase 3.1C du chantier BSTS) : approche formelle Montalvo 2016 / Han 2025, nécessite refonte R → projet séparé

## État session au freeze (2026-04-24)

- Phase 0 : modularisation `jurisdictions/` ✓ committé
- Phase 0.5 : fix draws BSTS + `--publish-web` + UK routing + non-régression ✓ committé `f79fc47`
- Phase 1a : REGION_CEILINGS QC + ungating ceiling générique ✓ committé `3b3d754`
- Phase 2 : spec figée ci-dessus, **à implémenter**
- Phase 1b Ontario data : en attente, indépendante (peut être parallèle à 2)
- Phase 3+ : à venir selon plan Opus `/Users/kleclerc/.claude/plans/je-veux-que-l-on-mighty-cascade.md`
