import { useMemo, useState } from 'preact/hooks';
import type { Instrument } from '../data/editorial';

type Props = {
  instruments: Instrument[];
  labels: {
    all: string;
    live: string;
    next: string;
    planned: string;
    open: string;
  };
  lang?: 'en' | 'fr' | 'es';
};

const FAMILY: Record<string, Record<'en' | 'fr' | 'es', string>> = {
  Power: { en: 'Power', fr: 'Pouvoir', es: 'Poder' },
  Movement: { en: 'Movement', fr: 'Mouvement', es: 'Movimiento' },
  Markets: { en: 'Markets', fr: 'Marchés', es: 'Mercados' },
  Sports: { en: 'Sports', fr: 'Sports', es: 'Deportes' },
};
const GROUP = { en: 'Instrument status', fr: 'Statut des indices', es: 'Estado de los índices' };

const statuses = ['all', 'live', 'next', 'planned'] as const;
type Filter = (typeof statuses)[number];

export default function InstrumentFilter({ instruments, labels, lang = 'en' }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return instruments;
    return instruments.filter((instrument) => instrument.status === filter);
  }, [filter, instruments]);

  return (
    <div class="island-panel" data-instrument-filter>
      <div class="filter-row" role="group" aria-label={GROUP[lang]}>
        {statuses.map((status) => (
          <button
            type="button"
            aria-pressed={filter === status}
            class={filter === status ? 'active' : ''}
            onClick={() => setFilter(status)}
          >
            {labels[status]}
          </button>
        ))}
      </div>

      <div class="island-grid">
        {visible.map((instrument) => (
          <a class="island-card" href={instrument.href} key={instrument.id}>
            <span>{FAMILY[instrument.family]?.[lang] ?? instrument.family}</span>
            <h3>{instrument.name}</h3>
            <strong>{instrument.question}</strong>
            <p>{instrument.description}</p>
            <footer>
              <small>{instrument.cadence}</small>
              <em>{labels[instrument.status]}</em>
            </footer>
          </a>
        ))}
      </div>
    </div>
  );
}
