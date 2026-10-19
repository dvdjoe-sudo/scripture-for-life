/* Shared navigation for the available guided studies; other Psalms remain
   available in the complete Bible reader. */
(function(){
  'use strict';
  const studies=[
    {number:23,title:'The LORD is my shepherd',summary:'Care, rest, guidance, and the comfort of God’s presence.',themes:'Comfort · Fear · Belonging',palette:0},
    {number:46,title:'God is our refuge and strength',summary:'Refuge, upheaval, peace, and the call to be still.',themes:'Strength · Uncertainty · Peace',palette:1}
  ];
  const resume=number=>number===23?window.SFL_STUDY_TRAIL.progress('psalm23'):window.SFL_PSALM46.progress();
  const route=(number,step=1)=>`#/study/${number}/${step}`;
  function switcher(number){return `<nav class="psalm-navigation" aria-label="Choose a guided psalm"><a class="back" href="#/psalms">← All guided Psalms</a><label>Switch psalm<select data-psalm-switch aria-label="Switch guided psalm">${studies.map(s=>`<option value="${s.number}" ${s.number===number?'selected':''}>Psalm ${s.number}</option>`).join('')}</select></label></nav>`;}
  function nextStudy(number){const other=studies.find(s=>s.number!==number);return `<section class="psalm-next-study"><div><span class="eyebrow">Another psalm to walk with</span><h3>Psalm ${other.number}</h3><p>${other.summary}</p></div><div><a class="btn outline" href="${route(other.number)}">Begin Psalm ${other.number} →</a><a class="text-link" href="#/psalms">Browse guided Psalms ↗</a></div></section>`;}
  function collection(ctx){return `<div class="container psalms-collection"><header class="page-head"><a class="back" href="#/">← Find help</a><span class="eyebrow">A quiet place in the Psalms</span><h1>Choose a psalm to walk with.</h1><p>Read, listen, explore the meaning, and reflect at your own pace. You can move freely between the available studies.</p></header><div class="psalms-study-grid">${studies.map(s=>{const last=resume(s.number);return `<article class="psalms-study-card"><div class="psalms-card-art">${ctx.scene(s.palette,'psalms-'+s.number)}</div><div class="psalms-card-copy"><span class="eyebrow">Psalm ${s.number} · six moments</span><h2>${s.title}</h2><p>${s.summary}</p><span class="small">${s.themes}</span><div class="psalms-card-links"><a class="btn" href="${route(s.number)}">Begin Psalm ${s.number} →</a>${last>1?`<a class="text-link" href="${route(s.number,last)}">Resume at moment ${last} ↗</a>`:''}</div></div></article>`;}).join('')}</div><section class="psalms-reader-link"><div><h2>Looking for another psalm?</h2><p>All 150 Psalms are available in the Bible reader. Choose any chapter to read it in full.</p></div><a class="btn outline" href="#/read/19/1">Open the Book of Psalms →</a></section><p class="choice-note">Your place and optional reflections are stored in this browser on this device.</p></div>`;}
  document.addEventListener('change',event=>{if(!event.target.matches('[data-psalm-switch]'))return;const n=Number(event.target.value);if(studies.some(s=>s.number===n))location.hash=route(n,resume(n));});
  window.SFL_PSALMS={switcher,nextStudy,collection,studies};
})();
