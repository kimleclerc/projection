/**
 * Image d'un scénario dessinée DANS le navigateur du lecteur (forfait gratuit de
 * Cloudflare : pas assez de calcul pour la dessiner sur le serveur).
 *
 * Même carte que sur le serveur (cards.ts → scenarioCard) : satori met en page et
 * transforme le texte en tracés, le navigateur peint le SVG sur un canevas, qui
 * donne le PNG. Chargé seulement au clic : rien ne pèse sur la page avant.
 */
import type { Lang } from './elections';

const FONTS = [
  ['barlow-latin-500-normal.woff', 'Barlow', 500],
  ['barlow-latin-600-normal.woff', 'Barlow', 600],
  ['barlow-latin-700-normal.woff', 'Barlow', 700],
  ['barlow-condensed-latin-700-normal.woff', 'Barlow Condensed', 700],
] as const;
let yogaPret: Promise<unknown> | null = null;

/** Prépare satori une seule fois (moteur de mise en page + polices). */
async function engine() {
  const [{ default: satori, init }, { default: yogaUrl }] = await Promise.all([
    import('satori/standalone'), import('satori/yoga.wasm?url'),
  ]);
  if (!yogaPret) yogaPret = init(await (await fetch(yogaUrl)).arrayBuffer());
  await yogaPret;
  if (!fontsPret) {
    fontsPret = Promise.all(FONTS.map(([file]) => fetch(`/og-fonts/${file}`).then((r) => r.arrayBuffer())));
  }
  const fonts = await fontsPret;
  return { satori, fonts: FONTS.map(([, name, weight], i) => ({ name, data: fonts[i], weight, style: 'normal' as const })) };
}
let fontsPret: Promise<ArrayBuffer[]> | null = null;

/** Arbre satori → SVG → canevas → PNG. */
async function toPng(tree: unknown, w: number, h: number): Promise<Blob> {
  const { satori, fonts } = await engine();
  const svg = await satori(tree as never, { width: w, height: h, fonts });
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((ok, ko) => canvas.toBlob((b) => (b ? ok(b) : ko(new Error('canvas'))), 'image/png'));
}

export async function renderScenarioPng(fmt: 'wide' | 'square' | 'story', key: string, lang: Lang, sim: string): Promise<Blob> {
  const { scenarioCard, SIZE } = await import('./cards');
  const get = (f: string) => fetch(`/web_data/${key}/${f}`).then((r) => r.json());
  const [doc, geo] = await Promise.all([get('simulator.json'), get('geomap.json')]);
  const { w, h } = SIZE[fmt];
  return toPng(scenarioCard(fmt, { key, lang, doc, geo, sim }), w, h);
}

/** Image d'une fiche de circonscription ou de district, à partir des chiffres de la page. */
export async function renderRidingPng(fmt: 'wide' | 'square' | 'story', lang: Lang, payload: import('./cards').RidingCardInput): Promise<Blob> {
  const { ridingCard, SIZE } = await import('./cards');
  const { w, h } = SIZE[fmt];
  return toPng(ridingCard(fmt, lang, payload), w, h);
}
