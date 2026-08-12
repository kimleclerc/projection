import { useEffect, useState } from 'preact/hooks';
import '../styles/clacton-live.css';

type Locale = 'en' | 'fr' | 'es';
type Localized = Record<Locale, string>;
type LiveUpdate = { at: string; text: Localized; source_url?: string };
type LiveData = {
  updated_at: string;
  status: string;
  status_label: Localized;
  turnout_pct: number | null;
  result: null | { candidate: string; votes: number; pct: number }[];
  updates: LiveUpdate[];
  method_note: Localized;
};

const copy = {
  en: { label: 'Live count', updated: 'Updated', turnout: 'Turnout', source: 'Source' },
  fr: { label: 'Dépouillement en direct', updated: 'Mise à jour', turnout: 'Participation', source: 'Source' },
  es: { label: 'Recuento en directo', updated: 'Actualizado', turnout: 'Participación', source: 'Fuente' },
};

export default function ClactonLiveDesk({ initial, lang }: { initial: LiveData; lang: Locale }) {
  const [data, setData] = useState(initial);
  const t = copy[lang];

  useEffect(() => {
    const load = () => fetch(`/web_data/uk-clacton-live/latest.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => undefined);
    const id = window.setInterval(load, 45_000);
    return () => window.clearInterval(id);
  }, []);

  const stamp = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : lang, {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London',
  }).format(new Date(data.updated_at));

  return <section className="clive" aria-live="polite">
    <div className="clive-head">
      <p className="clive-label"><i />{t.label}</p>
      <span>{t.updated}: {stamp} BST</span>
    </div>
    <h2>{data.status_label[lang]}</h2>
    {data.turnout_pct != null && <p className="clive-turnout">{t.turnout}: <strong>{data.turnout_pct.toFixed(1)}%</strong></p>}
    {data.result && <div className="clive-result">
      {data.result.map((row) => <p key={row.candidate}><span>{row.candidate}</span><strong>{row.votes.toLocaleString()} · {row.pct.toFixed(1)}%</strong></p>)}
    </div>}
    <ol>
      {data.updates.map((update) => <li key={update.at}>
        <time>{new Date(update.at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })}</time>
        <span>{update.text[lang]} {update.source_url && <a href={update.source_url} rel="noopener">{t.source} ↗</a>}</span>
      </li>)}
    </ol>
    <p className="clive-note">{data.method_note[lang]}</p>
  </section>;
}
