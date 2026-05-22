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
};

const statuses = ['all', 'live', 'next', 'planned'] as const;
type Filter = (typeof statuses)[number];

export default function InstrumentFilter({ instruments, labels }: Props) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return instruments;
    return instruments.filter((instrument) => instrument.status === filter);
  }, [filter, instruments]);

  return (
    <div class="island-panel" data-instrument-filter>
      <div class="filter-row" role="group" aria-label="Instrument status">
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
            <span>{instrument.family}</span>
            <h3>{instrument.name}</h3>
            <strong>{instrument.question}</strong>
            <p>{instrument.description}</p>
            <footer>
              <small>{instrument.cadence}</small>
              <em>{instrument.status}</em>
            </footer>
          </a>
        ))}
      </div>
    </div>
  );
}
