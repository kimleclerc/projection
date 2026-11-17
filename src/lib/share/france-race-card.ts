/** Images of the same conditional ranking and survey series shown on the France page. */
import { h, frame, SIZE, type Format, type Node } from './cards';
import { SHARE_ELECTIONS, type Lang } from './elections';
import type { Contender, Observation } from '../fr-race-tracker';

export type FranceRaceCardInput = { runDate: string } & (
  { kind: 'qualification'; contenders: Contender[] } |
  { kind: 'trend'; months: number; lineup: string; start: number; end: number; yMax: number;
    series: (Contender & { dash: string; points: Observation[]; trend: { date: string; value: number }[] })[] }
);
const T = {
  fr: { ranking: 'Qui peut atteindre le second tour ?', candidate: 'Candidat', qualify: 'Qualification', vote: 'Premier tour', note: 'Probabilités conditionnelles à la présence du candidat, pondérées par le nombre de sondages de chaque liste. Les hypothèses diffèrent : ces probabilités ne s’additionnent pas.', trend: 'Intentions de vote au premier tour', months: 'mois', all: 'Toutes les listes testées', fixed: 'Liste identique', help: 'Un point par enquête. Traits : min–max des hypothèses, pas une marge d’erreur. Lignes : moyenne des 30 derniers jours, à poids égal par enquête.', asOf: 'Projection du', data: 'Enquêtes publiées · Vue au', latest: 'Dernier point par candidat' },
  en: { ranking: 'Who can reach the runoff?', candidate: 'Candidate', qualify: 'Qualifies', vote: 'First round', note: 'Probabilities conditional on the candidate appearing, weighted by each lineup’s poll count. Different hypothetical fields: these probabilities do not add up.', trend: 'First-round voting intention', months: 'months', all: 'All tested lineups', fixed: 'Fixed lineup', help: 'One point per survey. Marks: min–max across lineups, not a margin of error. Lines: trailing 30-day average, equal weight per survey.', asOf: 'Forecast of', data: 'Published surveys · View as of', latest: 'Latest survey point per candidate' },
  es: { ranking: '¿Quién puede pasar a la segunda vuelta?', candidate: 'Candidato', qualify: 'Clasificación', vote: 'Primera vuelta', note: 'Probabilidades condicionadas a la presencia del candidato, ponderadas por las encuestas de cada lista. Son listas hipotéticas distintas: las probabilidades no se suman.', trend: 'Intención de voto en primera vuelta', months: 'meses', all: 'Todas las listas probadas', fixed: 'Lista idéntica', help: 'Un punto por encuesta. Marcas: mín–máx de las combinaciones, no un margen de error. Líneas: media de los últimos 30 días, igual peso por encuesta.', asOf: 'Proyección del', data: 'Encuestas publicadas · Vista del', latest: 'Último punto por candidato' },
};
const time = (date: string) => Date.parse(date + 'T12:00:00Z');
const uri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));

export function franceRaceCard(fmt: Format, lang: Lang, data: FranceRaceCardInput): Node {
  const t = T[lang], big = fmt !== 'wide';
  const el = SHARE_ELECTIONS['france-presidential'];
  const width = SIZE[fmt].w - (big ? 88 : 68);
  const num = (v: number, digits = 1) => new Intl.NumberFormat(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
  const date = (value: number | string) => new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(typeof value === 'string' ? time(value) : value);
  const heading = (text: string) => h('div', { fontSize: big ? 44 : 34, fontWeight: 700, lineHeight: 1.1, marginBottom: big ? 20 : 10 }, text);
  let body: Node;
  if (data.kind === 'qualification') {
    const columns = (name: string, probability: string, vote: string, color = '#111111', head = false) => h('div', { alignItems: 'center', borderBottom: '1px solid #d6d6d6', padding: head ? '8px 0' : fmt === 'story' ? '28px 0' : big ? '18px 0' : '4px 0', fontSize: head ? (big ? 22 : 17) : (big ? 32 : 22), lineHeight: 1.1, fontWeight: head ? 600 : 700 },
      h('div', { width: '50%', color }, name),
      h('div', { width: '25%', justifyContent: 'flex-end' }, probability),
      h('div', { width: '25%', justifyContent: 'flex-end' }, vote));
    body = h('div', { flexDirection: 'column', flexGrow: 1, justifyContent: big ? 'center' : 'flex-start' },
      heading(t.ranking), columns(t.candidate, t.qualify, t.vote, '#666666', true),
      ...data.contenders.map(c => columns(c.name, `${c.probability >= .995 ? '>99' : c.probability < .01 ? '<1' : num(c.probability * 100, 0)} %`, `${num(c.mean)} %`, c.color)),
      h('div', { fontSize: big ? 21 : 16, lineHeight: 1.3, marginTop: big ? 24 : 12, color: '#555555' }, t.note));
  } else {
    const plotHeight = fmt === 'story' ? 820 : big ? 440 : 235;
    const left = 48, right = 14, top = 12, bottom = 32;
    const x = (value: number) => left + (value - data.start) / (data.end - data.start || 1) * (width - left - right);
    const y = (value: number) => plotHeight - bottom - value / data.yMax * (plotHeight - top - bottom);
    const marks = data.series.flatMap(c => [
      ...c.trend.flatMap((p, i) => i > 0 && time(p.date) - time(c.trend[i - 1].date) <= 60 * 86400000 ? [`<line x1="${x(time(c.trend[i - 1].date))}" x2="${x(time(p.date))}" y1="${y(c.trend[i - 1].value)}" y2="${y(p.value)}" stroke="${escape(c.color)}" stroke-width="3" stroke-dasharray="${c.dash}"/>`] : []),
      ...c.points.map(p => `<line x1="${x(time(p.date))}" x2="${x(time(p.date))}" y1="${y(p.low)}" y2="${y(p.high)}" stroke="${escape(c.color)}" opacity=".45"/><circle cx="${x(time(p.date))}" cy="${y(p.mean)}" r="3" fill="${escape(c.color)}" opacity=".7"/>`),
    ]).join('');
    const grid = [0, 1, 2, 3, 4].map(i => `<line x1="${left}" x2="${width - right}" y1="${y(data.yMax * i / 4)}" y2="${y(data.yMax * i / 4)}" stroke="#dddddd"/>`).join('');
    const labels = [0, 1, 2, 3, 4].map(i => h('div', { position: 'absolute', left: 0, top: y(data.yMax * i / 4) - 9, fontSize: 16, color: '#555555' }, `${num(data.yMax * i / 4, 0)} %`));
    const ticks = [0, 1, 2, 3].map(i => h('div', { position: 'absolute', ...(i === 3 ? { right } : { left: x(data.start + (data.end - data.start) * i / 3) - (i ? 48 : 0) }), top: plotHeight - 22, fontSize: 16, color: '#555555' }, new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(data.start + (data.end - data.start) * i / 3)));
    body = h('div', { flexDirection: 'column', flexGrow: 1, justifyContent: big ? 'center' : 'flex-start' },
      heading(t.trend),
      h('div', { fontSize: big ? 22 : 17, color: '#555555', lineHeight: 1.25, marginBottom: big ? 22 : 12 }, `${data.months} ${t.months} · ${data.lineup ? `${t.fixed} : ${data.lineup}` : t.all}`),
      h('div', { position: 'relative', width, height: plotHeight, flexShrink: 0 }, { type: 'img', props: { src: uri(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${plotHeight}" viewBox="0 0 ${width} ${plotHeight}">${grid}${marks}</svg>`), width, height: plotHeight } }, ...labels, ...ticks),
      h('div', { fontSize: big ? 20 : 16, color: '#555555', marginTop: big ? 20 : 8 }, t.latest),
      h('div', { flexWrap: 'wrap', marginTop: 6, gap: big ? 16 : 8 }, ...data.series.flatMap(c => {
        const p = c.points.at(-1);
        return p ? [h('div', { alignItems: 'center', fontSize: big ? 22 : 17, fontWeight: 700, color: c.color, marginRight: 12 }, `${c.short} ${num(p.mean)} % · ${new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(time(p.date))}`)] : [];
      })),
      h('div', { fontSize: big ? 21 : 16, lineHeight: 1.3, marginTop: big ? 24 : 12, color: '#555555' }, `${t.help} ${date(data.start)} – ${date(data.end)}.`));
  }
  return frame(fmt, lang, el.name[lang], el.when[lang], body, `${data.kind === 'qualification' ? t.asOf : t.data} ${date(data.runDate)}`);
}
