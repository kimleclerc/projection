#!/usr/bin/env python3
"""Generate branded OG cards for the Canada Goose Index and CUSMA Showdown.

Reads live values from web_data/ and writes 1200x630 PNGs to public/og/.
Re-run after a data refresh to keep the social cards current:

    python scripts/make-og.py

macOS system fonts (Georgia / Menlo) are used; adjust paths for other OSes.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OG = (1200, 630)
BG = (246, 243, 236); INK = (26, 24, 20); INK3 = (107, 102, 92)
BLUE = (47, 111, 176); RED = (201, 64, 64); AMBER = (200, 160, 48); GOOSE = (40, 36, 31)
GEO_B = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
MENLO = "/System/Library/Fonts/Menlo.ttc"


def F(p, s, idx=None):
    return ImageFont.truetype(p, s, index=idx) if idx is not None else ImageFont.truetype(p, s)


def flock(d):
    for cx, cy, sc in [(940, 150, 1.0), (1020, 120, 0.85), (1090, 165, 0.8), (880, 205, 0.7), (1010, 235, 0.65), (1110, 250, 0.6)]:
        w = int(4 * sc) + 2; a = 26 * sc; drop = 13 * sc
        d.line([(cx - a, cy), (cx, cy - drop), (cx + a, cy)], fill=GOOSE, width=w)
        d.line([(cx, cy - drop), (cx + a * 0.5, cy - drop * 0.55)], fill=GOOSE, width=max(1, w - 1))


def gapbar(d, gap):
    x0, x1, y = 712, 1136, 250; h = 26; cxc = (x0 + x1) / 2
    X = lambda g: cxc + (g / 100) * ((x1 - x0) / 2)
    for a, b, c in [(-100, -40, RED), (-40, -15, (190, 90, 90)), (-15, 15, AMBER), (15, 40, BLUE), (40, 100, (47, 90, 150))]:
        d.rectangle([X(a), y, X(b), y + h], fill=tuple(int(v * 0.35 + 246 * 0.65) for v in c))
    knot = X(max(-100, min(100, gap)))
    d.rectangle([min(cxc, knot), y, max(cxc, knot), y + h], fill=BLUE if gap > 0 else RED)
    d.line([cxc, y - 10, cxc, y + h + 10], fill=INK, width=2)
    d.ellipse([knot - 13, y + h / 2 - 13, knot + 13, y + h / 2 + 13], fill=BLUE if gap > 0 else RED, outline=BG, width=4)
    d.text((x0, y - 30), "U.S.", font=F(MENLO, 20, 0), fill=RED)
    bb = d.textbbox((0, 0), "Canada", font=F(MENLO, 20, 0))
    d.text((x1 - (bb[2] - bb[0]), y - 30), "Canada", font=F(MENLO, 20, 0), fill=BLUE)


def card(path, eyebrow, title, big, color, sub, accent, kind, gap=None):
    img = Image.new("RGB", OG, BG); d = ImageDraw.Draw(img)
    d.rectangle([0, OG[1] - 14, OG[0], OG[1]], fill=accent)
    d.text((70, 68), eyebrow, font=F(MENLO, 25, 0), fill=INK3)
    d.text((68, 136), title, font=F(GEO_B, 74), fill=INK)
    d.text((70, 250), big, font=F(GEO_B, 158), fill=color)
    bb = d.textbbox((70, 250), big, font=F(GEO_B, 158))
    d.text((76, bb[3] - 8), sub, font=F(GEO_B, 42), fill=color)
    d.text((70, OG[1] - 72), "Vote-Scope", font=F(GEO_B, 34), fill=INK)
    flock(d) if kind == "goose" else gapbar(d, gap)
    img.save(path); print("wrote", path)


def main():
    g = json.loads((ROOT / "web_data" / "ca-canada-goose" / "latest.json").read_text())["cgi"]
    s = json.loads((ROOT / "web_data" / "cusma-showdown" / "latest.json").read_text())["showdown"]
    gap = s["gap"]; gaps = f"+{gap}" if gap > 0 else str(gap); col = BLUE if gap > 0 else RED
    out = ROOT / "public" / "og"; out.mkdir(parents=True, exist_ok=True)
    card(out / "canada-goose.png", "VOTE-SCOPE · CANADA · LIVE INSTRUMENT", "The Canada Goose Index.",
         str(int(round(g["score"]))), BLUE, g["label_en"], BLUE, "goose")
    card(out / "cusma-showdown.png", "VOTE-SCOPE · CUSMA · LIVE DUEL", "Goose vs Lame Duck.",
         gaps, col, s["label_en"], col, "duel", gap=gap)


if __name__ == "__main__":
    main()
