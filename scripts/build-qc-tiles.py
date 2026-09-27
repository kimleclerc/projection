#!/usr/bin/env python3
"""Carte en tuiles des 127 circonscriptions québécoises (soirée électorale).

Chaque circonscription reçoit une case de même taille, placée à peu près selon
sa géographie. Une carte réelle du Québec rend Montréal illisible : le Nord
occupe presque toute la surface pour une poignée de sièges. On étire donc les
coordonnées autour des pôles denses (Montréal, Québec), puis on résout une
affectation optimale centroïde → case (scipy.optimize.linear_sum_assignment).

Entrée : web_data/quebec/centroids.json, web_data/quebec/ridings.json
Sortie : src/data/qc-tiles.json  {cols, rows, tiles: {riding_id: [col, row]}}
Relancer seulement si la carte électorale change.
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy.optimize import linear_sum_assignment

ROOT = Path(__file__).resolve().parent.parent
cent = json.loads((ROOT / "web_data/quebec/centroids.json").read_text())
ids = sorted(cent)

# Pôles denses : on étire l'espace autour d'eux (distance transformée en racine).
POLES = [(-73.65, 45.52, 1.0), (-71.25, 46.82, 0.55)]  # Montréal, Québec


def warp(lon, lat):
    x = (lon + 72.0) * math.cos(math.radians(47))
    y = lat - 46.8
    for plon, plat, w in POLES:
        px, py = (plon + 72.0) * math.cos(math.radians(47)), plat - 46.8
        dx, dy = x - px, y - py
        d = math.hypot(dx, dy)
        if d > 0:
            # Proche du pôle : distance fortement dilatée; loin : presque inchangée.
            k = w * 1.6 / (d + 0.12)
            x, y = x + dx * min(k, 9.0) * 0.18, y + dy * min(k, 9.0) * 0.18
    # Le Nord est écrasé (log) pour ne pas gaspiller de lignes.
    if y > 1.2:
        y = 1.2 + math.log1p(y - 1.2) * 0.9
    return x, y


pts = np.array([warp(cent[i]["lon"], cent[i]["lat"]) for i in ids])
# Normalisation vers une grille d'environ 16 × 13 cases.
COLS, ROWS = 17, 14
span = pts.max(0) - pts.min(0)
scale = min((COLS - 1) / span[0], (ROWS - 1) / span[1])
p = (pts - pts.min(0)) * scale
p[:, 1] = (ROWS - 1) - p[:, 1]  # nord en haut
cells = np.array([(c, r) for r in range(ROWS) for c in range(COLS)], dtype=float)
cost = ((p[:, None, :] - cells[None, :, :]) ** 2).sum(-1)
row_ind, col_ind = linear_sum_assignment(cost)
tiles = {ids[i]: [int(cells[j][0]), int(cells[j][1])] for i, j in zip(row_ind, col_ind)}

# Recadrage : on retire les lignes et colonnes vides.
used_c = sorted({c for c, _ in tiles.values()})
used_r = sorted({r for _, r in tiles.values()})
tiles = {k: [used_c.index(c), used_r.index(r)] for k, (c, r) in tiles.items()}
out = {"cols": len(used_c), "rows": len(used_r), "tiles": tiles}
(ROOT / "src/data/qc-tiles.json").write_text(json.dumps(out, separators=(",", ":")))
print(f"{len(tiles)} tuiles, grille {out['cols']}×{out['rows']}")
