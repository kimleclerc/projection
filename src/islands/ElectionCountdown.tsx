import { useEffect, useMemo, useState } from 'preact/hooks';

interface Props {
  targetDate: string;
  locale: 'en' | 'fr' | 'es';
  title?: string;
  kicker?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_HOUR = 60 * 60 * 1000;
const MS_MINUTE = 60 * 1000;

function targetInstant(targetDate: string) {
  return new Date(`${targetDate}T00:00:00-04:00`).getTime();
}

function getRemaining(targetDate: string): Remaining {
  const diff = targetInstant(targetDate) - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(diff / MS_DAY),
    hours: Math.floor((diff % MS_DAY) / MS_HOUR),
    minutes: Math.floor((diff % MS_HOUR) / MS_MINUTE),
    seconds: Math.floor((diff % MS_MINUTE) / 1000),
    done: false,
  };
}

function formatDate(targetDate: string, locale: 'en' | 'fr' | 'es') {
  const browserLocale = locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es-MX' : 'en-CA';
  return new Date(`${targetDate}T12:00:00-04:00`).toLocaleDateString(
    browserLocale,
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  );
}

export default function ElectionCountdown({
  targetDate,
  locale,
  title,
  kicker,
}: Props) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const electionDate = useMemo(
    () => formatDate(targetDate, locale),
    [targetDate, locale],
  );

  useEffect(() => {
    const update = () => setRemaining(getRemaining(targetDate));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  const t = {
    kicker:
      kicker ??
      (locale === 'fr'
        ? 'Jour du vote'
        : locale === 'es'
        ? 'Día de la elección'
        : 'Election day'),
    title:
      title ??
      (locale === 'fr'
        ? 'Le jour du vote approche.'
        : locale === 'es'
        ? 'Se acerca el día de la elección.'
        : 'Election day approaches.'),
    datePrefix:
      locale === 'fr' ? 'Scrutin :' : locale === 'es' ? 'Votación:' : 'Vote:',
    days: locale === 'fr' ? 'jours' : locale === 'es' ? 'días' : 'days',
    hours: locale === 'fr' ? 'heures' : locale === 'es' ? 'horas' : 'hours',
    minutes: locale === 'fr' ? 'minutes' : locale === 'es' ? 'minutos' : 'minutes',
    seconds: locale === 'fr' ? 'secondes' : locale === 'es' ? 'segundos' : 'seconds',
    live:
      locale === 'fr'
        ? 'Compte à rebours en direct'
        : locale === 'es'
        ? 'Cuenta regresiva en directo'
        : 'Live countdown',
    done:
      locale === 'fr'
        ? 'Le scrutin est en cours.'
        : locale === 'es'
        ? 'La jornada electoral está en marcha.'
        : 'Election day is underway.',
  };

  const cells = remaining
    ? [
        [remaining.days, t.days],
        [remaining.hours, t.hours],
        [remaining.minutes, t.minutes],
        [remaining.seconds, t.seconds],
      ]
    : [
        ['--', t.days],
        ['--', t.hours],
        ['--', t.minutes],
        ['--', t.seconds],
      ];

  return (
    <aside class="election-countdown" aria-label={t.live}>
      <div class="election-countdown-copy">
        <p>{t.kicker}</p>
        <h2>{remaining?.done ? t.done : t.title}</h2>
        <span>
          {t.datePrefix} {electionDate}
        </span>
      </div>
      <p class="sr-only" aria-live="polite">
        {remaining?.done
          ? t.done
          : remaining
            ? `${remaining.days} ${t.days}, ${remaining.hours} ${t.hours}, ${remaining.minutes} ${t.minutes}`
            : ''}
      </p>
      <div class="election-countdown-grid" role="timer" aria-label={t.live}>
        {cells.map(([value, label]) => (
          <div class="election-countdown-cell" aria-hidden={label === t.seconds ? 'true' : undefined}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
