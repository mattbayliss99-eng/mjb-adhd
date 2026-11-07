import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {scoreProfile,resultText} from './scoring.mjs';
const {profiles}=JSON.parse(readFileSync(new URL('./profiles.json',import.meta.url)));
const answers=(p,v)=>Object.fromEntries(p.domains.flatMap(d=>d.questions.map(q=>[q.id,v])));
for(const p of profiles){
 test(p.id+': empty is incomplete, never is not missing',()=>{assert.ok(scoreProfile(p,{}).domains.every(d=>d.mean===null));assert.ok(scoreProfile(p,answers(p,'never')).domains.every(d=>d.mean===0));});
 test(p.id+': high frequencies and complete result',()=>{const r=scoreProfile(p,answers(p,'often'));assert.equal(r.complete,true);assert.ok(r.domains.every(d=>d.mean===3&&d.band==='frequently-reported'));assert.match(resultText(r),/does not establish a diagnosis/);});
 test(p.id+': skip prevents a domain score',()=>{const a=answers(p,'very-often');a[p.domains[0].questions[0].id]='not-sure';const r=scoreProfile(p,a);assert.equal(r.domains[0].mean,null);assert.equal(r.complete,false);assert.equal(r.domains[1].mean,4);});
 test(p.id+': invalid data rejected',()=>{assert.throws(()=>scoreProfile(p,{unknown:'never'}));const a=answers(p,'never');a[p.domains[0].questions[0].id]=4;assert.throws(()=>scoreProfile(p,a));});
 test(p.id+': band boundaries',()=>{for(const [v,band] of [['never','rarely-reported'],['rarely','occasionally-reported'],['sometimes','sometimes-reported'],['often','frequently-reported'],['very-often','frequently-reported']])assert.ok(scoreProfile(p,answers(p,v)).domains.every(d=>d.band===band));});
}
test('mixed answers are averaged, not summed across profiles',()=>{const p=profiles[0],a=answers(p,'never');const qs=p.domains[0].questions;a[qs[0].id]='sometimes';a[qs[1].id]='often';a[qs[2].id]='very-often';assert.equal(scoreProfile(p,a).domains[0].mean,3);});
