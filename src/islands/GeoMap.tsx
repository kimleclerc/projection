import { useEffect, useMemo, useState } from 'preact/hooks';
import { tileFill } from './TileMap';

/** Vraie carte + médaillons agrandis (web_data/<juridiction>/geomap.json).
 *
 *  La géométrie arrive déjà projetée, simplifiée et mise en page par le moteur
 *  (geo_map.py) : carte principale à gauche, villes agrandies à droite. Ici on
 *  ne fait que colorier — mêmes nuances que la carte en tuiles (sûr, compétitif,
 *  serré), mêmes hachures pour un changement de camp, même fiche au survol.
 *  Le fichier est chargé à l'affichage : il ne gonfle pas le HTML de la page. */
export interface GeoRiding {
  id: string;
  name: string;
  winner: string | null;
  p?: number;
  from?: string | null;
  changed?: boolean;
  margin: number;
  href?: string;
}
interface Panel { id: string; title_fr: string; title_en: string; title_es: string; x: number; y: number; w: number; h: number; main: boolean }
interface GeoDoc { viewBox: [number, number, number, number]; panels: Panel[]; paths: Record<string, Record<string, string>> }
interface Props {
  url: string;
  ridings: GeoRiding[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  locale: 'fr' | 'en' | 'es';
  flipWord?: string;
  query?: string;
}

const COPY = {
  fr: { pick: 'Touchez une circonscription pour la détailler.', margin: 'marge', pt: 'pt', tossup: 'Indécis', open: 'Voir la circonscription', loading: 'Chargement de la carte…', close: 'Fermer les détails' },
  en: { pick: 'Select a riding to see its detail.', margin: 'margin', pt: 'pt', tossup: 'Tossup', open: 'Open riding page', loading: 'Loading the map…', close: 'Close details' },
  es: { pick: 'Toca un distrito para ver el detalle.', margin: 'margen', pt: 'pt', tossup: 'Indeciso', open: 'Ver el distrito', loading: 'Cargando el mapa…', close: 'Cerrar detalles' },
} as const;
const HACHURE = 'gmap-hachure';

export default function GeoMap({ url, ridings, colors, labels, locale, flipWord, query = '' }: Props) {
  const t = COPY[locale] ?? COPY.fr;
  const [doc, setDoc] = useState<GeoDoc | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(url).then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive) setDoc(d); }).catch(() => {});
    return () => { alive = false; };
  }, [url]);

  // Les identifiants du fichier sont complétés à cinq chiffres ; ceux de la page non.
  const byId = useMemo(() => {
    const m = new Map<string, GeoRiding>();
    for (const r of ridings) m.set(String(r.id).padStart(5, '0'), r);
    return m;
  }, [ridings]);

  if (!doc) return <p class="gmap-loading vs-meta">{t.loading}</p>;
  const [, , W, H] = doc.viewBox;
  const q = query.trim().toLocaleLowerCase();
  const cur = sel ? byId.get(sel) : null;
  const nom = (code: string | null | undefined) => (code && labels[code]) || t.tossup;
  const nf = (n: number) => n.toLocaleString(locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es' : 'en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const titre = (p: Panel) => (locale === 'en' ? p.title_en : locale === 'es' ? p.title_es : p.title_fr);

  return (
    <div class="gmap">
      <div class="gmap-board" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg class="gmap-svg" viewBox={doc.viewBox.join(' ')} role="group">
          <defs>
            <pattern id={HACHURE} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="1.4" height="3" fill="rgba(0,0,0,.42)" />
            </pattern>
            {doc.panels.map((p) => (
              <clipPath id={`gmap-clip-${p.id}`} key={p.id}><rect x={p.x} y={p.y} width={p.w} height={p.h} /></clipPath>
            ))}
          </defs>
          {doc.panels.map((p) => (
            <g key={p.id} clip-path={`url(#gmap-clip-${p.id})`}>
              {!p.main && <rect class="gmap-inset-bg" x={p.x} y={p.y} width={p.w} height={p.h} />}
              {Object.entries(doc.paths[p.id] ?? {}).map(([id, d]) => {
                const r = byId.get(id);
                const dim = q.length > 0 && !(r?.name ?? '').toLocaleLowerCase().includes(q);
                return (
                  <g key={id} class={`gmap-riding${dim ? ' is-dim' : ''}`}>
                    <path
                      d={d}
                      style={{ fill: tileFill(r?.winner ? colors[r.winner] : undefined, r?.p) }}
                      role="button"
                      tabIndex={p.main ? 0 : -1}
                      aria-label={r ? `${r.name} — ${nom(r.winner)}` : id}
                      onClick={() => setSel(id)}
                      onMouseEnter={() => setSel(id)}
                      onFocus={() => setSel(id)}
                    />
                    {r?.changed && <path d={d} fill={`url(#${HACHURE})`} pointer-events="none" />}
                  </g>
                );
              })}
              {sel && doc.paths[p.id]?.[sel] && <path class="gmap-halo" d={doc.paths[p.id][sel]} pointer-events="none" />}
              {!p.main && <rect class="gmap-inset-frame" x={p.x} y={p.y} width={p.w} height={p.h} pointer-events="none" />}
            </g>
          ))}
        </svg>
        {doc.panels.filter((p) => !p.main).map((p) => (
          <span class="gmap-title" key={`t-${p.id}`} style={{ left: `${((p.x + 4) / W) * 100}%`, top: `${((p.y + 3) / H) * 100}%` }}>{titre(p)}</span>
        ))}
      </div>
      <p class={`tmap-detail${cur ? ' is-open' : ''}`} aria-live="polite">
        {cur ? (
          <>
            <button class="tmap-close" type="button" aria-label={t.close} onClick={() => setSel(null)}>×</button>
            <strong>{cur.name}</strong>
            <span class="tmap-who">
              <i style={{ background: (cur.winner && colors[cur.winner]) || '#b9b6ae' }} aria-hidden="true" />
              {nom(cur.winner)}{cur.p !== undefined && cur.p < 1 ? ` · ${Math.round(cur.p * 100)}${locale === 'en' ? '%' : ' %'}` : ''}
            </span>
            {cur.changed && cur.from && <span class="tmap-gain">{flipWord} {nom(cur.from)}</span>}
            <span class="tmap-marge">{t.margin} {nf(cur.margin)} {t.pt}</span>
            {cur.href && <a class="tmap-lien" href={cur.href}>{t.open}</a>}
          </>
        ) : <span class="tmap-vide">{t.pick}</span>}
      </p>
    </div>
  );
}
