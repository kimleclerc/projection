import { useEffect, useMemo, useState } from 'preact/hooks';
import type { RidingFull, MapParty } from './RidingsMap';
import { trackAnalyticsEvent } from '../lib/analytics';
import { readUrlParam, setUrlParam } from './lib/urlState';
import CopyLink from './lib/CopyLink';

interface Props {
  ridings: RidingFull[];
  parties: MapParty[];
  locale: 'en' | 'fr' | 'es';
  baselineYear?: number;
}

type SortKey =
  | 'name'
  | 'province'
  | 'winner'
  | 'vote'
  | 'margin'
  | 'p_winner'
  | 'baseline_shift';

interface Row {
  riding: RidingFull;
  winnerVote: number;
  baselineShift: 'hold' | 'flip' | 'new' | 'unknown';
  baselineShiftLabel: string;
}

function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById('rt-style'))
    return;
  const s = document.createElement('style');
  s.id = 'rt-style';
  s.textContent = `
.rt-wrap { --rt-row-rule: color-mix(in oklab, var(--rule, #ddd) 76%, transparent); font-family: var(--mono, ui-monospace, monospace); font-size: 13px; color: var(--ink, #1a1a1a); }
.rt-controls { display: flex; flex-wrap: wrap; gap: 12px 18px; align-items: center; margin-bottom: 14px; }
.rt-search { padding: 7px 10px; border: 1px solid var(--rule, #ddd); border-radius: 4px; font-family: inherit; font-size: 13px; background: var(--paper, #fff); color: var(--ink, #1a1a1a); min-width: 200px; }
.rt-chips { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.rt-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border: 1px solid var(--rule, #ddd); border-radius: 999px; font-size: 12px; color: var(--ink-2, #555); background: transparent; cursor: pointer; transition: background 0.12s, color 0.12s, border-color 0.12s; }
.rt-chip:hover { background: var(--card, #f5f5f0); }
.rt-chip[data-active="true"] { background: var(--ink, #1a1a1a); color: var(--paper-3, #fafaf5); border-color: var(--ink, #1a1a1a); }
.rt-chip-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.rt-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-2, #555); cursor: pointer; }
.rt-meta { font-size: 12px; color: var(--ink-3, #888); margin-left: auto; }
.rt-clear { background: none; border: none; color: var(--ink-3, #888); font-size: 12px; cursor: pointer; text-decoration: underline; padding: 0; }
.rt-table-wrap { overflow-x: auto; border: 1px solid var(--rule, #ddd); border-radius: 4px; }
.rt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.rt-table th { text-align: left; font-weight: 500; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-2, #555); padding: 11px 12px; border-bottom: 1px solid var(--rule, #ddd); cursor: pointer; user-select: none; white-space: nowrap; background: var(--card, #f8f8f3); position: sticky; top: 0; z-index: 1; }
.rt-table th:hover { color: var(--ink, #1a1a1a); }
.rt-table th[aria-sort="ascending"]::after { content: " ▲"; }
.rt-table th[aria-sort="descending"]::after { content: " ▼"; }
.rt-table td { padding: 10px 12px; border-bottom: 1px solid var(--rt-row-rule); white-space: nowrap; }
.rt-table tr:last-child td { border-bottom: none; }
.rt-table tr:hover td { background: var(--card, #f8f8f3); }
.rt-name { font-family: var(--serif, Georgia, serif); font-size: 14px; color: var(--ink, #1a1a1a); }
.rt-name a { color: inherit; text-decoration: underline; text-decoration-color: color-mix(in oklab, currentColor 28%, transparent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
.rt-name a:hover, .rt-name a:focus-visible { text-decoration-color: currentColor; }
.rt-province { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3, #888); }
.rt-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid; border-radius: 999px; font-size: 11px; font-weight: 500; background: color-mix(in oklab, currentColor 12%, transparent); }
.rt-pill-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.rt-num { font-variant-numeric: tabular-nums; text-align: right; color: var(--ink-2, #555); }
.rt-shift-flip { color: #b03030; font-weight: 500; }
.rt-shift-hold { color: var(--ink-2, #555); }
.rt-shift-new { color: var(--ink-2, #555); font-style: italic; }
.rt-empty { padding: 32px; text-align: center; color: var(--ink-3, #888); }
.rt-load-more { display: block; width: 100%; padding: 11px; background: var(--card, #f8f8f3); border: none; border-top: 1px solid var(--rule, #ddd); cursor: pointer; font-family: inherit; font-size: 12px; color: var(--ink-2, #555); letter-spacing: 0.05em; text-transform: uppercase; }
.rt-load-more:hover { background: var(--paper-2, #e5e5e0); color: var(--ink, #1a1a1a); }
[data-theme="dark"] .rt-wrap { --rt-row-rule: color-mix(in oklab, var(--rule, #2e2a24) 58%, transparent); }
`;
  document.head.appendChild(s);
}

const PAGE_SIZE = 50;

// Defensive clamp: upstream pipeline can occasionally produce >100% values for uncontested races; cap at 100 for display.
const clampPct = (v: number) => Math.max(0, Math.min(100, v));

export default function RidingTable({
  ridings,
  parties,
  locale,
  baselineYear = 2025,
}: Props) {
  const [search, setSearch] = useState('');
  const [provFilter, setProvFilter] = useState<Set<string>>(new Set());
  const [partyFilter, setPartyFilter] = useState<Set<string>>(new Set());
  const [closeOnly, setCloseOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('margin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    injectStyles();
    // Permalien : ?q=<recherche> restauré au mount.
    const q = readUrlParam('q');
    if (q) setSearch(q);
  }, []);

  // Miroir de la recherche dans l'URL, avec un léger debounce pour rester
  // sous la limite de fréquence de replaceState (Safari) pendant la frappe.
  useEffect(() => {
    const id = setTimeout(
      () => setUrlParam('q', search.trim() ? search : null),
      300,
    );
    return () => clearTimeout(id);
  }, [search]);

  const partyByKey = useMemo(
    () => new Map(parties.map((p) => [p.key, p])),
    [parties],
  );

  const provinces = useMemo(() => {
    const set = new Set<string>();
    for (const r of ridings) if (r.province) set.add(r.province);
    return Array.from(set).sort();
  }, [ridings]);

  // Pre-compute derived per-row values once.
  const rows: Row[] = useMemo(() => {
    return ridings.map((r) => {
      const winner = r.projection.winner;
      const winnerVote = r.projection.vote_mean?.[winner] ?? 0;
      let baselineShift: Row['baselineShift'] = 'unknown';
      let baselineShiftLabel = '—';
      if (r.baseline?.winner) {
        if (r.baseline.winner === winner) {
          baselineShift = 'hold';
          baselineShiftLabel =
            locale === 'fr' ? 'Maintien' : 'Hold';
        } else {
          baselineShift = 'flip';
          const fromLabel =
            partyByKey.get(r.baseline.winner)?.[
              locale === 'fr' ? 'label_fr' : 'label_en'
            ] ?? r.baseline.winner;
          const toLabel =
            partyByKey.get(winner)?.[
              locale === 'fr' ? 'label_fr' : 'label_en'
            ] ?? winner;
          baselineShiftLabel = `${fromLabel} → ${toLabel}`;
        }
      } else {
        baselineShift = 'new';
        baselineShiftLabel = locale === 'fr' ? 'Nouveau' : 'New';
      }
      return { riding: r, winnerVote, baselineShift, baselineShiftLabel };
    });
  }, [ridings, partyByKey, locale]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ riding: r, baselineShift }) => {
      if (q) {
        const name = (
          locale === 'fr' ? r.name_fr : r.name_en
        ).toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (provFilter.size && (!r.province || !provFilter.has(r.province)))
        return false;
      if (partyFilter.size && !partyFilter.has(r.projection.winner))
        return false;
      if (closeOnly && r.projection.p_close_race < 0.2) return false;
      void baselineShift;
      return true;
    });
  }, [rows, search, provFilter, partyFilter, closeOnly, locale]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const cmp = (a: Row, b: Row) => {
      switch (sortKey) {
        case 'name': {
          const an = locale === 'fr' ? a.riding.name_fr : a.riding.name_en;
          const bn = locale === 'fr' ? b.riding.name_fr : b.riding.name_en;
          return an.localeCompare(bn) * dir;
        }
        case 'province':
          return (
            (a.riding.province ?? '').localeCompare(
              b.riding.province ?? '',
            ) * dir
          );
        case 'winner':
          return (
            a.riding.projection.winner.localeCompare(
              b.riding.projection.winner,
            ) * dir
          );
        case 'vote':
          return (a.winnerVote - b.winnerVote) * dir;
        case 'margin':
          return (
            (a.riding.projection.mean_margin -
              b.riding.projection.mean_margin) *
            dir
          );
        case 'p_winner':
          return (
            (a.riding.projection.p_winner -
              b.riding.projection.p_winner) *
            dir
          );
        case 'baseline_shift': {
          const order = { flip: 0, hold: 1, new: 2, unknown: 3 } as const;
          return (
            (order[a.baselineShift] - order[b.baselineShift]) * dir
          );
        }
      }
    };
    return [...filtered].sort(cmp);
  }, [filtered, sortKey, sortDir, locale]);

  function toggleSort(key: SortKey) {
    const nextDirection = sortKey === key
      ? sortDir === 'asc' ? 'desc' : 'asc'
      : key === 'name' || key === 'province' || key === 'winner' ? 'asc' : 'desc';
    trackAnalyticsEvent('projection_table_sort', {
      sort_key: key,
      sort_direction: nextDirection,
    });
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      // Sensible default direction per column
      setSortDir(
        key === 'name' || key === 'province' || key === 'winner'
          ? 'asc'
          : 'desc',
      );
    }
    setPageLimit(PAGE_SIZE);
  }

  function toggleSet(set: Set<string>, key: string): Set<string> {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  }

  const clearAll = () => {
    trackAnalyticsEvent('projection_table_filter', {
      filter_type: 'clear_all',
      active: false,
    });
    setSearch('');
    setProvFilter(new Set());
    setPartyFilter(new Set());
    setCloseOnly(false);
    setPageLimit(PAGE_SIZE);
  };

  const t = {
    search: locale === 'fr' ? 'Rechercher une circo…' : 'Search a riding…',
    province: locale === 'fr' ? 'Province' : 'Province',
    party: locale === 'fr' ? 'Parti gagnant' : 'Winning party',
    closeOnly:
      locale === 'fr' ? 'Course serrée seulement' : 'Close races only',
    clear: locale === 'fr' ? 'Effacer' : 'Clear',
    showing:
      locale === 'fr'
        ? (n: number, tot: number) =>
            `${n.toLocaleString('fr-CA')} / ${tot.toLocaleString('fr-CA')} circos`
        : (n: number, tot: number) =>
            `${n.toLocaleString('en-CA')} / ${tot.toLocaleString('en-CA')} ridings`,
    empty:
      locale === 'fr'
        ? 'Aucune circo ne correspond.'
        : 'No riding matches.',
    loadMore:
      locale === 'fr' ? 'Voir plus' : 'Show more',
    cols: {
      name: locale === 'fr' ? 'Circonscription' : 'Riding',
      province: locale === 'fr' ? 'Prov.' : 'Prov.',
      winner: locale === 'fr' ? 'Projection' : 'Projection',
      vote: locale === 'fr' ? '% Vote' : 'Vote%',
      margin: locale === 'fr' ? 'Marge' : 'Margin',
      p_winner: locale === 'fr' ? 'P(victoire)' : 'P(win)',
      baseline_shift: `vs ${baselineYear}`,
    },
  };

  const ariaSort = (k: SortKey) =>
    sortKey === k
      ? sortDir === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none';

  const visible = sorted.slice(0, pageLimit);

  return (
    <div class="rt-wrap">
      <div class="rt-controls">
        <input
          class="rt-search"
          type="search"
          placeholder={t.search}
          value={search}
          onInput={(e) => {
            setSearch((e.target as HTMLInputElement).value);
            setPageLimit(PAGE_SIZE);
          }}
          onBlur={() => {
            if (search.trim()) {
              trackAnalyticsEvent('projection_table_filter', {
                filter_type: 'search',
                active: true,
                result_count: filtered.length,
              });
            }
          }}
          aria-label={t.search}
        />
        {provinces.length > 0 && (
          <div class="rt-chips" role="group" aria-label={t.province}>
            {provinces.map((p) => (
              <button
                key={p}
                type="button"
                class="rt-chip"
                data-active={provFilter.has(p)}
                aria-pressed={provFilter.has(p)}
                onClick={() => {
                  trackAnalyticsEvent('projection_table_filter', {
                    filter_type: 'province',
                    active: !provFilter.has(p),
                  });
                  setProvFilter(toggleSet(provFilter, p));
                  setPageLimit(PAGE_SIZE);
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <div class="rt-chips" role="group" aria-label={t.party}>
          {parties.map((p) => (
            <button
              key={p.key}
              type="button"
              class="rt-chip"
              data-active={partyFilter.has(p.key)}
              aria-pressed={partyFilter.has(p.key)}
              onClick={() => {
                trackAnalyticsEvent('projection_table_filter', {
                  filter_type: 'party',
                  active: !partyFilter.has(p.key),
                });
                setPartyFilter(toggleSet(partyFilter, p.key));
                setPageLimit(PAGE_SIZE);
              }}
            >
              <span
                class="rt-chip-dot"
                style={`background:${p.color}`}
              />
              {locale === 'fr' ? p.label_fr : p.label_en}
            </button>
          ))}
        </div>
        <label class="rt-toggle">
          <input
            type="checkbox"
            checked={closeOnly}
            onChange={(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              trackAnalyticsEvent('projection_table_filter', {
                filter_type: 'close_only',
                active: checked,
              });
              setCloseOnly(checked);
              setPageLimit(PAGE_SIZE);
            }}
          />
          {t.closeOnly}
        </label>
        {(search ||
          provFilter.size ||
          partyFilter.size ||
          closeOnly) && (
          <button type="button" class="rt-clear" onClick={clearAll}>
            {t.clear}
          </button>
        )}
        <span class="rt-meta">{t.showing(filtered.length, ridings.length)}</span>
        <CopyLink locale={locale} anchor="pe-table-title" />
      </div>

      <div class="rt-table-wrap">
        <table class="rt-table">
          <caption class="sr-only">
            {locale === 'fr'
              ? 'Projection détaillée par circonscription'
              : 'Detailed projection by electoral district'}
          </caption>
          <thead>
            <tr>
              <th
                onClick={() => toggleSort('name')}
                aria-sort={ariaSort('name')}
                scope="col"
              >
                {t.cols.name}
              </th>
              <th
                onClick={() => toggleSort('province')}
                aria-sort={ariaSort('province')}
                scope="col"
              >
                {t.cols.province}
              </th>
              <th
                onClick={() => toggleSort('winner')}
                aria-sort={ariaSort('winner')}
                scope="col"
              >
                {t.cols.winner}
              </th>
              <th
                class="rt-num"
                onClick={() => toggleSort('vote')}
                aria-sort={ariaSort('vote')}
                scope="col"
              >
                {t.cols.vote}
              </th>
              <th
                class="rt-num"
                onClick={() => toggleSort('margin')}
                aria-sort={ariaSort('margin')}
                scope="col"
              >
                {t.cols.margin}
              </th>
              <th
                class="rt-num"
                onClick={() => toggleSort('p_winner')}
                aria-sort={ariaSort('p_winner')}
                scope="col"
              >
                {t.cols.p_winner}
              </th>
              <th
                onClick={() => toggleSort('baseline_shift')}
                aria-sort={ariaSort('baseline_shift')}
                scope="col"
              >
                {t.cols.baseline_shift}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} class="rt-empty">
                  {t.empty}
                </td>
              </tr>
            )}
            {visible.map(
              ({
                riding: r,
                winnerVote,
                baselineShift,
                baselineShiftLabel,
              }) => {
                const meta = partyByKey.get(r.projection.winner);
                const color = meta?.color ?? '#888';
                const partyLabel =
                  meta?.[locale === 'fr' ? 'label_fr' : 'label_en'] ??
                  r.projection.winner;
                const name =
                  locale === 'fr' ? r.name_fr : r.name_en;
                return (
                  <tr key={r.riding_id}>
                    <td class="rt-name">
                      {r.href ? (
                        <a
                          href={r.href}
                          onClick={() =>
                            trackAnalyticsEvent('navigation_click', {
                              destination_path: r.href,
                              link_context: 'projection_table',
                              riding_id: r.riding_id,
                            })
                          }
                        >
                          {name}
                        </a>
                      ) : name}
                    </td>
                    <td class="rt-province">{r.province ?? '—'}</td>
                    <td>
                      <span
                        class="rt-pill"
                        style={`border-color:${color};color:${color};`}
                      >
                        <span
                          class="rt-pill-dot"
                          style={`background:${color}`}
                        />
                        {partyLabel}
                      </span>
                    </td>
                    <td class="rt-num">{clampPct(winnerVote).toFixed(1)}%</td>
                    <td class="rt-num">
                      {clampPct(r.projection.mean_margin).toFixed(1)}%
                    </td>
                    <td class="rt-num">
                      {(r.projection.p_winner * 100).toFixed(0)}%
                    </td>
                    <td
                      class={
                        baselineShift === 'flip'
                          ? 'rt-shift-flip'
                          : baselineShift === 'hold'
                            ? 'rt-shift-hold'
                            : 'rt-shift-new'
                      }
                    >
                      {baselineShiftLabel}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
        {visible.length < sorted.length && (
          <button
            type="button"
            class="rt-load-more"
            onClick={() => {
              trackAnalyticsEvent('projection_table_expand', {
                visible_count: Math.min(pageLimit + PAGE_SIZE, sorted.length),
              });
              setPageLimit(pageLimit + PAGE_SIZE);
            }}
          >
            {t.loadMore} (+
            {Math.min(PAGE_SIZE, sorted.length - visible.length)})
          </button>
        )}
      </div>
    </div>
  );
}
