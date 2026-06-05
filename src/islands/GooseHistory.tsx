import type { GooseHistoryPoint, GooseLocale } from '../data/canadaGoose';

interface Props {
  history: GooseHistoryPoint[];
  currentScore: number;
  locale: GooseLocale;
}

const copy = {
  en: { title: 'Index since launch', collecting: 'Collecting daily readings — the series builds over time.', latest: 'Latest', points: 'readings' },
  fr: { title: 'Indice depuis le lancement', collecting: 'Lectures quotidiennes en cours — la série se construit avec le temps.', latest: 'Dernier', points: 'lectures' },
  es: { title: 'Índice desde el lanzamiento', collecting: 'Recopilando lecturas diarias — la serie se construye con el tiempo.', latest: 'Último', points: 'lecturas' },
};

export default function GooseHistory({ history, currentScore, locale }: Props) {
  const t = copy[locale] ?? copy.en;
  const pts = history.filter((h) => typeof h.cgi === 'number') as Array<Required<Pick<GooseHistoryPoint, 'date' | 'cgi'>> & GooseHistoryPoint>;

  if (pts.length < 2) {
    return (
      <div class="note-card" style="max-width:560px">
        <p class="eyebrow">{t.title}</p>
        <p>{t.collecting}</p>
        <p style="font-family:var(--mono);color:var(--ink-3);margin-top:.5rem">
          {t.latest}: {currentScore.toFixed(1)}/100 · {pts.length} {t.points}
        </p>
      </div>
    );
  }

  const W = 720;
  const H = 220;
  const padL = 36;
  const padB = 24;
  const padT = 12;
  const xs = pts.map((_, i) => padL + (i / (pts.length - 1)) * (W - padL - 12));
  const ys = pts.map((p) => padT + (1 - (p.cgi as number) / 100) * (H - padT - padB));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${H - padB} L ${xs[0].toFixed(1)} ${H - padB} Z`;

  return (
    <div>
      <p class="eyebrow">{t.title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style="width:100%;height:auto;overflow:visible" role="img" aria-label={t.title}>
        <defs>
          <linearGradient id="gooseArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--blue)" stop-opacity="0.28" />
            <stop offset="100%" stop-color="var(--blue)" stop-opacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((tv) => {
          const y = padT + (1 - tv / 100) * (H - padT - padB);
          return (
            <g key={tv}>
              <line x1={padL} y1={y} x2={W - 12} y2={y} stroke="var(--paper-3)" stroke-width="1" />
              <text x={padL - 6} y={y + 3} font-size="10" font-family="var(--mono)" fill="var(--ink-3)" text-anchor="end">{tv}</text>
            </g>
          );
        })}
        <path d={area} fill="url(#gooseArea)" />
        <path d={path} fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linejoin="round" />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="4" fill="var(--blue)" />
      </svg>
    </div>
  );
}
