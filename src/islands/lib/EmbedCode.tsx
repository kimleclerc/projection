import { useEffect, useState } from 'preact/hooks';
import { injectStyles } from './CopyLink';

/* EmbedCode — bouton discret « Intégrer » à côté de CopyLink.
 *
 * Copie un extrait <iframe> pointant vers la page embed du module, en
 * reprenant la query string courante (l'état posé par urlState voyage donc
 * dans l'iframe). Même style .copy-link que CopyLink (feuille injectée là-bas).
 */

interface Props {
  locale: 'fr' | 'en' | 'es';
  /** Chemin de la page embed du module, ex. /fr/embed/lame-duck */
  embedPath: string;
  /** Hauteur suggérée de l'iframe (px). */
  height?: number;
}

const LABELS = {
  embed: { fr: 'Intégrer', en: 'Embed', es: 'Insertar' },
  copied: { fr: 'Code copié', en: 'Code copied', es: 'Código copiado' },
  title: { fr: 'Module Vote-Scope', en: 'Vote-Scope module', es: 'Módulo Vote-Scope' },
} as const;

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export default function EmbedCode({ locale, embedPath, height = 560 }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    injectStyles();
  }, []);

  const onClick = async () => {
    // Origin courant (prod, préversion Cloudflare ou preview local) + état courant.
    const src = `${location.origin}${embedPath}${location.search}`;
    const snippet = `<iframe src="${src}" width="100%" height="${height}" style="border:0" loading="lazy" title="${LABELS.title[locale]}"></iframe>`;
    await copyText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      class={`copy-link${copied ? ' is-copied' : ''}`}
      onClick={onClick}
      aria-live="polite"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
      {copied ? LABELS.copied[locale] : LABELS.embed[locale]}
    </button>
  );
}
