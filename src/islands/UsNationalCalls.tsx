/**
 * Appels d'ensemble faits par Vote-Scope (majorité à la Chambre, au Sénat),
 * lus tels quels dans le tableau `national_calls` du live.json. Rien n'est
 * déduit ici : sans tableau, ou tableau vide, l'îlot n'affiche rien.
 * Aucune lecture avant 17 h 30 HNE (`?direct=1` lève la barrière, pour essai).
 */
import { useEffect, useState } from 'preact/hooks';
import '../styles/us-national-calls.css';

type Lang = 'fr' | 'en' | 'es';
type NationalCall = { kind?: string; party?: string | null; chamber?: string | null; called_at?: string };
interface Props { lang: Lang; liveUrl: string; fallbackUrl?: string; demColor: string; repColor: string; pageUrl: string }

const OPENS_AT = Date.parse('2026-11-03T17:30:00-05:00');
const POLL_MS = 60_000;
const CHAMBERS = ['house', 'senate'] as const;
type Ch = (typeof CHAMBERS)[number];
type Side = 'dem' | 'rep';

const T = {
  fr: {
    head: (s: Side, c: Ch) => `Projection Vote-Scope : les ${s === 'dem' ? 'démocrates' : 'républicains'} remportent la majorité ${c === 'house' ? 'à la Chambre' : 'au Sénat'}`,
    party: { dem: 'Démocrates', rep: 'Républicains' }, chamber: { house: 'Chambre des représentants', senate: 'Sénat' },
    verdict: 'remportent la majorité',
    when: (t: string) => `Appel Vote-Scope à ${t}, heure de l’Est`,
    title: 'Vote-Scope · Mi-mandat 2026', foot: 'vote-scope.com · projection Vote-Scope',
    share: 'Partager', image: 'Image', busy: 'Image…',
  },
  en: {
    head: (s: Side, c: Ch) => `Vote-Scope projection: ${s === 'dem' ? 'Democrats' : 'Republicans'} win the ${c === 'house' ? 'House' : 'Senate'} majority`,
    party: { dem: 'Democrats', rep: 'Republicans' }, chamber: { house: 'House of Representatives', senate: 'Senate' },
    verdict: 'win the majority',
    when: (t: string) => `Vote-Scope call at ${t} Eastern`,
    title: 'Vote-Scope · 2026 midterms', foot: 'vote-scope.com · Vote-Scope projection',
    share: 'Share', image: 'Image', busy: 'Image…',
  },
  es: {
    head: (s: Side, c: Ch) => `Proyección de Vote-Scope: los ${s === 'dem' ? 'demócratas' : 'republicanos'} ganan la mayoría ${c === 'house' ? 'en la Cámara' : 'en el Senado'}`,
    party: { dem: 'Demócratas', rep: 'Republicanos' }, chamber: { house: 'Cámara de Representantes', senate: 'Senado' },
    verdict: 'ganan la mayoría',
    when: (t: string) => `Llamada de Vote-Scope a las ${t}, hora del Este`,
    title: 'Vote-Scope · Elecciones de medio mandato 2026', foot: 'vote-scope.com · proyección de Vote-Scope',
    share: 'Compartir', image: 'Imagen', busy: 'Imagen…',
  },
};

function etTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
  if (lang === 'en') return `${h % 12 || 12}:${m} ${h < 12 ? 'a.m.' : 'p.m.'}`;
  return lang === 'fr' ? `${h} h ${m}` : `${String(h).padStart(2, '0')}:${m}`;
}

function sideOf(party?: string | null): Side | null {
  if (party === 'us_dem') return 'dem';
  if (party === 'us_rep') return 'rep';
  return null;
}

/** Ne garde que les appels de majorité lisibles, un par chambre (le plus tôt), Chambre d'abord. */
export function majorityCalls(raw: unknown): { chamber: Ch; side: Side; at: string }[] {
  const list = Array.isArray(raw) ? (raw as NationalCall[]) : [];
  const out = new Map<Ch, { chamber: Ch; side: Side; at: string }>();
  for (const c of list) {
    const chamber = c?.chamber as Ch;
    const side = sideOf(c?.party);
    if (c?.kind !== 'majority' || !CHAMBERS.includes(chamber) || !side || typeof c.called_at !== 'string') continue;
    const prev = out.get(chamber);
    if (!prev || c.called_at < prev.at) out.set(chamber, { chamber, side, at: c.called_at });
  }
  return CHAMBERS.flatMap((ch) => (out.has(ch) ? [out.get(ch)!] : []));
}

async function copyText(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
}

export default function UsNationalCalls({ lang, liveUrl, fallbackUrl, demColor, repColor, pageUrl }: Props) {
  const [calls, setCalls] = useState<ReturnType<typeof majorityCalls>>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const t = T[lang];

  useEffect(() => {
    let alive = true;
    let timer = 0;
    const get = async (url: string) => {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    };
    const tick = async () => {
      try {
        const p = await get(liveUrl).catch(() => (fallbackUrl ? get(fallbackUrl) : Promise.reject()));
        if (alive && !p?.source?.is_test_page) setCalls(majorityCalls(p?.national_calls));
      } catch { /* on garde l'état précédent */ }
      if (alive) timer = window.setTimeout(tick, POLL_MS);
    };
    const force = new URLSearchParams(location.search).has('direct');
    timer = window.setTimeout(tick, force ? 0 : Math.max(0, OPENS_AT - Date.now()));
    return () => { alive = false; window.clearTimeout(timer); };
  }, [liveUrl, fallbackUrl]);

  if (!calls.length) return null;

  return (
    <div class="usnc" role="status" aria-live="polite">
      {calls.map((c) => {
        const color = c.side === 'dem' ? demColor : repColor;
        const time = etTime(c.at, lang);
        const head = t.head(c.side, c.chamber);
        const text = `${head} (${t.when(time)}).`;
        const key = `${c.chamber}-${c.side}`;
        const share = async () => {
          try {
            if (typeof navigator.share === 'function') await navigator.share({ text, url: pageUrl });
            else await copyText(`${text} ${pageUrl}`);
          } catch { /* annulé */ }
        };
        const image = async () => {
          if (busy) return; setBusy(key);
          try {
            const { renderCallPng } = await import('../lib/share/render-client');
            const blob = await renderCallPng('wide', lang, { title: t.title, race: t.chamber[c.chamber], party: t.party[c.side],
              candidate: null, color, verdict: t.verdict, when: t.when(time), foot: t.foot });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob); a.download = `vote-scope-majority-${key}-${lang}.png`; a.click();
            window.setTimeout(() => URL.revokeObjectURL(a.href), 5000);
          } catch { /* réseau ou navigateur */ }
          setBusy(null);
        };
        return (
          <div class="usnc-row" key={key} style={`--usnc-color:${color}`}>
            <p class="usnc-head">{head}</p>
            <p class="usnc-when"><time dateTime={c.at}>{t.when(time)}</time></p>
            <p class="usnc-actions">
              <button type="button" class="usnc-btn" onClick={share} data-analytics-event="share_click" data-analytics-kind="national-call">{t.share}</button>
              <button type="button" class="usnc-btn" onClick={image} disabled={busy === key} data-analytics-event="share_click" data-analytics-kind="national-call-image">{busy === key ? t.busy : t.image}</button>
            </p>
          </div>
        );
      })}
    </div>
  );
}
