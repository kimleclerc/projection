import assert from 'node:assert/strict';
import {observedPolling} from '../src/lib/fr-candidate-metrics.ts';
const p=(id,date,share,firm='a',released=date)=>({poll_id:id,firm,firm_name:firm,release_date:released,field_end:date,entries:share===null?[]:[{id:'x',share}]});
let d=observedPolling('x',[p('a','2026-11-17',9),p('b','2026-11-17',10),p('old','2026-01-01',1),p('future','2026-11-19',99),p('unpublished','2026-11-17',88,'b','2026-11-19')],'2026-11-18');
assert.equal(d.floor,9);assert.equal(d.ceiling,10);assert.equal(d.hypotheses,2);assert.equal(d.surveys,1);assert.equal(d.recent[0].hypotheses,2);
d=observedPolling('x',[p('a','2026-01-01',5)],'2026-11-18');assert.equal(d.floor,null);assert.equal(d.lastFieldEnd,'2026-01-01');
d=observedPolling('x',[p('zero','2026-11-17',0)],'2026-11-18');assert.equal(d.floor,0);assert.equal(d.ceiling,0);
d=observedPolling('x',[p('missing','2026-11-17',null)],'2026-11-18');assert.equal(d.floor,null);assert.equal(d.lastFieldEnd,null);
console.log('Metrics: 4 edge cases passed (physical survey grouping, future/unpublished data, stale or missing data, genuine zero).');

import {readFileSync} from 'node:fs';
const load=name=>JSON.parse(readFileSync(new URL('../web_data/france-presidential/'+name,import.meta.url),'utf8'));
const latest=load('latest.json'), sheets=load('data_sheets.json'), polls=load('polls.json');
assert.match(latest.meta.run_date,/^\d{4}-\d{2}-\d{2}/);
assert.equal(new Set(sheets.candidates.map(c=>c.candidate_id)).size,sheets.candidates.length,'duplicate candidate IDs');
let checked=0;
for(const c of sheets.candidates){
 const stats=observedPolling(c.candidate_id,polls.first_round,latest.meta.run_date);
 assert.equal(stats.floor===null,stats.ceiling===null,c.candidate_id);
 if(stats.floor!==null)assert.ok(stats.floor<=stats.ceiling,c.candidate_id);
 if(['declared','probable','primary','primary_lost'].includes(c.status)){
  assert.equal(c.profile_visible,true,`${c.candidate_id}: missing public profile`);
  assert.match(c.status_reviewed_on||'',/^\d{4}-\d{2}-\d{2}$/,`${c.candidate_id}: editorial review date missing`);
  assert.ok(c.status_source_url?.startsWith('https://'),`${c.candidate_id}: status source missing`);
 }
 if(['withdrawn','declined','primary_lost'].includes(c.status))assert.equal(c.featured_scenarios,0,`${c.candidate_id}: ended candidacy still modelled`);
 checked++;
}
const ids=new Set(sheets.candidates.map(c=>c.candidate_id));
for(const p of polls.first_round)for(const e of p.entries)assert.ok(ids.has(e.id),`${e.id}: poll references an unknown candidate`);
console.log(`France candidate checks: ${checked} registry entries verified against the current run and poll payload.`);
