/**
 * Télécharger l'image d'une fiche (circonscription, district) en trois formats.
 * L'image est dessinée dans le navigateur au clic : aucune image n'est stockée
 * par fiche (limite de 20 000 fichiers du site). Même dessin que les autres
 * images de partage (lib/share/cards → ridingCard).
 */
import { useEffect, useState } from 'preact/hooks';
import type { RidingCardInput } from '../lib/share/cards';

type Lang = 'fr' | 'en' | 'es';
type Fmt = 'wide' | 'square' | 'story';
interface Props { lang: Lang; payload: RidingCardInput & { slug: string; jurisdiction: string } }

const T = {
  fr: { get: 'Télécharger l’image', wide: 'Paysage', square: 'Carré', story: 'Story', busy: 'Image en cours…', share: 'Partager l’image' },
  en: { get: 'Download the image', wide: 'Landscape', square: 'Square', story: 'Story', busy: 'Drawing…', share: 'Share image' },
  es: { get: 'Descargar la imagen', wide: 'Horizontal', square: 'Cuadrada', story: 'Story', busy: 'Generando…', share: 'Compartir la imagen' },
};
const FORMATS: Fmt[] = ['wide', 'square', 'story'];

export default function RidingShareButton({ lang, payload }: Props) {
  const t = T[lang];
  const [busy, setBusy] = useState<'' | Fmt | 'share'>('');
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    try {
      const probe = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' });
      setCanShare(typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }));
    } catch { setCanShare(false); }
  }, []);
  const name = (f: Fmt) => `vote-scope-${payload.slug}-${lang}${f === 'wide' ? '' : `-${f}`}.png`;
  const render = async (f: Fmt) => (await import('../lib/share/render-client')).renderRidingPng(f, lang, payload);
  const track = { 'data-analytics-event': 'share_click', 'data-analytics-kind': 'riding', 'data-analytics-election': payload.jurisdiction };

  const download = async (f: Fmt) => {
    if (busy) return;
    setBusy(f);
    try {
      const blob = await render(f);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name(f);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch { /* rien de plus à faire */ }
    setBusy('');
  };
  const share = async () => {
    if (busy) return;
    setBusy('share');
    try {
      const blob = await render('square');
      await navigator.share({ files: [new File([blob], name('square'), { type: 'image/png' })] });
    } catch { /* annulé */ }
    setBusy('');
  };

  return (
    <div class="share-module" role="group" aria-label={t.get}>
      <span class="share-label">{t.get}</span>
      {FORMATS.map((f) => (
        <button type="button" class="vs-link share-item" onClick={() => download(f)} {...track} data-analytics-target={`png-${f}`}>
          {busy === f ? t.busy : t[f]}
        </button>
      ))}
      {canShare && (
        <button type="button" class="vs-btn-secondary share-native" onClick={share} {...track} data-analytics-target="native-file">
          {busy === 'share' ? t.busy : t.share}
        </button>
      )}
    </div>
  );
}
