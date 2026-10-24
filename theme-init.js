/* Dark mode: follow the device setting unless the reader chose one with the toggle (remembered). */
(function(){
  var KEY='scripture-for-life.theme', mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
  function stored(){try{var v=localStorage.getItem(KEY);return v==='dark'||v==='light'?v:null;}catch(e){return null;}}
  function current(){return stored()||(mq&&mq.matches?'dark':'light');}
  function apply(){var t=current();document.documentElement.setAttribute('data-theme',t);document.querySelectorAll('[data-action="theme"]').forEach(function(b){b.setAttribute('aria-pressed',String(t==='dark'));});}
  window.SFL_THEME={current:current,apply:apply,toggle:function(){var t=current()==='dark'?'light':'dark';try{localStorage.setItem(KEY,t);}catch(e){}apply();return t;}};
  if(mq){if(mq.addEventListener)mq.addEventListener('change',apply);else if(mq.addListener)mq.addListener(apply);}
  apply();
})();
