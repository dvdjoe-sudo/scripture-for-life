/* Original watercolor verse illustrations, in the app's ivory and sage palette. */
(function(){
  'use strict';
  const descriptions=[
    'A shepherd watches over a flock in a flourishing meadow, an image of care and provision.',
    'Sheep rest in green pasture beside a broad, quiet stream.',
    'Sheep follow a shepherd along a winding path through green hills toward morning light, expressing renewal and direction.',
    'A shepherd with a staff leads sheep through a shadowed rocky valley, with warm light falling on the path.',
    'A prepared table holds bread, an overflowing cup, and a vessel of oil, with rocky hills beyond.',
    'A welcoming house stands in warm light, its open doorway reached by a path through the meadow.'
  ];
  function render(n){
    if(!Number.isInteger(n)||n<1||n>6)throw Error('Unknown Psalm 23 verse illustration');
    return `<img class="landscape psalm-verse-art" data-psalm-art="23-${n}" src="assets/psalm23/verse-${n}-watercolor.webp" width="1280" height="853" alt="Psalm 23:${n}. ${descriptions[n-1]}" decoding="async">`;
  }
  function progress(){try{const v=Number(localStorage.getItem('scripture-for-life.psalm23-place'))||JSON.parse(localStorage.getItem('scripture-for-life.study-trail.psalm23')||'{}').last;return Number.isInteger(v)&&v>=1&&v<=6?v:1;}catch{return 1;}}
  function remember(n){try{localStorage.setItem('scripture-for-life.psalm23-place',String(n));}catch{}}
  function verseNav(n){remember(n);return window.SFL_VERSE_STUDIES.verseSelect(23,n,descriptions.length);}
  window.SFL_PSALM_ART={render,progress,verseNav,descriptions};
})();
