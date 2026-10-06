#!/usr/bin/env python3
"""Résultats de l'élection québécoise du 5 octobre 2026, figés pour le site.

    python3 scripts/build-qc-results-2026.py

Lit l'état public final archivé de la soirée (Fastest Call,
fastest_call/config/calibration/qc-2026-10-05/live-final.json.gz) et écrit
src/data/qc-results-2026.json : sièges par parti (circonscriptions appelées),
vote populaire, appels d'ensemble datés, et la projection d'avant-scrutin pour
comparaison. Résultats PRÉLIMINAIRES tant que le DGEQ n'a pas validé.
"""
import collections, gzip, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = Path.home() / "Code/votescope-soiree-qc/fastest_call/config/calibration/qc-2026-10-05"
live = json.loads(gzip.open(ARCHIVE / "live-final.json.gz").read())
national = json.loads((ARCHIVE / "national_calls.json").read_text()).get("calls", [])
proj = json.loads((ROOT / "web_data/quebec/latest.json").read_text())["parties"]

calls = {c["riding_id"]: c["party_code"] for c in live["calls"]}
votes = collections.Counter()
for r in live["results"]:
    for c in r["candidates"]:
        votes[c["party_code"]] += c["votes"]
total = sum(votes.values())
seats = collections.Counter(calls.values())
parties = []
for p in proj:
    code = p["party"]
    parties.append({"party": code, "seats": seats.get(code, 0), "vote_pct": round(100 * votes[code] / total, 1),
                    "seats_projected": p["seats_projected"], "vote_projected": p["vote_mean"]})
parties.sort(key=lambda x: (-x["seats"], -x["vote_pct"]))
out = {
    "election": "qc_2026", "date": "2026-10-05", "status": "preliminary",
    "source": "Élections Québec (résultats préliminaires), appels Vote-Scope",
    "ridings_called": len(calls), "total_seats": 127, "majority": 64,
    "ballots": total, "data_as_of": live["source"]["source_updated_at"],
    "winner": parties[0]["party"], "government": "minority" if parties[0]["seats"] < 64 else "majority",
    "national_calls": national, "parties": parties,
}
dest = ROOT / "src/data/qc-results-2026.json"
dest.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"→ {dest.relative_to(ROOT)} : {len(calls)} appels, " + ", ".join(f"{p['party']} {p['seats']}" for p in parties))
