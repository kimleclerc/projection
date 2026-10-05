#!/usr/bin/env python3
"""Données statiques de la soirée québécoise, par circonscription (carte 2026).

    python3 scripts/build-qc-live-ridings.py

Écrit src/data/qc-live-ridings.json :
  holder      parti qui détient la circonscription à la dissolution (député
              sortant ; indépendant → parti gagnant en 2022), pour « gain » ;
  mna         nom du député sortant et son genre (« Député·e de … »), pour
              « réélu·e » ;
  gender      genre des candidats 2026 par parti (baromètre des candidatures),
              pour accorder « élu / élue ».
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENGINE = Path.home() / "Code" / "votescope-nightly"
members = json.loads((ROOT / "web_data/quebec/members.json").read_text(encoding="utf-8"))
ridings = json.loads((ROOT / "web_data/quebec/ridings.json").read_text(encoding="utf-8"))["ridings"]

gender = {}
with (ENGINE / "data/equity/qc_candidate_gender.csv").open(encoding="utf-8") as fh:
    for r in csv.DictReader(fh):
        if r["election_cycle"] == "qc_2026" and r["gender"] in ("femme", "homme"):
            gender.setdefault(r["riding_id"], {})[r["party"]] = "f" if r["gender"] == "femme" else "m"

out = {}
for r in ridings:
    rid = r["riding_id"]
    m = members.get(rid) or {}
    w22 = (r.get("baseline_result") or {}).get("winner")
    party = m.get("party_current")
    holder = party if party and party not in ("qc_ind", "ind", "vacant") else w22
    title = (m.get("function_title") or "").lower()
    out[rid] = {
        "holder": holder,
        "mna": {"name": m.get("mp_name"), "last": m.get("last_name"), "first": m.get("first_name"),
                "g": "f" if title.startswith("députée") else "m" if title.startswith("député") else None} if m.get("mp_name") else None,
        "gender": gender.get(rid, {}),
    }
dest = ROOT / "src/data/qc-live-ridings.json"
dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"→ {dest.relative_to(ROOT)} : {len(out)} circonscriptions, "
      f"{sum(1 for v in out.values() if v['mna'])} sortants, {sum(len(v['gender']) for v in out.values())} genres")
