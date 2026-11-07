// @ts-nocheck
export const RESULT_NOTE = 'This profile may help you understand and describe those experiences. It does not establish a diagnosis or identify their biological cause.';
const values = new Map([['never',0],['rarely',1],['sometimes',2],['often',3],['very-often',4]]);
export function scoreProfile(profile, answers = {}) {
 const allowed = new Set(profile.domains.flatMap(d=>d.questions.map(q=>q.id)));
 for (const [id,value] of Object.entries(answers)) {
  if (!allowed.has(id)) throw new Error('Unknown question: '+id);
  if (!values.has(value) && value !== 'not-sure' && value !== null) throw new Error('Invalid answer: '+id);
 }
 const domains=profile.domains.map(d=>{
  const recorded=d.questions.map(q=>({id:q.id,answer:answers[q.id]??null}));
  const numeric=recorded.filter(x=>values.has(x.answer));
  const complete=numeric.length===d.questions.length;
  const mean=complete?numeric.reduce((a,x)=>a+values.get(x.answer),0)/numeric.length:null;
  // Descriptive bands only. They are not validated thresholds or impairment levels.
  const band=!complete?'incomplete':mean<1?'rarely-reported':mean<2?'occasionally-reported':mean<3?'sometimes-reported':'frequently-reported';
  return {id:d.id,label:d.label,answered:numeric.length,total:d.questions.length,mean,band,answers:recorded,reflection:d.reflection};
 });
 return {profileId:profile.id,version:profile.version,complete:domains.every(d=>d.mean!==null),domains,note:RESULT_NOTE};
}
export function resultText(result) {
 const frequent=result.domains.filter(d=>d.band==='frequently-reported').map(d=>d.label.toLowerCase());
 const opening=frequent.length?`Your answers suggest that ${frequent.join(', ')} ${frequent.length===1?'is a particular difficulty':'are particular difficulties'} for you.`:'Your answers are summarised below. Look at the individual situations as well as the pattern across them.';
 return `${opening} ${RESULT_NOTE}${result.complete?'':' Some areas are incomplete, so they have not been scored.'}`;
}
