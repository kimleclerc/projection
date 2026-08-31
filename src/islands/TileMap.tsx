import { useMemo, useState } from 'preact/hooks';
import type { SimDoc, SimRidingState } from '../lib/mini-sim';

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
 */
interface Props {
  doc: SimDoc;
  states: SimRidingState[];
  locale: 'fr' | 'en' | 'es';
  colors: Record<string, string>;
  labels: Record<string, string>;
  query?: string;
}

const COPY = {
  fr: { pick: 'Touchez une circonscription pour la détailler.', margin: 'marge', gain: 'gain sur', pt: 'pt' },
  en: { pick: 'Select a riding to see its detail.', margin: 'margin', gain: 'gain from', pt: 'pt' },
  es: { pick: 'Toca un distrito para ver el detalle.', margin: 'margen', gain: 'gana a', pt: 'pt' },
} as const;

export default function TileMap({ doc, states, locale, colors, labels, query = '' }: Props) {
  const [sel, setSel] = useState<string | null>(null);
  const t = COPY[locale] ?? COPY.fr;

  const byId = useMemo(() => new Map(states.map((s) => [s.id, s])), [states]);
  const colonnes = useMemo(() => {
    const blocs = doc.tiles?.blocs ?? [];
    const max = blocs.reduce((m, b) => Math.max(m, b.col), 0);
    return Array.from({ length: max + 1 }, (_, i) => blocs.filter((b) => b.col === i));
  }, [doc.tiles]);

  if (!doc.tiles) return null;
  const q = query.trim().toLocaleLowerCase();
  const courant = sel ? byId.get(sel) : null;
  const nf = (n: number) =>
    n.toLocaleString(locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es' : 'en-CA',
      { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div class="tmap">
      <div class="tmap-board">
        {colonnes.map((col, ci) => (
          <div class="tmap-col" key={ci}>
            {col.map((b) => (
              <section class="tmap-bloc" key={b.id} aria-labelledby={`tmap-${b.id}`}>
                <h3 id={`tmap-${b.id}`}>
                  <span>{locale === 'en' ? b.label_en : locale === 'es' ? b.label_es : b.label_fr}</span>
                  <em>{b.n}</em>
                </h3>
                <div class="tmap-cells" style={{ gridTemplateColumns: `repeat(${b.cols},var(--tmap-cell))` }}>
                  {b.ids.map((id) => {
                    const r = byId.get(id);
                    if (!r) return null;
                    const dim = q.length > 0 && !r.name.toLocaleLowerCase().includes(q);
                    return (
                      <button
                        key={id}
                        type="button"
                        class={`tmap-tile${r.changed ? ' is-flip' : ''}${dim ? ' is-dim' : ''}`}
                        style={{ background: colors[r.winner] ?? '#999' }}
                        aria-pressed={sel === id}
                        aria-label={`${r.name} — ${labels[r.winner]}${r.changed ? `, ${t.gain} ${labels[r.baselineWinner]}` : ''}, ${t.margin} ${nf(r.margin)}`}
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
        ))}
      </div>

      {/* La fiche ne déplace jamais la carte : c'est elle qui rend le zoom inutile. */}
      <p class="tmap-detail" aria-live="polite">
        {courant ? (
          <>
            <strong>{courant.name}</strong>
            <span class="tmap-who">
              <i style={{ background: colors[courant.winner] ?? '#999' }} aria-hidden="true" />
              {labels[courant.winner]}
            </span>
            {courant.changed && <span class="tmap-gain">{t.gain} {labels[courant.baselineWinner]}</span>}
            <span class="tmap-marge">{t.margin} {nf(courant.margin)} {t.pt}</span>
          </>
        ) : <span class="tmap-vide">{t.pick}</span>}
      </p>
    </div>
  );
}
