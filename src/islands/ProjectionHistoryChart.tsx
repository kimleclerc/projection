import { useEffect, useMemo, useState } from 'preact/hooks';

/*
 * ProjectionHistoryChart — Preact island, client:visible.
 *
 * Fetches /web_data/<jurisdiction>/history/<ridingId>.json (small per-riding
 * file ~3 KB) and renders an inline-SVG multi-line chart of party vote_mean
 * over time. Zero external chart library — pure SVG + Preact state for hover.
 */

interface HistoryPoint {
  date: string;
  vote_mean: Record<string, number>;
  win_prob: Record<string, number>;
}

interface PartyMetaLite {
  code: string;
  label_en: string;
  label_fr: string;
  color: string;
}

interface Props {
  historyUrl: string;             // e.g. /web_data/federal/history/35077.json
  parties: PartyMetaLite[];       // sorted by latest vote_mean desc
  lang: 'en' | 'fr';
}

const PAD = { top: 18, right: 18, bottom: 36, left: 40 };
const W = 720;
const H = 320;

function formatDate(iso: string, lang: 'en' | 'fr'): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'short', day: 'numeric',
  });
}

export default function ProjectionHistoryChart({ historyUrl, parties, lang }: Props) {
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(historyUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => { if (!cancelled) setHistory(data as HistoryPoint[]); })
      .catch((e) => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, [historyUrl]);

  const layout = useMemo(() => {
    if (!history || history.length < 2) return null;
    const allValues = history.flatMap((p) =>
      parties.map((party) => p.vote_mean[party.code] ?? null).filter((v): v is number => v != null)
    );
    const yMin = Math.max(0, Math.floor(Math.min(...allValues) / 5) * 5 - 2);
    const yMax = Math.min(100, Math.ceil(Math.max(...allValues) / 5) * 5 + 2);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const xFor = (i: number) =>
      PAD.left + (history.length === 1 ? innerW / 2 : (i / (history.length - 1)) * innerW);
    const yFor = (v: number) =>
      PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
    return { yMin, yMax, innerW, innerH, xFor, yFor };
  }, [history, parties]);

  if (error) {
    return <div class="ph-error">{lang === 'fr' ? 'Historique indisponible.' : 'History unavailable.'}</div>;
  }
  if (!history || !layout) {
    return <div class="ph-skel" aria-hidden="true"><div class="ph-skel-inner"></div></div>;
  }

  const ticksY = [layout.yMin, (layout.yMin + layout.yMax) / 2, layout.yMax].map((v) => Math.round(v));
  const tickCount = Math.min(history.length, 5);
  const ticksX = Array.from({ length: tickCount }, (_, i) =>
    Math.round((i * (history.length - 1)) / (tickCount - 1))
  );

  return (
    <div class="ph-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" role="img"
           aria-label={lang === 'fr' ? 'Évolution des projections par parti' : 'Projection history by party'}>
        {/* Y axis grid + labels */}
        {ticksY.map((tv) => (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={layout.yFor(tv)} y2={layout.yFor(tv)}
                  stroke="var(--rule)" stroke-dasharray="2 4" />
            <text x={PAD.left - 8} y={layout.yFor(tv) + 4} text-anchor="end"
                  font-family="var(--mono)" font-size="11" fill="var(--ink-2)">{tv}%</text>
          </g>
        ))}

        {/* X axis labels */}
        {ticksX.map((idx) => (
          <text x={layout.xFor(idx)} y={H - PAD.bottom + 18} text-anchor="middle"
                font-family="var(--mono)" font-size="10" fill="var(--ink-2)">
            {formatDate(history[idx].date, lang)}
          </text>
        ))}

        {/* Lines per party */}
        {parties.map((party) => {
          const pts = history
            .map((p, i) => {
              const v = p.vote_mean[party.code];
              return v != null ? `${layout.xFor(i)},${layout.yFor(v)}` : null;
            })
            .filter((s): s is string => s !== null);
          if (pts.length < 2) return null;
          return (
            <polyline points={pts.join(' ')} fill="none" stroke={party.color}
                      stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          );
        })}

        {/* Hover hit area */}
        {history.map((p, i) => (
          <rect x={layout.xFor(i) - 12} y={PAD.top} width="24" height={layout.innerH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)} />
        ))}

        {/* Hover marker */}
        {hoverIdx !== null && (
          <g>
            <line x1={layout.xFor(hoverIdx)} x2={layout.xFor(hoverIdx)}
                  y1={PAD.top} y2={H - PAD.bottom}
                  stroke="var(--ink)" stroke-width="1" opacity="0.4" />
            {parties.map((party) => {
              const v = history[hoverIdx].vote_mean[party.code];
              if (v == null) return null;
              return (
                <circle cx={layout.xFor(hoverIdx)} cy={layout.yFor(v)} r="4"
                        fill={party.color} stroke="var(--paper)" stroke-width="1.5" />
              );
            })}
          </g>
        )}
      </svg>

      {/* Tooltip + legend below */}
      <div class="ph-tooltip" aria-live="polite">
        {hoverIdx !== null ? (
          <>
            <div class="ph-date">{formatDate(history[hoverIdx].date, lang)}</div>
            <ul>
              {parties
                .map((p) => ({ party: p, v: history[hoverIdx].vote_mean[p.code] }))
                .filter((x) => x.v != null)
                .sort((a, b) => (b.v! - a.v!))
                .map(({ party, v }) => (
                  <li>
                    <span class="ph-key" style={{ background: party.color }}></span>
                    <span class="ph-pname">{lang === 'fr' ? party.label_fr : party.label_en}</span>
                    <strong>{v!.toFixed(1)}%</strong>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <p class="ph-hint">{lang === 'fr' ? 'Survolez le graphique pour les valeurs précises.' : 'Hover the chart for precise values.'}</p>
        )}
      </div>
    </div>
  );
}
