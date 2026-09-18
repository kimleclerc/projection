import { useEffect, useRef, useState } from 'preact/hooks';
import { readChartTheme, onThemeChange, readableOn } from './lib/chart-theme';

export interface RankParty {
  party: string;
  label_en: string;
  label_fr: string;
  color: string;
  seats_mean?: number;
  p_largest?: number;
  /** Ajouté au moteur le 2026-09-14 ; absent des runs antérieurs. */
  p_second?: number;
}

interface Props {
  parties: RankParty[];
  locale: 'en' | 'fr' | 'es';
}

const T = {
  fr: {
    loading: 'Chargement du graphique…',
    missing: "Les probabilités de rang n'ont pas encore été calculées pour ce run.",
    first: 'Finit premier',
    second: 'Finit deuxième',
    rest: 'Troisième ou moins',
  },
  en: {
    loading: 'Loading chart…',
    missing: 'Rank probabilities have not been computed for this run yet.',
    first: 'Finishes first',
    second: 'Finishes second',
    rest: 'Third or lower',
  },
  es: {
    loading: 'Cargando el gráfico…',
    missing: 'Las probabilidades de rango aún no se han calculado para esta corrida.',
    first: 'Queda primero',
    second: 'Queda segundo',
    rest: 'Tercero o menos',
  },
};

/** #RRGGBB → rgba(), pour l'échelon pâle du rang 2. */
function fade(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const fmtPct = (v: number) => {
  if (v >= 0.995) return '>99 %';
  if (v > 0 && v < 0.005) return '<1 %';
  return `${Math.round(v * 100)} %`;
};

export default function SeatRankChart({ parties, locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Un compteur, pas la valeur du thème : il suffit qu'il change pour que
  // l'effet rejoue et redessine avec les jetons fraîchement résolus.
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

        const { axis: axisColor, grid: gridColor, surface: surfaceColor, ink }
          = readChartTheme();

        // Le champ est neuf côté moteur : tant qu'un run ne l'a pas produit,
        // dire ce qui manque vaut mieux qu'une barre vide qui se lit « 0 % ».
        // Un parti qui ne peut finir ni premier ni deuxième n'a rien à dire
        // ici : sa barre serait « troisième ou moins, >99 % » sur toute la
        // largeur — une ligne de bruit qui pousse les vraies vers le bas.
        const usable = parties.filter((p) =>
          typeof p.p_second === 'number'
          && (p.p_largest ?? 0) + (p.p_second ?? 0) > 0.005);
        if (!usable.length) {
          setError(t.missing);
          setLoaded(true);
          return;
        }

        // Plotly empile les catégories du bas vers le haut : inverser pour que
        // le parti le mieux placé se lise en HAUT.
        const rows = [...usable]
          .sort((a, b) => (a.p_largest ?? 0) - (b.p_largest ?? 0)
            || (a.seats_mean ?? 0) - (b.seats_mean ?? 0));

        const labels = rows.map((p) => (locale === 'fr' ? p.label_fr : p.label_en));
        const first = rows.map((p) => p.p_largest ?? 0);
        const second = rows.map((p) => p.p_second ?? 0);
        const rest = rows.map((p) =>
          Math.max(0, 1 - (p.p_largest ?? 0) - (p.p_second ?? 0)));

        // ── IDENTITÉ EN TEINTE, RANG EN INTENSITÉ ────────────────────────
        // La teinte appartient au parti (imposée par son identité politique,
        // et la même que partout ailleurs sur le site) ; le rang, qui est une
        // catégorie ORDONNÉE, se lit sur une rampe d'intensité de cette même
        // teinte. Les étiquettes chiffrées et le nom du parti en ordonnée
        // portent l'information sans dépendre de la couleur — ces palettes de
        // partis échouent la séparation daltonienne et ne peuvent pas changer.
        const bar = (
          name: string, x: number[], colors: string[], hoverName: string,
          textColors: string[],
        ) => ({
          type: 'bar' as const,
          orientation: 'h' as const,
          name,
          y: labels,
          x,
          marker: {
            color: colors,
            // Filet de 2 px à la couleur du fond : sépare les segments sans
            // dessiner de contour.
            line: { color: surfaceColor, width: 2 },
          },
          text: x.map((v) => (v >= 0.08 ? fmtPct(v) : '')),
          textposition: 'inside' as const,
          insidetextanchor: 'middle' as const,
          // Une étiquette POSÉE sur un aplat de parti prend le noir ou le
          // blanc, selon lequel se lit ; sur un fond translucide elle prend
          // l'encre du thème. Sans cela, le mode sombre écrivait en sombre
          // sur du sombre.
          textfont: {
            size: 11,
            family: 'JetBrains Mono Variable, monospace',
            color: textColors,
          },
          cliponaxis: false,
          hovertemplate: `%{y} — ${hoverName} : %{x:.0%}<extra></extra>`,
        });

        await Plotly.newPlot(
          ref.current,
          [
            bar(t.first, first, rows.map((p) => p.color), t.first,
                rows.map((p) => readableOn(p.color))),
            bar(t.second, second, rows.map((p) => fade(p.color, 0.42)), t.second,
                rows.map(() => ink)),
            bar(t.rest, rest, rows.map(() => fade(axisColor, 0.14)), t.rest,
                rows.map(() => ink)),
          ],
          {
            barmode: 'stack' as const,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            margin: { t: 8, b: 40, l: 104, r: 16 },
            xaxis: {
              color: axisColor,
              gridcolor: gridColor,
              zeroline: false,
              range: [0, 1],
              tickformat: '.0%',
            },
            yaxis: {
              color: axisColor,
              gridcolor: gridColor,
              zeroline: false,
              automargin: true,
            },
            // ── PAS DE LÉGENDE PLOTLY ICI ──────────────────────────────
            // `marker.color` est un TABLEAU (une teinte par parti) : Plotly
            // ne peut en mettre qu'une seule dans la pastille de légende et
            // prend la première. « Finit premier » se retrouvait donc en
            // rouge PLQ, ce qui se lit comme une affirmation sur le PLQ. La
            // légende est rebâtie en HTML, en gris neutre, sous le graphique.
            showlegend: false,
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
        try { plotlyRef.purge(ref.current); } catch { /* noop */ }
      }
    };
  }, [parties, locale, themeTick]);

  return (
    <div
      class="pe-chart-wrap"
      data-analytics-event="projection_chart_interaction"
      data-analytics-chart-type="seat_rank"
      data-analytics-once="true"
    >
      {error && <p class="pe-chart-error" role="status">{error}</p>}
      {!error && !loaded && <p class="pe-chart-loading" role="status">{t.loading}</p>}
      <div ref={ref} class="pe-chart" />
    </div>
  );
}
