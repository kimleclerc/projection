import { useEffect, useState } from 'preact/hooks';
import CopyLink from './lib/CopyLink';
import type { Format } from '../lib/share/cards';
import type { Locale } from '../lib/fr-pres';

interface Props {
  locale: Locale;
  anchor: string;
  render: (format: Format) => Promise<Blob>;
  disabled?: boolean;
}
const T = {
  fr: { image: 'Télécharger ce visuel', wide: 'Paysage', square: 'Carré', story: 'Story', busy: 'Création…', share: 'Partager l’image', error: 'L’image n’a pas pu être créée. Réessayez ou copiez le lien.' },
  en: { image: 'Download this visual', wide: 'Landscape', square: 'Square', story: 'Story', busy: 'Drawing…', share: 'Share image', error: 'The image could not be created. Try again or copy the link.' },
  es: { image: 'Descargar este gráfico', wide: 'Horizontal', square: 'Cuadrada', story: 'Story', busy: 'Generando…', share: 'Compartir imagen', error: 'No se pudo crear la imagen. Inténtelo de nuevo o copie el enlace.' },
};
const FORMATS: Format[] = ['wide', 'square', 'story'];

export default function FranceShareTools({ locale, anchor, render, disabled = false }: Props) {
  const t = T[locale];
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => {
    try { setNative(!!navigator.canShare?.({ files: [new File(['x'], 'x.png', { type: 'image/png' })] })); }
    catch { setNative(false); }
  }, []);
  const output = async (fmt: Format, share = false) => {
    if (busy || disabled) return;
    setBusy(share ? 'share' : fmt); setError(false);
    try {
      const blob = await render(fmt);
      const filename = `vote-scope-${anchor}-${locale}-${fmt}.png`;
      if (share) await navigator.share({ files: [new File([blob], filename, { type: 'image/png' })] });
      else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = filename; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 5000);
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) { console.error('France image export failed', e); setError(true); }
    }
    finally { setBusy(''); }
  };
  return <div class="fr-module-share">
    <CopyLink locale={locale} anchor={anchor} />
    <div class="share-module" role="group" aria-label={t.image} aria-busy={!!busy}>
      <span class="share-label">{t.image}</span>
      {FORMATS.map(fmt => <button key={fmt} type="button" class="vs-link share-item" disabled={disabled || !!busy} onClick={() => output(fmt)} data-analytics-event="share_click" data-analytics-kind={anchor} data-analytics-election="france-presidential" data-analytics-target={`png-${fmt}`}>{busy === fmt ? t.busy : t[fmt]}</button>)}
      {native && <button type="button" class="vs-btn-secondary share-native" disabled={disabled || !!busy} onClick={() => output('square', true)}>{busy === 'share' ? t.busy : t.share}</button>}
    </div>
    <span role="status" class="fr-race-note">{error ? t.error : ''}</span>
  </div>;
}
