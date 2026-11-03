/**
 * Partager nos trois chiffres (Chambre, Sénat, gouverneurs) depuis le bureau US :
 * texte prêt à coller, feuille de partage du téléphone, image en trois formats.
 * Le texte et l'image viennent de usTrio (data/us-live) : rien n'est calculé ici.
 */
import { useEffect, useState } from 'preact/hooks';

type Lang = 'fr' | 'en' | 'es';
interface Props { lang: Lang; text: string; url: string; image: string; runDate: string }

const T = {
  fr: { title: 'Partager nos trois chiffres', share: 'Partager', copy: 'Copier le texte', copied: 'Copié', image: 'Image :', wide: 'Paysage', square: 'Carré', story: 'Story' },
  en: { title: 'Share our three numbers', share: 'Share', copy: 'Copy the text', copied: 'Copied', image: 'Image:', wide: 'Landscape', square: 'Square', story: 'Story' },
  es: { title: 'Compartir nuestras tres cifras', share: 'Compartir', copy: 'Copiar el texto', copied: 'Copiado', image: 'Imagen:', wide: 'Horizontal', square: 'Cuadrada', story: 'Story' },
};

export default function UsTrioShare({ lang, text, url, image, runDate }: Props) {
  const t = T[lang];
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCanShare(typeof navigator.share === 'function'); }, []);
  const full = `${text} ${url}`;
  const v = `?v=${runDate}`;
  const src = (suffix: string) => image.replace(/\.png$/, `${suffix}.png`) + v;

  const copy = async () => {
    try { await navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* le texte reste sélectionnable */ }
  };
  const share = async () => {
    try { await navigator.share({ text, url }); } catch { /* annulé */ }
  };
  const track = { 'data-analytics-event': 'share_click', 'data-analytics-kind': 'trio', 'data-analytics-election': 'us-midterms' };

  return (
    <aside class="ust" aria-labelledby="ust-h">
      <h2 id="ust-h" class="ust-h">{t.title}</h2>
      <p class="ust-text">{full}</p>
      <div class="ust-row">
        {canShare && <button type="button" class="vs-btn" onClick={share} {...track}>{t.share}</button>}
        <button type="button" class="vs-btn-secondary" onClick={copy} aria-live="polite" {...track}>{copied ? t.copied : t.copy}</button>
        <span class="ust-img">{t.image}{' '}
          <a href={src('')} download={`vote-scope-midterms-${lang}.png`} {...track}>{t.wide}</a>{' · '}
          <a href={src('-carre')} download={`vote-scope-midterms-${lang}-square.png`} {...track}>{t.square}</a>{' · '}
          <a href={src('-story')} download={`vote-scope-midterms-${lang}-story.png`} {...track}>{t.story}</a>
        </span>
      </div>
    </aside>
  );
}
