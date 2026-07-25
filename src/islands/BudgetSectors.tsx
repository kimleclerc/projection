import { useMemo, useState } from 'preact/hooks';
import { t, PRIORITY_LABEL, type Sector, type Locale } from '../lib/budget';

interface Props { sectors: Sector[]; locale: Locale }

const COPY = {
  fr: { all: 'Tous', high: 'Élevée', filter: 'Priorité', spend: 'Dépenses', more: 'Détails', less: 'Réduire' },
  en: { all: 'All', high: 'High', filter: 'Priority', spend: 'Spending', more: 'Details', less: 'Collapse' },
  es: { all: 'Todos', high: 'Alta', filter: 'Prioridad', spend: 'Gasto', more: 'Detalles', less: 'Contraer' },
};

export default function BudgetSectors({ sectors, locale }: Props) {
  const c = COPY[locale];
  const [prio, setPrio] = useState<'all' | 'high'>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const shown = useMemo(
    () => (prio === 'all' ? sectors : sectors.filter((s) => s.priority === 'high')),
    [sectors, prio],
  );

  return (
    <div class="bs">
      <div class="bs-filter">
        <span class="bs-filter-lab">{c.filter}:</span>
        {(['all', 'high'] as const).map((p) => (
          <button key={p} class={`bs-chip ${prio === p ? 'is-on' : ''}`} onClick={() => setPrio(p)}>
            {p === 'all' ? c.all : c.high}
          </button>
        ))}
      </div>

      <div class="bs-grid">
        {shown.map((s) => {
          const isOpen = !!open[s.id];
          return (
            <article key={s.id} class={`bs-card ${s.priority === 'high' ? 'is-high' : ''}`}>
              <header class="bs-card-head">
                <h3 class="bs-title">{t(s.title, locale)}</h3>
                {s.priority === 'high' && <span class="bs-prio">{PRIORITY_LABEL.high[locale]}</span>}
              </header>
              {t(s.spending, locale) && (
                <p class="bs-spend"><span class="bs-spend-lab">{c.spend}</span> {t(s.spending, locale)}</p>
              )}
              <p class="bs-summary">{t(s.summary, locale)}</p>
              {isOpen && s.points.length > 0 && (
                <ul class="bs-points">
                  {s.points.map((pt, i) => <li key={i}>{t(pt, locale)}</li>)}
                </ul>
              )}
              {s.tags?.length > 0 && (
                <div class="bs-tags">{s.tags.map((tag) => <span key={tag} class="bs-tag">#{tag}</span>)}</div>
              )}
              {s.points.length > 0 && (
                <button class="bs-toggle" onClick={() => setOpen({ ...open, [s.id]: !isOpen })}
                  aria-expanded={isOpen}>
                  {isOpen ? c.less : `${c.more} (${s.points.length}) ${isOpen ? '↑' : '↓'}`}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <style>{`
        .bs-filter { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
        .bs-filter-lab { font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:var(--ink-3); }
        .bs-chip { padding:5px 12px; border:1px solid var(--rule); border-radius:999px; background:var(--card); font-family:var(--mono); font-size:12px; color:var(--ink-2); cursor:pointer; }
        .bs-chip.is-on { background:var(--ink); color:var(--paper-3); border-color:var(--ink); }
        .bs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px; }
        .bs-card { border:1px solid var(--rule); border-radius:8px; background:var(--card); padding:18px; display:flex; flex-direction:column; }
        .bs-card.is-high { border-left:3px solid #b45309; }
        .bs-card-head { display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-bottom:8px; }
        .bs-title { margin:0; font-family:var(--serif); font-size:17px; line-height:1.25; color:var(--ink); }
        .bs-prio { font-family:var(--mono); font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:#b45309; white-space:nowrap; }
        .bs-spend { margin:0 0 8px; font-family:var(--mono); font-size:12px; color:var(--ink-2); line-height:1.5; }
        .bs-spend-lab { color:var(--ink-3); text-transform:uppercase; letter-spacing:.05em; font-size:10px; margin-right:4px; }
        .bs-summary { margin:0; color:var(--ink-2); font-size:14px; line-height:1.6; }
        .bs-points { margin:12px 0 0; padding-left:18px; display:flex; flex-direction:column; gap:6px; }
        .bs-points li { font-size:13px; line-height:1.55; color:var(--ink-2); }
        .bs-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
        .bs-tag { font-family:var(--mono); font-size:10px; color:var(--ink-3); }
        .bs-toggle { align-self:flex-start; margin-top:12px; padding:0; border:none; background:none; font-family:var(--mono); font-size:11px; color:var(--ink); cursor:pointer; text-decoration:underline; }
      `}</style>
    </div>
  );
}
