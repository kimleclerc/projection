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
type Projection = { riding_id: string; candidates: { party_code: string; color?: string; party_label?: Partial<Record<Locale, string>> }[] };
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
  en: { title: 'Results', connecting: 'Connecting to the official count…', waiting: 'Waiting for the first official results', leading: 'Leading', projected: 'Vote-Scope projects a win for', polls: 'Polls reporting', votes: 'votes', updated: 'Updated', source: 'Preliminary results', sourceDefault: 'Elections Canada', unavailable: 'Results are not loading right now. The page will try again on its own.', stale: 'No new official results for', minutes: 'min', calledAt: 'Projected at', pollsShort: 'polls', colon: ':', ahead: (n: string, who: string) => `${n} votes ahead of ${who}` },
  fr: { title: 'Résultats', connecting: 'Connexion au dépouillement officiel…', waiting: 'En attente des premiers résultats officiels', leading: 'En tête', projected: 'Vote-Scope projette une victoire de', polls: 'Bureaux dépouillés', votes: 'voix', updated: 'Mise à jour', source: 'Résultats préliminaires', sourceDefault: 'Élections Canada', unavailable: 'Les résultats ne se chargent pas en ce moment. La page réessaie d’elle-même.', stale: 'Aucun résultat officiel nouveau depuis', minutes: 'min', calledAt: 'Projeté à', pollsShort: 'bureaux', colon: '\u00a0:', ahead: (n: string, who: string) => `${n} voix d’avance sur ${who}` },
  es: { title: 'Resultados', connecting: 'Conectando con el recuento oficial…', waiting: 'A la espera de los primeros resultados oficiales', leading: 'En cabeza', projected: 'Vote-Scope proyecta la victoria de', polls: 'Mesas escrutadas', votes: 'votos', updated: 'Actualizado', source: 'Resultados preliminares', sourceDefault: 'Elections Canada', unavailable: 'Los resultados no se cargan en este momento. La página vuelve a intentarlo sola.', stale: 'Sin resultados oficiales nuevos desde hace', minutes: 'min', calledAt: 'Proyectado con', pollsShort: 'mesas', colon: ':', ahead: (n: string, who: string) => `${n} votos de ventaja sobre ${who}` },
};

export default function CanadaByelectionLive({ eventId, ridingId, lang, sourceName }: { eventId: string; ridingId: string; lang: Locale; sourceName?: string }) {
  const [data, setData] = useState<LivePayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const t = copy[lang];

  const race = useMemo(() => data?.results?.find((item) => item.riding_id === ridingId), [data, ridingId]);
  // Élections Canada publie le dénominateur des bureaux: reported >= total est le
  // seul signal de fin qui ne dépende ni d'un call ni d'une heure.
  const complete = race?.polls?.reported != null && !!race?.polls?.total
    && race.polls.reported >= race.polls.total;

  // The payload only carries a new generated_at when the count actually moved, so
  // a long gap during counting means the producer stopped — not that nothing changed.
  useEffect(() => {
    if (complete) return;
    const tick = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(tick);
  }, [complete]);

  useEffect(() => {
    // Tous les bureaux ont rapporté: la page cesse d'interroger l'API. Sans ça,
    // chaque visiteur redemandait un résultat figé toutes les 20 s, indéfiniment.
    if (complete) return;
    let active = true;
    const load = () => fetch(`https://vote-scope.com/api/v1/elections/${eventId}/live.json`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then((payload) => { if (active) { setData(payload); setFailed(false); } })
      .catch(() => { if (active) setFailed(true); });
    load();
    // 90 s: la cadence d'Élections Canada elle-même (leur page n'offre pas plus
    // rapide). Interroger aux 20 s demandait quatre fois la même donnée. Reste
    // bien sous le seuil de péremption de 5 min, qui ne doit jamais se déclencher
    // sur notre propre rythme de sondage plutôt que sur un vrai silence.
    const timer = window.setInterval(load, 90_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [eventId, complete]);

  const call = useMemo(() => data?.calls?.find((item) => item.riding_id === ridingId), [data, ridingId]);
  const colors = useMemo(() => new Map((data?.projections ?? [])
    .find((item) => item.riding_id === ridingId)?.candidates
    .map((candidate) => [candidate.party_code, candidate.color]) ?? []), [data, ridingId]);
  // Party codes are namespaced by jurisdiction in the engine (on_pc, qc_caq), so
  // upper-casing the raw code prints "ON_PC" at the reader. Prefer the label the
  // projection already carries; strip the namespace only as a fallback.
  const labels = useMemo(() => new Map((data?.projections ?? [])
    .find((item) => item.riding_id === ridingId)?.candidates
    .map((candidate) => [candidate.party_code, candidate.party_label?.[lang]]) ?? []), [data, ridingId, lang]);
  const partyLabel = (code: string) => labels.get(code) || code.replace(/^(on|qc|us|uk|fr)_/, '').toUpperCase();
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
  // Un dépouillement terminé n'est pas « en pause »: il est fini. Sans cette
  // exception, la page annonçait une panne toute la nuit une fois le collecteur
  // arrêté, sur un résultat pourtant complet.
  const stale = Boolean(leader) && !complete && ageMinutes != null && ageMinutes >= 5;

  return <section className={stale ? "cblive cblive-is-stale" : "cblive"} aria-live="polite" aria-busy={!data && !failed}>
    <div className="cblive-head">
      <p className="cblive-label"><i />{t.title}</p>
      {stamp && <span>{t.updated}{t.colon} {stamp}</span>}
    </div>
    {stale && <p className="cblive-stale" role="status">{t.stale} {ageMinutes} {t.minutes}</p>}
    {!data && <p className="cblive-state">{failed ? t.unavailable : t.connecting}</p>}
    {data && !leader && <p className="cblive-state">{t.waiting}</p>}
    {leader && <>
      <h2>{call ? `${t.projected} ${call.candidate_name}` : `${t.leading}${t.colon} ${leader.candidate_name}`}</h2>
      {candidates[1] && <p className="cblive-ahead">{t.ahead((leader.votes - candidates[1].votes).toLocaleString(locale), candidates[1].candidate_name)}</p>}
      {call && calledAt?.reported != null && <p className="cblive-called-at">{t.calledAt} {calledAt.reported}/{calledAt.total} {t.pollsShort}</p>}
      <div className="cblive-polls">
        <span>{t.polls}</span>
        <strong>{race?.polls?.reported ?? '—'} / {race?.polls?.total ?? '—'}</strong>
        <div><i style={{ width: `${Math.max(0, Math.min(100, pollPct || 0))}%` }} /></div>
      </div>
      <div className="cblive-results">
        {candidates.map((candidate) => <div className="cblive-row" key={`${candidate.party_code}-${candidate.candidate_name}`}>
          <i className="cblive-dot" style={{ background: colors.get(candidate.party_code) ?? '#8c8c8c' }} />
          <span><strong>{candidate.candidate_name}</strong><small>{partyLabel(candidate.party_code)}</small></span>
          <b>{candidate.votes.toLocaleString(locale)} {t.votes}</b>
          <em>{candidate.vote_pct.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</em>
        </div>)}
      </div>
    </>}
    <p className="cblive-source">{t.source} · {sourceName || t.sourceDefault}</p>
  </section>;
}
