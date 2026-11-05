// Fabrique toutes les icônes du site à partir de favicon.svg, la seule source du symbole.
//   node scripts/make-icons.mjs
// favicon.ico contient des PNG en 16, 32 et 48 px. Les icônes d'écran d'accueil ont
// un fond blanc plein et une marge, parce que les systèmes les découpent en carré arrondi.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(resolve(ROOT, 'favicon.svg'), 'utf8');
const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const bare = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
// Le cercle occupe 40 unités sur 44 : la marge ajoutée le ramène à environ 75 % de l'icône.
const padded = (size) => new Resvg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 52 52"><rect x="-4" y="-4" width="52" height="52" fill="#fff"/>${inner}</svg>`,
  { fitTo: { mode: 'width', value: size } },
).render().asPng();

const write = (name, data) => writeFileSync(resolve(ROOT, name), data);
const p16 = bare(16); const p32 = bare(32); const p48 = bare(48);
write('favicon-16x16.png', p16);
write('favicon-32x32.png', p32);
write('apple-touch-icon.png', padded(180));
write('icon-192.png', padded(192));
write('icon-512.png', padded(512));

// ICO : en-tête, une entrée de 16 octets par taille, puis les PNG bout à bout.
const images = [[16, p16], [32, p32], [48, p48]];
const head = Buffer.alloc(6 + 16 * images.length);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(images.length, 4);
let offset = head.length;
images.forEach(([size, png], i) => {
  const at = 6 + 16 * i;
  head[at] = size; head[at + 1] = size;
  head.writeUInt16LE(1, at + 4);
  head.writeUInt16LE(32, at + 6);
  head.writeUInt32LE(png.length, at + 8);
  head.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
write('favicon.ico', Buffer.concat([head, ...images.map(([, png]) => png)]));
console.log('Icônes refaites depuis favicon.svg');
