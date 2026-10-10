/**
 * Barre des sièges au-dessus d'une carte : le décompte, découpé par niveau de
 * certitude (sûr, compétitif, serré), avec la ligne de majorité — la grammaire
 * de 270toWin. Elle se lit avec la carte dessous : mêmes couleurs, mêmes seuils
 * (lib/riding-certainty.ts), et c'est ce couple carte + barre qu'on partage.
 *
 * Deux grands partis (≥ 97 % des sièges) : le premier à gauche, le second à
 * droite, les courses serrées au centre. Sinon, les partis dans l'ordre des
 * sièges et les courses serrées à la fin.
 */
import { tileFill, SERRE } from './TileMap';

type Lang = 'fr' | 'en' | 'es';
export interface BarRiding { winner: string | null; p?: number }
interface Props {
  ridings: BarRiding[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  majority: number;
  locale: Lang;
  /** « Change de camp depuis 2024 » ; absent = pas de légende de hachure. */
  flipLabel?: string;
}

const T = {
  fr: { majority: (n: number) => `${n} pour la majorité`, legend: ['Sûr', 'Compétitif', 'Serré'], tossups: 'serrés' },
  en: { majority: (n: number) => `${n} for a majority`, legend: ['Safe', 'Competitive', 'Toss-up'], tossups: 'toss-ups' },
  es: { majority: (n: number) => `${n} para la mayoría`, legend: ['Seguro', 'Competitivo', 'Reñido'], tossups: 'reñidos' },
};

type Tier = 'safe' | 'comp' | 'toss';
const tierOf = (p?: number): Tier => (p === undefined || p >= 0.85 ? 'safe' : p >= 0.6 ? 'comp' : 'toss');

export default function MapSeatBar({ ridings, colors, labels, majority, locale, flipLabel }: Props) {
  const t = T[locale];
  const total = ridings.length;
  if (!total) return null;

  const count: Record<string, Record<Tier, number>> = {};
  let toss = 0;
  for (const r of ridings) {
    if (!r.winner) { toss++; continue; }
    const tier = tierOf(r.p);
    if (tier === 'toss') { toss++; }
    (count[r.winner] ||= { safe: 0, comp: 0, toss: 0 })[tier]++;
  }
  const seats = (k: string) => (count[k]?.safe ?? 0) + (count[k]?.comp ?? 0) + (count[k]?.toss ?? 0);
  const order = Object.keys(count).filter((k) => seats(k) > 0).sort((a, b) => seats(b) - seats(a));
  const twoParty = order.length >= 2 && seats(order[0]) + seats(order[1]) >= 0.97 * total;

  type Seg = { key: string; n: number; fill: string };
  const segs: Seg[] = [];
  const side = (k: string, rev = false) => {
    const s: Seg[] = [
      { key: `${k}-safe`, n: count[k].safe, fill: tileFill(colors[k], 1) },
      { key: `${k}-comp`, n: count[k].comp, fill: tileFill(colors[k], 0.7) },
    ];
    return rev ? s.reverse() : s;
  };
  if (twoParty) {
    segs.push(...side(order[0]));
    segs.push({ key: 'toss', n: toss, fill: SERRE });
    segs.push(...side(order[1], true));
    for (const k of order.slice(2)) segs.push(...side(k));
  } else {
    for (const k of order) segs.push(...side(k));
    segs.push({ key: 'toss', n: toss, fill: SERRE });
  }

  const nf = (n: number) => n.toLocaleString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA');
  const head = twoParty ? [order[0], order[1]] : order.slice(0, 4);

  return (
    <div class="mseat">
      <div class={`mseat-head${twoParty ? ' is-duel' : ''}`}>
        {head.map((k) => (
          <p class="mseat-party" style={{ color: colors[k] }}>
            <strong>{nf(seats(k))}</strong> <span>{labels[k] ?? k}</span>
          </p>
        ))}
      </div>
      <div class="mseat-bar" role="img" aria-label={head.map((k) => `${labels[k] ?? k} ${seats(k)}`).join(', ') + `, ${toss} ${t.tossups}`}>
        {segs.filter((s) => s.n > 0).map((s) => (
          <span class="mseat-seg" style={{ flexGrow: s.n, background: s.fill }}>
            {s.n / total > 0.035 ? nf(s.n) : ''}
          </span>
        ))}
        <i class="mseat-maj" style={{ left: `${(majority / total) * 100}%` }} aria-hidden="true" />
      </div>
      <div class="mseat-foot">
        <span class="mseat-legend">
          <span><i style={{ background: colors[head[0]] }} /><i style={{ background: colors[head[1]] ?? colors[head[0]] }} />{t.legend[0]}</span>
          <span><i style={{ background: tileFill(colors[head[0]], 0.7) }} /><i style={{ background: tileFill(colors[head[1]] ?? colors[head[0]], 0.7) }} />{t.legend[1]}</span>
          <span><i style={{ background: SERRE }} />{t.legend[2]}</span>
          {flipLabel && <span><i class="is-hatch" />{flipLabel}</span>}
        </span>
        <span class="mseat-majlabel">{t.majority(majority)}</span>
      </div>
    </div>
  );
}
