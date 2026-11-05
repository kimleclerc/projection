/** « Pour vous » : le lecteur choisit son profil ; le choix voyage dans le lien (?profil=) et chaque profil a son image. */
import { useEffect, useState } from 'preact/hooks';
import { t, val, type Audience, type Locale } from '../lib/budget';
import CopyLink from './lib/CopyLink';
import RidingShareButton from './RidingShareButton';

interface Props {
  audiences: Audience[];
  locale: Locale;
  /** Commun aux images : titre de l'édition, pied, identifiants. */
  card: { title: string; foot: string; slug: string; jurisdiction: string };
}

const COPY = {
  fr: { prompt: 'Vous êtes…', impact: 'Ce que le budget change pour vous' },
  en: { prompt: 'You are…', impact: 'What the budget changes for you' },
  es: { prompt: 'Usted es…', impact: 'Lo que el presupuesto cambia para usted' },
};

export default function BudgetForYou({ audiences, locale, card }: Props) {
  const c = COPY[locale];
  const [sel, setSel] = useState(0);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('profil');
    const i = audiences.findIndex((a) => a.id === id);
    if (i > 0) setSel(i);
  }, []);
  const pick = (i: number) => {
    setSel(i);
    const url = new URL(window.location.href);
    url.searchParams.set('profil', audiences[i].id);
    history.replaceState(null, '', url);
  };
  const a = audiences[sel];
  if (!a) return null;
  const rows = a.measures.filter((m) => val(m.value, locale)).slice(0, 3)
    .map((m) => ({ label: t(m.label, locale), value: val(m.value, locale) }));

  return (
    <div class="fy">
      <p class="fy-prompt" id="fy-prompt">{c.prompt}</p>
      <div class="fy-chips" role="tablist" aria-labelledby="fy-prompt">
        {audiences.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={i === sel} class={`fy-chip ${i === sel ? 'is-on' : ''}`} onClick={() => pick(i)}>
            {t(x.title, locale)}
          </button>
        ))}
      </div>
      <div class="fy-panel">
        <p class="fy-summary">{t(a.summary, locale)}</p>
        {a.measures.length > 0 && (
          <>
            <h3 class="fy-impact">{c.impact}</h3>
            <ul class="fy-measures">
              {a.measures.map((m, i) => (
                <li key={i} class="fy-measure">
                  <div class="fy-measure-top">
                    <span class="fy-measure-label">{t(m.label, locale)}</span>
                    {val(m.value, locale) && <span class="fy-measure-value">{val(m.value, locale)}</span>}
                  </div>
                  {t(m.note, locale) && <p class="fy-measure-note">{t(m.note, locale)}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
        <div class="fy-share">
          <CopyLink locale={locale} anchor="pour-vous" />
          {rows.length > 0 && (
            <RidingShareButton lang={locale} payload={{ card: 'budget', slug: `${card.slug}-${a.id}`, jurisdiction: card.jurisdiction, title: card.title, heading: t(a.title, locale), rows, foot: card.foot }} />
          )}
        </div>
      </div>
      <style>{`
        .fy-prompt { margin: 0 0 8px; font-size: 17px; font-weight: 600; }
        .fy-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .fy-chip { min-height: 42px; padding: 8px 14px; border: 1px solid var(--ink-3); border-radius: 2px; background: var(--paper); font: inherit; font-size: 15px; font-weight: 600; color: var(--ink); cursor: pointer; }
        .fy-chip.is-on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
        .fy-panel { margin-top: 16px; border-top: 1px solid var(--rule); padding-top: 16px; }
        .fy-summary { max-width: 72ch; margin: 0 0 16px; color: var(--ink-2); font-size: 17px; line-height: 1.55; }
        .fy-impact { margin: 0 0 8px; font-size: 19px; font-weight: 700; }
        .fy-measures { list-style: none; margin: 0; padding: 0; }
        .fy-measure { border-top: 1px solid var(--rule); padding: 12px 0; }
        .fy-measure-top { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
        .fy-measure-label { font-size: 17px; font-weight: 600; }
        .fy-measure-value { font-family: var(--numeric); font-size: 26px; font-weight: 700; white-space: nowrap; }
        .fy-measure-note { max-width: 72ch; margin: 4px 0 0; font-size: 15px; line-height: 1.5; color: var(--ink-2); }
        .fy-share { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 16px; margin-top: 12px; }
      `}</style>
    </div>
  );
}
