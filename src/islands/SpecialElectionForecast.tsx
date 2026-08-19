import { useEffect, useMemo, useState } from 'preact/hooks';

type Locale = 'en' | 'fr' | 'es';

interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
  projected_vote_mean: number;
  top_two_probability: number;
  first_place_probability: number;
  vote_quantiles?: Record<string, number>;
}

interface Pair {
  pair: string[];
  probability: number;
}

interface NoteItem {
  label: string;
  note: string;
}

interface SourceItem {
  label: string;
  url: string;
}

interface SpecialElectionData {
  meta: {
    run_date: string;
    election_date: string;
    possible_runoff_date?: string;
    n_simulations: number;
    model_type: string;
    race_format?: 'top_two_primary' | 'head_to_head' | 'party_control';
  };
  district: {
    state: string;
    district: string;
    vacancy_reason: string;
    district_context?: {
      house_2024_republican_share?: number;
      house_2024_democratic_share?: number;
      note?: string;
    };
  };
  candidates: Candidate[];
  summary: {
    favorite_name: string;
    favorite_probability: number;
    runoff_probability: number;
    majority_outright_probability: number;
    likely_runoff_names: string[];
    likely_runoff_probability: number;
    if_likely_runoff_favorite: string;
    if_likely_runoff_favorite_probability: number;
    projected_margin_mean?: number;
  };
  benchmarks: {
    assumptions: NoteItem[];
    top_two_pairs: Pair[];
  };
  sources: SourceItem[];
  method_note: string;
}

interface Props {
  initialData: SpecialElectionData;
  locale: Locale;
  dataUrl: string;
  slug: string;
}

const copy = {
  en: {
    favorite: "Primary favorite",
    firstPlace: "first-place probability",
    runoff: "Runoff probability",
    outright: "Outright win chance",
    pair: "Likely runoff pair",
    candidates: "Candidate ranking",
    candidatesHelp:
      "Projected primary vote, top-two probability and first-place odds across the simulated all-party field.",
    projectedPrimaryField: "Projected primary field",
    topTwoPairs: "TOP-TWO PAIRS",
    conditionalRunoffView: "CONDITIONAL RUNOFF VIEW",
    modelInputs: "MODEL INPUTS",
    publicReferencePoints: "PUBLIC REFERENCE POINTS",
    topTwo: "Most likely top-two outcomes",
    runoffView: "Conditional runoff view",
    assumptions: "Main assumptions",
    sources: "Sources",
    model: "Model note",
    district: "District context",
    vote: "Projected vote",
    top2: "Top two",
    first: "First",
    simulations: "simulations",
    json: "JSON",
    updated: "Updated",
    loading: "Refreshing forecast...",
    error:
      "The live CA-1 projection file did not refresh. Showing the build-time forecast.",
    runoffBody: (name: string, prob: string) =>
      `${name} would be favored in the expected runoff pairing at about ${prob}, while that August race still depends on who survives the crowded June 2 field.`,
  },
  fr: {
    favorite: "Favori de la primaire",
    firstPlace: "probabilité de finir premier",
    runoff: "Probabilité de second tour",
    outright: "Chance de victoire directe",
    pair: "Duel probable au second tour",
    candidates: "Classement des candidats",
    candidatesHelp:
      "Vote primaire projeté, probabilité de top 2 et chances de finir premier dans le champ simulé.",
    projectedPrimaryField: "Champ primaire projeté",
    topTwoPairs: "PAIRES TOP-2",
    conditionalRunoffView: "VUE CONDITIONNELLE DU SECOND TOUR",
    modelInputs: "PARAMÈTRES DU MODÈLE",
    publicReferencePoints: "POINTS DE RÉFÉRENCE PUBLICS",
    topTwo: "Issues top 2 les plus probables",
    runoffView: "Vue conditionnelle du second tour",
    assumptions: "Hypothèses principales",
    sources: "Sources",
    model: "Note méthodologique",
    district: "Contexte de district",
    vote: "Vote projeté",
    top2: "Top 2",
    first: "Premier",
    simulations: "simulations",
    json: "JSON",
    updated: "Mis à jour",
    loading: "Actualisation de la projection...",
    error:
      "Le fichier de projection CA-1 ne s’est pas rafraîchi. Affichage de la projection incluse au build.",
    runoffBody: (name: string, prob: string) =>
      `${name} serait favori dans le duel probable au second tour à environ ${prob}, mais cette course d’août dépend encore de qui survit au champ chargé du 2 juin.`,
  },
  es: {
    favorite: "Favorito de la primaria",
    firstPlace: "probabilidad de quedar primero",
    runoff: "Probabilidad de segunda vuelta",
    outright: "Probabilidad de victoria directa",
    pair: "Duelo probable de segunda vuelta",
    candidates: "Ranking de candidatos",
    candidatesHelp:
      "Voto primario proyectado, probabilidad de top 2 y opciones de quedar primero en el campo simulado.",
    projectedPrimaryField: "Campo primario proyectado",
    topTwoPairs: "PARES TOP-2",
    conditionalRunoffView: "VISTA DE SEGUNDA VUELTA CONDICIONAL",
    modelInputs: "ENTRADAS DEL MODELO",
    publicReferencePoints: "REFERENCIAS PÚBLICAS",
    topTwo: "Resultados top 2 más probables",
    runoffView: "Vista condicional de segunda vuelta",
    assumptions: "Supuestos principales",
    sources: "Fuentes",
    model: "Nota metodológica",
    district: "Contexto del distrito",
    vote: "Voto proyectado",
    top2: "Top 2",
    first: "Primero",
    simulations: "simulaciones",
    json: "JSON",
    updated: "Actualizado",
    loading: "Actualizando pronóstico...",
    error:
      "El archivo de proyección CA-1 no se actualizó. Se muestra el pronóstico incluido en el build.",
    runoffBody: (name: string, prob: string) =>
      `${name} sería favorito en el duelo probable de segunda vuelta, con alrededor de ${prob}, mientras que esa carrera de agosto depende de quién sobreviva el concurrido campo del 2 de junio.`,
  },
};

const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const pctPoint = (v: number, digits = 1) => `${v.toFixed(digits)}%`;

function pairName(pair: string[], candidates: Candidate[]) {
  return pair
    .map((id) => candidates.find((candidate) => candidate.id === id)?.name ?? id)
    .join(' vs ');
}

export default function SpecialElectionForecast({
  initialData,
  locale,
  dataUrl,
  slug,
}: Props) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('ready');
  const t = copy[locale] ?? copy.en;

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        setStatus('loading');
        const response = await fetch(`${dataUrl}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const nextData = await response.json();
        if (!cancelled) {
          setData(nextData);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    refresh();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedCandidates = useMemo(
    () =>
      [...data.candidates].sort(
        (a, b) => b.projected_vote_mean - a.projected_vote_mean,
      ),
    [data.candidates],
  );
  const favorite = data.summary.favorite_name;
  const expectedPair = data.summary.likely_runoff_names.join(' vs ');
  const districtContext = data.district.district_context;
  const isHeadToHead = data.meta.race_format === 'head_to_head' || data.meta.race_format === 'party_control';
  const partyControl = data.meta.race_format === 'party_control';

  return (
    <div class="special-engine container" data-special-slug={slug}>
      <style>{specialElectionStyles}</style>
      <section class="special-dashboard" aria-label="Special-election forecast summary">
        <article class="special-big-number special-panel">
          <p class="special-label">{isHeadToHead ? (locale === 'fr' ? 'Gagnant projeté' : locale === 'es' ? 'Ganador proyectado' : 'Projected winner') : t.favorite}</p>
          <strong>{pct(data.summary.favorite_probability)}</strong>
          <span>
            {favorite} {isHeadToHead ? (locale === 'fr' ? 'probabilité de victoire' : locale === 'es' ? 'probabilidad de victoria' : 'win probability') : t.firstPlace}
          </span>
        </article>
        {isHeadToHead ? (
          <>
            <article class="special-panel">
              <p class="special-label">{locale === 'fr' ? 'Marge projetée' : locale === 'es' ? 'Margen proyectado' : 'Projected margin'}</p>
              <strong>{(data.summary.projected_margin_mean ?? 0).toFixed(1)} pts</strong>
              <span>{favorite}</span>
            </article>
            <article class="special-panel">
              <p class="special-label">{locale === 'fr' ? 'Date du vote' : locale === 'es' ? 'Fecha de votación' : 'Election date'}</p>
              <strong class="special-pair">{data.meta.election_date ?? (locale === 'fr' ? 'À déterminer' : locale === 'es' ? 'Por definir' : 'TBD')}</strong>
              <span>{partyControl ? (locale === 'fr' ? 'bref en attente' : locale === 'es' ? 'convocatoria pendiente' : 'writ pending') : expectedPair}</span>
            </article>
            <article class="special-panel">
              <p class="special-label">{locale === 'fr' ? 'Champ' : locale === 'es' ? 'Candidaturas' : 'Field'}</p>
              <strong class="special-pair">{partyControl ? (locale === 'fr' ? 'Noms à confirmer' : locale === 'es' ? 'Nombres por confirmar' : 'Names pending') : expectedPair}</strong>
              <span>{partyControl ? (locale === 'fr' ? 'projection par parti' : locale === 'es' ? 'proyección por partido' : 'party-level forecast') : 'head-to-head'}</span>
            </article>
          </>
        ) : (
          <>
            <article class="special-panel">
              <p class="special-label">{t.runoff}</p>
              <strong>{pct(data.summary.runoff_probability)}</strong>
              <span>{data.meta.possible_runoff_date ?? '2026-08-04'}</span>
            </article>
            <article class="special-panel">
              <p class="special-label">{t.outright}</p>
              <strong>{pct(data.summary.majority_outright_probability)}</strong>
              <span>50% + 1</span>
            </article>
            <article class="special-panel">
              <p class="special-label">{t.pair}</p>
              <strong class="special-pair">{expectedPair}</strong>
              <span>{pct(data.summary.likely_runoff_probability)} top-two path</span>
            </article>
          </>
        )}
      </section>

      <p class="special-status" role="status">
        {status === 'loading' && t.loading}
        {status === 'error' && t.error}
        {status === 'ready' &&
          `${t.updated} ${data.meta.run_date} · ${data.meta.n_simulations.toLocaleString()} ${t.simulations}`}
      </p>

      <section class="special-section" aria-labelledby="special-candidates-title">
        <header class="special-section-head">
          <div>
            <p class="special-label">{isHeadToHead ? (partyControl ? (locale === 'fr' ? 'Projection par parti' : locale === 'es' ? 'Proyección por partido' : 'Party-control projection') : (locale === 'fr' ? 'Duel projeté' : locale === 'es' ? 'Duelo proyectado' : 'Head-to-head forecast')) : t.projectedPrimaryField}</p>
            <h2 id="special-candidates-title">{t.candidates}</h2>
          </div>
          <p>{isHeadToHead ? (partyControl ? (locale === 'fr' ? 'Projection provisoire avant confirmation de la date et des candidatures.' : locale === 'es' ? 'Proyección provisional antes de confirmar fecha y candidatos.' : 'Provisional forecast before the date and candidates are confirmed.') : (locale === 'fr' ? 'Vote projeté et probabilité de victoire dans le second tour.' : locale === 'es' ? 'Voto proyectado y probabilidad de victoria en la segunda vuelta.' : 'Projected vote and win probability in the runoff.')) : t.candidatesHelp}</p>
        </header>

        <div class="special-candidate-list">
          {sortedCandidates.map((candidate) => (
            <article class="special-candidate">
              <div class="special-candidate-name">
                <span
                  class="special-swatch"
                  style={{ background: candidate.color }}
                  aria-hidden="true"
                />
                <div>
                  <h3>{candidate.name}</h3>
                  <p>{candidate.party}</p>
                </div>
              </div>
              <div class="special-vote-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(candidate.projected_vote_mean, 1)}%`,
                    background: candidate.color,
                  }}
                />
              </div>
              <dl class="special-candidate-stats">
                <div>
                  <dt>{t.vote}</dt>
                  <dd>{pctPoint(candidate.projected_vote_mean)}</dd>
                </div>
                <div>
                  <dt>{isHeadToHead ? (locale === 'fr' ? 'Victoire' : locale === 'es' ? 'Victoria' : 'Win') : t.top2}</dt>
                  <dd>{pct(isHeadToHead ? candidate.first_place_probability : candidate.top_two_probability, isHeadToHead ? 1 : 0)}</dd>
                </div>
                <div>
                  <dt>{isHeadToHead ? (locale === 'fr' ? 'Médiane' : locale === 'es' ? 'Mediana' : 'Median') : t.first}</dt>
                  <dd>{isHeadToHead ? pctPoint(candidate.vote_quantiles?.q50 ?? candidate.projected_vote_mean) : pct(candidate.first_place_probability, 1)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {!isHeadToHead && <section class="special-two-col">
        <article class="special-section special-compact" aria-labelledby="special-pairs-title">
          <p class="special-label">{t.topTwoPairs}</p>
          <h2 id="special-pairs-title">{t.topTwo}</h2>
          <div class="special-pair-list">
            {data.benchmarks.top_two_pairs.map((item) => (
              <div class="special-pair-row">
                <strong>{pairName(item.pair, data.candidates)}</strong>
                <span>{pct(item.probability, 1)}</span>
              </div>
            ))}
          </div>
        </article>

        <article class="special-section special-compact" aria-labelledby="special-runoff-title">
          <p class="special-label">{t.conditionalRunoffView}</p>
          <h2 id="special-runoff-title">{t.runoffView}</h2>
          <p>
            {t.runoffBody(
              data.summary.if_likely_runoff_favorite,
              pct(data.summary.if_likely_runoff_favorite_probability),
            )}
          </p>
        </article>
      </section>}

      <section class="special-two-col">
        <article class="special-section special-compact" aria-labelledby="special-district-title">
          <p class="special-label">{data.district.district}</p>
          <h2 id="special-district-title">{t.district}</h2>
          <p>{data.district.vacancy_reason}</p>
          {districtContext && (
            <div class="special-baseline">
              <span>R {districtContext.house_2024_republican_share?.toFixed(1)}%</span>
              <span>D {districtContext.house_2024_democratic_share?.toFixed(1)}%</span>
            </div>
          )}
          {districtContext?.note && <p>{districtContext.note}</p>}
        </article>

        <article class="special-section special-compact" aria-labelledby="special-model-title">
          <p class="special-label">{data.meta.model_type}</p>
          <h2 id="special-model-title">{t.model}</h2>
          <p>{data.method_note}</p>
          <a class="special-json-link" href={dataUrl}>
            {t.json}
          </a>
        </article>
      </section>

      <section class="special-two-col">
        <article class="special-section special-compact" aria-labelledby="special-assumptions-title">
          <p class="special-label">{t.modelInputs}</p>
          <h2 id="special-assumptions-title">{t.assumptions}</h2>
          <div class="special-note-list">
            {data.benchmarks.assumptions.map((item) => (
              <div class="special-note">
                <strong>{item.label}</strong>
                <p>{item.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article class="special-section special-compact" aria-labelledby="special-sources-title">
          <p class="special-label">{t.publicReferencePoints}</p>
          <h2 id="special-sources-title">{t.sources}</h2>
          <div class="special-source-list">
            {data.sources.map((source) => (
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

const specialElectionStyles = `
  .special-engine {
    max-width: 1080px;
  }

  .special-dashboard {
    display: grid;
    grid-template-columns: 1.25fr repeat(3, minmax(0, 1fr));
    border-top: 1px solid var(--rule);
    border-left: 1px solid var(--rule);
    margin-top: 48px;
  }

  .special-panel,
  .special-section {
    background: var(--card);
    border-right: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .special-panel {
    min-height: 190px;
    padding: 24px;
  }

  .special-panel strong {
    display: block;
    margin: 16px 0 8px;
    font-family: var(--serif);
    font-size: clamp(32px, 5vw, 58px);
    font-weight: 420;
    letter-spacing: -0.02em;
    line-height: 0.96;
  }

  .special-panel span {
    color: var(--ink-2);
    line-height: 1.45;
  }

  .special-big-number {
    background:
      radial-gradient(circle at 85% 20%, color-mix(in oklch, var(--red) 18%, transparent), transparent 34%),
      var(--card);
  }

  .special-pair {
    font-size: clamp(24px, 3vw, 34px) !important;
    line-height: 1.06 !important;
  }

  .special-label {
    margin: 0;
    color: var(--ink-3);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .special-status {
    min-height: 18px;
    margin: 18px 0 0;
    color: var(--ink-3);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  .special-section {
    margin-top: 48px;
    padding: 28px;
  }

  .special-section-head {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 36px;
    align-items: end;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--rule-2);
  }

  .special-section h2 {
    margin: 12px 0 0;
    font-family: var(--serif);
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 420;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .special-section p {
    color: var(--ink-2);
    line-height: 1.6;
  }

  .special-candidate-list {
    display: grid;
    gap: 0;
  }

  .special-candidate {
    display: grid;
    grid-template-columns: 240px minmax(180px, 1fr) 260px;
    gap: 24px;
    align-items: center;
    padding: 22px 0;
    border-bottom: 1px solid var(--rule-2);
  }

  .special-candidate:last-child {
    border-bottom: 0;
  }

  .special-candidate-name {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .special-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    flex: 0 0 auto;
  }

  .special-candidate h3 {
    margin: 0;
    font-family: var(--serif);
    font-size: 25px;
    font-weight: 430;
    letter-spacing: -0.01em;
  }

  .special-candidate-name p {
    margin: 3px 0 0;
    color: var(--ink-3);
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .special-vote-bar {
    height: 18px;
    overflow: hidden;
    border: 1px solid var(--rule);
    border-radius: 999px;
    background: var(--paper-2);
  }

  .special-vote-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
  }

  .special-candidate-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin: 0;
  }

  .special-candidate-stats dt {
    color: var(--ink-3);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .special-candidate-stats dd {
    margin: 5px 0 0;
    font-family: var(--serif);
    font-size: 25px;
    font-weight: 430;
    letter-spacing: -0.01em;
  }

  .special-two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .special-compact {
    min-height: 100%;
  }

  .special-pair-list,
  .special-note-list,
  .special-source-list {
    display: grid;
    gap: 12px;
    margin-top: 22px;
  }

  .special-pair-row,
  .special-note,
  .special-source-list a {
    border: 1px solid var(--rule);
    border-radius: 4px;
    background: var(--paper-2);
    padding: 14px 16px;
  }

  .special-pair-row {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: baseline;
  }

  .special-pair-row strong,
  .special-note strong {
    font-family: var(--serif);
    font-size: 21px;
    font-weight: 430;
    letter-spacing: -0.01em;
  }

  .special-pair-row span {
    color: var(--ink-2);
    font-family: var(--mono);
    font-size: 12px;
    white-space: nowrap;
  }

  .special-note p {
    margin: 8px 0 0;
  }

  .special-source-list a,
  .special-json-link {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--rule);
    text-underline-offset: 4px;
  }

  .special-baseline {
    display: flex;
    gap: 8px;
    margin: 18px 0;
  }

  .special-baseline span {
    border: 1px solid var(--rule);
    border-radius: 999px;
    padding: 7px 11px;
    background: var(--paper-2);
    font-family: var(--mono);
    font-size: 12px;
  }

  @media (max-width: 980px) {
    .special-dashboard,
    .special-two-col,
    .special-section-head,
    .special-candidate {
      grid-template-columns: 1fr;
    }

    .special-candidate {
      gap: 16px;
    }
  }
`;
