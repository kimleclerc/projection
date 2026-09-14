/**
 * chart-theme — jetons de thème pour les îlots Plotly.
 *
 * Plotly ne lit pas les variables CSS : il faut lui passer des couleurs
 * résolues. Les figer en clair (le motif des premiers graphiques du site)
 * donne en mode sombre des filets blancs autour de chaque barre et des
 * étiquettes sombres sur fond sombre. On résout donc les jetons au moment du
 * rendu, et on redessine quand le thème change.
 */

export interface ChartTheme {
  /** Axes et ticks — var(--ink-3). */
  axis: string;
  /** Grille — var(--rule). */
  grid: string;
  /** Fond de carte, pour les filets de séparation — var(--card). */
  surface: string;
  /** Texte porté par le graphique — var(--ink-2). */
  ink: string;
}

const FALLBACK: ChartTheme = {
  axis: '#6a635a', grid: '#d8d3c8', surface: '#fffdf6', ink: '#3a3530',
};

export function readChartTheme(): ChartTheme {
  if (typeof document === 'undefined') return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    axis: pick('--ink-3', FALLBACK.axis),
    grid: pick('--rule', FALLBACK.grid),
    surface: pick('--card', FALLBACK.surface),
    ink: pick('--ink-2', FALLBACK.ink),
  };
}

/**
 * Appelle `cb` quand le thème bascule — par le sélecteur du site
 * (`data-theme` sur <html>) ou par la préférence système.
 * Retourne la fonction de désabonnement.
 */
export function onThemeChange(cb: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme'],
  });
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener('change', cb);
  return () => { obs.disconnect(); mq?.removeEventListener('change', cb); };
}

/**
 * Noir ou blanc, selon ce qui se lit sur `hex` — pour une étiquette POSÉE sur
 * un aplat opaque (la couleur d'un parti). Luminance relative WCAG.
 */
export function readableOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#ffffff';
  const n = parseInt(m[1], 16);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin((n >> 16) & 255)
          + 0.7152 * lin((n >> 8) & 255)
          + 0.0722 * lin(n & 255);
  // Contraste contre blanc vs contre noir : on garde le meilleur.
  return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.05) ? '#ffffff' : '#111111';
}
