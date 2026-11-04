/**
 * Accueil du site : la carte des mi-mandats du 3 novembre 2026. Le titre suit
 * les appels de majorité de Vote-Scope (`national_calls`), les chiffres les
 * sièges appelés. Rendu au build depuis la copie de repli, puis tenu à jour.
 */
import type { UsLivePayload } from './usLive';
import { homeView, num, seatsOf, useLiveView, type HomeContext, type HomeView, type Lang } from '../lib/us-results';
import '../styles/us-results.css';

interface Props {
  lang: Lang; initial: HomeView; ctx: HomeContext; urls: string[]; colors: Record<string, string>;
  /** Parti majoritaire avant le scrutin, par chambre. */
  before: { house: string | null; senate: string | null };
  href: string;
}

type Side = 'dem' | 'rep';
const T = {
  fr: {
    lead: 'Mi-mandats 2026 : ', pending: 'Mi-mandats 2026 : les résultats',
    party: { dem: 'les démocrates', rep: 'les républicains' } as Record<Side, string>,
    take: 'reprennent', keep: 'gardent', and: ' et ', sep: ' ; ',
    ch: { house: 'la Chambre', senate: 'le Sénat' },
    house: 'Chambre', senate: 'Sénat', gov: 'Gouverneurs', flips: 'Bascules',
    seats: (d: string, r: string) => `${d} D, ${r} R`,
    senateNote: 'avec les sièges non renouvelés', govNote: 'courses appelées',
    more: 'Tous les résultats et les courses, État par État',
  },
  en: {
    lead: '2026 midterms: ', pending: '2026 midterms: the results',
    party: { dem: 'Democrats', rep: 'Republicans' } as Record<Side, string>,
    take: 'take back', keep: 'keep', and: ' and ', sep: '; ',
    ch: { house: 'the House', senate: 'the Senate' },
    house: 'House', senate: 'Senate', gov: 'Governors', flips: 'Seats changing hands',
    seats: (d: string, r: string) => `${d} D, ${r} R`,
    senateNote: 'including seats not up', govNote: 'races called',
    more: 'All results and races, state by state',
  },
  es: {
    lead: 'Elecciones de medio mandato 2026: ', pending: 'Elecciones de medio mandato 2026: los resultados',
    party: { dem: 'los demócratas', rep: 'los republicanos' } as Record<Side, string>,
    take: 'recuperan', keep: 'conservan', and: ' y ', sep: '; ',
    ch: { house: 'la Cámara', senate: 'el Senado' },
    house: 'Cámara', senate: 'Senado', gov: 'Gobernadores', flips: 'Escaños que cambian de partido',
    seats: (d: string, r: string) => `${d} D, ${r} R`,
    senateNote: 'incluidos los que no se renuevan', govNote: 'contiendas llamadas',
    more: 'Todos los resultados y las contiendas, estado por estado',
  },
};

/** « les démocrates reprennent la Chambre et le Sénat », d'après les appels de majorité. */
function headline(v: HomeView, lang: Lang, before: Props['before']): string {
  const t = T[lang];
  if (!v.majorities.length) return t.pending;
  const groups = new Map<string, string[]>();
  for (const m of v.majorities) {
    const was = before[m.chamber];
    const verb = was && was !== (m.side === 'dem' ? 'us_dem' : 'us_rep') ? t.take : t.keep;
    const key = `${m.side}|${verb}`;
    groups.set(key, [...(groups.get(key) ?? []), t.ch[m.chamber]]);
  }
  const clauses = [...groups.entries()].map(([key, chs]) => {
    const [side, verb] = key.split('|') as [Side, string];
    return `${t.party[side]} ${verb} ${chs.join(t.and)}`;
  });
  return t.lead + clauses.join(t.sep);
}

export default function UsMidtermsHomeCard({ lang, initial, ctx, urls, colors, before, href }: Props) {
  const v = useLiveView<HomeView>(urls, initial, (p: UsLivePayload) => homeView(p, ctx));
  const t = T[lang];
  const c = v.counts;
  const side = v.majorities[0]?.side;
  const color = side ? colors[side === 'dem' ? 'us_dem' : 'us_rep'] : undefined;
  const pair = (ch: 'house' | 'senate' | 'governor', hold: boolean) =>
    t.seats(num(seatsOf(c[ch], 'us_dem', hold), lang), num(seatsOf(c[ch], 'us_rep', hold), lang));
  const colon = lang === 'fr' ? ' : ' : ': ';
  return (
    <div class="usm" style={color ? `--usm-color:${color}` : ''}>
      <h2 class="usm-title"><a href={href}>{headline(v, lang, before)}</a></h2>
      <ul class="usm-figs">
        <li>{t.house}{colon}<strong>{pair('house', false)}</strong></li>
        <li>{t.senate}{colon}<strong>{pair('senate', true)}</strong> ({t.senateNote})</li>
        <li>{t.gov}{colon}<strong>{pair('governor', false)}</strong> ({t.govNote})</li>
        <li>{t.flips}{colon}<strong>{num(v.flips.length, lang)}</strong></li>
      </ul>
      <p class="usm-more"><a class="vs-link" href={href}>{t.more}</a></p>
    </div>
  );
}
