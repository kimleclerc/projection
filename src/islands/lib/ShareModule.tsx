/**
 * Télécharger l'image d'un module (carte, projection, graphique, scénario).
 *
 * En 2026, on publie l'IMAGE, pas un lien : les algorithmes favorisent les
 * publications avec image, et chacun veut la sienne. Donc : un clic, une image
 * prête à publier, en trois formats — paysage (X, Facebook), carré (Instagram),
 * story (Instagram, TikTok). Sur téléphone, « Partager l'image » ouvre la feuille
 * de partage avec le fichier joint.
 *
 * Les images fixes sont fabriquées au build (/og/share/…) ; celle d'un scénario
 * est dessinée dans le navigateur (voir LIVE_IMAGES dans lib/share/elections).
 */
import { useEffect, useState } from 'preact/hooks';
import { LIVE_IMAGES, shareImage, type ShareFormat } from '../../lib/share/elections';

type Lang = 'fr' | 'en' | 'es';
interface Props {
  lang: Lang;
  kind: 'map' | 'projection' | 'chart' | 'scenario';
  election: string;   // clé de SHARE_ELECTIONS (us-house, federal…)
  runDate: string;    // date du calcul : l'image change avec lui
  sim?: string;       // état du scénario (?sim=) pour un simulateur
}

const T = {
  fr: { get: 'Télécharger', share: 'Partager l’image', wide: 'Paysage', square: 'Carré', story: 'Story', busy: 'Image en cours…', what: { map: 'cette carte', projection: 'cette projection', chart: 'ce graphique', scenario: 'mon scénario' }, hint: { wide: 'X, Facebook', square: 'Instagram', story: 'Instagram, TikTok' } },
  en: { get: 'Download', share: 'Share image', wide: 'Landscape', square: 'Square', story: 'Story', busy: 'Drawing…', what: { map: 'this map', projection: 'this forecast', chart: 'this chart', scenario: 'my scenario' }, hint: { wide: 'X, Facebook', square: 'Instagram', story: 'Instagram, TikTok' } },
  es: { get: 'Descargar', share: 'Compartir la imagen', wide: 'Horizontal', square: 'Cuadrada', story: 'Story', busy: 'Generando…', what: { map: 'este mapa', projection: 'esta proyección', chart: 'este gráfico', scenario: 'mi escenario' }, hint: { wide: 'X, Facebook', square: 'Instagram', story: 'Instagram, TikTok' } },
};
const FORMATS: ShareFormat[] = ['wide', 'square', 'story'];

export default function ShareModule({ lang, kind, election, runDate, sim }: Props) {
  const t = T[lang];
  const [canShareFile, setCanShareFile] = useState(false);
  const [busy, setBusy] = useState<'' | ShareFormat | 'share'>('');
  useEffect(() => {
    try {
      const probe = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' });
      setCanShareFile(typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }));
    } catch { setCanShareFile(false); }
  }, []);

  const v = runDate.replace(/[^0-9-]/g, '');
  const local = kind === 'scenario' && !LIVE_IMAGES;
  const name = (f: ShareFormat) => `vote-scope-${election}-${kind}-${lang}${f === 'wide' ? '' : `-${f}`}.png`;
  const track = { 'data-analytics-event': 'share_click', 'data-analytics-kind': kind, 'data-analytics-election': election };

  /** L'image en fichier : dessinée ici (scénario) ou téléchargée (images fixes). */
  const blobOf = async (f: ShareFormat): Promise<Blob> => {
    if (local && sim) {
      const { renderScenarioPng } = await import('../../lib/share/render-client');
      return renderScenarioPng(f, election, lang, sim);
    }
    const r = await fetch(shareImage(kind, election, lang, f, { v, sim }));
    if (!r.ok) throw new Error(String(r.status));
    return r.blob();
  };

  const download = async (f: ShareFormat) => {
    if (busy) return;
    setBusy(f);
    try {
      const blob = await blobOf(f);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name(f);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch { /* réseau ou navigateur : rien à faire de plus */ }
    setBusy('');
  };

  // Téléphone : la feuille de partage avec l'image carrée jointe (format des fils).
  const shareFile = async () => {
    if (busy) return;
    setBusy('share');
    try {
      const blob = await blobOf('square');
      await navigator.share({ files: [new File([blob], name('square'), { type: 'image/png' })] });
    } catch { /* annulé */ }
    setBusy('');
  };

  return (
    <div class="share-module" role="group" aria-label={`${t.get} ${t.what[kind]}`}>
      <span class="share-label">{t.get} {t.what[kind]}</span>
      {FORMATS.map((f) => (
        <button type="button" class="vs-link share-item" title={t.hint[f]} onClick={() => download(f)} {...track} data-analytics-target={`png-${f}`}>
          {busy === f ? t.busy : t[f]}
        </button>
      ))}
      {canShareFile && (
        <button type="button" class="vs-btn-secondary share-native" onClick={shareFile} {...track} data-analytics-target="native-file">
          {busy === 'share' ? t.busy : t.share}
        </button>
      )}
    </div>
  );
}
