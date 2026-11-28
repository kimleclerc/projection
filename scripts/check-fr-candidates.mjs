import assert from 'node:assert/strict';
import {observedPolling} from '../src/lib/fr-candidate-metrics.ts';
import {candidateSeo} from '../src/lib/fr-candidate-seo.ts';
const p=(id,date,share,firm='a',released=date)=>({poll_id:id,firm,firm_name:firm,release_date:released,field_end:date,entries:share===null?[]:[{id:'x',share}]});
let d=observedPolling('x',[p('a','2026-11-17',9),p('b','2026-11-17',10),p('old','2026-01-01',1),p('future','2026-11-19',99),p('unpublished','2026-11-17',88,'b','2026-11-19')],'2026-11-18');
assert.equal(d.floor,9);assert.equal(d.ceiling,10);assert.equal(d.hypotheses,2);assert.equal(d.surveys,1);assert.equal(d.recent[0].hypotheses,2);
d=observedPolling('x',[p('a','2026-01-01',5)],'2026-11-18');assert.equal(d.floor,null);assert.equal(d.lastFieldEnd,'2026-01-01');
d=observedPolling('x',[p('zero','2026-11-17',0)],'2026-11-18');assert.equal(d.floor,0);assert.equal(d.ceiling,0);
d=observedPolling('x',[p('missing','2026-11-17',null)],'2026-11-18');assert.equal(d.floor,null);assert.equal(d.lastFieldEnd,null);
// 30-day average: one value per survey, at least two surveys, older polls excluded.
d=observedPolling('x',[p('a','2026-11-17',8),p('b','2026-11-17',10),p('c','2026-11-10',15,'b'),p('old','2026-10-01',40,'c')],'2026-11-18');
assert.deepEqual(d.average30,{value:12,surveys:2});
assert.equal(observedPolling('x',[p('a','2026-11-17',8)],'2026-11-18').average30,null);
// Titles and answers: never a "current" figure for an ended candidacy or a missing poll.
const sheet=(over={})=>({name:'Édouard X',archived:false,runDate:'2026-11-18',weighted:{mean:13.04,pTop2:0.19},polling:observedPolling('x',[p('a','2026-11-17',9),p('b','2026-11-17',10.5)],'2026-11-18'),...over});
let seo=candidateSeo(sheet(),'fr','Statut.');
assert.equal(seo.title,'Sondage Édouard X 2027 : 9 à 10,5\u00a0% (a, 17 nov.)');
assert.equal(seo.answers.length,3);assert.match(seo.answers[2].answer,/^19\u00a0% selon notre modèle, avec 13,0\u00a0%/);
seo=candidateSeo(sheet({archived:true}),'fr','Statut.');assert.equal(seo.answers.length,0);assert.doesNotMatch(seo.title,/%/);assert.doesNotMatch(seo.description,/%/);
seo=candidateSeo(sheet({weighted:null,polling:observedPolling('x',[],'2026-11-18')}),'en','Status.');assert.doesNotMatch(seo.title+seo.description+seo.answers.slice(0,2).map(a=>a.answer).join(),/\d%/);
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
