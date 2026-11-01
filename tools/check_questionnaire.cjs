/* Dependency-free definition, export and integration regression checks. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'site/questionnaire-demo');
const api=require(path.join(dir,'definition.js'));
const catalog=JSON.parse(fs.readFileSync(path.join(dir,'questionnaires.v1.json'),'utf8'));
api.validate(catalog);
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS',name);}
const clone=()=>JSON.parse(JSON.stringify(catalog));
test('stable questionnaire/question/option IDs and versioned exports for all topics',()=>{
 for(const q of catalog.questionnaires){
  const answers=Object.fromEntries(q.questions.map((x,i)=>[x.id,i===1?null:x.options[0].id]));
  const r=api.createRecord(q,answers);assert.equal(r.questionnaireId,q.id);assert.equal(r.questionnaireVersion,'1.0.0');assert.equal(r.schemaVersion,2);
  assert.equal(r.responses[1].optionId,null);assert.equal(r.responses[1].skipped,true);
  q.questions.forEach((x,i)=>{assert.equal(r.responses[i].questionId,x.id);assert.equal(r.responses[i].optionId,i===1?null:x.options[0].id);});
  const text=api.toText(r);assert.ok(text.includes(q.id));assert.ok(text.includes('Version: 1.0.0'));for(const x of q.questions)assert.ok(text.includes('['+x.id+']'));assert.match(text,/DEMONSTRATION ONLY/);
  const skipped=api.createRecord(q,{});assert.ok(skipped.responses.every(x=>x.skipped&&x.answer===null&&x.optionId===null));assert.deepEqual(r.result,skipped.result);
  assert.throws(()=>api.createRecord(q,{[q.questions[0].id]:'unknown-option'}),/Unknown option/);
 }
});
test('definition validation rejects real/unreviewed instruments and duplicate or missing IDs',()=>{
 for(const mutate of [c=>c.schemaVersion=2,c=>c.questionnaires[0].demonstrationOnly=false,c=>c.questionnaires[0].review.status='reviewed-real',c=>c.questionnaires[0].result.type='score',c=>c.questionnaires[0].questions[0].optional=false,c=>c.questionnaires[0].version='latest',c=>c.questionnaires[0].questions[0].id='',c=>c.questionnaires[0].questions.push(c.questionnaires[0].questions[0]),c=>c.questionnaires[0].questions[0].options.push(c.questionnaires[0].questions[0].options[0]),c=>c.questionnaires.push(c.questionnaires[0])]){const c=clone();mutate(c);assert.throws(()=>api.validate(c));}
});
test('IDs remain stable when questionnaire, question and option order changes',()=>{
 const reordered=clone();reordered.questionnaires.reverse();for(const q of reordered.questionnaires){q.questions.reverse();q.questions.forEach(x=>x.options.reverse());}api.validate(reordered);
 for(const q of catalog.questionnaires){const answers=Object.fromEntries(q.questions.map(x=>[x.id,x.options[0].id]));const a=api.createRecord(q,answers),b=api.createRecord(reordered.questionnaires.find(x=>x.id===q.id),answers);assert.deepEqual(Object.fromEntries(a.responses.map(x=>[x.questionId,x.optionId])),Object.fromEntries(b.responses.map(x=>[x.questionId,x.optionId])));}
});
test('component CSS cannot target other pages',()=>{
 const css=fs.readFileSync(path.join(dir,'hub.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 for(const m of css.matchAll(/([^{}]+)\{/g)){const selector=m[1].trim();if(selector.startsWith('@'))continue;assert.ok(selector.startsWith('#mjb-questionnaire-hub')||selector.startsWith('body[data-page="questionnaire-demo"]'),selector);}
 assert.doesNotMatch(css,/:root|@font-face/);
});
test('shared controls are loaded directly; answer engine has no storage or answer submission',()=>{
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),js=fs.readFileSync(path.join(dir,'hub.js'),'utf8');
 for(const file of ['/js/accessibility.js','/js/navigation.js','/js/navigation-data.js','/css/accessibility.css','/css/navigation.css'])assert.ok(html.includes(file));
 assert.doesNotMatch(js,/localStorage|sessionStorage|sendBeacon|XMLHttpRequest|method\s*:\s*['"]POST/);assert.equal((js.match(/fetch\(/g)||[]).length,1);assert.match(js,/questionnaires\.v1\.json/);assert.doesNotMatch(js,/const palettes|const prefs/);
});
test('all pre-existing navigation destinations remain available',()=>{
 const read=s=>{const c={window:{}};vm.runInNewContext(s,c);return c.window.MJB_NAV;};
 const before=read(cp.execFileSync('git',['show','origin/main:site/js/navigation-data.js'],{cwd:root,encoding:'utf8',maxBuffer:4e6})),after=read(fs.readFileSync(path.join(root,'site/js/navigation-data.js'),'utf8'));
 for(const [url,entry] of Object.entries(before.entries)){assert.ok(after.entries[url],url);assert.equal(after.entries[url].url,entry.url);assert.equal(after.entries[url].title,entry.title);}
 assert.ok(after.entries['/questionnaire-demo/']);assert.ok(after.global.some(x=>x.url==='/questionnaire-demo/'));
});
console.log(`${checks} check groups passed. Browser/PDF checks are recorded separately.`);
