import { useMemo, useState } from 'preact/hooks';
import {
  blocVar,
  blocLabel,
  fmtPct1,
  type Locale,
  type ScenarioCard,
} from '../lib/fr-pres';

interface Props {
  scenarios: ScenarioCard[];
  locale: Locale;
}

const COPY = {
  fr: {
    lineup: 'Casting testé',
    polls: (n: number) => `${n} sondage${n > 1 ? 's' : ''}`,
    firstRound: 'Premier tour',
    firstRoundHelp:
      'Intention de vote moyenne ± incertitude du modèle. Les deux premiers se qualifient pour le second tour.',
    secondRound: 'Second tour projeté',
    duelHelp: 'Report des voix estimé à partir des sondages de duel et des reports historiques.',
    qualifies: 'Qualifié·e',
    winner: 'l’emporte',
    pDuel: 'Probabilité de ce duel',
    noDuel: 'Pas de duel projeté pour ce casting.',
  },
  en: {
    lineup: 'Tested lineup',
    polls: (n: number) => `${n} poll${n > 1 ? 's' : ''}`,
    firstRound: 'First round',
    firstRoundHelp:
      'Mean voting intention ± model uncertainty. The top two advance to the runoff.',
    secondRound: 'Projected runoff',
    duelHelp: 'Vote transfer estimated from duel polls and historical transfer patterns.',
    qualifies: 'Advances',
    winner: 'wins',
    pDuel: 'Probability of this matchup',
    noDuel: 'No projected runoff for this lineup.',
  },
  es: {
    lineup: 'Combinación sondeada',
    polls: (n: number) => `${n} sondeo${n > 1 ? 's' : ''}`,
    firstRound: 'Primera vuelta',
    firstRoundHelp:
      'Intención de voto media ± incertidumbre del modelo. Los dos primeros pasan a la segunda vuelta.',
    secondRound: 'Segunda vuelta proyectada',
    duelHelp: 'Transferencia de votos estimada a partir de sondeos de duelo y transferencias históricas.',
    qualifies: 'Pasa',
    winner: 'gana',
    pDuel: 'Probabilidad de este duelo',
    noDuel: 'No hay segunda vuelta proyectada para esta combinación.',
  },
} as const;

export default function FranceScenarioExplorer({ scenarios, locale }: Props) {
  const t = COPY[locale];
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id ?? '');
  const current = useMemo(
    () => scenarios.find((s) => s.id === selectedId) ?? scenarios[0],
    [scenarios, selectedId],
  );
  if (!current) return null;

  const maxMean = Math.max(...current.qualification.map((q) => q.mean), 1);

  return (
    <div class="fse">
      {/* Sélecteur de scénarios */}
      <div class="fse-tabs" role="tablist" aria-label={t.lineup}>
        {scenarios.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === current.id}
            class={`fse-tab${s.id === current.id ? ' is-active' : ''}`}
            onClick={() => setSelectedId(s.id)}
          >
            <span class="fse-tab-label">{s.label}</span>
            <span class="fse-tab-polls">{t.polls(s.nPolls)}</span>
          </button>
        ))}
      </div>

      {/* Premier tour */}
      <section class="fse-block" aria-label={t.firstRound}>
        <header class="fse-block-head">
          <h3>{t.firstRound}</h3>
          <p>{t.firstRoundHelp}</p>
        </header>
        <ul class="fse-bars">
          {current.qualification.map((q, i) => {
            const qualifies = i < 2;
            const pct = (q.mean / maxMean) * 100;
            const sdPct = (q.sd / maxMean) * 100;
            return (
              <li
                key={q.id}
                class={`fse-bar-row${qualifies ? ' is-top2' : ''}`}
                title={`${q.name} · ${blocLabel(q.bloc, locale)} · ${fmtPct1(q.mean, locale)} ± ${q.sd
                  .toFixed(1)
                  .replace('.', locale === 'fr' ? ',' : '.')}`}
              >
                <span class="fse-bar-name">
                  {q.name}
                  {qualifies && <span class="fse-qual">{t.qualifies}</span>}
                </span>
                <span class="fse-bar-track">
                  <span
                    class="fse-bar-fill"
                    style={{ width: `${pct}%`, background: blocVar(q.bloc) }}
                  />
                  {/* Barre d'incertitude ±sd */}
                  <span
                    class="fse-bar-ci"
                    style={{ left: `${Math.max(0, pct - sdPct)}%`, width: `${sdPct * 2}%` }}
                  />
                </span>
                <span class="fse-bar-val">{fmtPct1(q.mean, locale)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Second tour */}
      <section class="fse-block" aria-label={t.secondRound}>
        <header class="fse-block-head">
          <h3>{t.secondRound}</h3>
          <p>{t.duelHelp}</p>
        </header>
        {current.duel ? (
          <div class="fse-duel">
            <div class="fse-duel-bar" role="img"
              aria-label={`${current.duel.leftName} ${fmtPct1(current.duel.leftShare, locale)} — ${current.duel.rightName} ${fmtPct1(current.duel.rightShare, locale)}`}>
              <span
                class={`fse-duel-side left${current.duel.winnerId === current.duel.leftId ? ' is-winner' : ''}`}
                style={{ width: `${current.duel.leftShare}%`, background: blocVar(blocOf(current, current.duel.leftId)) }}
              >
                <span class="fse-duel-share">{fmtPct1(current.duel.leftShare, locale)}</span>
              </span>
              <span
                class={`fse-duel-side right${current.duel.winnerId === current.duel.rightId ? ' is-winner' : ''}`}
                style={{ width: `${current.duel.rightShare}%`, background: blocVar(blocOf(current, current.duel.rightId)) }}
              >
                <span class="fse-duel-share">{fmtPct1(current.duel.rightShare, locale)}</span>
              </span>
            </div>
            <div class="fse-duel-names">
              <span>{current.duel.leftName}</span>
              <span>{current.duel.rightName}</span>
            </div>
            <p class="fse-duel-note">
              <strong>
                {current.duel.winnerId === current.duel.leftId
                  ? current.duel.leftName
                  : current.duel.rightName}{' '}
                {t.winner}
              </strong>{' '}
              · {t.pDuel} : {Math.round(current.duel.pDuel * 100)}%
            </p>
          </div>
        ) : (
          <p class="fse-empty">{t.noDuel}</p>
        )}
      </section>
    </div>
  );
}

function blocOf(card: ScenarioCard, candidateId: string): string {
  return card.qualification.find((q) => q.id === candidateId)?.bloc ?? 'other';
}
