/* Pure definition and export contract. No DOM, storage or network dependencies. */
(function(root){
'use strict';
const fail=message=>{throw new Error(message);};
const text=v=>typeof v==='string'&&v.trim().length>0;
const id=v=>text(v)&&/^[a-z][a-z0-9-]*$/.test(v);
function validate(catalog){
 if(catalog?.schemaVersion!==1||!/^\d+\.\d+\.\d+$/.test(catalog.catalogVersion))fail('Unsupported catalog version.');
 if(!Array.isArray(catalog.questionnaires)||!catalog.questionnaires.length)fail('No questionnaires.');
 const questionnaires=new Set();
 for(const q of catalog.questionnaires){
  if(!id(q.id)||questionnaires.has(q.id))fail('Invalid or duplicate questionnaire ID.');questionnaires.add(q.id);
  if(!/^\d+\.\d+\.\d+$/.test(q.version)||!text(q.title)||!text(q.description))fail('Invalid questionnaire metadata.');
  // A separate reviewed implementation is required before real instruments can load.
  if(q.demonstrationOnly!==true||q.review?.status!=='fictional-demo'||q.review.specification!==null||q.result?.type!=='fixed-fictional'||q.result.scoring!=='none'||!id(q.result.id)||!text(q.result.title)||!text(q.result.explanation))fail('Only fictional, unscored demos are supported.');
  if(!Array.isArray(q.questions)||!q.questions.length)fail('No questions.');
  const questions=new Set();
  for(const item of q.questions){
   if(!id(item.id)||questions.has(item.id))fail('Invalid or duplicate question ID.');questions.add(item.id);
   if(item.type!=='single-choice'||item.optional!==true||!text(item.prompt)||!Array.isArray(item.options)||item.options.length<2)fail('Unsupported question.');
   const options=new Set();for(const o of item.options){if(!id(o.id)||options.has(o.id)||!text(o.label))fail('Invalid or duplicate option ID.');options.add(o.id);}
  }
 }
 return catalog;
}
function createRecord(q,answers){
 return {schemaVersion:2,demonstrationOnly:true,questionnaireId:q.id,questionnaireVersion:q.version,title:q.title,result:{id:q.result.id,fictional:true,scoring:q.result.scoring,title:q.result.title,explanation:q.result.explanation},responses:q.questions.map(question=>{const selected=answers[question.id]??null;const option=question.options.find(o=>o.id===selected);if(selected!==null&&!option)fail('Unknown option ID.');return {questionId:question.id,question:question.prompt,optionId:option?.id??null,answer:option?.label??null,skipped:!option};})};
}
function toText(r){return ['MJB QUESTIONNAIRE — DEMONSTRATION ONLY',`Questionnaire: ${r.questionnaireId}`,`Version: ${r.questionnaireVersion}`,r.title,'Fictional fixed result. No clinical scoring or inference.',r.result.title,r.result.explanation,...r.responses.map(x=>`[${x.questionId}] ${x.question}\n${x.answer??'Skipped'} (option ID: ${x.optionId??'none'})`)].join('\n\n');}
const api={validate,createRecord,toText};if(typeof module==='object'&&module.exports)module.exports=api;else root.MJBQuestionnaireDefinition=api;
})(typeof window==='object'?window:globalThis);
