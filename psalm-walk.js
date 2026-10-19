/* Psalm 23 immersive walk-through. Adds a new path without replacing the original study. */
(function(){
'use strict';
var KEY='scripture-for-life.psalm23-progress';
var titles=['The Shepherd','Finding Rest','Restoring the Soul','Through the Valley','The Prepared Table','Goodness and Mercy'];
var openings=[
  'Begin with a relationship of trust: the Lord is described as a shepherd who knows and cares for the flock.',
  'Pause in a scene of nourishment and quiet water. The poem describes the care that makes rest possible.',
  'The journey continues along right paths. Restoration is connected to the guidance of the Shepherd.',
  'The landscape grows dark, but the central promise is presence even during difficulty.',
  'The image changes from a shepherd to a generous host. The table is set even while opposition remains.',
  'Look back on the path and forward in hope. The final words speak of faithful love and belonging.'
];
var prayers=[
  'God, help me receive Your care and seek Your guidance, especially where I feel uncertain. Amen.',
  'Lord, teach me to receive rest and nourishment without losing sight of those who need help. Amen.',
  'Lord, renew my strength and help me choose a faithful path today. Amen.',
  'God, when I am afraid, help me remember Your presence and reach out for help when I need it. Amen.',
  'God, help me recognize Your generosity and practice hospitality toward others. Amen.',
  'Lord, help me live with gratitude, hope, and love in the days ahead. Amen.'
];
/* Symbolic overlay drawings: no portrait, archaeological claim, or reconstruction. */
var symbols=[
  '<path d="M69 99V35a17 17 0 0 1 34 0" stroke-width="7"/><path d="M28 101c-8-14 4-31 20-28 8-15 28-14 38-3 17-3 29 14 24 29H28Z" fill="#fcf9ed" stroke-width="3"/><path d="M47 99v15m42-15v15" stroke-width="4"/>',
  '<path d="M9 81q25-21 50 0t50 0t50 0M9 98q25-21 50 0t50 0t50 0" stroke-width="5"/><path d="M41 74V29m0 14q-20-20-23-6m23 27q20-27 21-12M125 69V32m0 17q20-18 23-4" stroke-width="4"/>',
  '<path d="M15 125q68-17 50-51t38-54" stroke-width="14" opacity=".45"/><path d="M15 125q68-17 50-51t38-54" stroke="#fbf7eb" stroke-width="4" stroke-dasharray="4 11"/><path d="m104 20 13 5-12 9" stroke-width="4"/>',
  '<path d="m9 108 42-65 23 31 20-50 52 84Z" fill="#315951" opacity=".55" stroke-width="3"/><path d="m82 99 9-32m0 0 5 9m-5-9-10 7" stroke="#fff3ce" stroke-width="5"/><circle cx="102" cy="27" r="7" fill="#fff3ce" stroke="none"/>',
  '<path d="M16 76h130M28 76v54m106-54v54" stroke-width="7"/><path d="M65 57h35l-4 19H69Z" fill="#fff4d8" stroke-width="4"/><path d="M111 36v30m-11-26 11-13 11 13" stroke-width="4"/><path d="M38 59v16m-10-16h20" stroke-width="4"/>',
  '<path d="M35 124V42h91v82M35 42l45-28 46 28M62 124V78h39v46" stroke-width="6"/><path d="M123 14h26m-13-13v26" stroke-width="4"/><path d="M13 124h140" stroke-width="5"/>'
];
function progress(){try{var value=Number(localStorage.getItem(KEY));return Number.isInteger(value)&&value>=1&&value<=6?value:1;}catch(_){return 1;}}
function remember(n){try{localStorage.setItem(KEY,String(n));}catch(_){}}
function art(n,ctx){return '<figure class="pw-landscape">'+ctx.scene(n===4?2:n===5?1:n===6?3:0,'psalm-walk-'+n)
  +'<svg class="pw-art-mark" viewBox="0 0 160 145" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#214d43" stroke-linecap="round" stroke-linejoin="round">'+symbols[n-1]+'</g></svg>'
  +'<figcaption>SYMBOLIC ILLUSTRATION INSPIRED BY PSALM 23 · NOT A HISTORICAL RECONSTRUCTION</figcaption></figure>';}
function render(n,ctx){
  n=Number(n);if(!Number.isInteger(n)||n<1||n>6)return '<div class="container"><h1>That scene was not found.</h1><a href="#/walk/23/1">Begin Psalm 23</a></div>';
  remember(n);
  var s=ctx.studies[n-1],ref='Psalm 23:'+n,E=ctx.escapeHTML;
  var verse=ctx.verses[ref]||'';
  var progressSteps=ctx.studies.map(function(item,i){var step=i+1;return '<a href="#/walk/23/'+step+'" class="'+(step<=n?'completed ':'')+(step===n?'current':'')+'" aria-label="Scene '+step+': '+E(titles[i])+'" '+(step===n?'aria-current="step"':'')+'><span>'+step+'</span></a>';}).join('');
  var imagery=s.explore.map(function(entry){return '<details class="pw-word"><summary>'+E(entry[0])+'</summary><p>'+E(entry[1])+'</p></details>';}).join('');
  var related=s.related.map(function(item){return '<a class="ref-chip" href="'+ctx.refURL(item)+'">'+E(item)+' ↗</a>';}).join('');
  return '<article class="container pw-page"><header class="pw-header"><a href="#/" class="back">← Find help</a><span class="eyebrow">PSALM 23 · A SIX-SCENE JOURNEY</span><h1>'+E(titles[n-1])+'</h1><p>'+E(openings[n-1])+'</p></header>'
    +'<nav aria-label="Walk-through scenes" class="pw-progress">'+progressSteps+'</nav><p class="pw-count">SCENE '+n+' OF 6 · '+E(s.short.toUpperCase())+'</p>'
    +art(n,ctx)
    +'<section class="pw-scripture" aria-labelledby="pw-scripture-heading"><span class="eyebrow">GOD’S WORD · BEREAN STANDARD BIBLE</span><h2 id="pw-scripture-heading">'+E(ref)+'</h2><p class="pw-verse" data-speakref="'+E(ref)+'">'+E(verse)+'</p><div class="pw-tools">'+ctx.saveButton(ref,true)
    +'<button class="btn outline" data-action="listen-verse" data-ref="'+E(ref)+'">▶ Hear this verse</button>'
    +'<button class="btn outline" data-action="listen-psalm">▶ Hear all six verses</button>'
    +'<a class="btn outline" href="#/read/19/23/'+n+'">Read the whole Psalm →</a></div></section>'
    +'<section class="pw-guidance" aria-label="Optional guidance"><p class="pw-gentle">You can simply read or listen. Everything below is optional commentary, not Scripture.</p>'
    +'<details class="pw-section" open><summary>Understand the meaning</summary><div class="pw-detail"><h3>'+E(s.heading)+'</h3><p>'+E(s.explain)+'</p><p class="pw-note">EDITORIAL EXPLANATION · NOT BIBLE TEXT</p></div></details>'
    +'<details class="pw-section"><summary>Explore the images and original context</summary><div class="pw-detail"><h3>Look a little closer</h3>'+imagery+'<h3>Literary and historical context</h3><p>'+E(s.context)+'</p><p class="pw-note">Interpretation and translation context · the Psalm does not describe the exact day David wrote it.</p></div></details>'
    +'<details class="pw-section study-explainer"><summary>Pause, reflect, or pray</summary><div class="pw-detail"><h3>A question to carry with you</h3><p>'+E(s.reflect)+'</p><p class="pw-prayer"><strong>Suggested prayer · not Scripture</strong><span>'+E(prayers[n-1])+'</span></p>'+ctx.noteField(ref)
    +'<button class="btn outline" data-action="save-note" data-ref="'+E(ref)+'">Save my reflection</button></div></details></section>'
    +'<section class="pw-beyond" aria-label="Continue exploring"><h2>Go deeper when you’re ready.</h2><p>See the passages that connect with this scene. Explore David’s life without assuming that a particular event is the proven setting of this Psalm.</p><div class="related-links">'+related+'</div><p><a class="text-link" href="#/people/david">Explore David’s story ↗</a> <span aria-hidden="true"> · </span> <a class="text-link" href="#/study/23/'+n+'">Open the original Psalm 23 study ↗</a></p></section>'
    +'<nav class="pw-next" aria-label="Continue the walk">'+(n>1?'<a class="btn outline" href="#/walk/23/'+(n-1)+'">← Previous scene</a>':'<a class="btn outline" href="#/read/19/23">Read Psalm 23</a>')
    +(n<6?'<a class="btn" href="#/walk/23/'+(n+1)+'">Continue the journey →</a>':'<a class="btn" href="#/walk/23/1">Begin again ↻</a>')+'</nav>'
    +(n===6?'<p class="pw-finish">You have completed Psalm 23. Your verse notes remain saved on this device; return whenever you wish.</p>':'')
    +'<p class="pw-footer">The Scripture shown above is the Berean Standard Bible (BSB). Illustrations, explanations, questions, and suggested prayers are clearly separate from the Bible text.</p></article>';
}
window.SFL_PSALM_WALK={render:render,progress:progress,titles:titles};
})();