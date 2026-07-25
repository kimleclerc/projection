import { useState } from 'preact/hooks';
import { t, type Audience, type Locale } from '../lib/budget';

interface Props { audiences: Audience[]; locale: Locale }

const COPY = {
  fr: { prompt: 'Vous êtes…', impact: 'Ce que le budget change pour vous' },
  en: { prompt: 'You are…', impact: 'What the budget changes for you' },
  es: { prompt: 'Usted es…', impact: 'Lo que el presupuesto cambia para usted' },
};

export default function BudgetForYou({ audiences, locale }: Props) {
  const c = COPY[locale];
  const [sel, setSel] = useState(0);
  const a = audiences[sel];
  if (!a) return null;

  return (
    <div class="fy">
      <div class="fy-picker" role="tablist" aria-label={c.prompt}>
        <span class="fy-prompt">{c.prompt}</span>
        <div class="fy-chips">
          {audiences.map((x, i) => (
            <button key={x.id} role="tab" aria-selected={i === sel}
              class={`fy-chip ${i === sel ? 'is-on' : ''}`} onClick={() => setSel(i)}>
              {t(x.title, locale)}
            </button>
          ))}
        </div>
      </div>

      <div class="fy-panel">
        <p class="fy-summary">{t(a.summary, locale)}</p>
        {a.measures.length > 0 && (
          <>
            <p class="fy-impact-lab">{c.impact}</p>
            <ul class="fy-measures">
              {a.measures.map((m, i) => (
                <li key={i} class="fy-measure">
                  <div class="fy-measure-top">
                    <span class="fy-measure-label">{t(m.label, locale)}</span>
                    {m.value && <span class="fy-measure-value">{m.value}</span>}
                  </div>
                  {t(m.note, locale) && <span class="fy-measure-note">{t(m.note, locale)}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <style>{`
        .fy-picker { margin-bottom:18px; }
        .fy-prompt { display:block; font-family:var(--serif); font-size:18px; color:var(--ink); margin-bottom:10px; }
        .fy-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .fy-chip { padding:8px 14px; border:1px solid var(--rule); border-radius:999px; background:var(--card); font-family:var(--mono); font-size:12px; color:var(--ink-2); cursor:pointer; transition:border-color .15s; }
        .fy-chip:hover { border-color:var(--ink-2); }
        .fy-chip.is-on { background:var(--ink); color:var(--paper-3); border-color:var(--ink); }
        .fy-panel { border:1px solid var(--rule); border-radius:8px; background:var(--card); padding:20px; }
        .fy-summary { margin:0 0 16px; color:var(--ink-2); font-size:15px; line-height:1.65; }
        .fy-impact-lab { margin:0 0 10px; font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:var(--ink-3); }
        .fy-measures { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:12px; }
        .fy-measure { border-top:1px solid var(--rule); padding-top:12px; }
        .fy-measure-top { display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
        .fy-measure-label { font-family:var(--serif); font-size:15px; color:var(--ink); }
        .fy-measure-value { font-family:var(--mono); font-size:14px; font-weight:600; color:var(--ink); white-space:nowrap; }
        .fy-measure-note { display:block; margin-top:3px; font-family:var(--mono); font-size:11px; color:var(--ink-3); line-height:1.5; }
      `}</style>
    </div>
  );
}
