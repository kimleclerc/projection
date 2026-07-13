import { useMemo, useState } from 'preact/hooks';
import RidingsMap, { type MapParty, type RidingFull } from './RidingsMap';

type Locale = 'fr' | 'en' | 'es';

interface Props {
  blocRidings: RidingFull[];
  candidateRidings: RidingFull[];
  round2Ridings: RidingFull[];
  blocParties: MapParty[];
  candidateParties: MapParty[];
  round2Parties: MapParty[];
  locale: Locale;
  geoUrl?: string;
}

const COPY: Record<Locale, {
  round1: string;
  round2: string;
  viewWinner: string;
  viewCandidate: string;
  candidateLabel: string;
}> = {
  fr: {
    round1: '1er tour',
    round2: '2d tour',
    viewWinner: 'Bloc en tête',
    viewCandidate: 'Par candidat',
    candidateLabel: 'Candidat·e',
  },
  en: {
    round1: 'Round 1',
    round2: 'Round 2',
    viewWinner: 'Leading bloc',
    viewCandidate: 'By candidate',
    candidateLabel: 'Candidate',
  },
  es: {
    round1: '1.ª vuelta',
    round2: '2.ª vuelta',
    viewWinner: 'Bloque en cabeza',
    viewCandidate: 'Por candidato·a',
    candidateLabel: 'Candidato·a',
  },
};

export default function PresidentialMaps({
  blocRidings,
  candidateRidings,
  round2Ridings,
  blocParties,
  candidateParties,
  round2Parties,
  locale,
  geoUrl = '/web_data/france-legislative/ridings.geojson',
}: Props) {
  const t = COPY[locale];
  const mapLocale: 'en' | 'fr' = locale === 'en' ? 'en' : 'fr';

  const [round, setRound] = useState<1 | 2>(1);
  const [view, setView] = useState<'winner' | 'candidate'>('winner');
  const [candidate, setCandidate] = useState<string>(candidateParties[0]?.key ?? '');

  const candidateColor = useMemo(
    () => candidateParties.find((p) => p.key === candidate)?.color ?? '#888888',
    [candidateParties, candidate],
  );

  return (
    <div class="pm-wrap">
      <div class="pm-controls" role="group" aria-label={`${t.round1} / ${t.round2}`}>
        <div class="pm-segmented" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={round === 1}
            class={`pm-seg-btn${round === 1 ? ' is-active' : ''}`}
            onClick={() => setRound(1)}
          >
            {t.round1}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={round === 2}
            class={`pm-seg-btn${round === 2 ? ' is-active' : ''}`}
            onClick={() => setRound(2)}
          >
            {t.round2}
          </button>
        </div>

        {round === 1 && (
          <div class="pm-segmented" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'winner'}
              class={`pm-seg-btn${view === 'winner' ? ' is-active' : ''}`}
              onClick={() => setView('winner')}
            >
              {t.viewWinner}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'candidate'}
              class={`pm-seg-btn${view === 'candidate' ? ' is-active' : ''}`}
              onClick={() => setView('candidate')}
            >
              {t.viewCandidate}
            </button>
          </div>
        )}

        {round === 1 && view === 'candidate' && (
          <label class="pm-select-wrap">
            <span class="pm-select-label">{t.candidateLabel}</span>
            <select
              class="pm-select"
              value={candidate}
              onChange={(e) => setCandidate((e.target as HTMLSelectElement).value)}
            >
              {candidateParties.map((p) => (
                <option key={p.key} value={p.key}>
                  {locale === 'en' ? p.label_en : p.label_fr}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {round === 2 && (
        <RidingsMap
          key="r2"
          geoUrl={geoUrl}
          ridings={round2Ridings}
          parties={round2Parties}
          locale={mapLocale}
          center={[46.6, 2.4]}
          zoom={5}
          idProp="riding_id"
        />
      )}
      {round === 1 && view === 'winner' && (
        <RidingsMap
          key="r1-winner"
          geoUrl={geoUrl}
          ridings={blocRidings}
          parties={blocParties}
          locale={mapLocale}
          center={[46.6, 2.4]}
          zoom={5}
          idProp="riding_id"
        />
      )}
      {round === 1 && view === 'candidate' && (
        <RidingsMap
          key={`r1-cand-${candidate}`}
          geoUrl={geoUrl}
          ridings={candidateRidings}
          parties={candidateParties}
          locale={mapLocale}
          center={[46.6, 2.4]}
          zoom={5}
          idProp="riding_id"
          mode="heat"
          heatKey={candidate}
          heatColor={candidateColor}
        />
      )}

      <style>{`
        .pm-wrap { display: flex; flex-direction: column; gap: 14px; }
        .pm-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
        .pm-segmented { display: inline-flex; border: 1px solid var(--rule, #ddd); border-radius: 4px; overflow: hidden; }
        .pm-seg-btn { font-family: var(--mono, monospace); font-size: 11px; letter-spacing: .04em; padding: 7px 13px; background: var(--card, #fff); color: var(--ink-2, #555); border: none; border-right: 1px solid var(--rule, #ddd); cursor: pointer; }
        .pm-seg-btn:last-child { border-right: none; }
        .pm-seg-btn.is-active { background: var(--accent, var(--ink)); color: var(--paper, #fff); }
        .pm-select-wrap { display: inline-flex; align-items: center; gap: 8px; font-family: var(--mono, monospace); font-size: 11px; color: var(--ink-2, #555); }
        .pm-select { font-family: var(--mono, monospace); font-size: 12px; padding: 6px 8px; border: 1px solid var(--rule, #ddd); border-radius: 4px; background: var(--card, #fff); color: var(--ink, #1a1a1a); }
      `}</style>
    </div>
  );
}
