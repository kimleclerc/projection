import { useMemo, useState } from 'preact/hooks';
import { partyLabel, radarCopy, type RadarLocale } from '../data/latinoRadar';

type Component = { key: string; labels: Record<RadarLocale, string>; score: number; weight: number };
type Race = {
  office: 'house' | 'senate';
  rank: number;
  name: string;
  score: number;
  urls: Record<RadarLocale, string>;
  eligibility: { verified_candidate: boolean };
  projection: { winner: string; p_winner: number };
  movement_7d: { delta_probability_points: number };
  components: Component[];
  reason_keys: string[];
};

export default function LatinoRadarTable({ races, locale }: { races: Race[]; locale: RadarLocale }) {
  const copy = radarCopy[locale];
  const [filter, setFilter] = useState<'all' | 'house' | 'senate' | 'candidate' | 'close'>('all');
  const [sort, setSort] = useState<'rank' | 'score' | 'movement'>('rank');
  const [limit, setLimit] = useState(30);

  const visible = useMemo(() => races.filter((race) => {
    if (filter === 'house' || filter === 'senate') return race.office === filter;
    if (filter === 'candidate') return race.eligibility.verified_candidate;
    if (filter === 'close') return race.projection.p_winner <= 0.6;
    return true;
  }).sort((a, b) => {
    if (sort === 'score') return b.score - a.score;
    if (sort === 'movement') return Math.abs(b.movement_7d.delta_probability_points) - Math.abs(a.movement_7d.delta_probability_points);
    return a.rank - b.rank;
  }), [filter, sort, races]);

  const filters = [
    ['all', copy.all],
    ['house', copy.house],
    ['senate', copy.senate],
    ['candidate', copy.candidates],
    ['close', copy.close],
  ] as const;

  return <div class="radar-explorer">
    <div class="radar-controls" aria-label="Radar controls">
      <div class="radar-filters">
        {filters.map(([key, label]) =>
          <button type="button" class={filter === key ? 'active' : ''} aria-pressed={filter === key} onClick={() => { setFilter(key); setLimit(30); }}>{label}</button>
        )}
      </div>
      <label class="radar-sort">
        <span>{copy.score}</span>
        <select value={sort} onChange={(event) => setSort((event.currentTarget as HTMLSelectElement).value as typeof sort)}>
          <option value="rank">{copy.rank}</option>
          <option value="score">{copy.score}</option>
          <option value="movement">{copy.movement}</option>
        </select>
      </label>
    </div>

    <div class="radar-table" role="table" aria-label={copy.title}>
      <div class="radar-row radar-head" role="row">
        <span role="columnheader">{copy.rank}</span>
        <span role="columnheader">{copy.race}</span>
        <span role="columnheader">{copy.why}</span>
        <span role="columnheader">{copy.projection}</span>
        <span role="columnheader">{copy.movement}</span>
        <span role="columnheader">{copy.score}</span>
      </div>
      {visible.slice(0, limit).map((race) => {
        const reasons = race.components
          .filter((component) => race.reason_keys.includes(component.key))
          .map((component) => component.labels[locale])
          .join(' · ');
        const movement = race.movement_7d.delta_probability_points;
        return <a class="radar-row radar-data-row" role="row" href={race.urls[locale]}>
          <span class="radar-rank" role="cell">#{race.rank}</span>
          <span class="radar-race" role="cell">
            <strong>{race.name}</strong>
            <small>{race.office === 'house' ? copy.house : copy.senate}</small>
          </span>
          <span class="radar-why" role="cell">{reasons}</span>
          <span class="radar-projection" role="cell">
            <b class={race.projection.winner === 'us_dem' ? 'party-dem' : 'party-rep'}>{partyLabel(race.projection.winner, locale)}</b>
            {' '}{Math.round(race.projection.p_winner * 100)}%
          </span>
          <span class={`radar-movement ${movement > 0 ? 'up' : movement < 0 ? 'down' : ''}`} role="cell">
            {movement > 0 ? '+' : ''}{movement.toFixed(1)}
          </span>
          <span class="radar-score" role="cell"><strong>{race.score.toFixed(1)}</strong><small>/100</small></span>
        </a>;
      })}
    </div>
    <div class="radar-pagination">
      <p class="radar-count">{Math.min(limit, visible.length)} / {visible.length}</p>
      {limit < visible.length && <button type="button" onClick={() => setLimit(limit + 30)}>{copy.showMore}</button>}
    </div>
  </div>;
}
