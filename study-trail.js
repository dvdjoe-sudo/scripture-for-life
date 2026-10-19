/* Visual study paths: completion is always an explicit, optional reader action.
   A study supplies its stop labels, icons, and routes; Psalm 23 is the first. */
(function () {
  'use strict';
  const icons = {
    meadow:'<path d="M5 27h26M8 26V15m0 5-4-4m4 0 4-5M18 27V9m0 7-5-5m5 1 4-5M27 27v-9m0 4 4-4"/>',
    stream:'<path d="M3 13q5-5 10 0t10 0t10 0M3 21q5-5 10 0t10 0t10 0M10 5v3m16-4v4"/>',
    path:'<path d="M9 31c19-8 0-14 13-20l6-5M22 4l7 1-1 7"/>',
    valley:'<path d="m2 26 10-17 8 12 6-15 8 20M15 31l6-11m0 0 1 5m-1-5-5 2"/>',
    table:'<path d="M3 17h30M7 17v14m22-14v14M13 9h10l-2 8h-6ZM27 6v8m-3-8h6"/>',
    house:'<path d="m3 16 15-12 15 12M7 15v16h22V15M14 31V21h8v10M23 6V3h5v7"/>'
  };
  const studies = {
    psalm23:{title:'Psalm 23',route:'#/study/23/',stops:[
      {label:'Meadow',detail:'The Shepherd’s care',icon:'meadow'},
      {label:'Stream',detail:'Rest and refreshment',icon:'stream'},
      {label:'Guided path',detail:'Restoration and direction',icon:'path'},
      {label:'Valley',detail:'Presence through fear',icon:'valley'},
      {label:'Table',detail:'Welcome and provision',icon:'table'},
      {label:'House',detail:'Hope and belonging',icon:'house'}
    ]}
  };
  const key = id => 'scripture-for-life.study-trail.' + id;
  const E = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(id) {
    const count=studies[id]?.stops.length||0;
    try {
      const value=JSON.parse(localStorage.getItem(key(id)))||{};
      return {
        completed:Array.isArray(value.completed)?[...new Set(value.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=count))]:[],
        last:Number.isInteger(value.last)&&value.last>=1&&value.last<=count?value.last:1
      };
    } catch { return {completed:[],last:1}; }
  }
  function write(id,value) {try{localStorage.setItem(key(id),JSON.stringify(value));return true;}catch{return false;}}
  function progress(id) { return read(id).last; }
  function status(id) {
    const done=read(id).completed.length, count=studies[id].stops.length;
    return done===0?'Choose any moment and go at your own pace.':done===count?'All six moments are marked complete. Return whenever you wish.':`${done} of ${count} moments marked complete on this device.`;
  }
  function stop(id,n,current,map=false) {
    const study=studies[id],s=study.stops[n-1],done=read(id).completed.includes(n);
    const compact=[ [8,14],[25,60],[42,14],[58,60],[75,14],[92,60] ];
    const expanded=[ [12,43],[50,43],[88,43],[88,225],[50,225],[12,225] ];
    const [x,y]=(map?expanded:compact)[n-1];
    const label=`Moment ${n}: ${s.label} — ${s.detail}${n===current?', current moment':''}${done?', completed':''}`;
    return `<a href="${study.route}${n}" class="trail-stop ${n===current?'is-current':''} ${done?'is-complete':''}" style="--stop-x:${x}%;--stop-y:${y}px" data-trail-step="${n}" aria-label="${E(label)}" ${n===current?'aria-current="step"':''}><span class="trail-stop-icon"><svg viewBox="0 0 36 36" aria-hidden="true">${icons[s.icon]}</svg><span class="trail-check" aria-hidden="true">✓</span></span><span class="trail-stop-label">${E(s.label)}</span>${map?`<small>${E(s.detail)}</small>`:''}</a>`;
  }
  function render(id,current) {
    const study=studies[id];
    if(!study||!Number.isInteger(current)||current<1||current>study.stops.length)throw Error('Unknown study trail moment');
    const value=read(id);value.last=current;write(id,value);
    return `<section class="study-trail" data-trail-id="${id}" data-trail-current="${current}" aria-label="Your path through ${study.title}"><div class="trail-heading"><span class="eyebrow">Your path through ${study.title}</span><span class="trail-legend"><i class="trail-key-current"></i> Here now <i class="trail-key-done"></i> Completed</span></div><nav class="trail-compact" aria-label="${study.title} moments"><svg class="trail-line" viewBox="0 0 1000 140" preserveAspectRatio="none" aria-hidden="true"><path class="trail-road" d="M80 34C140 0 200 115 250 80S360 0 420 34S530 115 580 80S700 0 750 34S860 115 920 80"/><path class="trail-dashes" d="M80 34C140 0 200 115 250 80S360 0 420 34S530 115 580 80S700 0 750 34S860 115 920 80"/></svg>${study.stops.map((_,i)=>stop(id,i+1,current)).join('')}</nav><details class="trail-map-details"><summary>Explore the whole path <span aria-hidden="true">↗</span></summary><div class="trail-map"><svg class="trail-map-art" viewBox="0 0 1000 355" preserveAspectRatio="none" aria-hidden="true"><rect width="1000" height="355" fill="#edf0df"/><path d="M0 119Q130 50 264 123T535 105T802 122T1000 100V355H0Z" fill="#dce5c9"/><path d="M0 207Q140 144 293 213T590 194T1000 213V355H0Z" fill="#c9d8b7"/><path d="M455 0C345 83 654 114 505 183S283 249 400 355H505C389 252 598 233 591 158S451 76 517 0Z" fill="#b5d4cb" opacity=".8"/><path d="M120 63C240 7 374 98 500 63S753 10 880 63C1040 140 1033 300 880 245S623 300 500 245S250 304 120 245" fill="none" stroke="#e9dcb7" stroke-width="19"/><path d="M120 63C240 7 374 98 500 63S753 10 880 63C1040 140 1033 300 880 245S623 300 500 245S250 304 120 245" fill="none" stroke="#879d79" stroke-width="2" stroke-dasharray="6 10"/></svg><nav class="trail-map-stops" aria-label="${study.title} expanded path">${study.stops.map((_,i)=>stop(id,i+1,current,true)).join('')}</nav></div><p class="trail-art-caption">A symbolic path through the psalm’s imagery. Tap any stop to read its verse.</p></details><p class="trail-status" data-trail-status role="status">${status(id)}</p></section>`;
  }
  function completion(id,current) {
    const study=studies[id],done=read(id).completed.includes(current),last=current===study.stops.length;
    return `<div class="trail-completion" data-trail-id="${id}" data-trail-current="${current}"><span class="small">When you’re ready, you can mark this moment complete.</span><div><button class="btn outline" data-trail-action="finish" data-trail-study="${id}" data-trail-moment="${current}" ${done&&last?'disabled':''}>${done?(last?'Moment complete':'Continue to the next moment'):(last?'Mark this moment complete':'I’m ready to continue')} <span aria-hidden="true">${last?'✓':'→'}</span></button><button class="text-link" data-trail-action="undo" data-trail-study="${id}" data-trail-moment="${current}" ${done?'':'hidden'}>Mark unfinished</button></div><span class="trail-action-status small" role="status"></span></div>`;
  }
  function refresh(id,current) {
    const study=studies[id],done=read(id).completed;
    document.querySelectorAll(`[data-trail-id="${id}"] [data-trail-step]`).forEach(el=>{
      const n=Number(el.dataset.trailStep),s=study.stops[n-1];
      el.classList.toggle('is-complete',done.includes(n));
      el.setAttribute('aria-label',`Moment ${n}: ${s.label} — ${s.detail}${n===current?', current moment':''}${done.includes(n)?', completed':''}`);
    });
    document.querySelectorAll(`[data-trail-id="${id}"] [data-trail-status]`).forEach(el=>el.textContent=status(id));
    const wrapper=document.querySelector(`.trail-completion[data-trail-id="${id}"]`);
    if(wrapper){const complete=done.includes(current),last=current===study.stops.length,button=wrapper.querySelector('[data-trail-action="finish"]');button.disabled=complete&&last;button.textContent=complete?(last?'Moment complete ✓':'Continue to the next moment →'):(last?'Mark this moment complete ✓':'I’m ready to continue →');wrapper.querySelector('[data-trail-action="undo"]').hidden=!complete;}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-trail-action]');if(!button)return;
    const id=button.dataset.trailStudy,n=Number(button.dataset.trailMoment),study=studies[id];
    if(!study||!Number.isInteger(n)||n<1||n>study.stops.length)return;
    event.preventDefault();
    const value=read(id);value.last=n;
    if(button.dataset.trailAction==='finish')value.completed=[...new Set([...value.completed,n])];
    else if(button.dataset.trailAction==='undo')value.completed=value.completed.filter(v=>v!==n);
    else return;
    const message=button.closest('.trail-completion').querySelector('.trail-action-status');
    if(!write(id,value)){message.textContent='This browser could not save progress. You can still use every stop and the Next button.';return;}
    refresh(id,n);
    if(button.dataset.trailAction==='finish'&&n<study.stops.length)location.hash=study.route+(n+1);
    else message.textContent=button.dataset.trailAction==='undo'?'This moment is marked unfinished.':'This moment is marked complete on this device.';
  });
  window.SFL_STUDY_TRAIL={render,completion,progress,read,studies};
})();
