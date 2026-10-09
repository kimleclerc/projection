"""Archive des résultats officiels par circonscription pour les fiches du site.

Lit l'instantané final de la soirée électorale (résultats d'Élections Québec relevés par
le collecteur) et écrit src/data/<cycle>-ridings.json : candidats, voix, pourcentages,
participation, gagnant et marge, avec la source et l'heure de relevé.

    python3 scripts/archive-riding-results.py qc-2026 <live-final.json.gz> [--status preliminary|validated]

À relancer avec le fichier des résultats validés quand le directeur général des élections
les publie (statut « validated »).
"""
import gzip, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    cycle, src = sys.argv[1], Path(sys.argv[2]).expanduser()
    status = sys.argv[sys.argv.index('--status') + 1] if '--status' in sys.argv else 'preliminary'
    doc = json.load(gzip.open(src) if src.suffix == '.gz' else open(src))
    out = {
        'meta': {
            'cycle': cycle,
            'election_date': doc.get('event', {}).get('election_date') if isinstance(doc.get('event'), dict) else None,
            'status': status,
            'source_url': doc['source']['url'],
            'source_updated_at': doc['source'].get('source_updated_at'),
            'fetched_at': doc['source'].get('fetched_at'),
        },
        'ridings': {},
    }
    for r in doc['results']:
        cands = sorted(r['candidates'], key=lambda c: -c['votes'])
        if not cands:
            continue
        top, second = cands[0], (cands[1] if len(cands) > 1 else None)
        out['ridings'][r['riding_id']] = {
            'registered': r.get('registered_electors'),
            'ballots': r.get('ballots_counted'),
            'polls_reported': r.get('polls', {}).get('reported'),
            'polls_total': r.get('polls', {}).get('total'),
            'winner': top['party_code'],
            'winner_name': top['candidate_name'],
            'margin_pct': round(top['vote_pct'] - (second['vote_pct'] if second else 0), 2),
            'candidates': [
                {'name': c['candidate_name'], 'party': c['party_code'], 'votes': c['votes'], 'pct': c['vote_pct']}
                for c in cands
            ],
        }
    dest = ROOT / 'src' / 'data' / f'{cycle}-ridings.json'
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    print(f"{dest.relative_to(ROOT)} : {len(out['ridings'])} circonscriptions, statut {status}")


if __name__ == '__main__':
    main()
