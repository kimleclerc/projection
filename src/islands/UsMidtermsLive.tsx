import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import '../styles/quebec-election-night-live.css';
import '../styles/us-midterms-live.css';
import { numFmt, timeFmt, type Locale, type PartyInfo } from './qcLiveBus';
import { deriveUsRows, sanitize, stateNotices, tallyRows,
  type Chamber, type ExitPollEntry, type RaceStatus, type UsLivePayload, type UsRow } from './usLive';

/**
 * La couche directe des mi-mandat du 3 novembre 2026, posée sur les pages
 * Chambre, Sénat et gouverneurs : sièges appelés et en tête, course par
 * course, et le prédicteur d'avant-dépouillement tant qu'aucun bulletin n'est
 * compté. Un seul live.json pour les 506 courses ; chaque page filtre sa
 * chambre (voir usLive.ts).
 *
 * Même régime de lecture que BritishColumbiaElectionNightLive : `setTimeout`
 * récursif, 90 s ± 15 %, jamais deux lectures en vol, pause d'onglet caché,
 * garde de séquence, dernier état dans localStorage, repli plafonné vers le
 * Worker. Même contrat aussi : `live.json` v2, rail Pages d'abord.
 *
 * Ce qui est propre aux États-Unis :
 *  · cinquante sources, pas une. Un État sans flux (`state_unavailable`) ou en
 *    saisie manuelle (`transcribed`) est DIT comme tel ; ses courses ne
 *    montrent jamais « 0 voix » ;
 *  · `source.anomaly_count` n'est pas affiché : chaque course en saisie
 *    manuelle y compte, et « 80 anomalies » ferait croire à une panne ;
 *  · le prédicteur d'avant-dépouillement (us_exit_poll.py), étiqueté comme une
 *    estimation fondée sur les sondages de sortie, qui s'efface course par
 *    course au premier bulletin compté. Il ne nourrit aucun appel ;
 *  · la cote du marché n'est jamais lue ni rendue : `desk` est retiré par le
 *    Worker et, par prudence, une seconde fois ici (`sanitize`).
 */

const TZ = 'America/New_York';
const BASE_INTERVAL_MS = 90_000;
// Profil us-2026-11-03 : publication.stale_after_seconds = 300.
const STALE_AFTER_MS = 5 * 60_000;
const FALLBACK_AFTER_MS = 3 * 60_000;
const FALLBACK_MAX_USES = 3;
// Premières fermetures : 19 h HNE (00 h UTC le 4). Aucune lecture avant 18 h 30 :
// les pages sont en ligne depuis des mois. Un identifiant d'événement surchargé
// (répétition) ou `?direct=1` lève la barrière.
const DEFAULT_EVENT_ID = 'us-2026-11-03';
const OPENS_AT = Date.parse('2026-11-03T18:30:00-05:00');
const EARLY_UNTIL = Date.parse('2026-11-03T19:30:00-05:00');
const PAGE = 30;

type Filter = 'all' | 'called' | 'counting' | 'none';

const copy = {
  fr: { live: 'En direct', connecting: 'Connexion au décompte officiel…', waiting: 'En attente des premiers bulletins comptés',
        unavailable: 'Résultats en direct temporairement indisponibles', lastKnown: 'Dernière mise à jour connue', updated: 'Données de',
        eastern: 'HNE', stale: 'Décompte en pause — aucune donnée officielle depuis', minutes: 'min',
        before: 'Les premiers bureaux ferment le mardi 3 novembre à 19 h, heure de l’Est (19 h à Montréal aussi). Cette page passera au décompte d’elle-même, sans rafraîchir.',
        soon: 'Les premiers bureaux ferment à 19 h, heure de l’Est. Les premiers chiffres des États apparaîtront ici dans les minutes qui suivent; la page se met à jour d’elle-même.',
        testPage: 'Une source se présente encore comme une page d’essai : ces chiffres ne sont pas des résultats.',
        seats: 'Sièges', party: 'Parti', holdover: 'Hors scrutin', elected: 'Élus', ahead: 'En tête', total: 'Total', projCol: 'Projection',
        majority: (n: number) => `Majorité : ${n}`, decided: (n: number, of: number) => `${n} course${n > 1 ? 's' : ''} sur ${of} avec un appel ou un meneur`,
        projNoteRaces: 'Projection : les courses que notre projection d’avant-scrutin donnait à chaque parti, parmi celles qui ont déjà un appel ou un meneur. Les premiers bulletins trompent : l’écart se stabilise avec le décompte.',
        projNote: 'Projection : sièges hors scrutin plus les courses que notre projection d’avant-scrutin donnait à chaque parti, parmi celles qui ont déjà un appel ou un meneur. Les premiers bulletins trompent : l’écart se stabilise avec le décompte.',
        govNote: 'Gouverneurs : 50 postes, dont 14 hors scrutin cette année. Il n’y a pas de majorité à atteindre.',
        noticeTitle: 'Ce que chaque État publie ce soir',
        noticeUnavailable: (s: string) => `Source de l’État indisponible : ${s}. Aucun chiffre n’est affiché pour ces courses — ce n’est pas zéro voix, c’est une source que nous ne lisons pas en ce moment.`,
        noticeTranscribed: (s: string) => `Saisie manuelle : ${s}. Ces États n’offrent pas de flux lisible par machine; leurs chiffres sont relevés à la main sur le site officiel, avec un temps de retard, et aucun appel n’y est automatique.`,
        noticeRegressed: (s: string) => `Source en recul : ${s}. L’État a publié des chiffres plus anciens que les précédents; nous gardons les derniers chiffres publiés jusqu’à ce que la source se rétablisse.`,
        status: { called: 'Appelé', counting: 'Décompte', transcribed: 'Saisie manuelle', transcribed_empty: 'Saisie manuelle · en attente',
                  regressed: 'Derniers chiffres conservés', state_unavailable: 'Source de l’État indisponible', awaiting: 'Aucun bulletin compté' } as Record<RaceStatus, string>,
        racesTitle: 'Course par course', search: 'Chercher une course ou un État',
        filters: { all: 'Toutes', called: 'Appelées', counting: 'Au décompte', none: 'Sans décompte' } as Record<Filter, string>,
        colRace: 'Course', colStatus: 'Décompte', colLeader: 'En tête', colMargin: 'Écart', colReported: 'Bureaux',
        more: 'Afficher plus', votes: 'voix', none: 'Aucune course ne correspond.', estimate: 'Estimation',
        predTitle: 'Prédicteur d’avant-dépouillement',
        predBadge: 'Estimation · sondages de sortie',
        predLede: 'Avant le premier bulletin compté, notre projection d’avant-scrutin mise à jour par le sondage de sortie de l’État. Ce n’est ni un résultat ni un appel : les sondages de sortie se sont souvent trompés (2004, 2016), et nos marges d’erreur sont volontairement larges. Chaque course quitte ce bloc dès ses premiers bulletins comptés.',
        predFav: (p: string, pct: string) => `${p} favori à ${pct} %`, predPrior: (pct: string) => `projection : ${pct} %`,
        predRange: (lo: string, hi: string) => `écart probable ${lo} à ${hi}`,
        predGone: (n: number) => n === 1 ? '1 course a commencé son décompte : son estimation a cédé la place aux bulletins.' : `${n} courses ont commencé leur décompte : leur estimation a cédé la place aux bulletins.`,
        predEmpty: 'Aucune estimation pour l’instant : elles apparaissent à la fermeture des bureaux de chaque État.',
        kinds: { nep_initial: 'Sondage de sortie Edison (NEP)', votecast: 'AP VoteCast', nep_weighted: 'Edison, repondéré sur le décompte' } as Record<string, string>,
        source: 'Sources officielles : les secrétariats d’État, État par État. Les appels sont ceux de Vote-Scope, sous approbation humaine. Les sondages de sortie : Edison Research (NEP) et AP VoteCast.',
        at: 'appelé à' },
  en: { live: 'Live', connecting: 'Connecting to the official count…', waiting: 'Waiting for the first ballots counted',
        unavailable: 'Live results temporarily unavailable', lastKnown: 'Last known update', updated: 'Data as of',
        eastern: 'ET', stale: 'Count paused — no new official data for', minutes: 'min',
        before: 'The first polls close on Tuesday, November 3 at 7 p.m. Eastern. This page will switch to the live count on its own, no refresh needed.',
        soon: 'The first polls close at 7 p.m. Eastern. The first state figures will appear here within minutes; the page updates on its own.',
        testPage: 'A source still labels itself as a test page: these numbers are not results.',
        seats: 'Seats', party: 'Party', holdover: 'Not up', elected: 'Called', ahead: 'Leading', total: 'Total', projCol: 'Forecast',
        majority: (n: number) => `Majority: ${n}`, decided: (n: number, of: number) => `${n} of ${of} race${of > 1 ? 's' : ''} with a call or a leader`,
        projNoteRaces: 'Forecast: the races our pre-election forecast gave each party, among those that already have a call or a leader. Early ballots mislead: the gap settles as the count goes on.',
        projNote: 'Forecast: seats not up this year plus the races our pre-election forecast gave each party, among those that already have a call or a leader. Early ballots mislead: the gap settles as the count goes on.',
        govNote: 'Governors: 50 offices, 14 not up this year. There is no majority to reach.',
        noticeTitle: 'What each state is publishing tonight',
        noticeUnavailable: (s: string) => `State source unavailable: ${s}. No figures are shown for these races — that is not zero votes, it is a source we cannot read right now.`,
        noticeTranscribed: (s: string) => `Hand-entered: ${s}. These states offer no machine-readable feed; their figures are copied by hand from the official site, with a delay, and no call there is automatic.`,
        noticeRegressed: (s: string) => `Source went backwards: ${s}. The state published figures older than before; we keep the last published figures until the source recovers.`,
        status: { called: 'Called', counting: 'Counting', transcribed: 'Hand-entered', transcribed_empty: 'Hand-entered · pending',
                  regressed: 'Last figures kept', state_unavailable: 'State source unavailable', awaiting: 'No ballots counted' } as Record<RaceStatus, string>,
        racesTitle: 'Race by race', search: 'Search a race or a state',
        filters: { all: 'All', called: 'Called', counting: 'Counting', none: 'No count yet' } as Record<Filter, string>,
        colRace: 'Race', colStatus: 'Count', colLeader: 'Leading', colMargin: 'Margin', colReported: 'Precincts',
        more: 'Show more', votes: 'votes', none: 'No race matches.', estimate: 'Estimate',
        predTitle: 'Pre-count predictor',
        predBadge: 'Estimate · exit polls',
        predLede: 'Before the first ballot is counted, our pre-election forecast updated with the state’s exit poll. This is neither a result nor a call: exit polls have often been wrong (2004, 2016), and our error bands are deliberately wide. Each race leaves this block as soon as its first ballots are counted.',
        predFav: (p: string, pct: string) => `${p} favored at ${pct}%`, predPrior: (pct: string) => `forecast: ${pct}%`,
        predRange: (lo: string, hi: string) => `likely margin ${lo} to ${hi}`,
        predGone: (n: number) => n === 1 ? '1 race has started counting: its estimate gave way to the ballots.' : `${n} races have started counting: their estimates gave way to the ballots.`,
        predEmpty: 'No estimate yet: they appear as each state’s polls close.',
        kinds: { nep_initial: 'Edison exit poll (NEP)', votecast: 'AP VoteCast', nep_weighted: 'Edison, reweighted on the count' } as Record<string, string>,
        source: 'Official sources: each state’s election office. Calls are Vote-Scope’s, approved by a person. Exit polls: Edison Research (NEP) and AP VoteCast.',
        at: 'called at' },
  es: { live: 'En directo', connecting: 'Conectando con el recuento oficial…', waiting: 'A la espera de las primeras papeletas contadas',
        unavailable: 'Resultados en directo temporalmente no disponibles', lastKnown: 'Última actualización conocida', updated: 'Datos de las',
        eastern: 'hora del Este', stale: 'Recuento en pausa — sin datos oficiales desde hace', minutes: 'min',
        before: 'Las primeras urnas cierran el martes 3 de noviembre a las 19:00, hora del Este. Esta página pasará al recuento sola, sin recargar.',
        soon: 'Las primeras urnas cierran a las 19:00, hora del Este. Las primeras cifras de los estados aparecerán aquí en los minutos siguientes; la página se actualiza sola.',
        testPage: 'Una fuente aún figura como página de prueba: estas cifras no son resultados.',
        seats: 'Escaños', party: 'Partido', holdover: 'Sin elección', elected: 'Anunciados', ahead: 'En cabeza', total: 'Total', projCol: 'Proyección',
        majority: (n: number) => `Mayoría: ${n}`, decided: (n: number, of: number) => `${n} de ${of} contiendas con anuncio o líder`,
        projNoteRaces: 'Proyección: las contiendas que nuestra proyección previa daba a cada partido, entre las que ya tienen anuncio o líder. Las primeras papeletas engañan: la diferencia se estabiliza con el recuento.',
        projNote: 'Proyección: escaños sin elección más las contiendas que nuestra proyección previa daba a cada partido, entre las que ya tienen anuncio o líder. Las primeras papeletas engañan: la diferencia se estabiliza con el recuento.',
        govNote: 'Gobernadores: 50 cargos, 14 sin elección este año. No hay mayoría que alcanzar.',
        noticeTitle: 'Lo que publica cada estado esta noche',
        noticeUnavailable: (s: string) => `Fuente del estado no disponible: ${s}. No se muestra ninguna cifra para estas contiendas — no son cero votos, es una fuente que no podemos leer ahora.`,
        noticeTranscribed: (s: string) => `Captura manual: ${s}. Estos estados no ofrecen un flujo legible por máquina; sus cifras se copian a mano del sitio oficial, con retraso, y ningún anuncio allí es automático.`,
        noticeRegressed: (s: string) => `Fuente en retroceso: ${s}. El estado publicó cifras más antiguas que las anteriores; conservamos las últimas cifras publicadas hasta que la fuente se recupere.`,
        status: { called: 'Anunciada', counting: 'Recuento', transcribed: 'Captura manual', transcribed_empty: 'Captura manual · pendiente',
                  regressed: 'Últimas cifras conservadas', state_unavailable: 'Fuente del estado no disponible', awaiting: 'Sin papeletas contadas' } as Record<RaceStatus, string>,
        racesTitle: 'Contienda por contienda', search: 'Buscar una contienda o un estado',
        filters: { all: 'Todas', called: 'Anunciadas', counting: 'En recuento', none: 'Sin recuento' } as Record<Filter, string>,
        colRace: 'Contienda', colStatus: 'Recuento', colLeader: 'En cabeza', colMargin: 'Diferencia', colReported: 'Precintos',
        more: 'Mostrar más', votes: 'votos', none: 'Ninguna contienda coincide.', estimate: 'Estimación',
        predTitle: 'Predictor previo al recuento',
        predBadge: 'Estimación · encuestas a pie de urna',
        predLede: 'Antes de la primera papeleta contada, nuestra proyección previa actualizada con la encuesta a pie de urna del estado. No es un resultado ni un anuncio: las encuestas a pie de urna se han equivocado a menudo (2004, 2016), y nuestros márgenes de error son deliberadamente amplios. Cada contienda sale de este bloque en cuanto se cuentan sus primeras papeletas.',
        predFav: (p: string, pct: string) => `${p} favorito al ${pct} %`, predPrior: (pct: string) => `proyección: ${pct} %`,
        predRange: (lo: string, hi: string) => `diferencia probable de ${lo} a ${hi}`,
        predGone: (n: number) => n === 1 ? '1 contienda empezó su recuento: su estimación dejó paso a las papeletas.' : `${n} contiendas empezaron su recuento: sus estimaciones dejaron paso a las papeletas.`,
        predEmpty: 'Aún no hay estimaciones: aparecen al cierre de las urnas de cada estado.',
        kinds: { nep_initial: 'Encuesta a pie de urna Edison (NEP)', votecast: 'AP VoteCast', nep_weighted: 'Edison, reponderada con el recuento' } as Record<string, string>,
        source: 'Fuentes oficiales: la oficina electoral de cada estado. Los anuncios son de Vote-Scope, aprobados por una persona. Encuestas a pie de urna: Edison Research (NEP) y AP VoteCast.',
        at: 'anunciada a las' },
};

export type UsRaceInfo = { name: string; href?: string; projected?: string | null; rank: number };

function storageKey(eventId: string) { return `vs-live-${eventId}`; }
function readStored(eventId: string): UsLivePayload | null {
  try { const raw = localStorage.getItem(storageKey(eventId)); return raw ? sanitize(JSON.parse(raw) as UsLivePayload) : null; } catch { return null; }
}
function writeStored(eventId: string, payload: UsLivePayload) {
  try { localStorage.setItem(storageKey(eventId), JSON.stringify(payload)); } catch { /* quota, navigation privée : sans conséquence */ }
}
function isValid(value: unknown): value is UsLivePayload {
  const p = value as Partial<UsLivePayload> | null;
  return !!p && typeof p === 'object' && Array.isArray(p.results) && p.results.every((r) => typeof r?.riding_id === 'string');
}

export default function UsMidtermsLive({ chamber, eventId, lang, apiBase, fallbackApiBase, parties, races, holdovers = {}, seats, majority, headless = false }:
  { chamber: Chamber; eventId: string; lang: Locale; apiBase: string; fallbackApiBase?: string;
    /** Couleurs et noms des partis, joints au build. */
    parties: PartyInfo[];
    /** Par identifiant de course (`S-13000`) : nom localisé, lien, gagnant projeté, rang (courses serrées d'abord). */
    races: Record<string, UsRaceInfo>;
    /** Sièges non renouvelés cette année, par parti (Sénat, gouverneurs). */
    holdovers?: Record<string, number>;
    seats: number; majority: number | null;
    headless?: boolean }) {
  const t = copy[lang];
  const [data, setData] = useState<UsLivePayload | null>(null);
  const [fromStorage, setFromStorage] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const inFlight = useRef(false);
  const failures = useRef(0);
  const lastFetchAt = useRef(0);
  const timer = useRef<number | null>(null);
  const stopped = useRef(false);
  const sequence = useRef(-1);
  const fallbackUses = useRef(0);
  const [beforeOpen, setBeforeOpen] = useState(() => eventId === DEFAULT_EVENT_ID && Date.now() < OPENS_AT
    && !(typeof location !== 'undefined' && new URLSearchParams(location.search).has('direct')));

  useEffect(() => {
    const stored = readStored(eventId);
    if (stored && isValid(stored)) { setData(stored); setFromStorage(true); sequence.current = stored.sequence ?? -1; }

    const endpoint = (base: string) => `${base.replace(/\/$/, '')}/api/v1/elections/${eventId}/live.json`;
    const url = endpoint(apiBase);
    const read = async (from: string): Promise<UsLivePayload> => {
      const response = await fetch(from, { cache: 'default' });
      if (!response.ok) throw new Error(`http ${response.status}`);
      const body = await response.json();
      if (!isValid(body)) throw new Error('payload invalide');
      return sanitize(body as UsLivePayload);
    };
    const ageOf = (p: UsLivePayload) => {
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
        let payload: UsLivePayload;
        try {
          payload = await read(url);                             // le rail statique d'abord, toujours
          if (fallbackApiBase && ageOf(payload) > FALLBACK_AFTER_MS && fallbackUses.current < FALLBACK_MAX_USES) {
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
      // setTimeout plafonne à ~24,8 jours ; la page est en ligne depuis des mois.
      const arm = () => {
        const left = OPENS_AT - Date.now();
        if (left > 0) { timer.current = window.setTimeout(arm, Math.min(left, 24 * 3600_000)); return; }
        setBeforeOpen(false); schedule(500 + Math.random() * 4000);
      };
      arm();
    } else {
      schedule(500 + Math.random() * 4000);
    }
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => { stopped.current = true; if (timer.current) window.clearTimeout(timer.current); window.clearInterval(clock); document.removeEventListener('visibilitychange', onVisible); };
  }, [eventId, apiBase]);

  const metaOf = (code: string) => {
    const p = parties.find((x) => x.code === code);
    return p ? { color: p.color, label: p.label } : { color: '#78909c', label: code.replace(/^us_/, '').toUpperCase() };
  };
  const nameOf = (id: string, fallback: string) => races[id]?.name ?? fallback;

  const rows = useMemo(() => deriveUsRows(data, chamber)
    .sort((a, b) => (races[a.id]?.rank ?? 1e9) - (races[b.id]?.rank ?? 1e9)), [data, chamber, races]);
  const tally = useMemo(() => tallyRows(rows, holdovers), [rows, holdovers]);
  const notices = useMemo(() => stateNotices(rows), [rows]);
  const decidedRows = rows.filter((r) => r.party);
  const projectedHere = useMemo(() => {
    const acc: Record<string, number> = { ...holdovers };
    for (const row of decidedRows) { const w = races[row.id]?.projected; if (w) acc[w] = (acc[w] ?? 0) + 1; }
    return acc;
  }, [decidedRows, races, holdovers]);
  const predicted = rows.filter((r) => r.exitPoll);
  const predictorGone = useMemo(() => {
    if (!data?.exit_poll?.races) return 0;
    const prefix = chamber + ':';
    const visible = new Set(predicted.map((r) => r.id.slice(2)));
    return Object.keys(data.exit_poll.races).filter((k) => k.startsWith(prefix) && !visible.has(k.slice(prefix.length))
      && rows.some((r) => r.id.slice(2) === k.slice(prefix.length))).length;
  }, [data, predicted, rows, chamber]);

  const sourceStamp = data?.source?.source_updated_at ?? null;
  const ageMin = sourceStamp ? Math.floor((now - new Date(sourceStamp).getTime()) / 60_000) : null;
  const stale = !!data && !fromStorage && data.source?.healthy !== false && ageMin !== null && ageMin * 60_000 > STALE_AFTER_MS;
  const stamp = (iso: string | null | undefined) => `${timeFmt(iso, lang, TZ)} ${t.eastern}`;
  // Une estimation n'affiche jamais 100 % : au-delà de 99 %, « > 99 ».
  const pct = (p: number) => (p >= 0.995 ? '> 99' : p <= 0.005 ? '< 1' : numFmt(100 * p, lang, 0));
  const margin = (m: number) => (Math.abs(m) < 0.05 ? '0' : `${m > 0 ? 'D' : 'R'}+${numFmt(Math.abs(m), lang, 1)}`);

  if (headless) return null;

  if (!data) {
    return <section class={`qcl usl${failed ? ' qcl-is-failed' : ''}`} aria-live="polite"><div class="qcl-head"><span class="qcl-label"><i></i>{t.live}</span></div>
      <p class="qcl-state">{beforeOpen ? t.before : failed ? (Date.now() < EARLY_UNTIL - 15 * 60_000 ? t.soon : t.unavailable) : t.connecting}</p></section>;
  }

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => {
    if (filter === 'called' && r.status !== 'called') return false;
    if (filter === 'counting' && !(r.party && r.status !== 'called')) return false;
    if (filter === 'none' && r.party) return false;
    if (!q) return true;
    return nameOf(r.id, r.name).toLowerCase().includes(q) || (r.state ?? '').toLowerCase() === q;
  });
  const barTotal = Math.max(seats, 1);

  return (
    <section class={`qcl usl${stale || fromStorage ? ' qcl-is-stale' : ''}`} aria-live="polite" data-sequence={data.sequence ?? ''} data-chamber={chamber}>
      <div class="qcl-head">
        <span class="qcl-label"><i></i>{t.live}</span>
        <span>{fromStorage ? `${t.lastKnown} · ` : ''}{sourceStamp ? `${t.updated} ${stamp(sourceStamp)}` : ''}{typeof data.sequence === 'number' ? ` · #${data.sequence}` : ''}</span>
      </div>
      {data.source?.is_test_page && <p class="qcl-warn">{t.testPage}</p>}
      {failed && <p class="qcl-warn">{t.unavailable}</p>}
      {stale && ageMin !== null && <p class="qcl-warn">{t.stale} {ageMin} {t.minutes}.</p>}

      {(notices.unavailable.length > 0 || notices.transcribed.length > 0 || notices.regressed.length > 0) && (
        <div class="usl-notices" role="note" aria-label={t.noticeTitle}>
          {notices.unavailable.length > 0 && <p class="usl-notice is-unavailable">{t.noticeUnavailable(notices.unavailable.join(', '))}</p>}
          {notices.transcribed.length > 0 && <p class="usl-notice is-transcribed">{t.noticeTranscribed(notices.transcribed.join(', '))}</p>}
          {notices.regressed.length > 0 && <p class="usl-notice is-regressed">{t.noticeRegressed(notices.regressed.join(', '))}</p>}
        </div>
      )}

      {decidedRows.length === 0 ? <p class="qcl-state">{t.waiting}</p> : (
        <div class="qcl-seats">
          <div class="qcl-bar" role="img" aria-label={`${t.seats} — ${tally.map((p) => `${metaOf(p.code).label} ${p.total}`).join(', ')}`}>
            {tally.map((p) => <i key={p.code} style={`width:${(100 * p.total) / barTotal}%;background:${metaOf(p.code).color}`}>
              {p.called + p.holdover > 0 && <b style={`width:${(100 * (p.called + p.holdover)) / Math.max(p.total, 1)}%`}></b>}</i>)}
            {majority && <em style={`--m:${(100 * majority) / barTotal}%`} aria-hidden="true"></em>}
          </div>
          <table class="qcl-table">
            <thead><tr><th>{t.party}</th>{Object.keys(holdovers).length > 0 && <th class="num">{t.holdover}</th>}<th class="num">{t.elected}</th><th class="num">{t.ahead}</th><th class="num">{t.total}</th><th class="num">{t.projCol}</th></tr></thead>
            <tbody>
              {tally.map((p) => <tr key={p.code}>
                <th scope="row"><i style={`background:${metaOf(p.code).color}`}></i>{metaOf(p.code).label}</th>
                {Object.keys(holdovers).length > 0 && <td class="num">{p.holdover}</td>}
                <td class="num">{p.called}</td><td class="num">{p.leading}</td><td class="num qcl-total">{p.total}</td>
                <td class="num qcl-proj">{projectedHere[p.code] ?? 0}</td>
              </tr>)}
            </tbody>
          </table>
          <p class="qcl-majority">{majority ? `${t.majority(majority)} · ` : ''}{t.decided(decidedRows.length, rows.length)}</p>
          <p class="qcl-note">{Object.keys(holdovers).length > 0 ? t.projNote : t.projNoteRaces}{chamber === 'governor' ? ` ${t.govNote}` : ''}</p>
        </div>
      )}

      {data.exit_poll && (predicted.length > 0 || predictorGone > 0) && (
        <div class="usl-pred" aria-label={t.predTitle}>
          <div class="usl-pred-head">
            <h3>{t.predTitle}</h3>
            <span class="usl-pred-badge">{t.predBadge}</span>
          </div>
          <p class="usl-pred-lede">{t.predLede}</p>
          {predicted.length === 0 ? <p class="usl-pred-empty">{t.predEmpty}</p> : (
            <ul class="usl-pred-list">{predicted.map((r) => <PredictorItem key={r.id} row={r} name={nameOf(r.id, r.name)} t={t}
              metaOf={metaOf} pct={pct} margin={margin} stamp={stamp} />)}</ul>
          )}
          {predictorGone > 0 && <p class="usl-pred-gone">{t.predGone(predictorGone)}</p>}
        </div>
      )}

      <div class="usl-races">
        <div class="qll-head">
          <h3>{t.racesTitle}</h3>
          <input type="search" value={query} placeholder={t.search} aria-label={t.search}
            onInput={(e) => { setQuery((e.target as HTMLInputElement).value); setLimit(PAGE); }} />
          <div class="qll-filters" role="group">
            {(Object.keys(t.filters) as Filter[]).map((f) => <button type="button" key={f} class={filter === f ? 'is-on' : ''}
              aria-pressed={filter === f} onClick={() => { setFilter(f); setLimit(PAGE); }}>{t.filters[f]}</button>)}
          </div>
        </div>
        {shown.length === 0 ? <p class="qlf-empty">{t.none}</p> : (
          <ul class="usl-list">
            {shown.slice(0, limit).map((r) => <RaceItem key={r.id} row={r} info={races[r.id]} t={t} metaOf={metaOf} pct={pct} lang={lang} stamp={stamp} />)}
          </ul>
        )}
        {shown.length > limit && <button type="button" class="qll-more" onClick={() => setLimit(limit + PAGE * 2)}>{t.more} ({shown.length - limit})</button>}
      </div>
      <p class="qcl-source">{t.source}</p>
    </section>
  );
}

type Copy = typeof copy['fr'];
type MetaOf = (code: string) => { color: string; label: string };

function favoured(e: ExitPollEntry) {
  const dem = e.posterior.p_dem >= 0.5;
  return { code: dem ? 'us_dem' : 'us_rep', p: dem ? e.posterior.p_dem : e.posterior.p_rep, prior: dem ? e.prior.p_dem : 1 - e.prior.p_dem };
}

function PredictorItem({ row, name, t, metaOf, pct, margin, stamp }:
  { row: UsRow; name: string; t: Copy; metaOf: MetaOf; pct: (p: number) => string; margin: (m: number) => string; stamp: (iso: string) => string }) {
  const e = row.exitPoll!;
  const f = favoured(e);
  const m = metaOf(f.code);
  const qs = e.posterior.margin_quantiles ?? {};
  return (
    <li class="usl-pred-item" style={`--c:${m.color}`}>
      <div class="usl-pred-name"><strong>{name}</strong>
        {row.status !== 'awaiting' && <em class={`usl-status is-${row.status}`}>{t.status[row.status]}</em>}</div>
      <div class="usl-pred-fav"><i style={`background:${m.color}`}></i>{t.predFav(m.label, pct(f.p))}<small>{t.predPrior(pct(f.prior))}</small></div>
      <b class="usl-pred-meter" aria-hidden="true" style={`background:${metaOf('us_rep').color}`}><span style={`width:${Math.round(100 * e.posterior.p_dem)}%;background:${metaOf('us_dem').color}`}></span></b>
      <small class="usl-pred-meta">
        {typeof qs.q05 === 'number' && typeof qs.q95 === 'number' ? `${t.predRange(margin(qs.q05), margin(qs.q95))} · ` : ''}
        {t.kinds[e.kind] ?? e.kind}{e.as_of ? ` · ${stamp(e.as_of)}` : ''}
      </small>
    </li>
  );
}

function RaceItem({ row, info, t, metaOf, pct, lang, stamp }:
  { row: UsRow; info?: UsRaceInfo; t: Copy; metaOf: MetaOf; pct: (p: number) => string; lang: Locale; stamp: (iso: string) => string }) {
  const name = info?.name ?? row.name;
  const lead = row.call ? metaOf(row.call.party_code) : row.leader ? metaOf(row.leader.party_code) : null;
  const who = row.call?.candidate_name ?? row.leader?.candidate_name ?? null;
  const e = row.exitPoll;
  const f = e ? favoured(e) : null;
  return (
    <li class={`usl-race is-${row.status}`} style={lead ? `--c:${lead.color}` : undefined}>
      <div class="usl-race-name">{info?.href ? <a href={info.href}>{name}</a> : name}</div>
      <em class={`usl-status is-${row.status}`}>{t.status[row.status]}</em>
      <div class="usl-race-lead">
        {lead ? <><i style={`background:${lead.color}`}></i><strong>{lead.label}</strong>{who && <span>{who}</span>}
          {row.call?.called_at && <small>{t.at} {stamp(row.call.called_at)}</small>}</>
          : f ? <span class="usl-race-est">{t.estimate} : {t.predFav(metaOf(f.code).label, pct(f.p))}</span>
          : <span class="qcl-muted">—</span>}
      </div>
      <div class="usl-race-nums">
        {row.margin !== null && row.leader && <span>{numFmt(row.margin, lang, 1)} pt</span>}
        {row.reportedPct !== null && <span>{numFmt(row.reportedPct, lang, 0)} % {t.colReported.toLowerCase()}</span>}
        {row.votes > 0 && <span>{row.votes.toLocaleString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-CA')} {t.votes}</span>}
      </div>
    </li>
  );
}
