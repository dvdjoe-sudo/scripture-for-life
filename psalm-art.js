/* Original symbolic verse illustrations, in the app's ivory and sage palette. */
(function(){
  'use strict';
  const descriptions=[
    'A flock rests near a shepherd’s staff in an open green meadow: an image of care and provision.',
    'Sheep rest in green pasture beside a broad, quiet stream.',
    'A light path curves through green hills toward the morning sun, expressing renewal and direction.',
    'A narrow valley opens toward warm light, with a shepherd’s staff beside the path.',
    'A prepared table holds bread, an overflowing cup, and a vessel of oil, with dark hills beyond.',
    'A welcoming house stands in warm light, its open doorway reached by a path through the meadow.'
  ];
  const sheep=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-22 8v13m31-13v13" stroke="#365943" stroke-width="5"/><ellipse rx="29" ry="18" fill="#fff9e8"/><ellipse cx="27" cy="3" rx="11" ry="14" fill="#536747"/><path d="m30-8 8-5" stroke="#536747" stroke-width="5"/></g>`;
  const staff='<path d="M255 337V180a21 21 0 0 1 42 0v11" fill="none" stroke="#826743" stroke-width="9" stroke-linecap="round"/>';
  const stream='<path d="M480 209C365 258 616 255 511 309S349 367 398 420H638C515 356 701 320 614 271S510 237 530 209Z" fill="#a8cfc5"/><path d="M479 289h70m-79 65h66m-14 40h90" stroke="#e7f1df" stroke-width="3"/>';
  const path='<path d="M431 199C314 244 519 258 397 318S311 384 285 420H467C386 369 558 318 477 271S408 226 448 199Z" fill="#e8d7aa"/>';
  const scenes=[
    staff+sheep(377,305,1.1)+sheep(488,330,.85)+sheep(544,280,.65),
    stream+sheep(279,299,1)+sheep(210,330,.75)+'<path d="M150 350v-40m0 16-13-10m13 0 13-15" stroke="#577b53" stroke-width="4"/>',
    path+'<path d="M185 340v-70m0 35-23-14m23 0 24-25" stroke="#486e4e" stroke-width="6"/><ellipse cx="183" cy="257" rx="47" ry="49" fill="#6e9265"/>',
    '<path d="M0 0H180L341 280 226 420H0Z" fill="#355c54"/><path d="M800 0H641L471 268 569 420H800Z" fill="#26483f"/>'+path+staff,
    '<path d="M0 240 115 130 227 247 343 140 459 254 624 153 800 240V420H0Z" fill="#44634b"/><g stroke="#725a3f" stroke-width="11" stroke-linejoin="round"><path d="M231 303h339v23H231Z" fill="#e4cc9c"/><path d="M255 326v79m292-79v79"/></g><path d="M352 265h64l-11 40h-42Z" fill="#f7efcf" stroke="#8f754d" stroke-width="3"/><path d="M405 277q20 9 16 35t18 21" fill="none" stroke="#d8b76c" stroke-width="4"/><ellipse cx="309" cy="288" rx="27" ry="12" fill="#d8b77b"/><path d="M476 304v-42l10-16v-20h15v20l10 16v42Z" fill="#a8b68b" stroke="#677c54" stroke-width="3"/>',
    path+'<path d="M295 282V171h211v111Z" fill="#e9dab6"/><path d="m272 177 128-88 131 88Z" fill="#708264"/><path d="M373 282v-79q27-29 54 0v79Z" fill="#fff1b9"/><path d="M321 210h25v29h-25m112-29h25v29h-25" fill="#93af96"/><path d="M295 282h211" stroke="#8c9b72" stroke-width="4"/>'
  ];
  function render(n){
    if(!Number.isInteger(n)||n<1||n>6)throw Error('Unknown Psalm 23 verse illustration');
    const dark=n===4,sky=dark?'#b5c8c1':n>=5?'#efe1bd':'#e6ebd4';
    return `<svg class="landscape psalm-verse-art" data-psalm-art="23-${n}" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Psalm 23:${n}. ${descriptions[n-1]}"><rect width="800" height="420" fill="${sky}"/><circle cx="424" cy="116" r="49" fill="#fff2c5"/><path d="M0 231Q151 138 291 216T569 196T800 204V420H0Z" fill="#becfaf"/><path d="M0 287Q173 204 337 272T621 253T800 267V420H0Z" fill="#92ad83"/><path d="M0 355Q178 279 342 343T627 324T800 341V420H0Z" fill="#698b68"/>${scenes[n-1]}</svg>`;
  }
  function progress(){try{const v=Number(localStorage.getItem('scripture-for-life.psalm23-place'))||JSON.parse(localStorage.getItem('scripture-for-life.study-trail.psalm23')||'{}').last;return Number.isInteger(v)&&v>=1&&v<=6?v:1;}catch{return 1;}}
  function remember(n){try{localStorage.setItem('scripture-for-life.psalm23-place',String(n));}catch{}}
  function verseNav(n){remember(n);return `<nav class="psalm-verse-nav" aria-label="Psalm 23 verses">${descriptions.map((_,i)=>`<a href="#/study/23/${i+1}" ${n===i+1?'aria-current="page"':''}>Verse ${i+1}</a>`).join('')}</nav>`;}
  window.SFL_PSALM_ART={render,progress,verseNav,descriptions};
})();
