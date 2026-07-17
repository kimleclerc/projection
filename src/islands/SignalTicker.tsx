import { useState } from 'preact/hooks';

type Signal = { label: string; value: string; href: string };
type Props = { signals: Signal[]; locale?: 'en' | 'fr' | 'es' };

const copy = {
  en: { label: 'Vote-Scope live signals', pause: 'Pause signals', resume: 'Resume signals' },
  fr: { label: 'Signaux en direct Vote-Scope', pause: 'Mettre les signaux en pause', resume: 'Reprendre les signaux' },
  es: { label: 'Señales en directo de Vote-Scope', pause: 'Pausar las señales', resume: 'Reanudar las señales' },
};

function SignalList({ signals, clone = false }: { signals: Signal[]; clone?: boolean }) {
  return (
    <div class="signal-list" aria-hidden={clone ? 'true' : undefined}>
      {signals.map((signal) => clone ? (
        <span class="signal-item signal-item-clone">
          <span>{signal.label}</span><strong>{signal.value}</strong>
        </span>
      ) : (
        <a href={signal.href} class="signal-item">
          <span>{signal.label}</span><strong>{signal.value}</strong>
        </a>
      ))}
    </div>
  );
}

export default function SignalTicker({ signals, locale = 'en' }: Props) {
  const [paused, setPaused] = useState(false);
  const t = copy[locale];
  return (
    <section class={`signal-ticker${paused ? ' is-paused' : ''}`} data-signal-ticker aria-label={t.label}>
      <button class="signal-pause" type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
        <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
        <span>{paused ? t.resume : t.pause}</span>
      </button>
      <div class="signal-viewport">
        <div class="signal-track">
          <SignalList signals={signals} />
          <SignalList signals={signals} clone />
        </div>
      </div>
    </section>
  );
}
