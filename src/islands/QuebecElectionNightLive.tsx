import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import '../styles/quebec-election-night-live.css';
import { readDgeqDirect } from './dgeqDirect';

/**
 * La couche directe de la soirée québécoise : sièges en tête et appelés, et
 * les 127 circonscriptions, lues depuis le Worker (`live.json`).
 *
 * Lecture, telle que le plan l'exige : `setTimeout` récursif (pas d'intervalle
 * fixe), première lecture après un court délai aléatoire, cadence 90 s ± 15 %,
 * jamais deux lectures en vol, pause quand l'onglet est caché, relecture au
 * retour seulement si l'instantané est vieux, repli exponentiel plafonné sur
 * erreur, arrêt quand le dépouillement est complet, garde de séquence avant
 * tout rendu (un instantané plus ancien n'est jamais affiché), dernier état
 * conservé dans localStorage et rendu comme « dernière mise à jour connue ».
 */

type Locale = 'en' | 'fr' | 'es';
type Candidate = { candidate_name: string; party_code: string; votes: number; vote_pct: number };
type Result = {
  riding_id: string; slug?: string; name?: string;
  polls?: { reported?: number | null; total?: number | null; pct?: number | null };
  ballots_counted?: number; candidates: Candidate[];
};
type Call = { riding_id: string; party_code: string; candidate_name: string; called_at?: string;
  /** posé par le collecteur quand l'appel a été publié PAR-DESSUS une anomalie de source. */
  source_anomalies_overridden?: boolean };
type ProjCandidate = { party_code: string; candidate_name?: string | null; color?: string; party_label?: Partial<Record<Locale, string>> };
type Projection = { riding_id: string; candidates: ProjCandidate[] };
type LivePayload = {
  sequence?: number; generated_at?: string;
  event?: { id?: string; mode?: string; election_date?: string };
  source?: { source_updated_at?: string | null; healthy?: boolean; anomaly_count?: number; url?: string };
  results: Result[]; calls?: Call[]; projections?: Projection[];
};

const MAJORITY = 64;
const TOTAL = 127;
const BASE_INTERVAL_MS = 90_000;
const STALE_AFTER_MS = 7 * 60_000;
// Au-delà, on tente le repli : le statique est peut-être figé sur un PoP.
const FALLBACK_AFTER_MS = 3 * 60_000;
// PLAFOND DUR. Sans lui, un statique figé — la fin de soirée, par exemple —
// enverrait CHAQUE onglet sur le Worker à chaque tour, et la falaise de quota
// reviendrait par la porte d'en arrière. Le repli est un secours, pas un régime.
const FALLBACK_MAX_USES = 3;
// Répétitions : le collecteur republie `demo` sur un rejeu de fixture même quand
// la configuration dit `simulation`. Ni l'un ni l'autre n'est le vrai scrutin.
const REHEARSAL_MODES = new Set(['simulation', 'demo']);

const copy = {
  fr: { live: 'En direct', waiting: 'En attente des premiers résultats officiels', connecting: 'Connexion au dépouillement officiel…',
        unavailable: 'Résultats en direct temporairement indisponibles', lastKnown: 'Dernière mise à jour connue', updated: 'Données du',
        seats: 'Sièges', called: 'appelés', leading: 'en tête', majority: `Majorité : ${MAJORITY}`, ridings: 'Circonscriptions',
        riding: 'Circonscription', leader: 'Meneur', votes: 'Voix', polls: 'Bureaux', status: 'Statut', calledBadge: 'Appelé',
        leadingBadge: 'En tête', noVotes: '—', stale: 'Dépouillement en pause — aucune donnée officielle depuis', minutes: 'min',
        complete: 'Dépouillement terminé', source: 'Source officielle : Élections Québec. Les appels sont ceux de Vote-Scope.',
        direct: 'Source directe du directeur général des élections — nos appels et nos projections ne sont pas disponibles.',
        search: 'Chercher une circonscription', anomalies: 'candidats ou partis inconnus du registre',
        anomaliesBlocked: 'aucun appel automatique possible', anomaliesOverridden: 'des appels automatiques ont été publiés malgré l’anomalie' },
  en: { live: 'Live', waiting: 'Waiting for the first official results', connecting: 'Connecting to the official count…',
        unavailable: 'Live results temporarily unavailable', lastKnown: 'Last known update', updated: 'Data as of',
        seats: 'Seats', called: 'called', leading: 'leading', majority: `Majority: ${MAJORITY}`, ridings: 'Ridings',
        riding: 'Riding', leader: 'Leader', votes: 'Votes', polls: 'Polls', status: 'Status', calledBadge: 'Called',
        leadingBadge: 'Leading', noVotes: '—', stale: 'Count paused — no new official data for', minutes: 'min',
        complete: 'Count complete', source: 'Official source: Élections Québec. Calls are Vote-Scope’s.',
        direct: 'Reading the chief electoral officer directly — our calls and projections are unavailable.',
        search: 'Find a riding', anomalies: 'candidates or parties unknown to the registry',
        anomaliesBlocked: 'no automatic call possible', anomaliesOverridden: 'automatic calls were published over the anomaly' },
  es: { live: 'En directo', waiting: 'A la espera de los primeros resultados oficiales', connecting: 'Conectando con el recuento oficial…',
        unavailable: 'Resultados en directo temporalmente no disponibles', lastKnown: 'Última actualización conocida', updated: 'Datos del',
        seats: 'Escaños', called: 'asignados', leading: 'en cabeza', majority: `Mayoría: ${MAJORITY}`, ridings: 'Distritos',
        riding: 'Distrito', leader: 'Líder', votes: 'Votos', polls: 'Mesas', status: 'Estado', calledBadge: 'Asignado',
        leadingBadge: 'En cabeza', noVotes: '—', stale: 'Recuento en pausa — sin datos oficiales desde hace', minutes: 'min',
        complete: 'Recuento completo', source: 'Fuente oficial: Élections Québec. Las asignaciones son de Vote-Scope.',
        direct: 'Lectura directa del director general de elecciones — nuestras asignaciones y proyecciones no están disponibles.',
        search: 'Buscar un distrito', anomalies: 'candidatos o partidos desconocidos para el registro',
        anomaliesBlocked: 'sin asignación automática', anomaliesOverridden: 'se publicaron asignaciones automáticas pese a la anomalía' },
};

function storageKey(eventId: string) { return `vs-live-${eventId}`; }
function readStored(eventId: string): LivePayload | null {
  try { const raw = localStorage.getItem(storageKey(eventId)); return raw ? JSON.parse(raw) as LivePayload : null; } catch { return null; }
}
function writeStored(eventId: string, payload: LivePayload) {
  try { localStorage.setItem(storageKey(eventId), JSON.stringify(payload)); } catch { /* quota, navigation privée : sans conséquence */ }
}
function isValid(value: unknown): value is LivePayload {
  const p = value as Partial<LivePayload> | null;
  return !!p && typeof p === 'object' && Array.isArray(p.results) && p.results.every((r) => typeof r?.riding_id === 'string');
}
function fmtTime(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' });
}
function num(v: number, locale: Locale, digits = 1): string {
  return v.toLocaleString(locale === 'en' ? 'en-CA' : locale === 'es' ? 'es-ES' : 'fr-CA', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export default function QuebecElectionNightLive({ eventId, lang, apiBase, fallbackApiBase }:
  { eventId: string; lang: Locale; apiBase: string; fallbackApiBase?: string }) {
  const t = copy[lang];
  const [data, setData] = useState<LivePayload | null>(null);
  const [fromStorage, setFromStorage] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState('');
  const inFlight = useRef(false);
  const failures = useRef(0);
  const lastFetchAt = useRef(0);
  const timer = useRef<number | null>(null);
  const stopped = useRef(false);
  const sequence = useRef(-1);
  const fallbackUses = useRef(0);
  const [direct, setDirect] = useState(false);
  const lastPayload = useRef<LivePayload | null>(null);

  const complete = useMemo(() => {
    if (!data?.results?.length) return false;
    const withTotals = data.results.filter((r) => r.polls?.total);
    return withTotals.length === data.results.length && withTotals.every((r) => (r.polls?.reported ?? 0) >= (r.polls?.total ?? 1));
  }, [data]);

  useEffect(() => {
    const stored = readStored(eventId);
    if (stored && isValid(stored)) { setData(stored); setFromStorage(true); sequence.current = stored.sequence ?? -1; }

    const endpoint = (base: string) => `${base.replace(/\/$/, '')}/api/v1/elections/${eventId}/live.json`;
    const url = endpoint(apiBase);

    // `cache: 'default'` laisse HTTP travailler : un 304 coûte quelques octets.
    const read = async (from: string): Promise<LivePayload> => {
      const response = await fetch(from, { cache: 'default' });
      if (!response.ok) throw new Error(`http ${response.status}`);
      const body = await response.json();
      if (!isValid(body)) throw new Error('payload invalide');
      return body as LivePayload;
    };
    const ageOf = (p: LivePayload) => {
      const stamp = p.source?.source_updated_at;
      return stamp ? Date.now() - new Date(stamp).getTime() : Number.POSITIVE_INFINITY;
    };

    const schedule = (ms: number) => {
      if (stopped.current) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(tick, ms);
    };
    const jittered = () => BASE_INTERVAL_MS * (0.85 + Math.random() * 0.3);

    const tick = async () => {
      if (stopped.current) return;
      if (document.hidden) { schedule(jittered()); return; }    // pause : rien tant que l'onglet est caché
      if (inFlight.current) { schedule(jittered()); return; }   // jamais deux lectures en vol
      inFlight.current = true;
      try {
        // Le rail statique d'abord, TOUJOURS. Le Worker n'est sollicité que si
        // le statique tombe ou se fige — une fraction infime du trafic, qui ne
        // peut donc pas épuiser le quota de requêtes.
        let payload: LivePayload;
        let viaDirect = false;
        try {
          payload = await read(url);
          if (fallbackApiBase && ageOf(payload) > FALLBACK_AFTER_MS && fallbackUses.current < FALLBACK_MAX_USES) {
            fallbackUses.current += 1;
            try {
              const spare = await read(endpoint(fallbackApiBase));
              if (ageOf(spare) < ageOf(payload)) payload = spare;
            } catch { /* le repli ne doit jamais faire échouer une lecture réussie */ }
          }
        } catch (primaryError) {
          try {
            if (!fallbackApiBase || fallbackUses.current >= FALLBACK_MAX_USES) throw primaryError;
            fallbackUses.current += 1;
            payload = await read(endpoint(fallbackApiBase));
          } catch {
            // TROISIÈME RAIL, hors Cloudflare et hors notre collecteur : le DGEQ
            // lui-même. On y perd les appels et les projections — ils naissent du
            // moteur, et si on est ici le moteur est tombé — mais le dépouillement
            // officiel continue de s'afficher. On garde les projections déjà
            // connues pour les couleurs et les libellés, rien de plus.
            const reading = await readDgeqDirect();
            payload = {
              sequence: sequence.current,
              event: { id: eventId },
              source: { source_updated_at: reading.sourceUpdatedAt, healthy: true, anomaly_count: 0 },
              results: reading.results,
              calls: [],
              projections: lastPayload.current?.projections ?? readStored(eventId)?.projections ?? [],
            };
            viaDirect = true;
          }
        }
        const seq = payload.sequence ?? 0;
        if (seq < sequence.current) {
          // GARDE DE SÉQUENCE : un instantané plus ancien (cache, second point
          // de publication en retard) n'est jamais rendu ni conservé.
          failures.current = 0;
        } else {
          sequence.current = seq;
          lastPayload.current = payload;
          setData(payload); setFromStorage(false); setFailed(false);
          setDirect(viaDirect);
          writeStored(eventId, payload);
          failures.current = 0;
        }
        lastFetchAt.current = Date.now();
      } catch {
        failures.current += 1;
        setFailed(true);                                         // visible même après un premier succès
      } finally {
        inFlight.current = false;
      }
      setNow(Date.now());
      const backoff = Math.min(10 * 60_000, jittered() * 2 ** Math.min(failures.current, 4));
      schedule(failures.current ? backoff : jittered());
    };

    const onVisible = () => {
      if (!document.hidden && Date.now() - lastFetchAt.current > 60_000) { schedule(500 + Math.random() * 1500); }
    };
    document.addEventListener('visibilitychange', onVisible);
    schedule(500 + Math.random() * 4000);                        // première lecture : délai aléatoire court
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => { stopped.current = true; if (timer.current) window.clearTimeout(timer.current); window.clearInterval(clock); document.removeEventListener('visibilitychange', onVisible); };
  }, [eventId, apiBase]);

  useEffect(() => { if (complete) stopped.current = true; }, [complete]);

  const meta = useMemo(() => {
    const byParty = new Map<string, { color: string; label: string }>();
    for (const p of data?.projections ?? []) for (const c of p.candidates) {
      if (!byParty.has(c.party_code)) byParty.set(c.party_code, { color: c.color ?? '#78909c', label: c.party_label?.[lang] ?? c.party_code.toUpperCase() });
    }
    return byParty;
  }, [data, lang]);

  const rows = useMemo(() => {
    const calls = new Map((data?.calls ?? []).map((c) => [c.riding_id, c]));
    return (data?.results ?? []).map((r) => {
      const sorted = [...(r.candidates ?? [])].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));   // tri explicite du meneur
      const leader = sorted[0] && (sorted[0].votes ?? 0) > 0 ? sorted[0] : null;
      const call = calls.get(r.riding_id) ?? null;
      const party = call?.party_code ?? leader?.party_code ?? null;
      return { id: r.riding_id, name: r.name ?? r.riding_id, leader, call, party, polls: r.polls, margin: leader && sorted[1] ? (leader.vote_pct ?? 0) - (sorted[1].vote_pct ?? 0) : null };
    }).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [data]);

  const tally = useMemo(() => {
    const acc = new Map<string, { called: number; leading: number }>();
    for (const row of rows) {
      if (!row.party) continue;
      const entry = acc.get(row.party) ?? { called: 0, leading: 0 };
      if (row.call) entry.called += 1; else entry.leading += 1;
      acc.set(row.party, entry);
    }
    return [...acc.entries()].map(([code, v]) => ({ code, ...v, total: v.called + v.leading, ...(meta.get(code) ?? { color: '#78909c', label: code.toUpperCase() }) }))
      .sort((a, b) => b.total - a.total || b.called - a.called);
  }, [rows, meta]);

  const sourceStamp = data?.source?.source_updated_at ?? null;
  const ageMin = sourceStamp ? Math.floor((now - new Date(sourceStamp).getTime()) / 60_000) : null;
  const stale = !complete && !!data && !fromStorage && data.source?.healthy !== false && ageMin !== null && ageMin * 60_000 > STALE_AFTER_MS;
  const decided = rows.filter((r) => r.party).length;
  // Une anomalie de source n'interdit un appel automatique que hors répétition.
  // En simulation, `allow_source_anomalies` peut lever le garde-fou : on ne
  // promet donc rien tant qu'aucun appel n'a porté la dérogation.
  const anomalyOverridden = (data?.calls ?? []).some((c) => c.source_anomalies_overridden);
  const anomalyClause = anomalyOverridden ? t.anomaliesOverridden
    : REHEARSAL_MODES.has(data?.event?.mode ?? '') ? null : t.anomaliesBlocked;
  const visible = filter ? rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase())) : rows;

  if (!data) {
    return <section class={`qcl${failed ? ' qcl-is-failed' : ''}`} aria-live="polite"><div class="qcl-head"><span class="qcl-label"><i></i>{t.live}</span></div>
      <p class="qcl-state">{failed ? t.unavailable : t.connecting}</p></section>;
  }

  return (
    <section class={`qcl${stale || fromStorage ? ' qcl-is-stale' : ''}`} aria-live="polite" data-sequence={data.sequence ?? ''}>
      <div class="qcl-head">
        <span class="qcl-label"><i></i>{complete ? t.complete : t.live}</span>
        <span>{fromStorage ? `${t.lastKnown} · ` : ''}{sourceStamp ? `${t.updated} ${fmtTime(sourceStamp, lang)}` : ''}{typeof data.sequence === 'number' ? ` · #${data.sequence}` : ''}</span>
      </div>
      {direct && <p class="qcl-warn">{t.direct}</p>}
      {failed && !direct && <p class="qcl-warn">{t.unavailable}</p>}
      {stale && ageMin !== null && <p class="qcl-warn">{t.stale} {ageMin} {t.minutes}.</p>}
      {(data.source?.anomaly_count ?? 0) > 0 && (
        <p class="qcl-warn">{data.source?.anomaly_count} {t.anomalies}{anomalyClause ? ` — ${anomalyClause}` : ''}</p>
      )}

      {decided === 0 ? <p class="qcl-state">{t.waiting}</p> : (
        <div class="qcl-seats">
          <div class="qcl-bar" role="img" aria-label={`${t.seats} — ${tally.map((p) => `${p.label} ${p.total}`).join(', ')}`}>
            {tally.map((p) => <i key={p.code} style={`width:${(100 * p.total) / TOTAL}%;background:${p.color}`}>{p.called > 0 && <b style={`width:${(100 * p.called) / p.total}%`}></b>}</i>)}
            <em style={`--m:${(100 * MAJORITY) / TOTAL}%`} aria-hidden="true"></em>
          </div>
          <ul class="qcl-legend">
            {tally.map((p) => <li key={p.code}><i style={`background:${p.color}`}></i><span>{p.label}</span><strong>{p.total}</strong><small>{p.called} {t.called} · {p.leading} {t.leading}</small></li>)}
          </ul>
          <p class="qcl-majority">{t.majority} · {decided}/{TOTAL}</p>
        </div>
      )}

      <div class="qcl-ridings">
        <div class="qcl-ridings-head"><h3>{t.ridings}</h3>
          <input type="search" placeholder={t.search} value={filter} onInput={(e) => setFilter((e.target as HTMLInputElement).value)} aria-label={t.search} /></div>
        <table>
          <thead><tr><th>{t.riding}</th><th>{t.leader}</th><th class="num">{t.votes}</th><th class="num">{t.polls}</th><th>{t.status}</th></tr></thead>
          <tbody>
            {visible.map((r) => {
              const p = r.party ? meta.get(r.party) : null;
              return <tr key={r.id} class={r.call ? 'is-called' : ''}>
                <td>{r.name}</td>
                <td>{r.leader ? <><i class="qcl-dot" style={`background:${p?.color ?? '#78909c'}`}></i>{r.leader.candidate_name} <small>{p?.label ?? r.leader.party_code}</small></> : <span class="qcl-muted">{t.noVotes}</span>}</td>
                <td class="num">{r.leader ? `${num(r.leader.vote_pct ?? 0, lang)} %` : ''}{r.margin !== null && r.margin !== undefined ? <small> +{num(r.margin, lang)}</small> : null}</td>
                <td class="num">{r.polls?.reported != null && r.polls?.total ? `${r.polls.reported}/${r.polls.total}` : ''}</td>
                <td>{r.call ? <span class="qcl-badge qcl-badge-called">{t.calledBadge}</span> : r.leader ? <span class="qcl-badge">{t.leadingBadge}</span> : null}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      <p class="qcl-source">{t.source}</p>
    </section>
  );
}
