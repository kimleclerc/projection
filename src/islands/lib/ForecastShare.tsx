import { useEffect, useState } from 'preact/hooks';
import CopyLink, { injectStyles } from './CopyLink';

interface Props {
  locale: 'fr' | 'en' | 'es';
  cardPath: string;
  title: string;
  shareVersion: string;
}

const LABELS = {
  png: { fr: 'Télécharger PNG', en: 'Download PNG', es: 'Descargar PNG' },
  share: { fr: 'Partager', en: 'Share', es: 'Compartir' },
  shared: { fr: 'Partagé', en: 'Shared', es: 'Compartido' },
  x: { fr: 'Publier sur X', en: 'Post on X', es: 'Publicar en X' },
} as const;

export default function ForecastShare({ locale, cardPath, title, shareVersion }: Props) {
  const [canShare, setCanShare] = useState(false);
  const [shared, setShared] = useState(false);
  const cardKey = cardPath.split('/').filter(Boolean).at(-2) ?? 'forecast';
  const shareToken = shareVersion.replace(/\D/g, '');

  const getShareUrl = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set('vs', shareToken);
    url.hash = 'forecast';
    return url.toString();
  };

  // Lien d'intention X : titre + lien + « via @kimleclerc ». Construit au clic pour garder l'URL courante.
  const postOnX = (event: MouseEvent) => {
    event.preventDefault();
    const intent = new URL('https://x.com/intent/post');
    intent.searchParams.set('text', title);
    intent.searchParams.set('url', getShareUrl());
    intent.searchParams.set('via', 'kimleclerc');
    window.open(intent.toString(), '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    injectStyles();
    setCanShare(typeof navigator.share === 'function');

    if (!document.getElementById('forecast-share-style')) {
      const style = document.createElement('style');
      style.id = 'forecast-share-style';
      style.textContent = `
.forecast-share { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:14px; }
.forecast-share .copy-link { min-height:32px; text-decoration:none; }
`;
      document.head.appendChild(style);
    }
  }, []);

  const share = async () => {
    try {
      await navigator.share({ title, url: getShareUrl() });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') throw error;
    }
  };

  return (
    <div class="forecast-share" aria-label={LABELS.share[locale]}>
      <CopyLink locale={locale} anchor="forecast" params={{ vs: shareToken }} />
      <a class="copy-link" href={cardPath} download={`vote-scope-${cardKey}-${locale}.png`}>
        ↓ {LABELS.png[locale]}
      </a>
      <a class="copy-link" href="https://x.com/kimleclerc" onClick={postOnX} rel="noopener">
        𝕏 {LABELS.x[locale]}
      </a>
      {canShare && (
        <button type="button" class={`copy-link${shared ? ' is-copied' : ''}`} onClick={share} aria-live="polite">
          {shared ? LABELS.shared[locale] : LABELS.share[locale]}
        </button>
      )}
    </div>
  );
}
