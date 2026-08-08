/**
 * Post-build: copies public assets and web_data into dist/ so Cloudflare Pages
 * serves the modern Astro site from a single static output directory.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ROOT  = resolve(import.meta.dirname, '..');
const DIST  = join(ROOT, 'dist');
let skippedDataless = 0;

function copyDirSync(src, dst) {
  if (!existsSync(dst)) mkdirSync(dst, { recursive: true });

  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;

    const source = join(src, entry.name);
    const target = join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(source, target);
      continue;
    }

    if (entry.isFile()) {
      const sourceStat = statSync(source);
      if (sourceStat.size > 0 && sourceStat.blocks === 0) {
        skippedDataless += 1;
        continue;
      }
      const currentSize = existsSync(target) ? statSync(target).size : -1;
      const nextSize = sourceStat.size;
      if (nextSize === 0) continue;
      if (currentSize === nextSize) continue;
      copyFileSync(source, target);
    }
  }
}

// Legacy root HTML/assets stay in the repository as reference only. The modern
// Astro site owns dist/, so do not overwrite generated routes from root files.
console.log('✓ Skipped legacy root files');

// Public assets that should ship with both modern and legacy pages. Do not let
// Astro copy public/web_data through its symlink; web_data is handled below.
const publicAssetDirs = ['js', 'og'];
for (const dir of publicAssetDirs) {
  const src = join(ROOT, 'public', dir);
  const dst = join(DIST, dir);
  if (existsSync(src)) {
    copyDirSync(src, dst);
    console.log(`✓ Copied public/${dir}/ → dist/${dir}/`);
  }
}

// Public data needed by the modern Astro pages. Legacy HTML directories remain
// local reference archives and are intentionally excluded from dist/.
const assetDirs = ['web_data'];
for (const dir of assetDirs) {
  const src = join(ROOT, dir);
  const dst = join(DIST, dir);
  if (existsSync(src)) {
    copyDirSync(src, dst);
    console.log(`✓ Copied ${dir}/ → dist/${dir}/`);
  }
}
if (skippedDataless > 0) {
  console.warn(`⚠ Skipped ${skippedDataless} dataless local file(s); hydrate them before build if they are required publicly.`);
}

// Cloudflare routing files do not have public extensions.
for (const f of ['_redirects', '_headers']) {
  const src = join(ROOT, f);
  if (existsSync(src)) {
    copyFileSync(src, join(DIST, f));
    console.log(`✓ Copied ${f}`);
  }
}

// Root-level files crawlers, PWAs, and OS launchers expect at /<file>.
const rootFiles = [
  'robots.txt',
  'ai.txt',
  'e218854fe8e84c5d01aba2961670c496.txt',  // IndexNow verification key
  'manifest.json',
  'apple-touch-icon.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'icon-192.png',
  'icon-512.png',
];
for (const f of rootFiles) {
  const src = join(ROOT, f);
  if (existsSync(src)) {
    copyFileSync(src, join(DIST, f));
    console.log(`✓ Copied ${f}`);
  }
}
console.log('✓ Legacy assets copied. Build complete.');
