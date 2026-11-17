import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { candidateObservations, rollingTrend, type Contender, type Survey } from '../lib/fr-race-tracker';
import type { Locale } from '../lib/fr-pres';
import FranceShareTools from './FranceShareTools';
import { useUrlParam } from './lib/urlState';
import type { Format } from '../lib/share/cards';

interface Props { contenders: Contender[]; surveys: Survey[]; names: Record<string, string>; locale: Locale; candidateBase: string; slugs: Record<string, string>; runDate: string; }
const TEXT = {
  fr: { title: 'Qui a le plus de chances d’atteindre le second tour ?', candidate: 'Candidat', qualify: 'Qualification', vote: 'Premier tour', note: 'Probabilités parmi les hypothèses récentes où chaque candidat est présent, pondérées par le nombre de sondages de ces hypothèses. Elles ne constituent pas une liste unique de candidats et ne s’additionnent pas.', trend: 'Intentions de vote au premier tour : la tendance', help: 'Un point par enquête : moyenne des hypothèses où le candidat est testé. Les traits verticaux montrent leur minimum et leur maximum, pas une marge d’erreur. Les lignes suivent la moyenne des 30 derniers jours, à poids égal par enquête.', period: 'Période', months: 'mois', lineup: 'Liste de candidats', all: 'Toutes les listes testées', fixed: 'Pour comparer à candidatures identiques, choisissez une liste précise.', data: 'Voir les données du graphique', date: 'Terrain terminé le', firm: 'Institut', share: 'Intention de vote', empty: 'Pas assez de sondages sur cette période et cette liste.', chart: 'Évolution des intentions de vote au premier tour', source: 'Sources : enquêtes publiées, accessibles depuis la compilation des sondages.', polls: 'Ouvrir la compilation des sondages', latest: 'Dernier point', fullList: 'Candidats de la liste sélectionnée' },
  en: { title: 'Who is most likely to reach the runoff?', candidate: 'Candidate', qualify: 'Qualifies', vote: 'First round', note: 'Probabilities across recent lineups in which each candidate appears, weighted by each lineup’s poll count. These are different hypothetical fields, so the probabilities do not add up.', trend: 'First-round voting intention: the trend', help: 'One point per survey: average across lineups testing the candidate. Vertical marks show their minimum and maximum, not a margin of error. Lines show the trailing 30-day average, with equal weight per survey.', period: 'Period', months: 'months', lineup: 'Candidate lineup', all: 'All tested lineups', fixed: 'Choose a specific lineup to compare an unchanged field.', data: 'View chart data', date: 'Fieldwork ended', firm: 'Pollster', share: 'Voting intention', empty: 'Not enough polls for this period and lineup.', chart: 'First-round voting intention over time', source: 'Sources: published surveys, linked from our poll compilation.', polls: 'Open the poll compilation', latest: 'Latest point', fullList: 'Candidates in the selected lineup' },
  es: { title: '¿Quién tiene más probabilidades de pasar a la segunda vuelta?', candidate: 'Candidato', qualify: 'Clasificación', vote: 'Primera vuelta', note: 'Probabilidades en las combinaciones recientes donde aparece cada candidato, ponderadas por el número de encuestas de cada combinación. Son listas hipotéticas distintas y las probabilidades no se suman.', trend: 'Intención de voto en primera vuelta: la tendencia', help: 'Un punto por encuesta: media de las combinaciones que prueban al candidato. Las marcas verticales muestran su mínimo y máximo, no un margen de error. Las líneas muestran la media de los últimos 30 días, con igual peso por encuesta.', period: 'Periodo', months: 'meses', lineup: 'Lista de candidatos', all: 'Todas las listas probadas', fixed: 'Elija una lista concreta para comparar las mismas candidaturas.', data: 'Ver los datos del gráfico', date: 'Fin del trabajo de campo', firm: 'Instituto', share: 'Intención de voto', empty: 'No hay suficientes encuestas para este periodo y esta lista.', chart: 'Evolución de la intención de voto en primera vuelta', source: 'Fuentes: encuestas publicadas, enlazadas desde la recopilación.', polls: 'Abrir la recopilación de encuestas', latest: 'Último punto', fullList: 'Candidatos de la lista seleccionada' },
};
const HEIGHT = 380, LEFT = 42, RIGHT = 18, TOP = 18, BOTTOM = 40;
const time = (s: string) => Date.parse(s + 'T12:00:00Z');

export default function FranceRaceTracker({ contenders, surveys, names, locale, candidateBase, slugs, runDate }: Props) {
  const t = TEXT[locale];
  const figureRef = useRef<HTMLDivElement>(null);
  const [WIDTH, setWidth] = useState(900);
  useEffect(() => {
    if (!figureRef.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(320, Math.min(900, Math.round(entry.contentRect.width)))));
    observer.observe(figureRef.current);
    return () => observer.disconnect();
  }, []);
  const [period, setPeriod] = useUrlParam('fr-months', '6', value => ['3', '6', '12'].includes(value));
  const months = Number(period);
  const candidateIds = contenders.map(c => c.id);
  const [selection, setSelection] = useUrlParam('fr-candidates', candidateIds.join(','), value => value === '' || value.split(',').every(id => candidateIds.includes(id)));
  const selected = selection ? selection.split(',') : [];
  const number = (v: number, decimals = 1) => new Intl.NumberFormat(locale, { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(v);
  const date = (s: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(time(s));
  const end = surveys.at(-1)?.date ?? '1970-01-01';
  const endTime = time(end), startTime = endTime - months * 30.4375 * 86400000;
  const lineups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of surveys) if(time(s.date) >= time(end) - 183 * 86400000) for (const k of new Set(s.variants.map(v => v.key))) counts.set(k, (counts.get(k) ?? 0) + 1);
    return [...counts].filter(([, n]) => n >= 3).sort((a,b) => b[1] - a[1]).slice(0, 14).map(([id, n]) => ({ id, n, label: id.split('|').map(i => names[i] ?? i).join(' · ') }));
  }, [surveys, names, end]);
  const [key, setKey] = useUrlParam('fr-lineup', '', value => lineups.some(l => l.id === value));
  const series = useMemo(() => contenders.filter(c => selected.includes(c.id)).map(c => {
    const all = candidateObservations(surveys, c.id, key);
    const sameColorBefore = contenders.slice(0, contenders.findIndex(a => a.id === c.id)).filter(a => a.color === c.color).length;
    return { ...c, dash: ['', '7 3', '2 3'][sameColorBefore % 3], points: all.filter(p => time(p.date) >= startTime), trend: rollingTrend(all).filter(p => time(p.date) >= startTime) };
  }), [contenders, surveys, selected, key, startTime]);
  const yMax = Math.max(10, Math.ceil(Math.max(0, ...series.flatMap(c => c.points.map(p => p.high))) / 5) * 5);
  const x = (d: string) => LEFT + ((time(d) - startTime) / (endTime - startTime || 1)) * (WIDTH - LEFT - RIGHT);
  const y = (v: number) => HEIGHT - BOTTOM - v / yMax * (HEIGHT - TOP - BOTTOM);
  const rows = series.flatMap(c => c.points.map(p => ({ ...p, candidate: c.name }))).sort((a,b) => b.date.localeCompare(a.date));
  const pollPath = { fr: 'sondages', en: 'polls', es: 'sondeos' }[locale];
  const image = async (format: Format, kind: 'qualification' | 'trend') => {
    const { renderFranceRacePng } = await import('../lib/share/render-client');
    return renderFranceRacePng(format, locale, kind === 'qualification'
      ? { kind, runDate, contenders }
      : { kind, runDate, months, lineup: key ? key.split('|').map(id => names[id] ?? id).join(', ') : '', start: startTime, end: endTime, yMax, series });
  };
  return <div class="fr-race-tracker">
    <section id="fr-qualification" aria-labelledby="fr-qualification-title">
      <h2 id="fr-qualification-title">{t.title}</h2>
      <table class="fr-race-table"><thead><tr><th>{t.candidate}</th><th class="num">{t.qualify}</th><th class="num">{t.vote}</th></tr></thead><tbody>
        {contenders.map(c => <tr key={c.id}><th scope="row"><span class="fr-race-dot" style={{background:c.color}}/><a href={`${candidateBase}/${slugs[c.id]}/`}>{c.name}</a></th><td class="num"><strong>{c.probability >= .995 ? '>99' : c.probability < .01 ? '<1' : number(c.probability * 100, 0)} %</strong></td><td class="num">{number(c.mean)} %</td></tr>)}
      </tbody></table>
      <p class="fr-race-note">{t.note}</p>
      <FranceShareTools locale={locale} anchor="fr-qualification" render={format => image(format, 'qualification')} />
    </section>
    <section id="fr-trend" class="fr-race-trend" aria-labelledby="fr-trend-title">
      <h2 id="fr-trend-title">{t.trend}</h2>
      <div class="fr-race-controls"><label>{t.period}<select aria-label={t.period} value={months} onChange={e => setPeriod(e.currentTarget.value)}>{[3,6,12].map(n => <option value={n} key={n}>{n} {t.months}</option>)}</select></label>
      <label class="fr-race-lineup">{t.lineup}<select aria-label={t.lineup} value={key} onChange={e => setKey(e.currentTarget.value)}><option value="">{t.all}</option>{lineups.map(l => <option value={l.id} key={l.id}>{l.label} ({l.n})</option>)}</select></label></div>
      <p class="fr-race-note">{t.fixed}{key && <> {t.fullList} : {key.split('|').map(i => names[i] ?? i).join(', ')}.</>}</p>
      <div class="fr-race-legend" aria-label={t.candidate}>{contenders.map(c => <button type="button" key={c.id} aria-pressed={selected.includes(c.id)} onClick={() => setSelection(candidateIds.filter(id => id === c.id ? !selected.includes(id) : selected.includes(id)).join(','))}><span class="fr-race-dot" style={{background:c.color}}/>{c.short}</button>)}</div>
      <div class="vs-figure fr-race-figure" ref={figureRef}>
        {rows.length ? <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="fr-trend-svg-title fr-trend-svg-desc"><title id="fr-trend-svg-title">{t.chart}</title><desc id="fr-trend-svg-desc">{t.help}</desc>
          {[0,1,2,3,4].map(i => {const value=yMax*i/4;return <g key={i}><line class="fr-race-grid" x1={LEFT} x2={WIDTH-RIGHT} y1={y(value)} y2={y(value)}/><text x={LEFT-8} y={y(value)+4} text-anchor="end">{number(value,0)} %</text></g>})}
          {[0,1,2,3].map(i => {const v=startTime+(endTime-startTime)*i/3;return <text key={i} x={LEFT+(WIDTH-LEFT-RIGHT)*i/3} y={HEIGHT-12} text-anchor={i===0?'start':i===3?'end':'middle'}>{new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',timeZone:'UTC'}).format(v)}</text>})}
          {series.map(c => <g key={c.id} data-candidate={c.id}>
            {c.trend.map((p,i) => i > 0 && time(p.date)-time(c.trend[i-1].date) <= 60*86400000 ? <line key={`t${i}`} x1={x(c.trend[i-1].date)} x2={x(p.date)} y1={y(c.trend[i-1].value)} y2={y(p.value)} stroke={c.color} stroke-width="2.5" stroke-dasharray={c.dash}/> : null)}
            {c.points.map((p,i) => <g key={i}><title>{c.name} · {p.firm} · {date(p.date)} : {number(p.mean)} % ({number(p.low)}–{number(p.high)} %)</title><line x1={x(p.date)} x2={x(p.date)} y1={y(p.low)} y2={y(p.high)} stroke={c.color} opacity="0.45"/><circle cx={x(p.date)} cy={y(p.mean)} r="3" fill={c.color} opacity="0.7"/></g>)}
          </g>)}
        </svg> : <p role="status">{t.empty}</p>}
      </div>
      <p class="fr-race-note">{t.help}</p>
      <div class="fr-race-last">{series.map(c => {const p=c.points.at(-1);return p ? <span key={c.id}><span class="fr-race-dot" style={{background:c.color}}/>{c.short} <strong>{number(p.mean)} %</strong> · {date(p.date)}</span>:null})}</div>
      <FranceShareTools locale={locale} anchor="fr-trend" render={format => image(format, 'trend')} disabled={!rows.length} />
      <p class="fr-race-note">{t.source} <a href={`/${locale}/france/${pollPath}/`}>{t.polls}</a></p>
      <details><summary>{t.data}</summary><div class="table-scroll"><table class="fr-race-table"><thead><tr><th>{t.date}</th><th>{t.firm}</th><th>{t.candidate}</th><th>{t.share}</th></tr></thead><tbody>{rows.map((p,i) => <tr key={i}><td>{date(p.date)}</td><td><a href={p.url}>{p.firm}</a></td><td>{p.candidate}</td><td>{number(p.mean)} % ({number(p.low)}–{number(p.high)} %)</td></tr>)}</tbody></table></div></details>
    </section>
  </div>;
}
