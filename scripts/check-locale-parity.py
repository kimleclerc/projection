#!/usr/bin/env python3
"""Locale parity check on dist/.

Collects every internal href from the nav + footer of the EN, FR and ES home
pages (plus a few hub pages) and verifies each target exists in dist/. This is
the check that would have caught /es/indexes/ 404ing into the EN home.

Usage: python3 scripts/check-locale-parity.py  (exit 1 if anything is missing)
"""

import re
import sys
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / 'dist'

SEED_PAGES = [
    'en/index.html', 'fr/index.html', 'es/index.html',
    'en/indexes/index.html', 'fr/indexes/index.html', 'es/indexes/index.html',
    'en/sports/wc2026/index.html', 'fr/sports/wc2026/index.html', 'es/sports/wc2026/index.html',
]

HREF_RE = re.compile(r'href="(/[^"#?]*)"')


def target_exists(href: str) -> bool:
    p = href.strip('/')
    if not p:
        return True
    cand = DIST / p
    return (
        (cand / 'index.html').exists()
        or cand.exists()
        or (DIST / f'{p}.html').exists()
    )


def main() -> int:
    missing: dict[str, set[str]] = {}
    for seed in SEED_PAGES:
        f = DIST / seed
        if not f.exists():
            print(f'SEED MANQUANTE: {seed}')
            missing.setdefault(seed, set())
            continue
        html = f.read_text(encoding='utf-8', errors='replace')
        for href in set(HREF_RE.findall(html)):
            if href.startswith('/web_data/') or href.startswith('/og/'):
                continue
            if not target_exists(href):
                missing.setdefault(href, set()).add(seed)

    if not missing:
        print(f'OK — parité des locales : tous les liens internes de {len(SEED_PAGES)} pages sources existent dans dist/.')
        return 0
    print(f'{len(missing)} lien(s) interne(s) cassé(s) :')
    for href, seeds in sorted(missing.items()):
        print(f'  {href}  (référencé par : {", ".join(sorted(seeds))})')
    return 1


if __name__ == '__main__':
    sys.exit(main())
