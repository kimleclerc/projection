import { useEffect, useRef, useState } from 'preact/hooks';

export interface PollSnapshot {
  date: string;
  firm?: string;
  n?: number;
  weight?: number | null;
  // Party vote shares as keyed numbers (e.g. lib, con, ndp, bq, grn, ppc).
  [partyKey: string]: string | number | null | undefined;
}

export interface TrendParty {
  party: string;
  label_en: string;
  label_fr: string;
  color: string;
  vote_mean: number;
  vote_ci_low_95: number;
  vote_ci_high_95: number;
}

interface Props {
  polls: PollSnapshot[];
  parties: TrendParty[];
  /** Party keys to plot, in display order (typically the top 5 mainstream parties). */
  partiesOrder: string[];
  locale: 'en' | 'fr' | 'es';
  axisColor?: string;
  gridColor?: string;
}

export default function VoteTrendChart({
  polls,
  parties,
  partiesOrder,
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
        const Plotly =
          (await import('plotly.js-basic-dist-min')).default ??
          (await import('plotly.js-basic-dist-min'));
        plotlyRef = Plotly;
        if (cancelled || !ref.current) return;

        if (!polls.length) {
          setError(
            locale === 'fr'
              ? 'Aucun sondage exploitable pour cette juridiction.'
              : locale === 'es'
                ? 'No hay historial de sondeos utilizable para esta jurisdicción.'
                : 'No usable polling history is available for this jurisdiction.',
          );
          setLoaded(true);
          return;
        }

        const partyByKey = new Map(parties.map((p) => [p.party, p]));
        const orderedKeys = partiesOrder.filter((k) => partyByKey.has(k));
        const xDates = polls.map((p) => String(p.date));

        const pollTraces = orderedKeys.map((key) => {
          const meta = partyByKey.get(key)!;
          const y = polls.map((p) => {
            const v = p[key];
            return typeof v === 'number' ? v : null;
          });
          return {
            type: 'scatter' as const,
            mode: 'markers' as const,
            name: locale === 'fr' ? meta.label_fr : meta.label_en,
            x: xDates,
            y,
            marker: { color: meta.color, size: 5, opacity: 0.55 },
            legendgroup: key,
            hovertemplate: `%{x|%Y-%m-%d}<br>${
              locale === 'fr' ? meta.label_fr : meta.label_en
            } : %{y:.1f}%<extra></extra>`,
          };
        });

        const lastDate = xDates[xDates.length - 1];
        const estimateTraces = orderedKeys.map((key) => {
          const meta = partyByKey.get(key)!;
          return {
            type: 'scatter' as const,
            mode: 'markers' as const,
            name: `${locale === 'fr' ? meta.label_fr : meta.label_en} (${
              locale === 'fr' ? 'modèle' : locale === 'es' ? 'modelo' : 'model'
            })`,
            x: [lastDate],
            y: [meta.vote_mean],
            marker: {
              color: meta.color,
              size: 12,
              symbol: 'diamond',
              line: { color: 'white', width: 1 },
            },
            error_y: {
              type: 'data' as const,
              symmetric: false,
              array: [meta.vote_ci_high_95 - meta.vote_mean],
              arrayminus: [meta.vote_mean - meta.vote_ci_low_95],
              color: meta.color,
              thickness: 1.5,
              width: 4,
            },
            legendgroup: key,
            showlegend: false,
            hovertemplate: `${locale === 'fr' ? 'Modèle' : locale === 'es' ? 'Modelo' : 'Model'} ${
              locale === 'fr' ? meta.label_fr : meta.label_en
            }<br>%{y:.1f}% [${meta.vote_ci_low_95.toFixed(
              1,
            )}–${meta.vote_ci_high_95.toFixed(1)}]<extra></extra>`,
          };
        });

        await Plotly.newPlot(
          ref.current,
          [...pollTraces, ...estimateTraces],
          {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            margin: { t: 8, b: 56, l: 40, r: 16 },
            xaxis: {
              type: 'date' as const,
              color: axisColor,
              gridcolor: gridColor,
              zeroline: false,
            },
            yaxis: {
              color: axisColor,
              gridcolor: gridColor,
              zeroline: false,
              ticksuffix: '%',
              rangemode: 'tozero' as const,
            },
            legend: {
              orientation: 'h' as const,
              y: -0.22,
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
  }, [polls, parties, partiesOrder, locale, axisColor, gridColor]);

  return (
    <div class="pe-chart-wrap">
      {error && (
        <p class="pe-chart-error" role="status">
          {error}
        </p>
      )}
      {!error && !loaded && (
        <p class="pe-chart-loading" role="status">
          {locale === 'fr' ? 'Chargement du graphique…' : locale === 'es' ? 'Cargando el gráfico…' : 'Loading chart…'}
        </p>
      )}
      <div ref={ref} class="pe-chart" />
    </div>
  );
}
