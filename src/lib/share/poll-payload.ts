/**
 * Ce qu'il faut pour dessiner l'image d'un sondage (cards.ts → pollCard), tiré
 * d'une ligne du tableau. Le tableau embarque ce petit objet par ligne ; l'image
 * est dessinée dans le navigateur au clic, aucune image stockée par sondage.
 * Sert aussi à l'image de partage du tableau entier (moyenne simple), au build.
 */
import type { PollRow } from '../polls-adapter';
import type { PollCardInput } from './cards';
import { longDate } from '../format';

type Lang = 'fr' | 'en' | 'es';
export interface Chip { code: string; label: string; color: string }

/** Jour du scrutin à venir, par tableau. Un scrutin passé n'est pas affiché. */
const VOTE_DAY: Record<string, string> = {
  'us-house': '2026-11-03', 'us-senate': '2026-11-03', 'us-governor': '2026-11-03',
  'british-columbia': '2026-10-24', spain: '2026-11-29',
};
export const voteDayFor = (key: string, today: string): string | undefined => {
  const d = VOTE_DAY[key];
  return d && d >= today ? d : undefined;
};

const C = {
  fr: { field: 'Terrain', resp: 'répondants', lv: 'électeurs probables', rv: 'électeurs inscrits', a: 'adultes', dl: 'décidés et ceux qui penchent', derived: 'parmi les décidés', by: 'Commandé par', party: 'Commandé par un parti', qc: 'Québec seulement', nonfr: 'Anglophones et allophones seulement', pub: 'Publié le' },
  en: { field: 'Fieldwork', resp: 'respondents', lv: 'likely voters', rv: 'registered voters', a: 'adults', dl: 'decided and leaning', derived: 'decided voters only', by: 'Sponsored by', party: 'Commissioned by a party', qc: 'Quebec only', nonfr: 'Anglophones and allophones only', pub: 'Released' },
  es: { field: 'Trabajo de campo', resp: 'encuestados', lv: 'votantes probables', rv: 'votantes registrados', a: 'adultos', dl: 'decididos e inclinados', derived: 'entre los decididos', by: 'Encargada por', party: 'Encargada por un partido', qc: 'Solo Quebec', nonfr: 'Solo anglófonos y alófonos', pub: 'Publicada el' },
} as const;

const colon = (lang: Lang) => (lang === 'fr' ? ' : ' : ': ');

/** « du 7 au 8 octobre 2026 », « October 7–8, 2026 », « del 7 al 8 de octubre de 2026 ». */
export function fieldRange(s: string | null | undefined, e: string, lang: Lang): string {
  if (!s || s === e) return lang === 'en' ? longDate(e, lang) : `${lang === 'fr' ? 'le' : 'el'} ${longDate(e, lang)}`;
  const sd = Number(s.slice(8, 10));
  const sameYear = s.slice(0, 4) === e.slice(0, 4);
  const sameMonth = sameYear && s.slice(0, 7) === e.slice(0, 7);
  const end = longDate(e, lang);
  if (lang === 'en') {
    if (sameMonth) return end.replace(/^(\w+) (\d+)/, (_, m, d) => `${m} ${sd}–${d}`);
    const start = longDate(s, lang);
    return `${sameYear ? start.replace(/, \d{4}$/, '') : start} – ${end}`;
  }
  const start = sameMonth ? String(sd) : sameYear ? longDate(s, lang).replace(/ (de )?\d{4}$/, '') : longDate(s, lang);
  return lang === 'fr' ? `du ${start} au ${end}` : `del ${start} al ${end}`;
}

function popLabel(pop: string | null | undefined, lang: Lang): string {
  if (!pop) return '';
  const c = C[lang];
  const k = pop.toLowerCase();
  if (k === 'lv') return c.lv;
  if (k === 'rv') return c.rv;
  if (k === 'a' || k === 'adults') return c.a;
  if (k === 'decided_and_leaning') return c.dl;
  return '';
}

/** Ligne compacte embarquée dans la page (le titre, les couleurs et les noms de
 *  partis sont donnés une seule fois par tableau, voir PollShare.astro). */
export interface PollShareRow {
  f: string;                 // maison
  a?: string;                // début du terrain (ISO)
  b?: string;                // fin du terrain (ISO)
  n?: number;                // répondants
  m: string;                 // population, commanditaire, scénario
  r?: string;                // date de publication (ISO)
  p: [string, number][];     // code de parti (ou étiquette déjà lisible), %
  s?: string;                // précision ajoutée au titre (État, circonscription)
}

/** Une ligne de sondage : tableau national (PollRow) ou sondage local d'une fiche. */
type PollLike = Pick<PollRow, 'firm_name' | 'topline'> & Partial<PollRow>;

/** Ce que la ligne embarque : les chiffres bruts, le texte est fait au clic. */
export function pollShareRow(p: PollLike, lang: Lang, extra?: string, keep?: Set<string>): PollShareRow {
  const c = C[lang];
  const meta: string[] = [];
  if (p.topline_scope?.kind === 'region' && p.topline_scope.value === 'qc') meta.push(c.qc);
  if (p.topline_scope?.kind === 'language' && p.topline_scope.value === 'nonfr') meta.push(c.nonfr);
  const pop = popLabel(p.population, lang);
  if (pop) meta.push(pop);
  if (p.vote_share_basis === 'decided_including_leaners' && pop !== c.dl) meta.push(c.dl);
  if (p.vote_share_basis === 'decided_derived_proportional') meta.push(c.derived);
  if (p.client) meta.push(`${c.by} ${p.client}`);
  else if (p.partisan_poll) meta.push(c.party);
  const end = p.field_end || p.display_date;
  const row: PollShareRow = {
    f: p.firm_name,
    m: meta.join(' · '),
    p: Object.entries(p.topline)
      .filter(([code, v]) => typeof v === 'number' && v > 0 && (!keep || keep.has(code)))
      .sort((x, y) => y[1] - x[1]) as [string, number][],
  };
  if (end) row.b = end;
  if (p.field_start && p.field_start !== end) row.a = p.field_start;
  if (p.sample_size && p.sample_size > 0) row.n = p.sample_size;
  if (p.release_date) row.r = p.release_date;
  if (extra) row.s = extra;
  return row;
}

/** Ligne compacte + contexte du tableau → ce que dessine pollCard. Les codes absents
 *  de la légende (petits partis, « autres ») sont écartés, comme dans le tableau. */
export function expandPollRow(r: PollShareRow, ctx: { lang: Lang; title: string; voteDay?: string; chips: Chip[] }): PollCardInput {
  const { lang } = ctx;
  const c = C[lang];
  const byCode = new Map(ctx.chips.map((ch) => [ch.code, ch]));
  const parties = r.p.filter(([code]) => byCode.has(code))
    .map(([code, v]) => ({ label: byCode.get(code)!.label, color: byCode.get(code)!.color, v }));
  // Espace simple : l'espace fine insécable manque à Barlow (case vide sur l'image).
  const n = r.n ? `${r.n.toLocaleString(lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'fr-CA').replace(/[\u202f\u00a0]/g, ' ')} ${c.resp}` : '';
  return {
    title: r.s ? `${ctx.title} · ${r.s}` : ctx.title,
    firm: r.f,
    field: r.b ? `${c.field}${colon(lang)}${fieldRange(r.a, r.b, lang)}` : '',
    meta: [n, r.m].filter(Boolean).join(' · '),
    parties,
    foot: r.r ? `${c.pub} ${longDate(r.r, lang)}` : '',
    voteDay: ctx.voteDay,
    digits: 'auto',
  };
}

export function pollPayload(p: PollRow, lang: Lang, title: string, chips: Chip[], voteDay?: string): PollCardInput {
  return expandPollRow(pollShareRow(p, lang), { lang, title, voteDay, chips });
}

/** Ligne → texte court pour l'attribut data-poll : « maison|meta|code~v;code~v|début|fin|n|publication|précision ».
 *  Pas de JSON : ses guillemets s'échappent en &quot; et doublaient le poids des tableaux longs. */
const clean = (x: string | number | undefined) => String(x ?? '').replace(/[|;~]/g, ' ');
export const packRow = (r: PollShareRow): string =>
  [clean(r.f), clean(r.m), r.p.map(([k, v]) => `${clean(k)}~${v}`).join(';'), r.a ?? '', r.b ?? '', r.n ?? '', r.r ?? '', clean(r.s)].join('|');
export function unpackRow(s: string): PollShareRow {
  const [f, m, p, a, b, n, r, x] = s.split('|');
  const row: PollShareRow = { f, m, p: p ? p.split(';').map((e) => { const i = e.lastIndexOf('~'); return [e.slice(0, i), Number(e.slice(i + 1))] as [string, number]; }) : [] };
  if (a) row.a = a;
  if (b) row.b = b;
  if (n) row.n = Number(n);
  if (r) row.r = r;
  if (x) row.s = x;
  return row;
}
