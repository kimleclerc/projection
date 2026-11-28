// Titre, description et réponses courtes d'une fiche candidat (France 2027).
// Tout vient des données du run : le dernier sondage, la moyenne sur 30 jours
// et la projection du tableau de la page France.
import { fmtPct1, type Locale } from './fr-pres.ts';
import type { CandidateProfile } from './fr-candidates';

type Input = Pick<CandidateProfile, 'name' | 'archived' | 'runDate' | 'polling' | 'weighted'>;
export interface CandidateAnswer { question: string; answer: string; }

const INTL: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };
const day = (iso: string, locale: Locale, month: 'long' | 'short') =>
  new Intl.DateTimeFormat(INTL[locale], { day: 'numeric', month, ...(month === 'long' ? { year: 'numeric' } : {}), timeZone: 'UTC' })
    .format(new Date(iso.slice(0, 10) + 'T00:00:00Z'))
    .replace(locale === 'fr' ? /^1 / : /(?!)/, '1er ');

/** Un score publié, sans décimale inutile : « 8 % », « 9 à 10 % ». */
export function fmtPollRange(min: number, max: number, locale: Locale): string {
  const n = (v: number) => new Intl.NumberFormat(INTL[locale], { maximumFractionDigits: 1 }).format(v);
  const unit = locale === 'en' ? '%' : ' %';
  if (min === max) return `${n(min)}${unit}`;
  const join = { fr: ' à ', en: '–', es: ' a ' }[locale];
  return `${n(min)}${join}${n(max)}${unit}`;
}

/** Mêmes seuils que le tableau de la page France. */
export function fmtChance(p: number, locale: Locale): string {
  const value = p >= 0.995 ? '>99' : p < 0.01 ? '<1' : String(Math.round(p * 100));
  return `${value}${locale === 'en' ? '%' : ' %'}`;
}

const COPY = {
  fr: {
    fallbackTitle: (n: string) => `${n} : sondages présidentielle 2027 et second tour — Vote-Scope`,
    title: (n: string, v: string, f: string, d: string) => `Sondage ${n} 2027 : ${v} (${f}, ${d})`,
    descLatest: (n: string, v: string, f: string, d: string) => `${n} : ${v} au premier tour selon ${f} (${d}).`,
    descAverage: (v: string) => `Moyenne sur 30 jours : ${v}.`,
    descChance: (p: string) => `Chances de second tour selon notre modèle : ${p}.`,
    updated: (d: string) => `Mise à jour le ${d}.`,
    qLatest: (n: string) => `Quel est le dernier sondage sur ${n} ?`,
    aLatest: (v: string, f: string, d: string, h: number) => `${f}, ${d} : ${v} des intentions de vote au premier tour${h > 1 ? `, selon les ${h} listes testées` : ''}.`,
    noPoll: 'Aucune intention de vote publiée dans les 90 derniers jours dans notre base.',
    lastKnown: (d: string) => `Dernière mesure connue : ${d}.`,
    qAverage: (n: string) => `Quelle moyenne pour ${n} dans les sondages ?`,
    aAverage: (v: string, k: number) => `${v} en moyenne au premier tour sur les 30 derniers jours (${k} enquêtes, à poids égal).`,
    noAverage: 'Moins de deux enquêtes sur les 30 derniers jours : aucune moyenne n’est calculée.',
    qRunoff: (n: string) => `Quelles chances de second tour pour ${n} ?`,
    aRunoff: (p: string, v: string) => `${p} selon notre modèle, avec ${v} au premier tour, dans les listes récemment sondées qui incluent cette candidature.`,
    noRunoff: 'Aucune projection actuelle pour cette candidature. Une absence de mesure ne vaut pas 0 %.',
  },
  en: {
    fallbackTitle: (n: string) => `${n}: 2027 French Election Polls & Runoff Odds — Vote-Scope`,
    title: (n: string, v: string, f: string, d: string) => `${n} 2027 polls: ${v} (${f}, ${d})`,
    descLatest: (n: string, v: string, f: string, d: string) => `${n}: ${v} in the first round according to ${f} (${d}).`,
    descAverage: (v: string) => `30-day average: ${v}.`,
    descChance: (p: string) => `Chance of reaching the runoff in our model: ${p}.`,
    updated: (d: string) => `Updated ${d}.`,
    qLatest: (n: string) => `What is the latest poll on ${n}?`,
    aLatest: (v: string, f: string, d: string, h: number) => `${f}, ${d}: ${v} of first-round voting intention${h > 1 ? `, across the ${h} lineups tested` : ''}.`,
    noPoll: 'No published first-round voting intention in our database over the last 90 days.',
    lastKnown: (d: string) => `Last known observation: ${d}.`,
    qAverage: (n: string) => `What is ${n}’s polling average?`,
    aAverage: (v: string, k: number) => `${v} on average in the first round over the last 30 days (${k} surveys, equally weighted).`,
    noAverage: 'Fewer than two surveys in the last 30 days: no average is calculated.',
    qRunoff: (n: string) => `What are ${n}’s chances of reaching the runoff?`,
    aRunoff: (p: string, v: string) => `${p} in our model, with ${v} in the first round, across recently polled lineups that include this candidate.`,
    noRunoff: 'No current forecast for this candidate. Missing data does not mean 0%.',
  },
  es: {
    fallbackTitle: (n: string) => `${n}: encuestas presidenciales Francia 2027 y segunda vuelta — Vote-Scope`,
    title: (n: string, v: string, f: string, d: string) => `Encuestas ${n} 2027: ${v} (${f}, ${d})`,
    descLatest: (n: string, v: string, f: string, d: string) => `${n}: ${v} en primera vuelta según ${f} (${d}).`,
    descAverage: (v: string) => `Media de 30 días: ${v}.`,
    descChance: (p: string) => `Probabilidad de pasar a la segunda vuelta según nuestro modelo: ${p}.`,
    updated: (d: string) => `Actualizado el ${d}.`,
    qLatest: (n: string) => `¿Cuál es la última encuesta sobre ${n}?`,
    aLatest: (v: string, f: string, d: string, h: number) => `${f}, ${d}: ${v} de intención de voto en primera vuelta${h > 1 ? `, según las ${h} listas probadas` : ''}.`,
    noPoll: 'No hay intención de voto publicada en nuestra base durante los últimos 90 días.',
    lastKnown: (d: string) => `Última observación conocida: ${d}.`,
    qAverage: (n: string) => `¿Cuál es la media de ${n} en las encuestas?`,
    aAverage: (v: string, k: number) => `${v} de media en primera vuelta en los últimos 30 días (${k} encuestas, con igual peso).`,
    noAverage: 'Menos de dos encuestas en los últimos 30 días: no se calcula ninguna media.',
    qRunoff: (n: string) => `¿Qué probabilidades tiene ${n} de pasar a la segunda vuelta?`,
    aRunoff: (p: string, v: string) => `${p} según nuestro modelo, con un ${v} en primera vuelta, en las listas sondeadas recientemente que incluyen esta candidatura.`,
    noRunoff: 'No hay proyección actual para esta candidatura. La falta de datos no significa 0 %.',
  },
} as const;

/** `statement` : la phrase de statut de la fiche (« X a déclaré sa candidature. »). */
export function candidateSeo(c: Input, locale: Locale, statement: string) {
  const t = COPY[locale];
  const updated = t.updated(day(c.runDate, locale, 'long'));
  // Une candidature terminée garde son titre d'archive et n'affiche aucune réponse « actuelle ».
  if (c.archived) return { title: t.fallbackTitle(c.name), description: `${statement} ${updated}`, answers: [] as CandidateAnswer[] };

  const latest = c.polling.recent[0];
  const average = c.polling.average30 ? fmtPct1(c.polling.average30.value, locale) : null;
  const chance = c.weighted ? fmtChance(c.weighted.pTop2, locale) : null;
  const score = latest ? fmtPollRange(latest.min, latest.max, locale) : null;

  const title = latest && score ? t.title(c.name, score, latest.firm, day(latest.date, locale, 'short')) : t.fallbackTitle(c.name);
  const description = [
    latest && score ? t.descLatest(c.name, score, latest.firm, day(latest.date, locale, 'long')) : `${statement} ${t.noPoll}`,
    average && t.descAverage(average),
    chance && t.descChance(chance),
    updated,
  ].filter(Boolean).join(' ');

  const answers: CandidateAnswer[] = [
    { question: t.qLatest(c.name), answer: latest && score
      ? t.aLatest(score, latest.firm, day(latest.date, locale, 'long'), latest.hypotheses)
      : [t.noPoll, c.polling.lastFieldEnd && t.lastKnown(day(c.polling.lastFieldEnd, locale, 'long'))].filter(Boolean).join(' ') },
    { question: t.qAverage(c.name), answer: average ? t.aAverage(average, c.polling.average30!.surveys) : t.noAverage },
    { question: t.qRunoff(c.name), answer: chance ? t.aRunoff(chance, fmtPct1(c.weighted!.mean, locale)) : t.noRunoff },
  ];
  return { title, description, answers };
}
