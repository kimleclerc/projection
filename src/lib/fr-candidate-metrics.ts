// Pure metrics: missing observations stay missing; model priors are never polls.
export interface PollRow {
  poll_id: string; firm: string; firm_name: string; release_date: string | null;
  field_end: string | null; source_url?: string | null; entries: {id: string; share: number}[];
}
export function observedPolling(id: string, rows: PollRow[], asOf: string, days = 90) {
  const end = Date.parse(asOf.slice(0, 10) + 'T00:00:00Z');
  const start = end - days * 86400000;
  const valid = rows.flatMap(p => {
    const date = p.field_end || p.release_date;
    const time = Date.parse((date || '').slice(0, 10) + 'T00:00:00Z');
    const entry = p.entries.find(e => e.id === id);
    if (!entry || !Number.isFinite(entry.share) || entry.share < 0 || entry.share > 100 || !Number.isFinite(time) || time > end || (p.release_date && p.release_date.slice(0, 10) > asOf.slice(0, 10))) return [];
    return [{...p, date: date!.slice(0, 10), time, share: entry.share}];
  }).sort((a, b) => b.date.localeCompare(a.date) || (b.release_date || '').localeCompare(a.release_date || ''));
  const recent = valid.filter(p => p.time >= start);
  const surveys = new Map<string, {firm: string; date: string; release: string; min: number; max: number; hypotheses: number; sum: number; source: string | null}>();
  for (const p of recent) {
    const key = `${p.firm}|${p.date}`;
    const previous = surveys.get(key);
    if (previous) {previous.min = Math.min(previous.min, p.share); previous.max = Math.max(previous.max, p.share); previous.hypotheses++; previous.sum += p.share;}
    else surveys.set(key, {firm: p.firm_name, date: p.date, release: p.release_date || p.date, min: p.share, max: p.share, hypotheses: 1, sum: p.share, source: p.source_url || null});
  }
  // Same method as the trend line on the France desk: one value per survey, last 30 days, at least two surveys.
  const month = [...surveys.values()].filter(s => end - Date.parse(s.date + 'T00:00:00Z') <= 30 * 86400000);
  const average30 = month.length >= 2 ? {value: month.reduce((sum, s) => sum + s.sum / s.hypotheses, 0) / month.length, surveys: month.length} : null;
  return {
    average30,
    floor: recent.length ? Math.min(...recent.map(p => p.share)) : null,
    ceiling: recent.length ? Math.max(...recent.map(p => p.share)) : null,
    hypotheses: recent.length, surveys: surveys.size,
    lastFieldEnd: valid[0]?.date || null,
    recent: [...surveys.values()].slice(0, 5),
    since: new Date(start).toISOString().slice(0, 10),
  };
}
