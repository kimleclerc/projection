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
 *  DEUX COUCHES, et la frontière entre elles est délibérée :
 *
 *  * **les tuiles sont un SVG unique à viewBox**. Leurs coordonnées sont fixes,
 *    donc leur égalité est structurelle et non le produit d'une arithmétique
 *    CSS. La version en grilles imbriquées la tenait par le calcul, et un
 *    `gap: 6%` — qui se résout sur la largeur du BLOC, pas de la carte — a
 *    suffi à donner des tuiles de 42 px et de 29 px sur la même carte.
 *  * **les étiquettes restent du HTML**. Dans le SVG elles rétréciraient avec
 *    les tuiles : à 7 px de tuile sur un téléphone, un nom de région serait
 *    illisible. En HTML leur corps a un plancher, et le moteur leur a réservé
 *    la place correspondante (`label_w`, `label_h`, `lines_*`) — la même boîte
 *    que celle où il a vérifié qu'elles ne se chevauchaient pas.
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
  /** Étiquette déjà pliée par le moteur, sur une ou deux lignes. C'est le
   *  pliage sur lequel il a pris la place : le rendu ne le refait pas. */
  lines_fr?: string[]; lines_en?: string[]; lines_es?: string[];
  /** Boîte réservée à l'étiquette, en unités de tuile. */
  label_w?: number; label_h?: number;
  /** Côté par lequel l'étiquette déborde quand elle est plus large que son
   *  bloc. Le moteur l'a choisi en fonction de la place libre autour. */
  label_anchor?: 'start' | 'end';
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
/** Écart entre tuiles, en fraction d'une tuile. Le pas d'une tuile vaut 1 unité
 *  de toile — c'est exactement l'unité dans laquelle le moteur a placé les
 *  blocs, donc rien ne se recalcule ici. */
const GAP = 0.14;
/** Une seule définition de hachure par page suffit : elles sont identiques. */
const HACHURE = 'tmap-hachure';

const DEFAUT_H = 0.78;

export default function TileMap({ blocs, canvas, ridings, locale, colors, labels, query = '', flipWord }: Props) {
  const [sel, setSel] = useState<string | null>(null);
  const t = COPY[locale] ?? COPY.fr;
  const byId = useMemo(() => new Map(ridings.map((r) => [r.id, r])), [ridings]);
  const hauteurEtiq = (b: TileBloc) => b.label_h ?? DEFAUT_H;
  const toile = canvas ?? {
    w: Math.max(...blocs.map((b) => b.x + b.cols), 1),
    h: Math.max(...blocs.map((b) => b.y + b.rows + hauteurEtiq(b)), 1),
  };

  if (!blocs.length) return null;
  const q = query.trim().toLocaleLowerCase();
  const cur = sel ? byId.get(sel) : null;
  const nf = (n: number) =>
    n.toLocaleString(locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es' : 'en-CA',
      { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nom = (code: string | null | undefined) => (code && labels[code]) || t.tossup;
  const lignes = (b: TileBloc): string[] => {
    const pretes = locale === 'en' ? b.lines_en : locale === 'es' ? b.lines_es : b.lines_fr;
    if (pretes && pretes.length) return pretes;
    return [locale === 'en' ? b.label_en : locale === 'es' ? b.label_es : b.label_fr];
  };

  /** Position d'une tuile dans la toile, en unités de tuile. */
  const place = (b: TileBloc, rang: number) => ({
    x: b.x + (rang % b.cols) + GAP / 2,
    y: b.y + hauteurEtiq(b) + Math.floor(rang / b.cols) + GAP / 2,
  });

  return (
    <div class="tmap">
      <div class="tmap-board" style={{ aspectRatio: `${toile.w} / ${toile.h}` }}>
        {/* Les tuiles : un seul SVG, des coordonnées fixes. Deux tuiles ne
            peuvent pas sortir de tailles différentes — elles ont le même
            attribut, pas le même calcul. */}
        <svg
          class="tmap-svg"
          viewBox={`0 0 ${toile.w} ${toile.h}`}
          preserveAspectRatio="xMidYMid meet"
          role="group"
        >
          <defs>
            <pattern id={HACHURE} width=".26" height=".26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width=".13" height=".26" fill="rgba(0,0,0,.42)" />
            </pattern>
          </defs>
          {blocs.map((b) => (
            <g key={b.id}>
              {b.ids.map((id, rang) => {
                const r = byId.get(id);
                if (!r) return null;
                const p = place(b, rang);
                const dim = q.length > 0 && !r.name.toLocaleLowerCase().includes(q);
                const choisi = sel === id;
                return (
                  <g key={id} class={`tmap-tile${dim ? ' is-dim' : ''}${choisi ? ' is-sel' : ''}`}>
                    <rect
                      x={p.x} y={p.y} width={1 - GAP} height={1 - GAP} rx=".1"
                      fill={(r.winner && colors[r.winner]) || GRIS}
                      role="button"
                      tabIndex={0}
                      aria-pressed={choisi}
                      aria-label={`${r.name} — ${nom(r.winner)}${r.changed && r.from ? `, ${flipWord ?? t.from} ${nom(r.from)}` : ''}, ${t.margin} ${nf(r.margin)}`}
                      onClick={() => setSel(id)}
                      onMouseEnter={() => setSel(id)}
                      onFocus={() => setSel(id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(id); }
                      }}
                    />
                    {/* Bascule : une HACHURE, pas une nuance — une texture reste
                        lisible à sept pixels, une teinte non. */}
                    {r.changed && (
                      <rect x={p.x} y={p.y} width={1 - GAP} height={1 - GAP} rx=".1"
                            fill={`url(#${HACHURE})`} pointer-events="none" />
                    )}
                  </g>
                );
              })}
            </g>
          ))}
          {/* Le liseré de la tuile choisie se dessine en dernier, sinon les
              tuiles voisines le rognent. */}
          {sel && blocs.map((b) => {
            const rang = b.ids.indexOf(sel);
            if (rang < 0) return null;
            const p = place(b, rang);
            return (
              <rect key="halo" class="tmap-halo" x={p.x} y={p.y} width={1 - GAP} height={1 - GAP} rx=".1"
                    pointer-events="none" />
            );
          })}
        </svg>

        {/* Les étiquettes : du HTML, pour que leur corps ne suive pas la taille
            des tuiles. La boîte est celle que le moteur a réservée. */}
        {blocs.map((b) => {
          const lw = Math.max(b.label_w ?? b.cols, b.cols);
          const fin = b.label_anchor === 'end';
          return (
          <h3
            class={`tmap-label${fin ? ' is-end' : ''}`}
            key={`e-${b.id}`}
            style={{
              left: `${((fin ? b.x + b.cols - lw : b.x) / toile.w) * 100}%`,
              top: `${(b.y / toile.h) * 100}%`,
              width: `${(lw / toile.w) * 100}%`,
              height: `${(hauteurEtiq(b) / toile.h) * 100}%`,
            }}
          >
            <span>
              {lignes(b).map((ligne, i) => <span class="tmap-ligne" key={i}>{ligne}</span>)}
            </span>
            <em>{b.n}</em>
          </h3>
          );
        })}
      </div>

      {/* La fiche ne déplace jamais la carte : c'est elle qui rend le zoom inutile. */}
      <p class={`tmap-detail${cur ? ' is-open' : ''}`} aria-live="polite">
        {cur ? (
          <>
            <button
              class="tmap-close"
              type="button"
              aria-label={locale === 'fr' ? 'Fermer les détails' : locale === 'es' ? 'Cerrar detalles' : 'Close details'}
              onClick={() => setSel(null)}
            >×</button>
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
