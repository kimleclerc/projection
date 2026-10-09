"""Fige l'historique des marchés de prédiction d'un scrutin, coupé à la veille du vote.

Le fichier web_data/polymarket/history/<juridiction>.json est regénéré chaque nuit et peut,
après le règlement des marchés, contenir des prix de 0 ou 1. Pour le bilan (track record),
on garde une copie figée dans src/data/<cycle>-markets.json.

    python3 scripts/freeze-market-history.py quebec qc-2026 2026-10-04
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
jur, cycle, eve = sys.argv[1], sys.argv[2], sys.argv[3]
src = json.load(open(ROOT / 'web_data' / 'polymarket' / 'history' / f'{jur}.json'))
out = {'meta': {'cycle': cycle, 'eve': eve, 'source': 'Polymarket', 'frozen_from_generated_at': src.get('generated_at')}, 'races': {}}
for key, race in src['races'].items():
    rid = key.split(':', 1)[1]
    series = []
    for s in race['series']:
        pts = [p for p in s['points'] if p[0] <= eve]
        if pts:
            series.append({'label': s['label'], 'party': s.get('party'), 'points': pts, 'eve_price': pts[-1][1]})
    if series:
        leader = max(series, key=lambda s: s['eve_price'])
        out['races'][rid] = {'event_slug': race['event_slug'], 'name': race['name'], 'eve_leader': leader['label'], 'eve_leader_party': leader['party'], 'eve_price': leader['eve_price'], 'series': series}
dest = ROOT / 'src' / 'data' / f'{cycle}-markets.json'
dest.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(f'{dest.relative_to(ROOT)} : {len(out["races"])} courses figées au {eve}')
