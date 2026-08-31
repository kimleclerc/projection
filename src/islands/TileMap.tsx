import { useMemo, useState } from 'preact/hooks';

/** Carte en tuiles : une tuile par circonscription, toutes de la même taille.
 *
 *  Une carte géographique ment sur ce qui compte. Au Québec, Ungava occupe la
 *  place de cinquante circonscriptions montréalaises pour le même siège unique,
 *  et 56 circonscriptions sur 127 tombaient sous 10 x 10 px — sous le minimum
 *  de 24 px exigé d'une cible tactile. Ici chaque siège pèse pareil, ce qui est
 *  la bonne sémantique pour une chambre, et rien n'exige de zoomer.
 *
 *  Trois règles tenues du patron NYT : aucun texte DANS les tuiles (le nom va à
 *  côté du bloc), la même disposition sur ordinateur et sur téléphone (les
 *  tuiles rétrécissent, rien ne se replie), et les bascules en hachure plutôt
 *  qu'en nuance — une texture survit à dix pixels, pas une teinte.
 *
 *  Le composant ne connaît ni simulateur ni projection : il reçoit des tuiles
 *  déjà normalisées, ce qui lui permet de servir les deux.
 */
export interface TileRiding {
  id: string;
  name: string;
  /** Parti gagnant, ou null pour une course indécise. */
  winner: string | null;
  /** Parti que la circonscription quitte, quand elle bascule. */
  from?: string | null;
  changed?: boolean;
  margin: number;
  href?: string;
}

export interface TileBloc {
  id: string;
  label_fr: string; label_en: string; label_es: string;
  /** Position du bloc sur la toile, en unités de tuile — sa VRAIE position
   *  géographique, écartée juste assez pour ne chevaucher personne. */
  x: number; y: number;
  n: number; cols: number; rows: number;
  ids: string[];
}

interface Props {
  blocs: TileBloc[];
  /** Dimensions de la toile, en unités de tuile. */
  canvas?: { w: number; h: number };
  ridings: TileRiding[];
  locale: 'fr' | 'en' | 'es';
  colors: Record<string, string>;
  labels: Record<string, string>;
  query?: string;
  /** Libellé de la bascule : « bascule » en projection, « gain sur » en scénario. */
  flipWord?: string;
}

const COPY = {
  fr: { pick: 'Touchez une circonscription pour la détailler.', margin: 'marge', from: 'sur', pt: 'pt', tossup: 'Indécis', open: 'Voir la circonscription' },
  en: { pick: 'Select a riding to see its detail.', margin: 'margin', from: 'from', pt: 'pt', tossup: 'Tossup', open: 'Open riding page' },
  es: { pick: 'Toca un distrito para ver el detalle.', margin: 'margen', from: 'a', pt: 'pt', tossup: 'Indeciso', open: 'Ver el distrito' },
} as const;

const GRIS = '#b9b6ae';

export default function TileMap({ blocs, canvas, ridings, locale, colors, labels, query = '', flipWord }: Props) {
  const [sel, setSel] = useState<string | null>(null);
  const t = COPY[locale] ?? COPY.fr;
  const byId = useMemo(() => new Map(ridings.map((r) => [r.id, r])), [ridings]);
  const toile = canvas ?? {
    w: Math.max(...blocs.map((b) => b.x + b.cols), 1),
    h: Math.max(...blocs.map((b) => b.y + b.rows + 0.75), 1),
  };

  if (!blocs.length) return null;
  const q = query.trim().toLocaleLowerCase();
  const cur = sel ? byId.get(sel) : null;
  const nf = (n: number) =>
    n.toLocaleString(locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es' : 'en-CA',
      { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nom = (code: string | null | undefined) => (code && labels[code]) || t.tossup;

  return (
    <div class="tmap">
      {/* Chaque bloc est posé à sa position géographique, en unités de tuile.
          Les ranger en colonnes donnait un ORDRE, pas une FORME. */}
      <div
        class="tmap-board"
        style={{ aspectRatio: `${toile.w} / ${toile.h}`, '--tmap-cols': toile.w }}
      >
        {blocs.map((b) => (
          <section
            class="tmap-bloc"
            key={b.id}
            aria-labelledby={`tmap-${b.id}`}
            style={{
              left: `${(b.x / toile.w) * 100}%`,
              top: `${(b.y / toile.h) * 100}%`,
              width: `${(b.cols / toile.w) * 100}%`,
            }}
          >
            <h3 id={`tmap-${b.id}`}>
              <span>{locale === 'en' ? b.label_en : locale === 'es' ? b.label_es : b.label_fr}</span>
              <em>{b.n}</em>
            </h3>
            <div class="tmap-cells" style={{ gridTemplateColumns: `repeat(${b.cols},1fr)` }}>
              {b.ids.map((id) => {
                const r = byId.get(id);
                if (!r) return null;
                const dim = q.length > 0 && !r.name.toLocaleLowerCase().includes(q);
                return (
                  <button
                    key={id}
                    type="button"
                    class={`tmap-tile${r.changed ? ' is-flip' : ''}${dim ? ' is-dim' : ''}`}
                    style={{ background: (r.winner && colors[r.winner]) || GRIS }}
                    aria-pressed={sel === id}
                    aria-label={`${r.name} — ${nom(r.winner)}${r.changed && r.from ? `, ${flipWord ?? t.from} ${nom(r.from)}` : ''}, ${t.margin} ${nf(r.margin)}`}
                    onClick={() => setSel(id)}
                    onMouseEnter={() => setSel(id)}
                    onFocus={() => setSel(id)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* La fiche ne déplace jamais la carte : c'est elle qui rend le zoom inutile. */}
      <p class="tmap-detail" aria-live="polite">
        {cur ? (
          <>
            <strong>{cur.name}</strong>
            <span class="tmap-who">
              <i style={{ background: (cur.winner && colors[cur.winner]) || GRIS }} aria-hidden="true" />
              {nom(cur.winner)}
            </span>
            {cur.changed && cur.from && <span class="tmap-gain">{flipWord ?? t.from} {nom(cur.from)}</span>}
            <span class="tmap-marge">{t.margin} {nf(cur.margin)} {t.pt}</span>
            {cur.href && <a class="tmap-lien" href={cur.href}>{t.open} →</a>}
          </>
        ) : <span class="tmap-vide">{t.pick}</span>}
      </p>
    </div>
  );
}
