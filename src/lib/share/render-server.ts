/**
 * Dessin d'une image de partage AU BUILD (satori → SVG, resvg → PNG). Mêmes
 * polices et même dessin (cards.ts) que les images dessinées dans le navigateur.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SIZE, type Format } from './cards';

const font = (f: string) => readFileSync(resolve(process.cwd(), 'public', 'og-fonts', f));
let fonts: Parameters<typeof satori>[1]['fonts'] | null = null;

export async function renderPngServer(tree: unknown, fmt: Format): Promise<Uint8Array> {
  fonts ??= [
    { name: 'Barlow', data: font('barlow-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Barlow', data: font('barlow-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Barlow', data: font('barlow-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Barlow Condensed', data: font('barlow-condensed-latin-700-normal.woff'), weight: 700, style: 'normal' },
  ];
  const { w, h } = SIZE[fmt];
  const svg = await satori(tree as never, { width: w, height: h, fonts });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng());
}
