import { useEffect, useRef, useState } from 'preact/hooks';
import { readChartTheme, onThemeChange } from './lib/chart-theme';

export interface SeatRun {
  run_date: string;
  n_polls?: number;
  mode?: string;
  /** Sièges moyens par parti. Un parti ABSENT n'avait pas de projection. */
  seats: Record<string, number>;
}

export interface HistoryParty {
  party: string;
  label_en: string;
  label_fr: string;
  color: string;
}

interface Props {
  runs: SeatRun[];
  parties: HistoryParty[];
  /** Clés de partis à tracer, dans l'ordre d'affichage. */
  partiesOrder: string[];
  /** Seuil de majorité — trait de repère horizontal. */
  majorityThreshold?: number;
  locale: 'en' | 'fr' | 'es';
}

// ── ENCODAGE SECONDAIRE : POURQUOI LES SYMBOLES ET LES ÉTIQUETTES ──────────
// Les couleurs de partis sont imposées par l'identité politique, pas choisies.
// Passées au validateur de palette, elles ÉCHOUENT la séparation daltonienne :
// au fédéral, l'orange néo-démocrate et le vert du PVC tombent à ΔE 2,0 en
// protanopie (seuil 8) — deux lignes littéralement identiques pour un lecteur
// sur douze. On ne peut pas corriger la couleur ; on ajoute donc deux canaux
// qui ne dépendent pas d'elle : un symbole de marqueur par parti et une
// étiquette nominative au bout de chaque ligne. La légende reste, mais elle
// n'est plus le seul porteur d'identité.
const SYMBOLS = [
  'circle', 'square', 'diamond', 'triangle-up',
  'cross', 'x', 'triangle-down', 'pentagon',
];

const T = {
  fr: {
    empty: "Pas encore assez de runs archivés pour tracer une évolution.",
    loading: 'Chargement du graphique…',
    seats: 'sièges',
    majority: 'majorité',
  },
  en: {
    empty: 'Not enough archived runs yet to draw a trajectory.',
    loading: 'Loading chart…',
    seats: 'seats',
    majority: 'majority',
  },
  es: {
    empty: 'Aún no hay suficientes corridas archivadas para trazar una evolución.',
    loading: 'Cargando el gráfico…',
    seats: 'escaños',
    majority: 'mayoría',
  },
};

export default function SeatHistoryChart({
  runs,
  parties,
  partiesOrder,
  majorityThreshold,
  locale,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  const t = T[locale] ?? T.en;

  useEffect(() => onThemeChange(() => setThemeTick((n) => n + 1)), []);

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

        const { axis: axisColor, grid: gridColor, surface: surfaceColor }
          = readChartTheme();

        // Deux points ne font pas une trajectoire : sous ce seuil la courbe
        // ment plus qu'elle n'informe.
        if (runs.length < 3) {
          setError(t.empty);
          setLoaded(true);
          return;
        }

        const ordered = [...runs].sort((a, b) =>
          a.run_date < b.run_date ? -1 : a.run_date > b.run_date ? 1 : 0);
        const xDates = ordered.map((r) => r.run_date);
        const lastDate = xDates[xDates.length - 1];

        const partyByKey = new Map(parties.map((p) => [p.party, p]));
        const label = (p: HistoryParty) =>
          locale === 'fr' ? p.label_fr : p.label_en;

        // Ne tracer que les partis qui ont DÉJÀ décroché un siège quelque part
        // dans la fenêtre : une ligne plate à zéro sur cinquante runs mange de
        // la légende sans rien dire.
        const keys = partiesOrder.filter((k) => {
          if (!partyByKey.has(k)) return false;
          return ordered.some((r) => (r.seats?.[k] ?? 0) > 0);
        });

        const traces = keys.map((key, i) => {
          const meta = partyByKey.get(key)!;
          return {
            type: 'scatter' as const,
            mode: 'lines+markers' as const,
            name: label(meta),
            x: xDates,
            // Un parti absent du résumé d'un run n'y avait AUCUNE projection de
            // sièges : c'est un zéro, pas un trou. Tracer `null` briserait la
            // ligne au moment précis où l'effondrement est l'information.
            y: ordered.map((r) => Number(r.seats?.[key] ?? 0)),
            line: { color: meta.color, width: 2, shape: 'linear' as const },
            marker: {
              color: meta.color,
              size: 5,
              symbol: SYMBOLS[i % SYMBOLS.length],
              line: { color: surfaceColor, width: 1 },
            },
            hovertemplate:
              `%{x|%Y-%m-%d}<br>${label(meta)} : %{y:.0f} ${t.seats}<extra></extra>`,
          };
        });

        // Étiquette nominative au bout de chaque ligne — le canal d'identité
        // qui survit au daltonisme.
        const annotations = keys.map((key, i) => {
          const meta = partyByKey.get(key)!;
          const last = ordered[ordered.length - 1];
          return {
            x: lastDate,
            y: Number(last.seats?.[key] ?? 0),
            xref: 'x' as const,
            yref: 'y' as const,
            text: label(meta),
            showarrow: false,
            xanchor: 'left' as const,
            xshift: 8,
            font: { size: 10, color: axisColor },
          };
        });

        const shapes = typeof majorityThreshold === 'number' ? [{
          type: 'line' as const,
          xref: 'paper' as const, x0: 0, x1: 1,
          yref: 'y' as const, y0: majorityThreshold, y1: majorityThreshold,
          line: { color: axisColor, width: 1 },
          layer: 'below' as const,
        }] : [];

        if (typeof majorityThreshold === 'number') {
          annotations.push({
            x: 0 as any, y: majorityThreshold,
            xref: 'paper' as any, yref: 'y' as const,
            text: `${t.majority} · ${majorityThreshold}`,
            showarrow: false,
            xanchor: 'left' as const,
            xshift: 4,
            font: { size: 10, color: axisColor },
          } as any);
        }

        await Plotly.newPlot(
          ref.current,
          traces,
          {
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            // Marge droite large : les étiquettes de bout de ligne vivent là.
            margin: { t: 16, b: 56, l: 44, r: 96 },
            shapes,
            annotations,
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
              rangemode: 'tozero' as const,
              title: { text: t.seats, font: { size: 11, color: axisColor } },
            },
            legend: {
              orientation: 'h' as const,
              y: -0.22,
              font: { color: axisColor, size: 11 },
            },
            font: { family: 'JetBrains Mono Variable, monospace' },
            hovermode: 'x unified' as const,
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
        try { plotlyRef.purge(ref.current); } catch { /* noop */ }
      }
    };
  }, [runs, parties, partiesOrder, majorityThreshold, locale, themeTick]);

  return (
    <div
      class="pe-chart-wrap"
      data-analytics-event="projection_chart_interaction"
      data-analytics-chart-type="seat_history"
      data-analytics-once="true"
    >
      {error && <p class="pe-chart-error" role="status">{error}</p>}
      {!error && !loaded && <p class="pe-chart-loading" role="status">{t.loading}</p>}
      <div ref={ref} class="pe-chart" />
    </div>
  );
}
