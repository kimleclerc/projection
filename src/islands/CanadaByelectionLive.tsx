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
type Result = {
  riding_id: string;
  polls?: { reported?: number | null; total?: number | null; pct?: number | null };
  candidates: Candidate[];
};
type Call = {
  riding_id: string;
  candidate_name: string;
  party_code: string;
  called_at?: string;
  /** The count frozen at approval time — never re-derived from the live payload. */
  as_of?: { polls?: { reported?: number | null; total?: number | null; pct?: number | null } };
};
type Projection = { riding_id: string; candidates: { party_code: string; color?: string }[] };
type LivePayload = {
  generated_at?: string;
  source?: { source_updated_at?: string; healthy?: boolean };
  /** Official facts. A jurisdiction's own feed can supply this block verbatim. */
  results: Result[];
  /** VoteScope's product, joined by riding_id. Never expected from a source feed. */
  calls?: Call[];
  projections?: Projection[];
};

const copy = {
  en: { title: 'Live results', connecting: 'Connecting to the official count…', waiting: 'Waiting for the first official results', leading: 'Current leader', projected: 'Vote-Scope projects a win for', polls: 'Polls reporting', votes: 'votes', updated: 'Updated', source: 'Preliminary results · Elections Canada', unavailable: 'Live results temporarily unavailable', stale: 'Count paused — no new official data for', minutes: 'min', calledAt: 'Projected at', pollsShort: 'polls' },
  fr: { title: 'Résultats en direct', connecting: 'Connexion au dépouillement officiel…', waiting: 'En attente des premiers résultats officiels', leading: 'Tendance actuelle', projected: 'Vote-Scope projette une victoire de', polls: 'Bureaux dépouillés', votes: 'voix', updated: 'Mise à jour', source: 'Résultats préliminaires · Élections Canada', unavailable: 'Résultats en direct temporairement indisponibles', stale: 'Dépouillement en pause — aucune donnée officielle depuis', minutes: 'min', calledAt: 'Projeté à', pollsShort: 'bureaux' },
  es: { title: 'Resultados en directo', connecting: 'Conectando con el recuento oficial…', waiting: 'A la espera de los primeros resultados oficiales', leading: 'Tendencia actual', projected: 'Vote-Scope proyecta la victoria de', polls: 'Mesas escrutadas', votes: 'votos', updated: 'Actualizado', source: 'Resultados preliminares · Elections Canada', unavailable: 'Resultados en directo temporalmente no disponibles', stale: 'Recuento en pausa — sin datos oficiales desde hace', minutes: 'min', calledAt: 'Proyectado con', pollsShort: 'mesas' },
};

export default function CanadaByelectionLive({ eventId, ridingId, lang }: { eventId: string; ridingId: string; lang: Locale }) {
  const [data, setData] = useState<LivePayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const t = copy[lang];

  // The payload only carries a new generated_at when the count actually moved, so
  // a long gap during counting means the producer stopped — not that nothing changed.
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

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

  const race = useMemo(() => data?.results?.find((item) => item.riding_id === ridingId), [data, ridingId]);
  const call = useMemo(() => data?.calls?.find((item) => item.riding_id === ridingId), [data, ridingId]);
  const colors = useMemo(() => new Map((data?.projections ?? [])
    .find((item) => item.riding_id === ridingId)?.candidates
    .map((candidate) => [candidate.party_code, candidate.color]) ?? []), [data, ridingId]);
  const candidates = (race?.candidates ?? []).filter((candidate) => candidate.votes > 0).slice(0, 5);
  const leader = candidates[0];
  const pollPct = race?.polls?.pct ?? (race?.polls?.reported != null && race?.polls?.total ? 100 * race.polls.reported / race.polls.total : 0);
  // A call describes the count that justified it, not the count as it stands now.
  const calledAt = call?.as_of?.polls;
  const locale = lang === 'en' ? 'en-CA' : lang === 'fr' ? 'fr-CA' : 'es-ES';
  const stamp = data?.generated_at ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.generated_at)) : null;
  const ageMinutes = data?.generated_at ? Math.floor((now - new Date(data.generated_at).getTime()) / 60_000) : null;
  // Before the first box reports, an old waiting snapshot is expected and must not
  // look like a stalled count. Once votes exist, five quiet minutes are meaningful.
  const stale = Boolean(leader) && ageMinutes != null && ageMinutes >= 5;

  return <section className={stale ? "cblive cblive-is-stale" : "cblive"} aria-live="polite" aria-busy={!data && !failed}>
    <div className="cblive-head">
      <p className="cblive-label"><i />{t.title}</p>
      {stamp && <span>{t.updated}: {stamp}</span>}
    </div>
    {stale && <p className="cblive-stale" role="status">{t.stale} {ageMinutes} {t.minutes}</p>}
    {!data && <p className="cblive-state">{failed ? t.unavailable : t.connecting}</p>}
    {data && !leader && <p className="cblive-state">{t.waiting}</p>}
    {leader && <>
      <h2>{call ? `${t.projected} ${call.candidate_name}` : `${t.leading}: ${leader.candidate_name}`}</h2>
      {call && calledAt?.reported != null && <p className="cblive-called-at">{t.calledAt} {calledAt.reported}/{calledAt.total} {t.pollsShort}</p>}
      <div className="cblive-polls">
        <span>{t.polls}</span>
        <strong>{race?.polls?.reported ?? '—'} / {race?.polls?.total ?? '—'}</strong>
        <div><i style={{ width: `${Math.max(0, Math.min(100, pollPct || 0))}%` }} /></div>
      </div>
      <div className="cblive-results">
        {candidates.map((candidate) => <div className="cblive-row" key={`${candidate.party_code}-${candidate.candidate_name}`}>
          <i className="cblive-dot" style={{ background: colors.get(candidate.party_code) ?? '#8c8c8c' }} />
          <span><strong>{candidate.candidate_name}</strong><small>{candidate.party_code.toUpperCase()}</small></span>
          <b>{candidate.votes.toLocaleString(locale)} {t.votes}</b>
          <em>{candidate.vote_pct.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</em>
        </div>)}
      </div>
    </>}
    <p className="cblive-source">{t.source}</p>
  </section>;
}
