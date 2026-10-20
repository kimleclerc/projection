import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import '../styles/quebec-election-night-live.css';
import { awaitsFinalCount, deriveRows, governmentStatus, numFmt, publishLive, timeFmt,
  type LivePayload, type Locale, type PartyInfo } from './qcLiveBus';

/**
 * La couche directe de la soirée britanno-colombienne du 24 octobre 2026 :
 * sièges en tête et appelés, vote populaire, appels sur le gouvernement, lus
 * depuis `live.json` — le même schéma qu'au Québec, publié par le collecteur.
 *
 * Même régime de lecture que QuebecElectionNightLive : `setTimeout` récursif,
 * 90 s ± 15 %, jamais deux lectures en vol, pause d'onglet caché, garde de
 * séquence, dernier état dans localStorage, repli plafonné vers le Worker.
 *
 * Deux différences, toutes deux dues à Elections BC :
 *  · pas de troisième rail « source directe » : la page de résultats d'Elections
 *    BC n'est pas lisible depuis un navigateur, seul le collecteur la lit ;
 *  · le soir, c'est le dépouillement INITIAL. Le vote postal tardif et les
 *    bulletins d'absents attendent le dépouillement FINAL, une semaine plus tard
 *    (en 2024, il a renversé Surrey-Guildford). Une circonscription dont toutes
 *    les boîtes sont dépouillées peut donc rester sans appel : on le dit, ce
 *    n'est pas une panne.
 */

const MAJORITY = 47;
const TOTAL = 93;
const TZ = 'America/Vancouver';
const BASE_INTERVAL_MS = 90_000;
// Dépouillement initial terminé : il ne reste que des appels tardifs et, une
// semaine plus tard, le dépouillement final. Inutile de lire toutes les 90 s.
const COMPLETE_INTERVAL_MS = 10 * 60_000;
const STALE_AFTER_MS = 7 * 60_000;
const FALLBACK_AFTER_MS = 3 * 60_000;
// Le repli (Worker) est un secours, pas un régime : voir QuebecElectionNightLive.
const FALLBACK_MAX_USES = 3;
const REHEARSAL_MODES = new Set(['simulation', 'demo']);
// Bureaux fermés à 20 h, heure du Pacifique (2026-10-25T03:00Z). Aucune lecture
// avant 19 h 30 : la page est en ligne des jours d'avance. Un identifiant
// d'événement surchargé (répétition) ou `?direct=1` lève la barrière.
const DEFAULT_EVENT_ID = 'bc-2026-10-24';
const OPENS_AT = Date.parse('2026-10-24T19:30:00-07:00');
const EARLY_UNTIL = Date.parse('2026-10-24T20:30:00-07:00');

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const copy = {
  fr: { live: 'En direct', waiting: 'En attente des premiers résultats officiels', connecting: 'Connexion au dépouillement officiel…',
        unavailable: 'Résultats en direct temporairement indisponibles', lastKnown: 'Dernière mise à jour connue', updated: 'Données de',
        pacific: 'heure du Pacifique',
        seats: 'Sièges', popular: 'Vote populaire', majority: `Majorité : ${MAJORITY}`,
        stale: 'Dépouillement en pause — aucune donnée officielle depuis', minutes: 'min',
        complete: 'Dépouillement initial terminé', source: 'Source officielle : Elections BC. Les appels sont ceux de Vote-Scope; Elections BC n’en fait aucun.',
        anomalies: 'candidats ou partis inconnus du registre',
        soon: 'Les bureaux ferment à 20 h, heure du Pacifique (23 h à Montréal). Les premiers résultats d’Elections BC apparaîtront ici dans les minutes qui suivent; inutile de rafraîchir, la page se met à jour d’elle-même.',
        before: 'Les premiers résultats arrivent le samedi 24 octobre à 20 h, heure du Pacifique (23 h à Montréal), à la fermeture des bureaux. Gardez cette page dans vos favoris : elle se mettra à jour d’elle-même.',
        anomaliesBlocked: 'aucun appel automatique possible', anomaliesOverridden: 'des appels automatiques ont été publiés malgré l’anomalie',
        testPage: 'La page officielle s’affiche encore comme une page d’essai : ces chiffres ne sont pas des résultats, et aucun gagnant n’est annoncé à partir d’eux.',
        phaseInitial: 'Ce soir, c’est le dépouillement initial.',
        phaseInitialText: 'Le vote postal arrivé tard et les bulletins d’absents ne sont comptés qu’au dépouillement final, environ une semaine plus tard. En 2024, ce second compte a renversé Surrey-Guildford. Une circonscription peut donc avoir toutes ses boîtes dépouillées et rester sans gagnant annoncé ce soir : c’est voulu.',
        phaseFinal: 'Dépouillement final en cours.',
        phaseFinalText: 'Les résultats intègrent maintenant le vote postal arrivé tard et les bulletins d’absents. Ce sont ces chiffres qui deviennent officiels.',
        pendingFinal: (n: number) => n === 1 ? '1 circonscription entièrement dépouillée reste trop serrée pour un appel ce soir : elle attend le dépouillement final.'
          : `${n} circonscriptions entièrement dépouillées restent trop serrées pour un appel ce soir : elles attendent le dépouillement final.`,
        party: 'Parti', elected: 'Élus', ahead: 'En tête', total: 'Total', vsProj: 'Écart', projCol: 'Projection',
        projNote: (n: number) => `Projection : les sièges que notre projection d’avant-scrutin donnait à chaque parti dans les ${n} circonscriptions qui ont déjà des résultats. Écart : élus et en tête moins cette projection. Les premières boîtes trompent : l’écart se stabilise avec le dépouillement.`,
        better: 'mieux que prévu', worse: 'moins bien que prévu', asExpected: 'comme prévu',
        govTitle: 'L’Assemblée législative', govNone: 'Aucun appel sur le gouvernement pour l’instant : il faut d’abord que des circonscriptions soient annoncées.',
        gov: (p: string) => `${cap(p)} formera le gouvernement`, govMaj: (p: string) => `Majorité pour ${p}`,
        govMin: (p: string | null) => p ? `${cap(p)} formera un gouvernement minoritaire` : 'Gouvernement minoritaire', at: 'Appel à', manual: 'appel de la rédaction',
        auto: 'certain d’après les circonscriptions annoncées' },
  en: { live: 'Live', waiting: 'Waiting for the first official results', connecting: 'Connecting to the official count…',
        unavailable: 'Live results temporarily unavailable', lastKnown: 'Last known update', updated: 'Data as of',
        pacific: 'Pacific time',
        seats: 'Seats', popular: 'Popular vote', majority: `Majority: ${MAJORITY}`,
        stale: 'Count paused — no new official data for', minutes: 'min',
        complete: 'Initial count complete', source: 'Official source: Elections BC. Calls are Vote-Scope’s; Elections BC makes none.',
        anomalies: 'candidates or parties unknown to the registry',
        soon: 'Polls close at 8 p.m. Pacific time. The first results from Elections BC will appear here within minutes; no need to refresh, the page updates on its own.',
        before: 'The first results arrive on Saturday, October 24 at 8 p.m. Pacific time, when polls close. Bookmark this page: it will update on its own.',
        anomaliesBlocked: 'no automatic call possible', anomaliesOverridden: 'automatic calls were published over the anomaly',
        testPage: 'The official page is still labelled as a test: these numbers are not results, and no winner is called from them.',
        phaseInitial: 'Tonight is the initial count.',
        phaseInitialText: 'Mail-in ballots that arrived late and absentee ballots are only counted at the final count, about a week later. In 2024, that second count reversed Surrey-Guildford. A riding can therefore have every box counted and still have no winner called tonight: that is by design.',
        phaseFinal: 'Final count under way.',
        phaseFinalText: 'Results now include late mail-in ballots and absentee ballots. These are the numbers that become official.',
        pendingFinal: (n: number) => n === 1 ? '1 fully counted riding remains too close to call tonight: it awaits the final count.'
          : `${n} fully counted ridings remain too close to call tonight: they await the final count.`,
        party: 'Party', elected: 'Elected', ahead: 'Leading', total: 'Total', vsProj: 'Gap', projCol: 'Forecast',
        projNote: (n: number) => `Forecast: the seats our pre-election forecast gave each party in the ${n} ridings already reporting. Gap: elected and leading minus that forecast. Early boxes mislead: the gap settles as the count goes on.`,
        better: 'better than forecast', worse: 'worse than forecast', asExpected: 'as forecast',
        govTitle: 'The Legislative Assembly', govNone: 'No call on the government yet: ridings have to be called first.',
        gov: (p: string) => `${cap(p)} will form the government`, govMaj: (p: string) => `Majority for ${p}`,
        govMin: (p: string | null) => p ? `${cap(p)} will form a minority government` : 'Minority government', at: 'Called at', manual: 'newsroom call',
        auto: 'certain from the ridings called' },
  es: { live: 'En directo', waiting: 'A la espera de los primeros resultados oficiales', connecting: 'Conectando con el recuento oficial…',
        unavailable: 'Resultados en directo temporalmente no disponibles', lastKnown: 'Última actualización conocida', updated: 'Datos de las',
        pacific: 'hora del Pacífico',
        seats: 'Escaños', popular: 'Voto popular', majority: `Mayoría: ${MAJORITY}`,
        stale: 'Recuento en pausa — sin datos oficiales desde hace', minutes: 'min',
        complete: 'Recuento inicial terminado', source: 'Fuente oficial: Elections BC. Los anuncios son de Vote-Scope; Elections BC no hace ninguno.',
        anomalies: 'candidatos o partidos desconocidos para el registro',
        soon: 'Las urnas cierran a las 20:00, hora del Pacífico. Los primeros resultados de Elections BC aparecerán aquí en los minutos siguientes; no hace falta recargar, la página se actualiza sola.',
        before: 'Los primeros resultados llegan el sábado 24 de octubre a las 20:00, hora del Pacífico, al cierre de las urnas. Guarda esta página en tus favoritos: se actualizará sola.',
        anomaliesBlocked: 'sin asignación automática', anomaliesOverridden: 'se publicaron asignaciones automáticas pese a la anomalía',
        testPage: 'La página oficial aún figura como página de prueba: estas cifras no son resultados y no se anuncia ningún ganador a partir de ellas.',
        phaseInitial: 'Esta noche es el recuento inicial.',
        phaseInitialText: 'El voto por correo llegado tarde y las papeletas de ausentes solo se cuentan en el recuento final, aproximadamente una semana después. En 2024, ese segundo recuento dio la vuelta a Surrey-Guildford. Un distrito puede tener todas sus urnas escrutadas y seguir sin ganador anunciado esta noche: es a propósito.',
        phaseFinal: 'Recuento final en curso.',
        phaseFinalText: 'Los resultados ya incluyen el voto por correo tardío y las papeletas de ausentes. Son estas cifras las que pasan a ser oficiales.',
        pendingFinal: (n: number) => n === 1 ? '1 distrito totalmente escrutado sigue demasiado ajustado para anunciarse esta noche: espera el recuento final.'
          : `${n} distritos totalmente escrutados siguen demasiado ajustados para anunciarse esta noche: esperan el recuento final.`,
        party: 'Partido', elected: 'Electos', ahead: 'En cabeza', total: 'Total', vsProj: 'Diferencia', projCol: 'Proyección',
        projNote: (n: number) => `Proyección: los escaños que nuestra proyección previa daba a cada partido en los ${n} distritos que ya tienen resultados. Diferencia: electos y en cabeza menos esa proyección. Las primeras urnas engañan: la diferencia se estabiliza con el recuento.`,
        better: 'mejor de lo previsto', worse: 'peor de lo previsto', asExpected: 'como se previó',
        govTitle: 'La Asamblea Legislativa', govNone: 'Aún no hay anuncio sobre el gobierno: primero deben anunciarse distritos.',
        gov: (p: string) => `${cap(p)} formará el gobierno`, govMaj: (p: string) => `Mayoría para ${p}`,
        govMin: (p: string | null) => p ? `${cap(p)} formará un gobierno minoritario` : 'Gobierno minoritario', at: 'Anunciado a las', manual: 'anuncio de la redacción',
        auto: 'seguro según los distritos anunciados' },
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

export default function BritishColumbiaElectionNightLive({ eventId, lang, apiBase, fallbackApiBase, headless = false, parties = [], projected = {}, projectedBy = {} }:
  { eventId: string; lang: Locale; apiBase: string; fallbackApiBase?: string;
    /** Couleurs et noms des partis, joints au build (prioritaires sur ceux du direct). */
    parties?: Array<PartyInfo & { long?: string }>;
    /** Sièges projetés avant le scrutin, par parti. */
    projected?: Record<string, number>;
    /** Gagnant projeté par circonscription : l'écart se mesure sur les MÊMES circonscriptions. */
    projectedBy?: Record<string, string>;
    /** Lit et diffuse le direct sans rien afficher (pages de circonscription). */
    headless?: boolean }) {
  const t = copy[lang];
  const [data, setData] = useState<LivePayload | null>(null);
  const [fromStorage, setFromStorage] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const inFlight = useRef(false);
  const failures = useRef(0);
  const lastFetchAt = useRef(0);
  const timer = useRef<number | null>(null);
  const stopped = useRef(false);
  const sequence = useRef(-1);
  const fallbackUses = useRef(0);
  const completeRef = useRef(false);
  const [beforeOpen, setBeforeOpen] = useState(() => eventId === DEFAULT_EVENT_ID && Date.now() < OPENS_AT
    && !(typeof location !== 'undefined' && new URLSearchParams(location.search).has('direct')));

  // Dépouillement initial complet : toutes les boîtes de toutes les circonscriptions.
  const complete = useMemo(() => {
    if (!data?.results?.length || data.source?.count_phase === 'final') return false;
    const withTotals = data.results.filter((r) => r.polls?.total);
    return withTotals.length === data.results.length && withTotals.every((r) => (r.polls?.reported ?? 0) >= (r.polls?.total ?? 1));
  }, [data]);
  completeRef.current = complete;

  useEffect(() => {
    const stored = readStored(eventId);
    if (stored && isValid(stored)) { setData(stored); setFromStorage(true); sequence.current = stored.sequence ?? -1; }

    const endpoint = (base: string) => `${base.replace(/\/$/, '')}/api/v1/elections/${eventId}/live.json`;
    const url = endpoint(apiBase);
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
    const base = () => (completeRef.current ? COMPLETE_INTERVAL_MS : BASE_INTERVAL_MS);
    const jittered = () => base() * (0.85 + Math.random() * 0.3);

    const tick = async () => {
      if (stopped.current) return;
      if (document.hidden) { schedule(jittered()); return; }    // pause : rien tant que l'onglet est caché
      if (inFlight.current) { schedule(jittered()); return; }   // jamais deux lectures en vol
      inFlight.current = true;
      try {
        let payload: LivePayload;
        try {
          payload = await read(url);                             // le rail statique d'abord, toujours
          if (fallbackApiBase && ageOf(payload) > FALLBACK_AFTER_MS && fallbackUses.current < FALLBACK_MAX_USES && !completeRef.current) {
            fallbackUses.current += 1;
            try {
              const spare = await read(endpoint(fallbackApiBase));
              if (ageOf(spare) < ageOf(payload)) payload = spare;
            } catch { /* le repli ne doit jamais faire échouer une lecture réussie */ }
          }
        } catch (primaryError) {
          if (!fallbackApiBase || fallbackUses.current >= FALLBACK_MAX_USES) throw primaryError;
          fallbackUses.current += 1;
          payload = await read(endpoint(fallbackApiBase));
        }
        const seq = payload.sequence ?? 0;
        if (seq >= sequence.current) {
          // GARDE DE SÉQUENCE : un instantané plus ancien n'est jamais rendu ni conservé.
          sequence.current = seq;
          setData(payload); setFromStorage(false); setFailed(false);
          writeStored(eventId, payload);
        }
        failures.current = 0;
        lastFetchAt.current = Date.now();
      } catch {
        failures.current += 1;
        setFailed(true);
      } finally {
        inFlight.current = false;
      }
      setNow(Date.now());
      // Entre 19 h 30 et les premiers résultats, chaque échec est attendu : plafond de 2 min jusqu'à 20 h 30.
      const cap = Date.now() < EARLY_UNTIL ? 2 * 60_000 : 10 * 60_000;
      const backoff = Math.min(cap, jittered() * 2 ** Math.min(failures.current, 4));
      schedule(failures.current ? backoff : jittered());
    };

    const onVisible = () => {
      if (beforeOpen && Date.now() < OPENS_AT) return;          // la barrière tient aussi au retour sur l'onglet
      if (!document.hidden && Date.now() - lastFetchAt.current > 60_000) { schedule(500 + Math.random() * 1500); }
    };
    document.addEventListener('visibilitychange', onVisible);
    const wait = beforeOpen ? Math.max(0, OPENS_AT - Date.now()) : 0;
    if (wait > 0) {
      timer.current = window.setTimeout(() => { setBeforeOpen(false); schedule(500 + Math.random() * 4000); }, wait);
    } else {
      schedule(500 + Math.random() * 4000);
    }
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => { stopped.current = true; if (timer.current) window.clearTimeout(timer.current); window.clearInterval(clock); document.removeEventListener('visibilitychange', onVisible); };
  }, [eventId, apiBase]);

  // Diffusion aux autres blocs de la page (carte, annonces, liste) : aucune lecture de plus.
  useEffect(() => { publishLive({ data, beforeOpen, failed }); }, [data, beforeOpen, failed]);

  const meta = useMemo(() => {
    const byParty = new Map<string, { color: string; label: string }>();
    for (const p of parties) byParty.set(p.code, { color: p.color, label: p.label });
    for (const p of data?.projections ?? []) for (const c of p.candidates) {
      if (!byParty.has(c.party_code)) byParty.set(c.party_code, { color: c.color ?? '#78909c', label: c.party_label?.[lang] ?? c.party_code.toUpperCase() });
    }
    return byParty;
  }, [data, lang, parties]);
  const metaOf = (code: string) => meta.get(code) ?? { color: '#78909c', label: code.toUpperCase() };

  const rows = useMemo(() => deriveRows(data), [data]);
  const tally = useMemo(() => {
    const acc = new Map<string, { called: number; leading: number }>();
    for (const row of rows) {
      if (!row.party) continue;
      const entry = acc.get(row.party) ?? { called: 0, leading: 0 };
      if (row.call) entry.called += 1; else entry.leading += 1;
      acc.set(row.party, entry);
    }
    return [...acc.entries()].map(([code, v]) => ({ code, ...v, total: v.called + v.leading, ...metaOf(code) }))
      .sort((a, b) => b.total - a.total || b.called - a.called);
  }, [rows, meta]);

  const popular = useMemo(() => {
    const acc = new Map<string, number>(); let total = 0;
    for (const r of data?.results ?? []) for (const c of r.candidates ?? []) {
      const v = c.votes ?? 0; if (!v) continue; total += v; acc.set(c.party_code, (acc.get(c.party_code) ?? 0) + v);
    }
    return total ? [...acc.entries()].map(([code, v]) => ({ code, pct: (100 * v) / total, ...metaOf(code) }))
      .sort((a, b) => b.pct - a.pct).slice(0, 6) : [];
  }, [data, meta]);

  const gov = useMemo(() => governmentStatus(data, MAJORITY, TOTAL), [data]);
  const projectedHere = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const row of rows) if (row.party) { const w = projectedBy[row.id]; if (w) acc[w] = (acc[w] ?? 0) + 1; }
    return acc;
  }, [rows, projectedBy]);
  const useHere = Object.keys(projectedBy).length > 0;
  const pendingFinal = rows.filter((r) => awaitsFinalCount(data, r)).length;
  const phase = data?.source?.count_phase ?? null;
  const sourceStamp = data?.source?.source_updated_at ?? null;
  const ageMin = sourceStamp ? Math.floor((now - new Date(sourceStamp).getTime()) / 60_000) : null;
  const stale = !complete && phase !== 'final' && !!data && !fromStorage && data.source?.healthy !== false && ageMin !== null && ageMin * 60_000 > STALE_AFTER_MS;
  const decided = rows.filter((r) => r.party).length;
  const anomalyOverridden = (data?.calls ?? []).some((c) => c.source_anomalies_overridden);
  const anomalyClause = anomalyOverridden ? t.anomaliesOverridden
    : REHEARSAL_MODES.has(data?.event?.mode ?? '') ? null : t.anomaliesBlocked;
  const stamp = (iso: string | null | undefined) => `${timeFmt(iso, lang, TZ)} (${t.pacific})`;

  if (headless) return null;

  if (!data) {
    return <section class={`qcl${failed ? ' qcl-is-failed' : ''}`} aria-live="polite"><div class="qcl-head"><span class="qcl-label"><i></i>{t.live}</span></div>
      <p class="qcl-state">{beforeOpen ? t.before : failed ? (Date.now() < EARLY_UNTIL - 15 * 60_000 ? t.soon : t.unavailable) : t.connecting}</p></section>;
  }

  return (
    <section class={`qcl${stale || fromStorage ? ' qcl-is-stale' : ''}`} aria-live="polite" data-sequence={data.sequence ?? ''}>
      <div class="qcl-head">
        <span class="qcl-label"><i></i>{phase === 'final' ? t.phaseFinal.replace(/\.$/, '') : complete ? t.complete : t.live}</span>
        <span>{fromStorage ? `${t.lastKnown} · ` : ''}{sourceStamp ? `${t.updated} ${stamp(sourceStamp)}` : ''}{typeof data.sequence === 'number' ? ` · #${data.sequence}` : ''}</span>
      </div>
      {data.source?.is_test_page && <p class="qcl-warn">{t.testPage}</p>}
      {failed && <p class="qcl-warn">{t.unavailable}</p>}
      {stale && ageMin !== null && <p class="qcl-warn">{t.stale} {ageMin} {t.minutes}.</p>}
      {(data.source?.anomaly_count ?? 0) > 0 && (
        <p class="qcl-warn">{data.source?.anomaly_count} {t.anomalies}{anomalyClause ? ` — ${anomalyClause}` : ''}</p>
      )}
      {phase && (
        <p class={`qcl-phase is-${phase}`}><strong>{phase === 'final' ? t.phaseFinal : t.phaseInitial}</strong> {phase === 'final' ? t.phaseFinalText : t.phaseInitialText}</p>
      )}

      {decided === 0 ? <p class="qcl-state">{t.waiting}</p> : (
        <div class="qcl-seats">
          <div class="qcl-bar" role="img" aria-label={`${t.seats} — ${tally.map((p) => `${p.label} ${p.total}`).join(', ')}`}>
            {tally.map((p) => <i key={p.code} style={`width:${(100 * p.total) / TOTAL}%;background:${p.color}`}>{p.called > 0 && <b style={`width:${(100 * p.called) / p.total}%`}></b>}</i>)}
            <em style={`--m:${(100 * MAJORITY) / TOTAL}%`} aria-hidden="true"></em>
          </div>
          <table class="qcl-table">
            <thead><tr><th>{t.party}</th><th class="num">{t.elected}</th><th class="num">{t.ahead}</th><th class="num">{t.total}</th><th class="num">{t.projCol}</th><th class="num">{t.vsProj}</th></tr></thead>
            <tbody>
              {[...tally, ...Object.entries(projected).filter(([code, n]) => n > 0 && !tally.some((x) => x.code === code))
                  .map(([code]) => ({ code, called: 0, leading: 0, total: 0, ...metaOf(code) }))
              ].map((p) => {
                const proj = useHere ? (projectedHere[p.code] ?? 0) : projected[p.code];
                const d = typeof proj === 'number' ? p.total - proj : null;
                return <tr key={p.code}>
                  <th scope="row"><i style={`background:${p.color}`}></i>{p.label}</th>
                  <td class="num">{p.called}</td><td class="num">{p.leading}</td><td class="num qcl-total">{p.total}</td><td class="num qcl-proj">{typeof proj === 'number' ? proj : '—'}</td>
                  <td class={`num qcl-gauge${d === null ? '' : d > 0 ? ' is-up' : d < 0 ? ' is-down' : ' is-even'}`}
                    title={d === null ? '' : d > 0 ? t.better : d < 0 ? t.worse : t.asExpected}>
                    {d === null ? '—' : d === 0 ? '=' : `${d > 0 ? '+' : '−'}${Math.abs(d)}`}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
          <p class="qcl-majority">{t.majority} · {decided}/{TOTAL}</p>
          {pendingFinal > 0 && <p class="qcl-pending">{t.pendingFinal(pendingFinal)}</p>}
          <p class="qcl-note">{t.projNote(decided)}</p>
        </div>
      )}

      <div class="qcl-gov">
        <h3>{t.govTitle}</h3>
        {gov.length === 0 ? <p class="qcl-gov-none">{t.govNone}</p> : (
          <ol>{gov.map((g) => {
            const label = g.party ? parties.find((x) => x.code === g.party)?.long ?? metaOf(g.party).label : null;
            const text = g.kind === 'government' ? t.gov(label ?? '') : g.kind === 'majority' ? t.govMaj(label ?? '') : t.govMin(label);
            const color = g.party ? metaOf(g.party).color : '#78909c';
            return <li key={g.kind} style={`--c:${color}`}><strong>{text}</strong><span>{t.at} {stamp(g.at)} · {g.manual ? t.manual : t.auto}</span></li>;
          })}</ol>
        )}
      </div>

      {popular.length > 0 && (
        <div class="qcl-popular">
          <h3>{t.popular}</h3>
          <ul>{popular.map((p) => <li key={p.code}><span><i style={`background:${p.color}`}></i>{p.label}</span><strong>{numFmt(p.pct, lang)} %</strong><b style={`width:${Math.min(100, p.pct * 2)}%;background:${p.color}`}></b></li>)}</ul>
        </div>
      )}
      <p class="qcl-source">{t.source}</p>
    </section>
  );
}
