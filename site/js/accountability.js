(function(){
  const search=document.getElementById('case-search'), outcome=document.getElementById('case-outcome'), count=document.getElementById('case-count');
  if(!search||!outcome||!count)return;
  const cards=[...document.querySelectorAll('[data-case]')];
  function filter(){const terms=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);let shown=0;cards.forEach(card=>{const keep=(!outcome.value||card.dataset.outcome===outcome.value)&&terms.every(term=>card.dataset.search.includes(term));card.hidden=!keep;if(keep)shown++;});count.textContent=shown===0?'No records match. Try another name, condition or service.':`${shown} ${shown===1?'record':'records'} shown`;}
  search.addEventListener('input',filter);outcome.addEventListener('change',filter);
})();
