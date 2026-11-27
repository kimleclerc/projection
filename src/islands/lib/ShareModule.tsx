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
import type { SimDoc } from '../../lib/mini-sim';
import type { ScenarioDataCardInput } from '../../lib/share/cards';

type Lang = 'fr' | 'en' | 'es';
interface Props {
  lang: Lang;
  kind: 'map' | 'projection' | 'chart' | 'scenario' | 'candidate' | 'province';
  election: string;   // clé de SHARE_ELECTIONS (us-house, federal…)
  runDate?: string;
  sim?: string;
  simDoc?: SimDoc;
  scenario?: ScenarioDataCardInput;
}

const T = {
  fr: { get: 'Télécharger', share: 'Partager l’image', wide: 'Paysage', square: 'Carré', story: 'Story', busy: 'Image en cours…', what: { map: 'cette carte', projection: 'cette projection', chart: 'ce graphique', scenario: 'mon scénario', candidate: 'cette fiche', province: 'cette province' }, hint: { wide: 'X, Facebook', square: 'Instagram', story: 'Instagram, TikTok' } },
  en: { get: 'Download', share: 'Share image', wide: 'Landscape', square: 'Square', story: 'Story', busy: 'Drawing…', what: { map: 'this map', projection: 'this forecast', chart: 'this chart', scenario: 'my scenario', candidate: 'this profile', province: 'this province' }, hint: { wide: 'X, Facebook', square: 'Instagram', story: 'Instagram, TikTok' } },
  es: { get: 'Descargar', share: 'Compartir la imagen', wide: 'Horizontal', square: 'Cuadrada', story: 'Story', busy: 'Generando…', what: { map: 'este mapa', projection: 'esta proyección', chart: 'este gráfico', scenario: 'mi escenario', candidate: 'esta ficha', province: 'esta provincia' }, hint: { wide: 'X, Facebook', square: 'Instagram', story: 'Instagram, TikTok' } },
};
const FORMATS: ShareFormat[] = ['wide', 'square', 'story'];
const feedback = {
  fr: { retry: 'Impossible de créer l’image. Réessayez.', ready: 'L’image est prête. Touchez Partager l’image de nouveau.' },
  en: { retry: 'Could not create the image. Try again.', ready: 'The image is ready. Tap Share image again.' },
  es: { retry: 'No se pudo crear la imagen. Inténtalo de nuevo.', ready: 'La imagen está lista. Pulsa Compartir la imagen de nuevo.' },
};

export default function ShareModule({ lang, kind, election, runDate = '', sim, simDoc, scenario }: Props) {
  const t = T[lang];
  const [canShareFile, setCanShareFile] = useState(false);
  const [busy, setBusy] = useState<'' | ShareFormat | 'share'>('');
  const [error, setError] = useState(false);
  const [ready, setReady] = useState<{ key: string; file: File }>();
  const stateKey = scenario ? JSON.stringify(scenario) : `${election}:${runDate}:${sim ?? ''}`;
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
    if (scenario) {
      const { renderScenarioDataPng } = await import('../../lib/share/render-client');
      return renderScenarioDataPng(f, lang, scenario);
    }
    if (kind === 'scenario' && sim !== undefined && (local || simDoc)) {
      const { renderScenarioPng } = await import('../../lib/share/render-client');
      return renderScenarioPng(f, election, lang, sim, simDoc);
    }
    const r = await fetch(shareImage(kind, election, lang, f, { v, sim }));
    if (!r.ok) throw new Error(String(r.status));
    return r.blob();
  };

  const download = async (f: ShareFormat) => {
    if (busy) return;
    setBusy(f);
    setError(false);
    try {
      const blob = await blobOf(f);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name(f);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch {
      setError(true);
    } finally {
      setBusy('');
    }
  };

  // Téléphone : la feuille de partage avec l'image carrée jointe (format des fils).
  const shareFile = async () => {
    if (busy) return;
    setBusy('share');
    setError(false);
    let file = ready?.key === stateKey ? ready.file : undefined;
    try {
      file ??= new File([await blobOf('square')], name('square'), { type: 'image/png' });
      await navigator.share({ files: [file] });
      setReady(undefined);
    } catch (cause) {
      const errorName = (cause as DOMException).name;
      if (errorName === 'NotAllowedError' && file && ready?.key !== stateKey) setReady({ key: stateKey, file });
      else if (errorName !== 'AbortError') setError(true);
    } finally {
      setBusy('');
    }
  };

  return (
    <div class="share-module" role="group" aria-label={`${t.get} ${t.what[kind]}`}>
      <span class="share-label">{t.get} {t.what[kind]}</span>
      {FORMATS.map((f) => (
        <button key={f} type="button" class="vs-link share-item" disabled={!!busy} title={t.hint[f]} onClick={() => download(f)} {...track} data-analytics-target={`png-${f}`}>
          {busy === f ? t.busy : t[f]}
        </button>
      ))}
      {canShareFile && (
        <button type="button" class="vs-btn-secondary share-native" disabled={!!busy} onClick={shareFile} {...track} data-analytics-target="native-file">
          {busy === 'share' ? t.busy : t.share}
        </button>
      )}
      <span role="status">{error ? feedback[lang].retry : ready?.key === stateKey ? feedback[lang].ready : ''}</span>
    </div>
  );
}
