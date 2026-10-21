/* Shared navigation for all Psalms, retaining the original detailed studies. */
(function(){
'use strict';
const studies=[{number:23,title:'The LORD is my shepherd',summary:'Care, rest, guidance, and presence.'},{number:46,title:'God is our refuge and strength',summary:'Refuge, upheaval, peace, and stillness.'}];
const resume=n=>n===23?window.SFL_PSALM_ART.progress():window.SFL_PSALM46.progress();
function switcher(n,chapter=false){return `<nav class="psalm-navigation" aria-label="Choose a psalm"><a class="back" href="#/psalms">← All Psalms</a><label>Switch psalm<select data-psalm-switch data-psalm-scope="${chapter?'chapter':'study'}" aria-label="Switch psalm">${window.SFL_PSALMS_CONTENT.chapters.map(c=>`<option value="${c.number}" ${c.number===n?'selected':''}>Psalm ${c.number}</option>`).join('')}</select></label></nav>`;}
function nextStudy(n){const other=studies.find(s=>s.number!==n);return `<section class="psalm-next-study"><div><span class="eyebrow">Read another psalm</span><h3>Psalm ${other.number}</h3><p>${other.summary}</p></div><div><a class="btn outline" href="#/study/${other.number}/1">Read Psalm ${other.number} →</a><a class="text-link" href="#/psalms">Browse all 150 Psalms ↗</a></div></section>`;}
document.addEventListener('change',e=>{if(!e.target.matches('[data-psalm-switch]'))return;const n=Number(e.target.value);if(!Number.isInteger(n)||n<1||n>150)return;location.hash=window.SFL_VERSE_STUDIES?.studies[n]?`#/study/${n}/${window.SFL_VERSE_STUDIES.progress(n)}`:e.target.dataset.psalmScope==='study'&&[23,46].includes(n)?`#/study/${n}/${resume(n)}`:`#/psalms/${n}`;});
window.SFL_PSALMS={switcher,nextStudy,collection:(ctx)=>window.SFL_PSALMS_BOOK.collection(ctx),studies};
})();
