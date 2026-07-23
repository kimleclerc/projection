import { useEffect, useState } from 'preact/hooks';

/* CopyLink — bouton discret « Copier le lien » pour les îlots partageables.
 *
 * Copie l'URL courante (avec les paramètres posés par urlState) et une ancre
 * optionnelle pour que le lien ramène directement au module. Libellés
 * trilingues fr/en/es, retour visuel « copié » temporaire.
 */

interface Props {
  locale: 'fr' | 'en' | 'es';
  /** Ancre (#id) ajoutée à l'URL copiée pour cibler le module. */
  anchor?: string;
}

const LABELS = {
  copy: { fr: 'Copier le lien', en: 'Copy link', es: 'Copiar enlace' },
  copied: { fr: 'Lien copié', en: 'Link copied', es: 'Enlace copiado' },
} as const;

export function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById('cl-style')) return;
  const s = document.createElement('style');
  s.id = 'cl-style';
  s.textContent = `
.copy-link { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border: 1px solid var(--rule, #ddd); border-radius: 999px; background: transparent; font-family: var(--mono, ui-monospace, monospace); font-size: 11px; letter-spacing: .04em; color: var(--ink-3, #888); cursor: pointer; transition: color .12s, border-color .12s; }
.copy-link:hover { color: var(--ink, #1a1a1a); border-color: var(--ink-3, #888); }
.copy-link.is-copied { color: var(--blue, #2b6cb0); border-color: currentColor; }
.copy-link svg { flex: none; }
`;
  document.head.appendChild(s);
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Repli hors contexte sécurisé / navigateurs anciens.
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

export default function CopyLink({ locale, anchor }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    injectStyles();
  }, []);

  const onClick = async () => {
    const url = new URL(window.location.href);
    if (anchor) url.hash = anchor;
    await copyText(url.toString());
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
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      {copied ? LABELS.copied[locale] : LABELS.copy[locale]}
    </button>
  );
}
