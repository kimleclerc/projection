/**
 * Watermarked poll share-card renderer (build-time, satori → SVG → PNG).
 *
 * This is the centerpiece of the polls vertical (cf. project memory
 * votescope-polls-vertical): every shared poll URL resolves to a branded
 * VoteScope topline card — the og:image AND the downloadable share asset.
 *
 * Pure function: caller passes already-localized strings + topline entries,
 * gets back a PNG Buffer. No data fetching here (uniformity / one template).
 *
 * Fonts: satori reads .woff directly (NOT woff2). We feed the static
 * @fontsource .woff files already in node_modules — no vendored binaries.
 */
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// --- brand palette (light card, matches site --paper/--ink) ---------------
const PAPER = '#f5f1e8';
const CARD = '#fffdf6';
const INK = '#1a1814';
const INK_2 = '#3a3530';
const INK_3 = '#6a635a';
const RULE = '#d8d3c8';

const ROOT = process.cwd();
const FONT = (rel: string) => fs.readFileSync(path.join(ROOT, 'node_modules', rel));

const FONTS = [
  { name: 'Newsreader', data: FONT('@fontsource/newsreader/files/newsreader-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Newsreader', data: FONT('@fontsource/newsreader/files/newsreader-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: FONT('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'JetBrains Mono', data: FONT('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
];

// --- tiny hyperscript for satori (React-element-shaped objects) -----------
type Node = { type: string; props: Record<string, unknown> };
function el(
  type: string,
  style: Record<string, unknown>,
  children?: Node | Node[] | string,
): Node {
  return { type, props: { style, children } };
}

export interface CardEntry {
  label: string;
  color: string;
  value: number;
}

export interface PollCardInput {
  eyebrow: string;       // mono kicker, e.g. "SONDEOS · CÁMARA US · 2026"
  title: string;         // serif headline (firm + cycle, or hub title)
  subtitle?: string;     // serif sub line (field dates / sample)
  entries: CardEntry[];  // topline rows (sorted desc by caller)
  footerLeft: string;    // e.g. latest field date / source
  /** Output dimensions. Default 1200×630 (og / X 16:9). */
  width?: number;
  height?: number;
}

/** Render a branded topline card to a PNG Buffer. */
export async function renderPollCard(input: PollCardInput): Promise<Buffer> {
  const W = input.width ?? 1200;
  const H = input.height ?? 630;
  const maxVal = Math.max(1, ...input.entries.map((e) => e.value));

  const barRows = input.entries.map((e) =>
    el('div', { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }, [
      el('div', {
        display: 'flex', width: 220, fontFamily: 'JetBrains Mono', fontSize: 22,
        letterSpacing: '0.06em', textTransform: 'uppercase', color: e.color,
      }, e.label),
      el('div', {
        display: 'flex', flex: 1, height: 34,
        backgroundColor: '#e9e3d6', borderRadius: 6, overflow: 'hidden',
      }, [
        el('div', {
          display: 'flex', width: `${(e.value / maxVal) * 100}%`,
          backgroundColor: e.color, borderRadius: 6,
        }, ''),
      ]),
      el('div', {
        display: 'flex', width: 96, justifyContent: 'flex-end',
        fontFamily: 'Newsreader', fontWeight: 600, fontSize: 44, color: INK,
      }, e.value.toFixed(0)),
    ]),
  );

  const tree = el('div', {
    display: 'flex', flexDirection: 'column', width: W, height: H,
    padding: 56, backgroundColor: PAPER, position: 'relative',
  }, [
    // bordered inner card
    el('div', {
      display: 'flex', flexDirection: 'column', flex: 1,
      backgroundColor: CARD, border: `1px solid ${RULE}`, borderRadius: 14,
      padding: 48, justifyContent: 'space-between',
    }, [
      // header
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, [
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 500,
          fontSize: 22, letterSpacing: '0.14em', color: INK,
        }, 'VOTE·SCOPE'),
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 16,
          letterSpacing: '0.12em', color: INK_3,
        }, input.eyebrow),
      ]),
      // title block
      el('div', { display: 'flex', flexDirection: 'column', marginTop: 8 }, [
        el('div', {
          display: 'flex', fontFamily: 'Newsreader', fontWeight: 600,
          fontSize: 56, lineHeight: 1.05, color: INK, letterSpacing: '-0.01em',
        }, input.title),
        ...(input.subtitle
          ? [el('div', {
              display: 'flex', fontFamily: 'Newsreader', fontSize: 26,
              color: INK_2, marginTop: 10,
            }, input.subtitle)]
          : []),
      ]),
      // bars
      el('div', { display: 'flex', flexDirection: 'column', marginTop: 8 }, barRows),
      // footer
      el('div', {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${RULE}`, paddingTop: 18,
      }, [
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 16, color: INK_3,
        }, input.footerLeft),
        el('div', {
          display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 500,
          fontSize: 18, color: INK, letterSpacing: '0.04em',
        }, 'vote-scope.com'),
      ]),
    ]),
  ]);

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: FONTS,
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } })
    .render()
    .asPng();
  return Buffer.from(png);
}
