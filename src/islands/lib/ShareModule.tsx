/**
 * « Partager » sous un module (carte, projection, graphique) : le lien du module,
 * son image en paysage ou en carré, X, et le partage natif du téléphone.
 *
 * Le lien est /s/<module>/<scrutin>/<langue> : les réseaux y lisent l'image DU
 * module, et la personne qui clique arrive à cet endroit de la page. Les images
 * sont fabriquées à la demande (functions/og/live) : rien n'est ajouté au site.
 */
import { useEffect, useState } from 'preact/hooks';

type Lang = 'fr' | 'en' | 'es';
interface Props {
  lang: Lang;
  kind: 'map' | 'projection' | 'chart';
  election: string;   // clé de SHARE_ELECTIONS (us-house, federal…)
  runDate: string;    // date du calcul : l'image change avec lui
  text: string;       // texte du message (la question du scrutin)
}

const T = {
  fr: { share: 'Partager', copy: 'Copier le lien', copied: 'Lien copié', wide: 'Image paysage', square: 'Image carrée', x: 'Publier sur X', native: 'Partager…', what: { map: 'cette carte', projection: 'cette projection', chart: 'ce graphique' } },
  en: { share: 'Share', copy: 'Copy link', copied: 'Link copied', wide: 'Landscape image', square: 'Square image', x: 'Post on X', native: 'Share…', what: { map: 'this map', projection: 'this forecast', chart: 'this chart' } },
  es: { share: 'Compartir', copy: 'Copiar el enlace', copied: 'Enlace copiado', wide: 'Imagen horizontal', square: 'Imagen cuadrada', x: 'Publicar en X', native: 'Compartir…', what: { map: 'este mapa', projection: 'esta proyección', chart: 'este gráfico' } },
};

export default function ShareModule({ lang, kind, election, runDate, text }: Props) {
  const t = T[lang];
  const [origin, setOrigin] = useState('https://vote-scope.com');
  const [canNative, setCanNative] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNative(typeof navigator.share === 'function');
  }, []);

  const v = runDate.replace(/[^0-9-]/g, '');
  const link = `${origin}/s/${kind}/${election}/${lang}?v=${v}`;
  const image = (f: 'wide' | 'square') => `/og/live/${kind}/${election}/${lang}.png?v=${v}${f === 'square' ? '&f=square' : ''}`;
  const file = (f: string) => `vote-scope-${election}-${kind}-${lang}${f === 'square' ? '-carre' : ''}.png`;
  const track = { 'data-analytics-event': 'share_click', 'data-analytics-kind': kind, 'data-analytics-election': election };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* presse-papiers refusé : le lien reste visible dans X ou le partage natif */ }
  };
  const x = (e: MouseEvent) => {
    e.preventDefault();
    const intent = new URL('https://x.com/intent/post');
    intent.searchParams.set('text', text);
    intent.searchParams.set('url', link);
    intent.searchParams.set('via', 'kimleclerc');
    window.open(intent.toString(), '_blank', 'noopener,noreferrer');
  };
  const native = async () => {
    try { await navigator.share({ title: text, text, url: link }); } catch { /* annulé */ }
  };

  return (
    <div class="share-module" role="group" aria-label={`${t.share} ${t.what[kind]}`}>
      <span class="share-label">{t.share} {t.what[kind]}</span>
      <button type="button" class="vs-link share-item" onClick={copy} aria-live="polite" {...track} data-analytics-target="copy">{copied ? t.copied : t.copy}</button>
      <a class="vs-link share-item" href={image('wide')} download={file('wide')} {...track} data-analytics-target="png-wide">{t.wide}</a>
      <a class="vs-link share-item" href={image('square')} download={file('square')} {...track} data-analytics-target="png-square">{t.square}</a>
      <a class="vs-link share-item" href="https://x.com/kimleclerc" onClick={x} rel="noopener" {...track} data-analytics-target="x">{t.x}</a>
      {canNative && <button type="button" class="vs-link share-item" onClick={native} {...track} data-analytics-target="native">{t.native}</button>}
    </div>
  );
}
