import { blocHex } from './fr-pres.ts';

export interface Contender { id: string; name: string; short: string; color: string; probability: number; mean: number; tests: number; }
export interface Survey { date: string; firm: string; url: string; variants: { key: string; entries: { id: string; share: number }[] }[]; }
export interface Observation { date: string; firm: string; url: string; mean: number; low: number; high: number; }
export const lineupKey = (entries: { id: string }[]) => entries.map(e => e.id).sort().join('|');

/** Each candidate is conditioned on being present, rather than treated as zero when absent. */
export function rankContenders(scenarios: any[], candidates: any[]): Contender[] {
  const meta = new Map(candidates.map(c => [c.candidate_id, c]));
  const totals = new Map<string, Contender>();
  for (const s of scenarios) {
    const w = s.scenario?.n_polls_recent ?? 0;
    if (!s.scenario?.featured || w <= 0) continue;
    for (const q of s.qualification ?? []) {
      if (!Number.isFinite(q.p_top2) || !Number.isFinite(q.first_round_mean)) continue;
      const id = q.candidate_id;
      const c = meta.get(id);
      const t = totals.get(id) ?? { id, name: q.candidate_name, short: c?.short_label ?? q.candidate_name, color: blocHex(q.bloc), probability: 0, mean: 0, tests: 0 };
      t.probability += w * q.p_top2; t.mean += w * q.first_round_mean; t.tests += w;
      totals.set(id, t);
    }
  }
  return [...totals.values()].map(t => ({ ...t, probability: t.probability / t.tests, mean: t.mean / t.tests }))
    .sort((a, b) => b.probability - a.probability || b.mean - a.mean);
}

export function prepareSurveys(polls: any[], candidateIds?: string[]): Survey[] {
  const last = polls.reduce((date, p) => p.field_end > date ? p.field_end : date, '1970-01-01');
  const earliest = Date.parse(last + 'T12:00:00Z') - 397 * 86400000;
  return polls.filter(p => Date.parse((p.field_end ?? '') + 'T12:00:00Z') >= earliest).filter(p => /^\d{4}-\d{2}-\d{2}$/.test(p.field_end ?? '')).map(p => ({
    date: p.field_end, firm: p.firm_name, url: p.source_url,
    variants: (p.scenarios ?? []).map((s: any) => ({ key: lineupKey(s.entries ?? []), entries: (s.entries ?? []).filter((e: any) => !candidateIds || candidateIds.includes(e.id)) })),
  })).sort((a, b) => a.date.localeCompare(b.date));
}

/** One observation per survey; multiple hypothetical lineups are not independent polls. */
export function candidateObservations(surveys: Survey[], id: string, key = ''): Observation[] {
  return surveys.flatMap(s => {
    const values = s.variants.filter(v => !key || v.key === key).flatMap(v => v.entries.filter(e => e.id === id && Number.isFinite(e.share)).map(e => e.share));
    return values.length ? [{ date: s.date, firm: s.firm, url: s.url, mean: values.reduce((a,b) => a+b, 0) / values.length, low: Math.min(...values), high: Math.max(...values) }] : [];
  });
}

export function rollingTrend(points: Observation[], days = 30): { date: string; value: number }[] {
  const dates = [...new Set(points.map(p => p.date))];
  return dates.flatMap(date => {
    const end = Date.parse(date + 'T12:00:00Z');
    const sample = points.filter(p => { const age = end - Date.parse(p.date + 'T12:00:00Z'); return age >= 0 && age <= days * 86400000; });
    return sample.length >= 2 ? [{ date, value: sample.reduce((sum, p) => sum + p.mean, 0) / sample.length }] : [];
  });
}
