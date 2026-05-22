import { useEffect, useMemo, useState } from 'preact/hooks';
import type { LameDuckHistoryPoint, LameDuckLocale, LameDuckPresident } from '../data/lameDuck';

interface Props {
  history: LameDuckHistoryPoint[];
  presidents: LameDuckPresident[];
  currentScore: number;
  locale: LameDuckLocale;
}

const copy = {
  en: {
    selected: 'Selected date',
    ldi: 'LDI',
    approval: 'Net approval',
    current: 'Current LDI',
    termEnd: 'Term-end LDI',
    close: 'Close',
    start: 'Start',
    end: 'End',
    change: 'Change',
  },
  fr: {
    selected: 'Date choisie',
    ldi: 'ICB',
    approval: 'Approbation nette',
    current: 'Indice actuel',
    termEnd: 'Indice final',
    close: 'Fermer',
    start: 'Début',
    end: 'Fin',
    change: 'Changement',
  },
  es: {
    selected: 'Fecha seleccionada',
    ldi: 'LDI',
    approval: 'Aprobación neta',
    current: 'LDI actual',
    termEnd: 'LDI final',
    close: 'Cerrar',
    start: 'Inicio',
    end: 'Fin',
    change: 'Cambio',
  },
};

function fmtDate(dateString: string, locale: LameDuckLocale) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  const browserLocale = locale === 'fr' ? 'fr-CA' : locale === 'es' ? 'es-US' : 'en-US';
  return date.toLocaleDateString(browserLocale, { month: 'short', day: 'numeric', year: 'numeric' });
}

function linePath(values: Array<number | null | undefined>, width: number, height: number, min = 0, max = 100) {
  const valid = values.map((value, index) => ({ value, index })).filter((point) => typeof point.value === 'number');
  if (valid.length < 2) return '';
  const lastIndex = values.length - 1 || 1;
  return valid
    .map((point, segmentIndex) => {
      const x = (point.index / lastIndex) * width;
      const y = height - (((point.value as number) - min) / (max - min)) * height;
      return `${segmentIndex === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function spark(values: number[] = []) {
  return linePath(values, 130, 42);
}

function partyColor(party?: string) {
  return party === 'D' ? 'var(--blue)' : party === 'R' ? 'var(--red)' : 'var(--ink-3)';
}

export default function LameDuckHistory({ history, presidents, currentScore, locale }: Props) {
  const t = copy[locale] ?? copy.en;
  const cleanHistory = useMemo(() => history.filter((point) => typeof point.ldi === 'number'), [history]);
  const [index, setIndex] = useState(Math.max(0, cleanHistory.length - 1));
  const [selectedPresident, setSelectedPresident] = useState<LameDuckPresident | null>(null);
  const selected = cleanHistory[index] ?? cleanHistory[cleanHistory.length - 1];
  const ldiPath = linePath(cleanHistory.map((point) => point.ldi), 900, 280);
  const approvalPath = linePath(cleanHistory.map((point) => point.net_approval), 900, 280, -30, 30);
  const markerX = cleanHistory.length > 1 ? (index / (cleanHistory.length - 1)) * 900 : 900;
  const markerY = selected?.ldi != null ? 280 - (selected.ldi / 100) * 280 : 140;

  useEffect(() => {
    if (!selectedPresident) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPresident(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPresident]);

  return (
    <div class="lame-duck-history">
      <article class="lame-duck-history-chart">
        <header>
          <div>
            <p class="eyebrow">{t.selected}</p>
            <h3>{selected ? fmtDate(selected.date, locale) : '—'}</h3>
          </div>
          <dl>
            <div>
              <dt>{t.ldi}</dt>
              <dd>{selected?.ldi?.toFixed(1) ?? '—'}</dd>
            </div>
            <div>
              <dt>{t.approval}</dt>
              <dd>{selected?.net_approval != null ? `${selected.net_approval.toFixed(1)}pp` : '—'}</dd>
            </div>
          </dl>
        </header>
        <svg viewBox="0 0 900 300" role="img" aria-label="Lame-Duck Index history">
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = 280 - (tick / 100) * 280 + 10;
            return (
              <g key={tick}>
                <line x1="0" y1={y} x2="900" y2={y} />
                <text x="0" y={y - 4}>{tick}</text>
              </g>
            );
          })}
          {approvalPath && <path class="approval-line" d={approvalPath} transform="translate(0 10)" />}
          {ldiPath && <path class="ldi-line" d={ldiPath} transform="translate(0 10)" />}
          <line class="marker-line" x1={markerX} y1="10" x2={markerX} y2="290" />
          <circle class="marker-dot" cx={markerX} cy={markerY + 10} r="5" />
        </svg>
        <input
          type="range"
          min="0"
          max={Math.max(0, cleanHistory.length - 1)}
          value={index}
          onInput={(event) => setIndex(Number((event.currentTarget as HTMLInputElement).value))}
          aria-label={t.selected}
        />
      </article>

      <div class="lame-duck-president-grid">
        {presidents.map((president) => (
          <button
            type="button"
            class="lame-duck-president-card"
            key={`${president.name}-${president.term}`}
            onClick={() => setSelectedPresident(president)}
          >
            <span>{president.term}</span>
            <strong>{president.name}</strong>
            {president.sparkline && (
              <svg viewBox="0 0 130 42" preserveAspectRatio="none" aria-hidden="true">
                <path d={spark(president.sparkline)} stroke={partyColor(president.party)} />
              </svg>
            )}
            <em>{president.final_ldi ?? '—'}</em>
            <small>{t.termEnd}</small>
          </button>
        ))}
        <article class="lame-duck-president-card is-current">
          <span>2025—</span>
          <strong>Trump</strong>
          <svg viewBox="0 0 130 42" preserveAspectRatio="none" aria-hidden="true">
            <path d={linePath(cleanHistory.map((point) => point.ldi), 130, 42)} stroke="var(--duck-deep)" />
          </svg>
          <em>{currentScore.toFixed(1)}</em>
          <small>{t.current}</small>
        </article>
      </div>

      {selectedPresident && (
        <div
          class="lame-duck-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPresident.name}
          onClick={(event) => {
            if (event.currentTarget === event.target) setSelectedPresident(null);
          }}
        >
          <div class="lame-duck-modal-panel">
            <button type="button" onClick={() => setSelectedPresident(null)}>{t.close}</button>
            <p class="eyebrow">{selectedPresident.party ?? '—'} · {selectedPresident.term}</p>
            <h3>{selectedPresident.name}</h3>
            <svg viewBox="0 0 560 180" preserveAspectRatio="none" aria-hidden="true">
              <path d={linePath(selectedPresident.sparkline ?? [], 560, 180)} stroke={partyColor(selectedPresident.party)} />
            </svg>
            <dl>
              <div>
                <dt>{t.start}</dt>
                <dd>{selectedPresident.sparkline?.[0]?.toFixed(0) ?? '—'}</dd>
              </div>
              <div>
                <dt>{t.end}</dt>
                <dd>{selectedPresident.final_ldi ?? selectedPresident.sparkline?.at(-1)?.toFixed(0) ?? '—'}</dd>
              </div>
              <div>
                <dt>{t.change}</dt>
                <dd>
                  {selectedPresident.sparkline && selectedPresident.sparkline.length > 1
                    ? `${(selectedPresident.sparkline.at(-1)! - selectedPresident.sparkline[0]).toFixed(0)}`
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
