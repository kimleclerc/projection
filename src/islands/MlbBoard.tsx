import { useEffect, useMemo, useState } from 'preact/hooks';
import { useUrlParam } from './lib/urlState';
import CopyLink from './lib/CopyLink';
import EmbedCode from './lib/EmbedCode';
import {
  fmtNum1,
  fmtProb,
  fmtStreak,
  DIVISION_LABELS,
  type MlbDivision,
  type MlbLeague,
  type MlbLocale,
} from '../lib/mlb';

/* MlbBoard — tableau triable des 30 équipes MLB.
 *
 * Permaliens (urlState) : ?league=AL|NL (filtre, « toutes » = URL propre) et
 * ?sort=<clé> (tri, p_ws par défaut). Le sens du tri reste local : un lien
 * partagé restaure la colonne, toujours en descendant — l'ordre attendu.
 */

export interface MlbBoardRow {
  code: string;
  label: string; // déjà localisé par la page (es reprend label_en)
  league: MlbLeague;
  division: MlbDivision;
  color: string;
  emoji: string;
  wins: number;
  losses: number;
  streak: string;
  exp_wins: number;
  p_series: number;
  p_division: number;
  p_bye: number;
  p_pennant: number;
  p_ws: number;
}

interface Props {
  rows: MlbBoardRow[];
  locale: MlbLocale;
  /** Chemin de la page embed — affiche « Intégrer » quand fourni. */
  embedPath?: string;
}

type SortKey = 'team' | 'wins' | 'exp' | 'series' | 'division' | 'bye' | 'pennant' | 'ws';
const SORT_KEYS: SortKey[] = ['team', 'wins', 'exp', 'series', 'division', 'bye', 'pennant', 'ws'];
const LEAGUES: Array<'all' | MlbLeague> = ['all', 'AL', 'NL'];

const COPY = {
  fr: {
    leagueGroup: 'Filtrer par ligue',
    all: 'Les 30',
    showing: (n: number) => `${n} équipe${n > 1 ? 's' : ''}`,
    caption: 'Les 30 équipes MLB : fiche, victoires attendues et probabilités de séries, de division et de Série mondiale',
    cols: {
      team: 'Équipe',
      record: 'Fiche',
      streak: 'Séq.',
      exp: 'V. attendues',
      series: 'Séries',
      division: 'Division',
      bye: 'Laissez-passer',
      pennant: 'Championnat',
      ws: 'Série mondiale',
    },
  },
  en: {
    leagueGroup: 'Filter by league',
    all: 'All 30',
    showing: (n: number) => `${n} team${n > 1 ? 's' : ''}`,
    caption: 'All 30 MLB teams: record, expected wins and playoff, division and World Series probabilities',
    cols: {
      team: 'Team',
      record: 'Record',
      streak: 'Strk',
      exp: 'Exp. wins',
      series: 'Playoffs',
      division: 'Division',
      bye: 'Bye',
      pennant: 'Pennant',
      ws: 'World Series',
    },
  },
  es: {
    leagueGroup: 'Filtrar por liga',
    all: 'Los 30',
    showing: (n: number) => `${n} equipo${n > 1 ? 's' : ''}`,
    caption: 'Los 30 equipos de MLB: récord, victorias esperadas y probabilidades de postemporada, división y Serie Mundial',
    cols: {
      team: 'Equipo',
      record: 'Récord',
      streak: 'Racha',
      exp: 'V. esperadas',
      series: 'Postemporada',
      division: 'División',
      bye: 'Bye',
      pennant: 'Banderín',
      ws: 'Serie Mundial',
    },
  },
} as const;

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById('mlb-style')) return;
  const s = document.createElement('style');
  s.id = 'mlb-style';
  s.textContent = `
.mlb-wrap { --mlb-row-rule: color-mix(in oklab, var(--rule, #ddd) 76%, transparent); font-family: var(--mono, ui-monospace, monospace); font-size: 13px; color: var(--ink, #1a1a1a); }
.mlb-controls { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center; margin-bottom: 14px; }
.mlb-chips { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.mlb-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border: 1px solid var(--rule, #ddd); border-radius: 999px; font-size: 12px; color: var(--ink-2, #555); background: transparent; cursor: pointer; transition: background 0.12s, color 0.12s, border-color 0.12s; }
.mlb-chip:hover { background: var(--card, #f5f5f0); }
.mlb-chip[data-active="true"] { background: var(--ink, #1a1a1a); color: var(--paper-3, #fafaf5); border-color: var(--ink, #1a1a1a); }
.mlb-meta { font-size: 12px; color: var(--ink-3, #888); margin-left: auto; }
.mlb-share { display: inline-flex; gap: 8px; }
.mlb-table-wrap { overflow-x: auto; border: 1px solid var(--rule, #ddd); border-radius: 4px; }
.mlb-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mlb-table th { text-align: right; font-weight: 500; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-2, #555); padding: 11px 12px; border-bottom: 1px solid var(--rule, #ddd); cursor: pointer; user-select: none; white-space: nowrap; background: var(--card, #f8f8f3); position: sticky; top: 0; z-index: 1; }
.mlb-table th.mlb-left { text-align: left; }
.mlb-table th:hover { color: var(--ink, #1a1a1a); }
.mlb-table th[aria-sort="ascending"]::after { content: " ▲"; }
.mlb-table th[aria-sort="descending"]::after { content: " ▼"; }
.mlb-table td { padding: 9px 12px; border-bottom: 1px solid var(--mlb-row-rule); white-space: nowrap; }
.mlb-table tr:last-child td { border-bottom: none; }
.mlb-table tr:hover td { background: var(--card, #f8f8f3); }
.mlb-team { display: inline-flex; align-items: center; gap: 8px; font-family: var(--serif, Georgia, serif); font-size: 14px; color: var(--ink, #1a1a1a); }
.mlb-team-bar { width: 4px; height: 1.05em; border-radius: 2px; display: inline-block; flex: none; }
.mlb-div { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3, #888); }
.mlb-num { font-variant-numeric: tabular-nums; text-align: right; color: var(--ink-2, #555); }
.mlb-num.is-lead { color: var(--ink, #1a1a1a); font-weight: 600; }
.mlb-streak-w { color: #2d7a4f; }
.mlb-streak-l { color: #b03030; }
[data-theme="dark"] .mlb-wrap { --mlb-row-rule: color-mix(in oklab, var(--rule, #2e2a24) 58%, transparent); }
[data-theme="dark"] .mlb-streak-w { color: #5fbf8a; }
[data-theme="dark"] .mlb-streak-l { color: #e08080; }
`;
  document.head.appendChild(s);
}

export default function MlbBoard({ rows, locale, embedPath }: Props) {
  const t = COPY[locale];

  // Permaliens : ?league= et ?sort= (défauts retirés de l'URL par urlState).
  const [league, setLeague] = useUrlParam<'all' | MlbLeague>(
    'league',
    'all',
    (v) => v === 'AL' || v === 'NL',
  );
  const [sortKey, setSortKey] = useUrlParam<SortKey>(
    'sort',
    'ws',
    (v) => (SORT_KEYS as string[]).includes(v),
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    injectStyles();
  }, []);

  const filtered = useMemo(
    () => (league === 'all' ? rows : rows.filter((r) => r.league === league)),
    [rows, league],
  );

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const val = (r: MlbBoardRow): number => {
      switch (sortKey) {
        case 'wins': return r.wins;
        case 'exp': return r.exp_wins;
        case 'series': return r.p_series;
        case 'division': return r.p_division;
        case 'bye': return r.p_bye;
        case 'pennant': return r.p_pennant;
        default: return r.p_ws;
      }
    };
    const cmp = (a: MlbBoardRow, b: MlbBoardRow) =>
      sortKey === 'team'
        ? a.label.localeCompare(b.label) * dir
        : (val(a) - val(b)) * dir || b.p_ws - a.p_ws;
    return [...filtered].sort(cmp);
  }, [filtered, sortKey, sortDir, locale]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'team' ? 'asc' : 'desc');
    }
  }

  const ariaSort = (k: SortKey) =>
    sortKey === k ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';

  const th = (key: SortKey, label: string, left = false) => (
    <th
      class={left ? 'mlb-left' : 'mlb-num'}
      onClick={() => toggleSort(key)}
      aria-sort={ariaSort(key)}
      scope="col"
    >
      {label}
    </th>
  );

  return (
    <div class="mlb-wrap">
      <div class="mlb-controls">
        <div class="mlb-chips" role="group" aria-label={t.leagueGroup}>
          {LEAGUES.map((l) => (
            <button
              key={l}
              type="button"
              class="mlb-chip"
              data-active={league === l}
              aria-pressed={league === l}
              onClick={() => setLeague(l)}
            >
              {l === 'all' ? t.all : l}
            </button>
          ))}
        </div>
        <span class="mlb-meta">{t.showing(filtered.length)}</span>
        <span class="mlb-share">
          <CopyLink locale={locale} anchor="mlb-board" />
          {embedPath && <EmbedCode locale={locale} embedPath={embedPath} height={960} />}
        </span>
      </div>

      <div class="mlb-table-wrap">
        <table class="mlb-table">
          <caption class="sr-only">{t.caption}</caption>
          <thead>
            <tr>
              {th('team', t.cols.team, true)}
              {th('wins', t.cols.record)}
              <th class="mlb-num" scope="col" aria-sort="none" style="cursor:default;">{t.cols.streak}</th>
              {th('exp', t.cols.exp)}
              {th('series', t.cols.series)}
              {th('division', t.cols.division)}
              {th('bye', t.cols.bye)}
              {th('pennant', t.cols.pennant)}
              {th('ws', t.cols.ws)}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.code}>
                <td>
                  <span class="mlb-team">
                    <span class="mlb-team-bar" style={`background:${r.color}`} />
                    {r.emoji} {r.label}
                  </span>{' '}
                  <span class="mlb-div">
                    {r.league} {DIVISION_LABELS[r.division][locale]}
                  </span>
                </td>
                <td class="mlb-num">{r.wins}-{r.losses}</td>
                <td class={`mlb-num ${r.streak.startsWith('W') ? 'mlb-streak-w' : 'mlb-streak-l'}`}>
                  {fmtStreak(r.streak, locale)}
                </td>
                <td class="mlb-num">{fmtNum1(r.exp_wins, locale)}</td>
                <td class={`mlb-num${sortKey === 'series' ? ' is-lead' : ''}`}>{fmtProb(r.p_series, locale)}</td>
                <td class={`mlb-num${sortKey === 'division' ? ' is-lead' : ''}`}>{fmtProb(r.p_division, locale)}</td>
                <td class="mlb-num">{fmtProb(r.p_bye, locale)}</td>
                <td class="mlb-num">{fmtProb(r.p_pennant, locale)}</td>
                <td class={`mlb-num${sortKey === 'ws' ? ' is-lead' : ''}`}>{fmtProb(r.p_ws, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
