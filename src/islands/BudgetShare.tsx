/**
 * Partager une édition du budget : texte prêt à coller, feuille de partage du
 * téléphone, publication sur X, image en trois formats, code d'intégration.
 * Le texte et les chiffres viennent de la page : rien n'est calculé ici.
 */
import { useEffect, useState } from 'preact/hooks';
import EmbedCode from './lib/EmbedCode';

type Lang = 'fr' | 'en' | 'es';
interface Props { lang: Lang; text: string; url: string; image: string; version: string; slug: string; embedPath: string }

const T = {
  fr: { title: 'Partager cette analyse', share: 'Partager', copy: 'Copier le texte', copied: 'Copié', x: 'Publier sur X', image: 'Image :', wide: 'Paysage', square: 'Carré', story: 'Story' },
  en: { title: 'Share this analysis', share: 'Share', copy: 'Copy the text', copied: 'Copied', x: 'Post on X', image: 'Image:', wide: 'Landscape', square: 'Square', story: 'Story' },
  es: { title: 'Compartir este análisis', share: 'Compartir', copy: 'Copiar el texto', copied: 'Copiado', x: 'Publicar en X', image: 'Imagen:', wide: 'Horizontal', square: 'Cuadrada', story: 'Story' },
};

export default function BudgetShare({ lang, text, url, image, version, slug, embedPath }: Props) {
  const t = T[lang];
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCanShare(typeof navigator.share === 'function'); }, []);
  const full = `${text} ${url}`;
  const src = (suffix: string) => image.replace(/\.png$/, `${suffix}.png`) + `?v=${version}`;
  const track = { 'data-analytics-event': 'share_click', 'data-analytics-kind': 'budget', 'data-analytics-election': slug };

  const copy = async () => {
    try { await navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* le texte reste sélectionnable */ }
  };
  const share = async () => {
    try { await navigator.share({ text, url }); } catch { /* annulé */ }
  };
  const intent = new URL('https://x.com/intent/post');
  intent.searchParams.set('text', text);
  intent.searchParams.set('url', url);
  intent.searchParams.set('via', 'kimleclerc');

  return (
    <aside class="bshare" aria-labelledby="bshare-h">
      <h2 id="bshare-h" class="bshare-h">{t.title}</h2>
      <p class="bshare-text">{full}</p>
      <div class="bshare-row">
        {canShare && <button type="button" class="vs-btn" onClick={share} {...track}>{t.share}</button>}
        <button type="button" class="vs-btn-secondary" onClick={copy} aria-live="polite" {...track}>{copied ? t.copied : t.copy}</button>
        <a class="vs-btn-secondary" href={intent.toString()} target="_blank" rel="noopener" {...track}>{t.x}</a>
        <EmbedCode locale={lang} embedPath={embedPath} height={520} />
      </div>
      <p class="bshare-img">{t.image}{' '}
        <a class="vs-link" href={src('')} download={`vote-scope-budget-${slug}-${lang}.png`} {...track}>{t.wide}</a>{' · '}
        <a class="vs-link" href={src('-carre')} download={`vote-scope-budget-${slug}-${lang}-square.png`} {...track}>{t.square}</a>{' · '}
        <a class="vs-link" href={src('-story')} download={`vote-scope-budget-${slug}-${lang}-story.png`} {...track}>{t.story}</a>
      </p>
      <style>{`
        .bshare { border-top: 2px solid var(--ink); padding-top: 12px; }
        .bshare-h { margin: 0 0 8px; font-size: 19px; font-weight: 700; }
        .bshare-text { max-width: 72ch; margin: 0 0 12px; font-size: 15px; line-height: 1.5; color: var(--ink-2); }
        .bshare-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .bshare-row .copy-link { min-height: 42px; padding: 9px 16px; border: 2px solid var(--ink); font-size: 15px; font-weight: 600; color: var(--ink); }
        .bshare-img { margin: 12px 0 0; font-size: 14px; color: var(--ink-3); font-weight: 600; }
      `}</style>
    </aside>
  );
}
