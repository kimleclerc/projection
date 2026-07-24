import { useMemo, useState } from 'preact/hooks';
import {
  US_TILE_GRID,
  TILE_ROWS,
  TILE_COLS,
  type EcFrame,
  type EcUnit,
  type Locale,
} from '../lib/us-pres';

interface Props {
  frame: EcFrame;
  locale: Locale;
}

const COPY = {
  fr: {
    tally: 'Grands électeurs — carte de référence 2024',
    toWin: '270 pour gagner',
    dem: 'Démocrate',
    rep: 'Républicain',
    hoverHint: 'Survolez un État',
    split: 'Le Maine et le Nebraska répartissent par district (ME-2 → républicain, NE-2 → démocrate en 2024).',
    ev: (n: number) => `${n} grand${n > 1 ? 's' : ''} électeur${n > 1 ? 's' : ''}`,
    baselineNote: 'Résultat certifié 2024 — référence, PAS une projection 2028.',
  },
  en: {
    tally: 'Electoral votes — 2024 reference map',
    toWin: '270 to win',
    dem: 'Democratic',
    rep: 'Republican',
    hoverHint: 'Hover a state',
    split: 'Maine and Nebraska split by district (ME-2 → Republican, NE-2 → Democratic in 2024).',
    ev: (n: number) => `${n} electoral vote${n > 1 ? 's' : ''}`,
    baselineNote: 'Certified 2024 result — reference baseline, NOT a 2028 projection.',
  },
  es: {
    tally: 'Votos electorales — mapa de referencia 2024',
    toWin: '270 para ganar',
    dem: 'Demócrata',
    rep: 'Republicano',
    hoverHint: 'Pase el cursor sobre un estado',
    split: 'Maine y Nebraska se reparten por distrito (ME-2 → republicano, NE-2 → demócrata en 2024).',
    ev: (n: number) => `${n} voto${n > 1 ? 's' : ''} electoral${n > 1 ? 'es' : ''}`,
    baselineNote: 'Resultado certificado de 2024 — referencia, NO una proyección de 2028.',
  },
};

function stateName(units: EcUnit[], st: string, locale: Locale): string {
  const u = units.find((x) => x.state === st);
  if (!u) return st;
  return locale === 'fr' ? u.name_fr.replace(/ \(.*\)$/, '') : u.name_en.replace(/ \(.*\)$/, '');
}

export default function UsElectoralMap({ frame, locale }: Props) {
  const t = COPY[locale];
  const [hover, setHover] = useState<string | null>(null);

  // Agrège les unités au niveau de l'État : gagnant statewide + total GE.
  const { stateWinner, stateEv } = useMemo(() => {
    const winner: Record<string, string> = {};
    const ev: Record<string, number> = {};
    for (const u of frame.units) {
      ev[u.state] = (ev[u.state] ?? 0) + u.ec_votes;
      // Couleur = gagnant statewide : unité WTA, ou bloc « at-large » pour ME/NE.
      if ((u.kind === 'statewide' || u.kind === 'at_large') && u.baseline_2024_winner) {
        winner[u.state] = u.baseline_2024_winner;
      }
    }
    return { stateWinner: winner, stateEv: ev };
  }, [frame]);

  const totals = frame.baseline_2024?.totals ?? {};
  const demTotal = totals.us_dem ?? 0;
  const repTotal = totals.us_rep ?? 0;
  const total = frame.total;

  const fill = (st: string) =>
    stateWinner[st] === 'us_dem' ? 'var(--dem)'
      : stateWinner[st] === 'us_rep' ? 'var(--rep)'
      : 'var(--ink-3)';

  const cell = 100 / TILE_COLS;

  return (
    <div>
      <div class="ecm-tally-head">
        <span class="ecm-tally-title">{t.tally}</span>
        <span class="ecm-hint">{hover ? `${stateName(frame.units, hover, locale)} · ${t.ev(stateEv[hover] ?? 0)}` : t.hoverHint}</span>
      </div>

      <div class="ecm-bar" role="img"
        aria-label={`${t.dem} ${demTotal} · ${t.rep} ${repTotal} · ${t.toWin}`}>
        <div class="ecm-bar-dem" style={{ width: `${(demTotal / total) * 100}%` }}>
          {demTotal >= 40 && <span>{demTotal}</span>}
        </div>
        <div class="ecm-bar-rep" style={{ width: `${(repTotal / total) * 100}%` }}>
          {repTotal >= 40 && <span>{repTotal}</span>}
        </div>
        <div class="ecm-270" style={{ left: '50%' }} aria-hidden="true">
          <span>{t.toWin}</span>
        </div>
      </div>

      <div class="ecm-grid" style={{ aspectRatio: `${TILE_COLS} / ${TILE_ROWS}` }}>
        {Object.entries(US_TILE_GRID).map(([st, [r, c]]) => (
          <button
            key={st}
            class="ecm-tile"
            style={{
              left: `${c * cell}%`,
              top: `${(r / TILE_ROWS) * 100}%`,
              width: `${cell}%`,
              height: `${100 / TILE_ROWS}%`,
              background: fill(st),
              outline: hover === st ? '2px solid var(--ink)' : 'none',
            }}
            onMouseEnter={() => setHover(st)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(st)}
            onBlur={() => setHover(null)}
            title={`${stateName(frame.units, st, locale)} — ${t.ev(stateEv[st] ?? 0)}`}
          >
            <span class="ecm-abbr">{st}</span>
            <span class="ecm-ev">{stateEv[st] ?? 0}</span>
          </button>
        ))}
      </div>

      <div class="ecm-legend">
        <span><i class="ecm-sw" style={{ background: 'var(--dem)' }} /> {t.dem} {demTotal}</span>
        <span><i class="ecm-sw" style={{ background: 'var(--rep)' }} /> {t.rep} {repTotal}</span>
      </div>
      <p class="ecm-note">{t.split}</p>
      <p class="ecm-note ecm-note-strong">{t.baselineNote}</p>

      <style>{`
        .ecm-tally-head { display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px; align-items:baseline; margin-bottom:10px; }
        .ecm-tally-title { font-family:var(--serif); font-size:1.05rem; color:var(--ink); }
        .ecm-hint { font-family:var(--mono); font-size:11px; color:var(--ink-3); }
        .ecm-bar { position:relative; display:flex; height:34px; border-radius:6px; overflow:hidden; border:1px solid var(--rule); }
        .ecm-bar-dem, .ecm-bar-rep { display:flex; align-items:center; color:#fff; font-family:var(--mono); font-size:13px; font-weight:600; }
        .ecm-bar-dem { background:var(--dem); justify-content:flex-start; padding-left:10px; }
        .ecm-bar-rep { background:var(--rep); justify-content:flex-end; padding-right:10px; }
        .ecm-270 { position:absolute; top:-4px; bottom:-4px; width:0; border-left:2px dashed var(--ink); }
        .ecm-270 span { position:absolute; top:-18px; left:50%; transform:translateX(-50%); white-space:nowrap; font-family:var(--mono); font-size:9px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-2); }
        .ecm-grid { position:relative; width:100%; margin:26px 0 14px; }
        .ecm-tile { position:absolute; padding:0; border:1.5px solid var(--paper-3, #fff); border-radius:4px; color:#fff; cursor:default; display:flex; flex-direction:column; align-items:center; justify-content:center; line-height:1; transition:outline 0.1s ease; }
        .ecm-abbr { font-family:var(--mono); font-size:clamp(7px, 1.1vw, 12px); font-weight:700; }
        .ecm-ev { font-family:var(--mono); font-size:clamp(6px, 0.9vw, 10px); opacity:0.85; }
        .ecm-legend { display:flex; gap:18px; font-family:var(--mono); font-size:12px; color:var(--ink-2); margin-top:4px; }
        .ecm-legend span { display:inline-flex; align-items:center; gap:6px; }
        .ecm-sw { width:12px; height:12px; border-radius:3px; display:inline-block; }
        .ecm-note { font-family:var(--mono); font-size:11px; color:var(--ink-3); line-height:1.5; margin:8px 0 0; }
        .ecm-note-strong { color:var(--ink-2); }
      `}</style>
    </div>
  );
}
