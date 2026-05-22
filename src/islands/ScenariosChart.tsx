import { useEffect, useRef, useState } from 'preact/hooks';

export interface ScenarioParty {
  party: string;
  label_en: string;
  label_fr: string;
  color: string;
  p_majority: number;
  p_largest: number;
  p_strict_largest?: number;
  p_tied_largest?: number;
}

interface Props {
  parties: ScenarioParty[];
  locale: 'en' | 'fr';
  /** CSS color resolved from --ink-3 for axis/tick text (Plotly cannot read CSS vars). */
  axisColor?: string;
  /** CSS color for grid lines (resolved from --rule). */
  gridColor?: string;
}

const fmtPct = (v: number) => {
  if (v >= 0.99) return '>99%';
  if (v < 0.005 && v > 0) return '<1%';
  return `${(v * 100).toFixed(0)}%`;
};

export default function ScenariosChart({
  parties,
  locale,
  axisColor = '#7a7568',
  gridColor = '#d8d3c8',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let plotlyRef: any = null;

    async function boot() {
      try {
        const Plotly = (await import('plotly.js-basic-dist-min')).default ?? (await import('plotly.js-basic-dist-min'));
        plotlyRef = Plotly;
        if (cancelled || !ref.current) return;

        const filtered = parties
          .filter(
            (p) =>
              (p.p_majority ?? 0) > 0 ||
              (p.p_largest ?? 0) > 0 ||
              (p.p_strict_largest ?? 0) > 0 ||
              (p.p_tied_largest ?? 0) > 0,
          )
          .sort(
            (a, b) =>
              Math.max(
                b.p_majority ?? 0,
                b.p_largest ?? 0,
                b.p_strict_largest ?? 0,
                b.p_tied_largest ?? 0,
              ) -
              Math.max(
                a.p_majority ?? 0,
                a.p_largest ?? 0,
                a.p_strict_largest ?? 0,
                a.p_tied_largest ?? 0,
              ),
          )
          .slice(0, 6);
        if (filtered.length === 0) {
          setError(
            locale === 'fr'
              ? 'Aucun parti avec probabilité ≥ 1 %.'
              : 'No party with probability ≥ 1%.',
          );
          setLoaded(true);
          return;
        }

        const labels = filtered.map((p) =>
          locale === 'fr' ? p.label_fr : p.label_en,
        );
        const colors = filtered.map((p) => p.color);

        const hasMajoritySeries = filtered.some((p) => (p.p_majority ?? 0) > 0);
        const traces = [
          hasMajoritySeries && {
            type: 'bar' as const,
            orientation: 'h' as const,
            name: locale === 'fr' ? 'P(majorité)' : 'P(majority)',
            y: labels,
            x: filtered.map((p) => (p.p_majority ?? 0) * 100),
            marker: { color: colors },
            text: filtered.map((p) => fmtPct(p.p_majority ?? 0)),
            textposition: 'outside' as const,
            textfont: { color: axisColor, size: 11 },
            hovertemplate:
              `%{y}<br>${locale === 'fr' ? 'P(majorité)' : 'P(majority)'}: %{x:.1f}%<extra></extra>`,
          },
          {
            type: 'bar' as const,
            orientation: 'h' as const,
            name: locale === 'fr' ? 'P(plus grand seul)' : 'P(largest alone)',
            y: labels,
            x: filtered.map(
              (p) => (p.p_strict_largest ?? p.p_largest ?? 0) * 100,
            ),
            marker: { color: colors, opacity: 0.45 },
            text: filtered.map((p) =>
              fmtPct(p.p_strict_largest ?? p.p_largest ?? 0),
            ),
            textposition: 'outside' as const,
            textfont: { color: axisColor, size: 11 },
            hovertemplate:
              `%{y}<br>${locale === 'fr' ? 'P(plus grand seul)' : 'P(largest alone)'}: %{x:.1f}%<extra></extra>`,
          },
        ].filter(Boolean);

        await Plotly.newPlot(
          ref.current,
          traces,
          {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            margin: { t: 8, b: 30, l: 92, r: 32 },
            xaxis: {
              range: [0, 110],
              ticksuffix: '%',
              color: axisColor,
              gridcolor: gridColor,
              zeroline: false,
            },
            yaxis: {
              color: axisColor,
              automargin: true,
              autorange: 'reversed' as const,
            },
            barmode: 'group' as const,
            bargap: 0.25,
            bargroupgap: 0.08,
            legend: {
              orientation: 'h' as const,
              y: -0.18,
              font: { color: axisColor, size: 11 },
            },
            font: { family: 'JetBrains Mono Variable, monospace' },
            hovermode: 'closest' as const,
          },
          { responsive: true, displayModeBar: false },
        );

        setLoaded(true);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (plotlyRef && ref.current) {
        try {
          plotlyRef.purge(ref.current);
        } catch {
          /* noop */
        }
      }
    };
  }, [parties, locale, axisColor, gridColor]);

  return (
    <div class="pe-chart-wrap">
      {error && (
        <p class="pe-chart-error" role="status">
          {error}
        </p>
      )}
      {!error && !loaded && (
        <p class="pe-chart-loading" role="status">
          {locale === 'fr' ? 'Chargement du graphique…' : 'Loading chart…'}
        </p>
      )}
      <div ref={ref} class="pe-chart" />
    </div>
  );
}
