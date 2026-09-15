/** Validate built social image links, PNG dimensions, and live index routing. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root = resolve(process.argv[2] || 'dist');
let pages = 0;
const images = new Set();
const errors = [];
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, item.name);
    if (item.isDirectory()) { walk(file); continue; }
    if (!item.name.endsWith('.html')) continue;
    const html = readFileSync(file, 'utf8');
    const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
    const content = key => {
      const tag = tags.find(t => new RegExp(`(?:property|name)=["']${key}["']`).test(t));
      return tag?.match(/content=["']([^"']*)["']/)?.[1]?.replaceAll('&amp;', '&');
    };
    const og = content('og:image');
    if (!og) continue;
    pages++;
    if (content('twitter:image') !== og) errors.push(`${file}: OG/Twitter disagree`);
    const url = new URL(og);
    if (url.hostname !== 'vote-scope.com') continue;
    if (!url.searchParams.get('v')) errors.push(`${file}: image URL not versioned`);
    const image = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!image.startsWith(root + '/')) throw new Error('Invalid image path');
    if (!existsSync(image)) { errors.push(`${file}: missing ${url.pathname}`); continue; }
    if (/\/(?:canada|us)\/indexes\/(canada-goose|lame-duck)\/index.html$/.test(file)
        && !url.pathname.startsWith('/og/indexes/')) errors.push(`${file}: static index card`);
    images.add(image);
  }
}
walk(root);
for (const file of images) {
  const bytes = readFileSync(file);
  if (file.endsWith('.png') && (bytes.length < 24 || bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a'
      || bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630))
    errors.push(`${file}: expected valid 1200x630 PNG`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OG: ${pages} pages checked, ${images.size} images valid`);
