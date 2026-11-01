/* Loads public definition only. Answers never leave memory except explicit local exports. */
(() => {
'use strict';
const component=document.getElementById('mjb-questionnaire-hub');if(!component)return;
const app=component.querySelector('#hub-app'),status=component.querySelector('#hub-status');
const contract=window.MJBQuestionnaireDefinition;
let catalog,topic=null,step=0,answers={},view='topics';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function announce(message){status.textContent=message;}
function answered(){return topic.questions.filter(q=>answers[q.id]!=null).length;}
function render(focus=true){
 window.MJBReading?.stop();
 if(view==='topics')app.innerHTML='<h2 tabindex="-1">1. Choose a demonstration topic</h2><p>Each topic has three optional questions. Take as long as you like.</p><div class="hub-topics">'+catalog.questionnaires.map(t=>`<button type="button" class="hub-topic" data-topic="${t.id}"><strong>${esc(t.title)}</strong><span>${esc(t.description)}</span></button>`).join('')+'</div><p>Every topic leads to the same fixed fictional result. There is no score.</p>';
 if(view==='questions'){
 const q=topic.questions[step];
 app.innerHTML=`<p class="hub-subtle">${esc(topic.title)} · ${esc(topic.id)} · v${esc(topic.version)}</p><p>Question ${step+1} of ${topic.questions.length} · ${answered()} answered</p><label for="hub-progress">Question position</label><progress id="hub-progress" max="${topic.questions.length}" value="${step+1}">${step+1} of ${topic.questions.length}</progress><form id="hub-question"><fieldset><legend tabindex="-1">${esc(q.prompt)}</legend><p id="hub-optional">Optional. Choose one answer, or skip this question.</p>${q.options.map(o=>`<label class="hub-option"><input type="radio" name="hub-answer" value="${o.id}" aria-describedby="hub-optional" ${answers[q.id]===o.id?'checked':''}><span>${esc(o.label)}</span></label>`).join('')}</fieldset><div class="hub-actions"><button type="button" data-action="back">${step===0?'Change topic':'Back'}</button><button type="button" data-action="skip">Skip question</button><button class="hub-primary" type="submit">${step===topic.questions.length-1?'View sample results':'Next question'}</button></div></form><p class="hub-subtle">Changing topic clears this attempt. Back keeps your selections.</p><button type="button" data-action="clear">Clear answers &amp; start again</button>`;
 }
 if(view==='results'){
 const r=contract.createRecord(topic,answers);
 app.innerHTML=`<p class="hub-print-only">MJB ADHD · QUESTIONNAIRE DEMONSTRATION ONLY</p><h2 tabindex="-1">Your demonstration summary</h2><p>${esc(topic.title)} · ${answered()} of ${topic.questions.length} answered.</p><p class="hub-subtle">Questionnaire ID: ${esc(r.questionnaireId)}<br>Questionnaire version: ${esc(r.questionnaireVersion)}</p><div class="hub-result"><strong>${esc(r.result.title)}</strong><p>${esc(r.result.explanation)}</p></div><h3>Your selections</h3><dl>${r.responses.map(x=>`<div class="hub-response"><dt>${esc(x.question)}</dt><dd>${esc(x.answer??'Skipped')}</dd><dd class="hub-subtle">Question ID: ${esc(x.questionId)} · Option ID: ${esc(x.optionId??'none (skipped)')}</dd></div>`).join('')}</dl><div class="hub-export"><h3>Keep a local copy</h3><p>Text and JSON download to your device. Print opens your browser’s print dialog; choose Save as PDF if available. There is no direct PDF generator.</p><div class="hub-actions"><button type="button" data-action="text">Download text (.txt)</button><button type="button" data-action="json">Download JSON (.json)</button><button type="button" data-action="print">Print / browser PDF</button></div></div><div class="hub-actions"><button type="button" data-action="review">Review answers</button><button type="button" data-action="clear">Clear answers &amp; start again</button></div>`;
 }
 // Shared API enhances newly rendered sections, detail and bionic text without a second preferences implementation.
 window.MJBReading?.refresh();
 if(focus)app.querySelector('h2,legend')?.focus();
}
function next(){if(step<topic.questions.length-1)step++;else view='results';render();}
app.addEventListener('change',e=>{if(e.target.name==='hub-answer'){const q=topic.questions[step];if(q.options.some(o=>o.id===e.target.value))answers[q.id]=e.target.value;announce('Selection kept in this page only.');}});
app.addEventListener('submit',e=>{e.preventDefault();next();});
function download(type){try{const r=contract.createRecord(topic,answers),content=type==='json'?JSON.stringify(r,null,2):contract.toText(r),blob=new Blob([content],{type:type==='json'?'application/json;charset=utf-8':'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=topic.id+'-v'+topic.version+'.'+(type==='json'?'json':'txt');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Download requested. Check your browser downloads.');}catch{announce('Export failed. Please try again.');}}
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.topic){topic=catalog.questionnaires.find(t=>t.id===b.dataset.topic);if(!topic)return;answers={};step=0;view='questions';render();announce('Topic selected. Answers stay in this page only.');return;}
 switch(b.dataset.action){case 'back':if(step>0)step--;else{view='topics';answers={};topic=null;}render();break;case 'skip':answers[topic.questions[step].id]=null;next();announce('Question skipped.');break;case 'review':view='questions';step=0;render();break;case 'clear':answers={};topic=null;step=0;view='topics';render();announce('All answers cleared from this page.');break;case 'text':download('text');break;case 'json':download('json');break;case 'print':window.MJBReading?.stop();window.print();break;}
});
fetch(new URL('questionnaires.v1.json',document.currentScript.src),{credentials:'omit',cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('Definition unavailable.');return response.json();}).then(data=>{catalog=contract.validate(data);app.setAttribute('aria-busy','false');render(false);}).catch(()=>{app.setAttribute('aria-busy','false');app.innerHTML='<h2>Demonstration unavailable</h2><p>The questionnaire definition could not be loaded or validated. No answers have been collected. Reload to try again.</p>';announce('The demonstration could not load.');});
})();
