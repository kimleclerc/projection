import { useMemo, useState } from 'preact/hooks';
import {
  partyVar,
  laneLabel,
  statusLabel,
  fmtPct1,
  type PartyBlock,
  type Locale,
  type Party,
} from '../lib/us-pres';

interface Props {
  dem: PartyBlock;
  rep: PartyBlock;
  locale: Locale;
  maxRows?: number;
}

const COPY = {
  fr: {
    dem: 'Démocrates', rep: 'Républicains',
    polls: (n: number) => `${n} sondage${n > 1 ? 's' : ''}`,
    undecided: 'Indécis / autre',
    help: 'Moyenne pondérée qualité des sondages nationaux de primaire (récence, taille, effet-maison, décote intra-firme, cap de concentration). Part par candidat parmi les sondages qui le testent — pas un champ renormalisé.',
    lead: 'en tête',
    inelig: 'Le 22e amendement interdit un troisième mandat à Trump, mais les sondeurs testent l’hypothèse trop souvent pour l’omettre — son chiffre est la moyenne des seuls sondages qui l’incluent (donc non comparable au reste du champ). Voir la',
    ineligLink: 'proposition de troisième mandat',
  },
  en: {
    dem: 'Democrats', rep: 'Republicans',
    polls: (n: number) => `${n} poll${n > 1 ? 's' : ''}`,
    undecided: 'Undecided / other',
    help: 'Quality-weighted average of national primary polls (recency, sample size, house effect, intra-firm decay, concentration cap). Per-candidate share across the polls that test them — not a renormalized field.',
    lead: 'leads',
    inelig: 'The 22nd Amendment bars Trump from a third term, but pollsters test the scenario too often to omit — his figure is the average of only the polls that include him (so not comparable to the rest of the field). See the',
    ineligLink: 'third-term proposal',
  },
  es: {
    dem: 'Demócratas', rep: 'Republicanos',
    polls: (n: number) => `${n} sondeo${n > 1 ? 's' : ''}`,
    undecided: 'Indecisos / otro',
    help: 'Media ponderada por calidad de los sondeos nacionales de primarias (recencia, tamaño, efecto casa, descuento intrafirma, tope de concentración). Cuota por candidato entre los sondeos que lo miden — no un campo renormalizado.',
    lead: 'encabeza',
    inelig: 'La 22.ª enmienda prohíbe a Trump un tercer mandato, pero los sondeos miden el escenario demasiado a menudo como para omitirlo — su cifra es la media de solo los sondeos que lo incluyen (no comparable con el resto del campo). Ver la',
    ineligLink: 'propuesta de tercer mandato',
  },
};

const THIRD_TERM_URL = 'https://en.wikipedia.org/wiki/Donald_Trump_third_term_proposal';

function Trend({ v }: { v: number | null }) {
  if (v === null || Math.abs(v) < 0.15) return <span class="ups-trend ups-flat">→</span>;
  const up = v > 0;
  return (
    <span class={`ups-trend ${up ? 'ups-up' : 'ups-down'}`}>
      {up ? '▲' : '▼'} {Math.abs(v).toFixed(1)}
    </span>
  );
}

export default function UsPrimaryStandings({ dem, rep, locale, maxRows = 12 }: Props) {
  const t = COPY[locale];
  const [party, setParty] = useState<Party>('us_rep'); // REP = champ le plus net (Vance)

  const block = party === 'us_dem' ? dem : rep;
  const rows = useMemo(() => block.standings.slice(0, maxRows), [block, maxRows]);
  const maxShare = Math.max(1, ...rows.map((r) => r.share));

  return (
    <div class="ups">
      <div class="ups-tabs" role="tablist">
        <button role="tab" aria-selected={party === 'us_dem'}
          class={`ups-tab ${party === 'us_dem' ? 'is-on ups-tab-dem' : ''}`}
          onClick={() => setParty('us_dem')}>
          {t.dem} <span class="ups-tab-n">{t.polls(dem.n_polls)}</span>
        </button>
        <button role="tab" aria-selected={party === 'us_rep'}
          class={`ups-tab ${party === 'us_rep' ? 'is-on ups-tab-rep' : ''}`}
          onClick={() => setParty('us_rep')}>
          {t.rep} <span class="ups-tab-n">{t.polls(rep.n_polls)}</span>
        </button>
      </div>

      <p class="ups-help">{t.help}</p>

      <ol class="ups-list">
        {rows.map((r) => (
          <li key={r.candidate_id} class="ups-row">
            <div class="ups-row-head">
              <span class="ups-rank">{r.rank}</span>
              <span class="ups-name">{r.name}</span>
              <span class="ups-lane">{laneLabel(r.lane, locale)}</span>
              <span class={`ups-status is-${r.status}`}>{statusLabel(r.status, locale)}</span>
              <span class="ups-share">
                {fmtPct1(r.share, locale)}{r.status === 'ineligible' && <sup class="ups-dagger">‡</sup>}
              </span>
              <Trend v={r.trend} />
            </div>
            <div class="ups-track">
              <div class="ups-fill"
                style={{ width: `${(r.share / maxShare) * 100}%`, background: partyVar(party) }} />
            </div>
          </li>
        ))}
      </ol>

      {block.undecided_other != null && (
        <p class="ups-undecided">
          {t.undecided}: <b>{fmtPct1(block.undecided_other, locale)}</b>
        </p>
      )}

      {rows.some((r) => r.status === 'ineligible') && (
        <p class="ups-caveat">
          <span class="ups-caveat-mark">‡</span> {t.inelig}{' '}
          <a href={THIRD_TERM_URL} target="_blank" rel="noopener noreferrer">{t.ineligLink}</a>.
        </p>
      )}

      <style>{`
        .ups-tabs { display:flex; gap:8px; margin-bottom:14px; }
        .ups-tab { flex:1; padding:10px 14px; border:1px solid var(--rule); border-radius:8px; background:var(--card); font-family:var(--mono); font-size:13px; color:var(--ink-2); cursor:pointer; transition:border-color .15s, color .15s; }
        .ups-tab-n { display:block; font-size:10px; color:var(--ink-3); margin-top:3px; }
        .ups-tab:hover { border-color:var(--ink-2); }
        .ups-tab.is-on { color:#fff; }
        .ups-tab.ups-tab-dem.is-on { background:var(--dem); border-color:var(--dem); }
        .ups-tab.ups-tab-rep.is-on { background:var(--rep); border-color:var(--rep); }
        .ups-tab.is-on .ups-tab-n { color:rgba(255,255,255,.8); }
        .ups-help { font-family:var(--mono); font-size:11px; line-height:1.6; color:var(--ink-3); margin:0 0 16px; max-width:640px; }
        .ups-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:12px; }
        .ups-row-head { display:flex; align-items:center; gap:8px; margin-bottom:5px; flex-wrap:wrap; }
        .ups-rank { font-family:var(--mono); font-size:11px; color:var(--ink-3); width:18px; }
        .ups-name { font-family:var(--serif); font-size:16px; color:var(--ink); }
        .ups-lane { font-family:var(--mono); font-size:9px; letter-spacing:.05em; text-transform:uppercase; color:var(--ink-3); }
        .ups-status { font-family:var(--mono); font-size:9px; letter-spacing:.05em; text-transform:uppercase; padding:2px 7px; border-radius:999px; border:1px solid var(--rule); color:var(--ink-2); }
        .ups-status.is-probable { background:var(--blue-tint); border-color:var(--blue-soft); color:var(--blue); }
        .ups-status.is-ineligible { background:rgba(217,119,6,.12); border-color:rgba(217,119,6,.45); color:#b45309; }
        :global(:root[data-theme='dark']) .ups-status.is-ineligible { color:#f0b072; }
        .ups-dagger { color:#b45309; font-size:9px; margin-left:1px; }
        :global(:root[data-theme='dark']) .ups-dagger { color:#f0b072; }
        .ups-caveat { font-family:var(--mono); font-size:11px; line-height:1.6; color:var(--ink-3); margin-top:14px; padding-top:12px; border-top:1px solid var(--rule); max-width:640px; }
        .ups-caveat-mark { color:#b45309; font-weight:700; }
        .ups-caveat a { color:var(--ink-2); text-decoration:underline; }
        .ups-share { margin-left:auto; font-family:var(--mono); font-size:14px; font-weight:600; color:var(--ink); }
        .ups-trend { font-family:var(--mono); font-size:11px; min-width:44px; text-align:right; }
        .ups-up { color:#2e7d32; } .ups-down { color:#c62828; } .ups-flat { color:var(--ink-3); }
        .ups-track { height:8px; border-radius:4px; background:var(--rule); overflow:hidden; }
        .ups-fill { height:100%; border-radius:4px; transition:width .2s ease; }
        .ups-undecided { font-family:var(--mono); font-size:12px; color:var(--ink-3); margin-top:16px; }
      `}</style>
    </div>
  );
}
