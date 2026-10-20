#!/usr/bin/env python3
"""Carte en tuiles des 93 circonscriptions de la Colombie-Britannique (soirée électorale).

Jumeau de build-qc-tiles.py. Une carte réelle de la C.-B. rend le Lower
Mainland illisible : la moitié des sièges tient dans un coin du sud-ouest. On
étire les coordonnées autour des pôles denses (Vancouver, Surrey, Victoria),
on écrase le Nord, puis on résout une affectation optimale centroïde → case.

Entrée : web_data/british-columbia/centroids.json
Sortie : src/data/bc-tiles.json  {cols, rows, tiles: {riding_id: [col, row]}}
Relancer seulement si la carte électorale change.
"""
import json
import math
from pathlib import Path

import numpy as np
from scipy.optimize import linear_sum_assignment

ROOT = Path(__file__).resolve().parent.parent
cent = json.loads((ROOT / "web_data/british-columbia/centroids.json").read_text())
ids = sorted(cent)

LON0, LAT0 = -123.0, 49.3
POLES = [(-123.12, 49.25, 1.0), (-122.80, 49.13, 0.8), (-123.37, 48.46, 0.5), (-119.45, 49.88, 0.25)]


def proj(lon, lat):
    return (lon - LON0) * math.cos(math.radians(50)), lat - LAT0


def warp(lon, lat):
    x, y = proj(lon, lat)
    for plon, plat, w in POLES:
        px, py = proj(plon, plat)
        dx, dy = x - px, y - py
        d = math.hypot(dx, dy)
        if d > 0:
            k = w * 1.2 / (d + 0.08)
            x, y = x + dx * min(k, 9.0) * 0.16, y + dy * min(k, 9.0) * 0.16
    if y > 1.5:  # le Nord : peu de sièges, beaucoup de surface
        y = 1.5 + math.log1p(y - 1.5) * 0.8
    return x, y


pts = np.array([warp(cent[i]["lon"], cent[i]["lat"]) for i in ids])
COLS, ROWS = 14, 12
span = pts.max(0) - pts.min(0)
scale = min((COLS - 1) / span[0], (ROWS - 1) / span[1])
p = (pts - pts.min(0)) * scale
p[:, 1] = (ROWS - 1) - p[:, 1]  # nord en haut
cells = np.array([(c, r) for r in range(ROWS) for c in range(COLS)], dtype=float)
cost = ((p[:, None, :] - cells[None, :, :]) ** 2).sum(-1)
row_ind, col_ind = linear_sum_assignment(cost)
tiles = {ids[i]: [int(cells[j][0]), int(cells[j][1])] for i, j in zip(row_ind, col_ind)}

used_c = sorted({c for c, _ in tiles.values()})
used_r = sorted({r for _, r in tiles.values()})
tiles = {k: [used_c.index(c), used_r.index(r)] for k, (c, r) in tiles.items()}
out = {"cols": len(used_c), "rows": len(used_r), "tiles": tiles}
(ROOT / "src/data/bc-tiles.json").write_text(json.dumps(out, separators=(",", ":")))
print(f"{len(tiles)} tuiles, grille {out['cols']}×{out['rows']}")
