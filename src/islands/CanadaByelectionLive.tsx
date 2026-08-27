import { useEffect, useMemo, useState } from 'preact/hooks';
import '../styles/canada-byelection-live.css';

type Locale = 'en' | 'fr' | 'es';
type Candidate = {
  candidate_name: string;
  party_code: string;
  votes: number;
  vote_pct: number;
  color?: string;
};
type Race = {
  riding_id: string;
  polls?: { reported?: number | null; total?: number | null; pct?: number | null };
  candidates: Candidate[];
  call?: { candidate_name: string; party_code: string } | null;
};
type LivePayload = {
  generated_at?: string;
  source?: { source_updated_at?: string; healthy?: boolean };
  races: Race[];
};

const copy = {
  en: { title: 'Live results', connecting: 'Connecting to the official count…', waiting: 'Waiting for the first official results', leading: 'Current leader', projected: 'Vote-Scope projects a win for', polls: 'Polls reporting', votes: 'votes', updated: 'Updated', source: 'Preliminary results · Elections Canada', unavailable: 'Live results temporarily unavailable' },
  fr: { title: 'Résultats en direct', connecting: 'Connexion au dépouillement officiel…', waiting: 'En attente des premiers résultats officiels', leading: 'Tendance actuelle', projected: 'Vote-Scope projette une victoire de', polls: 'Bureaux dépouillés', votes: 'voix', updated: 'Mise à jour', source: 'Résultats préliminaires · Élections Canada', unavailable: 'Résultats en direct temporairement indisponibles' },
  es: { title: 'Resultados en directo', connecting: 'Conectando con el recuento oficial…', waiting: 'A la espera de los primeros resultados oficiales', leading: 'Tendencia actual', projected: 'Vote-Scope proyecta la victoria de', polls: 'Mesas escrutadas', votes: 'votos', updated: 'Actualizado', source: 'Resultados preliminares · Elections Canada', unavailable: 'Resultados en directo temporalmente no disponibles' },
};

export default function CanadaByelectionLive({ eventId, ridingId, lang }: { eventId: string; ridingId: string; lang: Locale }) {
  const [data, setData] = useState<LivePayload | null>(null);
  const [failed, setFailed] = useState(false);
  const t = copy[lang];

  useEffect(() => {
    let active = true;
    const load = () => fetch(`https://vote-scope.com/api/v1/elections/${eventId}/live.json`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then((payload) => { if (active) { setData(payload); setFailed(false); } })
      .catch(() => { if (active) setFailed(true); });
    load();
    const timer = window.setInterval(load, 20_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [eventId]);

  const race = useMemo(() => data?.races?.find((item) => item.riding_id === ridingId), [data, ridingId]);
  const candidates = (race?.candidates ?? []).filter((candidate) => candidate.votes > 0).slice(0, 5);
  const leader = candidates[0];
  const pollPct = race?.polls?.pct ?? (race?.polls?.reported != null && race?.polls?.total ? 100 * race.polls.reported / race.polls.total : 0);
  const locale = lang === 'en' ? 'en-CA' : lang === 'fr' ? 'fr-CA' : 'es-ES';
  const stamp = data?.generated_at ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.generated_at)) : null;

  return <section className="cblive" aria-live="polite" aria-busy={!data && !failed}>
    <div className="cblive-head">
      <p className="cblive-label"><i />{t.title}</p>
      {stamp && <span>{t.updated}: {stamp}</span>}
    </div>
    {!data && <p className="cblive-state">{failed ? t.unavailable : t.connecting}</p>}
    {data && !leader && <p className="cblive-state">{t.waiting}</p>}
    {leader && <>
      <h2>{race?.call ? `${t.projected} ${race.call.candidate_name}` : `${t.leading}: ${leader.candidate_name}`}</h2>
      <div className="cblive-polls">
        <span>{t.polls}</span>
        <strong>{race?.polls?.reported ?? '—'} / {race?.polls?.total ?? '—'}</strong>
        <div><i style={{ width: `${Math.max(0, Math.min(100, pollPct || 0))}%` }} /></div>
      </div>
      <div className="cblive-results">
        {candidates.map((candidate) => <div className="cblive-row" key={candidate.party_code}>
          <i className="cblive-dot" style={{ background: candidate.color ?? '#8c8c8c' }} />
          <span><strong>{candidate.candidate_name}</strong><small>{candidate.party_code.toUpperCase()}</small></span>
          <b>{candidate.votes.toLocaleString(locale)} {t.votes}</b>
          <em>{candidate.vote_pct.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</em>
        </div>)}
      </div>
    </>}
    <p className="cblive-source">{t.source}</p>
  </section>;
}
