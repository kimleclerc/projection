/**
 * Notre aiguille : de quel côté le dépouillement s'écarte de notre projection,
 * lue telle quelle dans le bloc `wave` du live.json (fastest_call/wave.py).
 * Rien n'est recalculé ici. Le live.json ne porte pas de probabilité de
 * contrôle des chambres : la ligne le dit (« en attente ») au lieu d'en inventer.
 * Aucune lecture avant 17 h 30 HNE (`?direct=1` lève la barrière, pour essai).
 */
import { useEffect, useState } from 'preact/hooks';
import type { Chamber, EngineWave } from './usLive';
import '../styles/us-needle.css';

type Lang = 'fr' | 'en' | 'es';
type Wave = EngineWave & { reading?: 'dem_over' | 'rep_over' | 'in_line' | null; n_states?: number; n_races?: number };
interface Props { lang: Lang; liveUrl: string; fallbackUrl?: string; demColor: string; repColor: string }

const OPENS_AT = Date.parse('2026-11-03T17:30:00-05:00');
const SPAN = 15;                 // points D − R aux deux bouts du cadran
const POLL_MS = 90_000;

const T = {
  fr: {
    title: 'L’aiguille Vote-Scope',
    lede: 'Écart moyen entre le dépouillement et notre projection, en points (démocrates moins républicains). Chaque État compte une fois.',
    dem: 'plus démocrate', rep: 'plus républicain', center: 'notre projection',
    status: { waiting: 'En attente', provisional: 'Provisoire', mature: 'Mûre' } as Record<string, string>,
    waiting: (min: number, pct: number) => `En attente : l’aiguille bouge quand ${min} États ont au moins ${pct} % de leurs unités dépouillées.`,
    before: 'En attente : premières fermetures à 18 h, heure de l’Est.',
    offline: 'En attente : le flux de résultats ne répond pas, la page réessaie d’elle-même.',
    reading: { dem_over: 'Le décompte penche plus démocrate que prévu.', rep_over: 'Le décompte penche plus républicain que prévu.', in_line: 'Le décompte suit notre projection.' } as Record<string, string>,
    pts: (v: number) => `${v > 0 ? 'D +' : v < 0 ? 'R +' : ''}${Math.abs(v).toLocaleString('fr-CA', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} pt`,
    basis: (r: number, s: number) => `${r} course${r > 1 ? 's' : ''}, ${s} État${s > 1 ? 's' : ''}`,
    chambers: { house: 'Chambre', senate: 'Sénat', governor: 'Gouverneurs' } as Record<Chamber, string>,
    noChamber: 'en attente',
    control: 'Probabilités de contrôle en direct : en attente (le flux n’en publie pas).',
    excluded: (s: string) => `Hors moyenne : ${s} (soirée sans tout le vote par correspondance).`,
  },
  en: {
    title: 'The Vote-Scope needle',
    lede: 'Average gap between the count and our forecast, in points (Democrats minus Republicans). Each state counts once.',
    dem: 'more Democratic', rep: 'more Republican', center: 'our forecast',
    status: { waiting: 'Waiting', provisional: 'Provisional', mature: 'Settled' } as Record<string, string>,
    waiting: (min: number, pct: number) => `Waiting: the needle moves once ${min} states have at least ${pct}% of their units reporting.`,
    before: 'Waiting: the first polls close at 6 p.m. Eastern.',
    offline: 'Waiting: the results feed is not answering; the page retries on its own.',
    reading: { dem_over: 'The count leans more Democratic than forecast.', rep_over: 'The count leans more Republican than forecast.', in_line: 'The count is in line with our forecast.' } as Record<string, string>,
    pts: (v: number) => `${v > 0 ? 'D+' : v < 0 ? 'R+' : ''}${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} pts`,
    basis: (r: number, s: number) => `${r} race${r === 1 ? '' : 's'}, ${s} state${s === 1 ? '' : 's'}`,
    chambers: { house: 'House', senate: 'Senate', governor: 'Governors' } as Record<Chamber, string>,
    noChamber: 'waiting',
    control: 'Live control probabilities: waiting (the feed does not publish them).',
    excluded: (s: string) => `Left out: ${s} (election night counts only part of the mail vote).`,
  },
  es: {
    title: 'La aguja de Vote-Scope',
    lede: 'Diferencia media entre el recuento y nuestra proyección, en puntos (demócratas menos republicanos). Cada estado cuenta una vez.',
    dem: 'más demócrata', rep: 'más republicano', center: 'nuestra proyección',
    status: { waiting: 'En espera', provisional: 'Provisional', mature: 'Consolidada' } as Record<string, string>,
    waiting: (min: number, pct: number) => `En espera: la aguja se mueve cuando ${min} estados tengan al menos el ${pct} % de sus unidades escrutadas.`,
    before: 'En espera: las primeras urnas cierran a las 18:00, hora del Este.',
    offline: 'En espera: el flujo de resultados no responde; la página reintenta sola.',
    reading: { dem_over: 'El recuento se inclina más a los demócratas de lo previsto.', rep_over: 'El recuento se inclina más a los republicanos de lo previsto.', in_line: 'El recuento sigue nuestra proyección.' } as Record<string, string>,
    pts: (v: number) => `${v > 0 ? 'D +' : v < 0 ? 'R +' : ''}${Math.abs(v).toLocaleString('es-ES', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} pts`,
    basis: (r: number, s: number) => `${r} contienda${r === 1 ? '' : 's'}, ${s} estado${s === 1 ? '' : 's'}`,
    chambers: { house: 'Cámara', senate: 'Senado', governor: 'Gobernadores' } as Record<Chamber, string>,
    noChamber: 'en espera',
    control: 'Probabilidades de control en directo: en espera (el flujo no las publica).',
    excluded: (s: string) => `Fuera del promedio: ${s} (la noche solo cuenta parte del voto por correo).`,
  },
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export default function UsNeedle({ lang, liveUrl, fallbackUrl, demColor, repColor }: Props) {
  const t = T[lang];
  const [wave, setWave] = useState<Wave | null>(null);
  const [phase, setPhase] = useState<'before' | 'live' | 'offline'>('before');

  useEffect(() => {
    const force = new URLSearchParams(location.search).has('direct');
    let timer: ReturnType<typeof setTimeout>;
    let stop = false;
    const get = async (url: string) => {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    };
    const tick = async () => {
      if (stop) return;
      try {
        const p = await get(liveUrl).catch(() => (fallbackUrl ? get(fallbackUrl) : Promise.reject()));
        setWave(p?.source?.is_test_page ? null : (p?.wave ?? null));
        setPhase('live');
      } catch { setPhase('offline'); }
      timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, force ? 0 : Math.max(0, OPENS_AT - Date.now()));
    return () => { stop = true; clearTimeout(timer); };
  }, [liveUrl, fallbackUrl]);

  const value = wave && wave.status !== 'waiting' && isNum(wave.dem_vs_model) ? wave.dem_vs_model : null;
  const clamped = value === null ? 0 : Math.max(-SPAN, Math.min(SPAN, value));
  const angle = (clamped / SPAN) * 90;                       // −90° (R) … +90° (D)
  const status = value === null ? 'waiting' : wave!.status;
  const note = phase === 'before' ? t.before : phase === 'offline' && !wave ? t.offline
    : value === null ? t.waiting(wave?.rules?.min_states ?? 3, wave?.rules?.min_pct ?? 60)
    : (wave!.reading && t.reading[wave!.reading]) || '';
  const chambers: Chamber[] = ['house', 'senate', 'governor'];

  return (
    <aside class="usn" aria-labelledby="usn-h">
      <div class="usn-head">
        <h2 id="usn-h" class="usn-h">{t.title}</h2>
        <span class={`usn-status is-${status}`}>{t.status[status]}</span>
      </div>
      <p class="usn-lede">{t.lede}</p>
      <div class="usn-dial">
        <svg viewBox="0 0 240 132" role="img" aria-label={value === null ? note : `${t.pts(value)} · ${note}`}>
          <path d="M20 120 A100 100 0 0 1 120 20" fill="none" stroke={repColor} stroke-width="18" opacity="0.85" />
          <path d="M120 20 A100 100 0 0 1 220 120" fill="none" stroke={demColor} stroke-width="18" opacity="0.85" />
          <line x1="120" y1="10" x2="120" y2="32" stroke="var(--ink)" stroke-width="2" />
          <g transform={`rotate(${angle} 120 120)`} class={value === null ? 'usn-idle' : undefined}>
            <line x1="120" y1="120" x2="120" y2="34" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" />
          </g>
          <circle cx="120" cy="120" r="8" fill="var(--ink)" />
        </svg>
        <div class="usn-scale"><span>{t.rep}</span><span>{t.center}</span><span>{t.dem}</span></div>
        <p class="usn-value">{value === null ? '—' : t.pts(value)}</p>
        {value !== null && isNum(wave!.n_races) && isNum(wave!.n_states) && <p class="usn-basis">{t.basis(wave!.n_races, wave!.n_states)}</p>}
      </div>
      <p class="usn-note">{note}</p>
      <ul class="usn-chambers">
        {chambers.map((c) => {
          const a = wave?.by_chamber?.[c];
          const ready = a && isNum(a.dem_vs_model) && a.n_states >= (wave?.rules?.min_states ?? 3);
          return <li key={c}><span>{t.chambers[c]}</span><b>{ready ? `${t.pts(a!.dem_vs_model)} · ${t.basis(a!.n_races, a!.n_states)}` : t.noChamber}</b></li>;
        })}
      </ul>
      <p class="usn-note">{t.control}</p>
      {(wave?.excluded_states ?? []).length > 0 && <p class="usn-note">{t.excluded(wave!.excluded_states!.join(', '))}</p>}
    </aside>
  );
}
