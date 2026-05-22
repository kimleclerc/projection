import { useEffect, useMemo, useState } from 'preact/hooks';

type Locale = 'en' | 'fr' | 'es';

interface Props {
  score: number;
  delta7d?: number;
  approvalLabel?: string;
  electionDate?: string;
  initialDaysToElection?: number | null;
  locale: Locale;
}

const copy = {
  en: {
    reading: "Today's reading",
    approval: 'Net approval',
    countdown: 'Days to midterms',
    tracker: 'NYT tracker',
    election: 'Nov 3, 2026',
    sevenDay: '7-day',
  },
  fr: {
    reading: 'Lecture du jour',
    approval: 'Approbation nette',
    countdown: 'Jours avant les midterms',
    tracker: 'Tracker NYT',
    election: '3 nov. 2026',
    sevenDay: '7 jours',
  },
  es: {
    reading: 'Lectura de hoy',
    approval: 'Aprobación neta',
    countdown: 'Días hasta las midterms',
    tracker: 'Tracker NYT',
    election: '3 nov. 2026',
    sevenDay: '7 días',
  },
};

function daysUntil(dateString?: string) {
  if (!dateString) return null;
  const target = new Date(`${dateString}T00:00:00-05:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

function deltaClass(delta?: number) {
  if (typeof delta !== 'number') return 'flat';
  if (delta > 0) return 'up';
  if (delta < 0) return 'down';
  return 'flat';
}

function deltaText(delta: number | undefined, sevenDay: string) {
  if (typeof delta !== 'number') return '—';
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '—';
  return `${arrow} ${Math.abs(delta).toFixed(1)} · ${sevenDay}`;
}

export default function HeroStats({
  score,
  delta7d,
  approvalLabel,
  electionDate,
  initialDaysToElection = null,
  locale,
}: Props) {
  const t = copy[locale] ?? copy.en;
  const [days, setDays] = useState<number | null>(initialDaysToElection);
  const deltaTone = useMemo(() => deltaClass(delta7d), [delta7d]);

  useEffect(() => {
    setDays(daysUntil(electionDate));
  }, [electionDate]);

  return (
    <div class="lame-duck-stats" aria-label="Lame-Duck live stats">
      <article>
        <p>{t.reading}</p>
        <strong>
          {score.toFixed(1)}
          <span>/100</span>
        </strong>
        <em class={`is-${deltaTone}`}>{deltaText(delta7d, t.sevenDay)}</em>
      </article>
      <article>
        <p>{t.approval}</p>
        <strong class="is-red">{approvalLabel ?? '—'}</strong>
        <em>{t.tracker}</em>
      </article>
      <article>
        <p>{t.countdown}</p>
        <strong>{days ?? '—'}</strong>
        <em>{t.election}</em>
      </article>
    </div>
  );
}
