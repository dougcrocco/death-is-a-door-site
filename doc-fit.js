if(!document.querySelector('script[src*="nav.js"]')){
(function(){try{window.__uz=parseFloat(localStorage.getItem('didad-doczoom'))||1;}catch(e){window.__uz=1;}
var STEPS=[0.5,0.67,0.8,1,1.25,1.5,2];var M="font-family:'Space Mono',monospace;";
function has(){return !!document.querySelector('doc-page,[data-hasdoc]');}
function css(){if(document.getElementById('zm-css'))return;var s=document.createElement('style');s.id='zm-css';s.textContent="[data-zoomctl]{position:fixed;left:16px;bottom:16px;z-index:80;display:flex;align-items:stretch;background:#0d0c0b;border:1px solid #3a3630;box-shadow:0 6px 18px rgba(0,0,0,0.35);"+M+"font-size:11px;letter-spacing:0.08em;color:#e9e3d6}[data-zoomctl] button{"+M+"font-size:12px;background:transparent;color:#e9e3d6;border:none;cursor:pointer;padding:8px 11px;min-width:34px}[data-zoomctl] button:hover{background:#24211c;color:#7fa39b}[data-zoomctl] [data-zl]{min-width:58px;font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;border-left:1px solid #2a2722;border-right:1px solid #2a2722}@media print{[data-zoomctl]{display:none !important}}";document.head.appendChild(s);}
var el=null;
function set(z){window.__uz=z;try{localStorage.setItem('didad-doczoom',String(z));}catch(e){}window.dispatchEvent(new Event('resize'));lab();}
function lab(){if(!el)return;el.querySelector('[data-zl]').textContent=Math.abs(window.__uz-1)<0.01?'Fit':Math.round(window.__uz*100)+'%';}
function step(d){var i=STEPS.findIndex(function(s){return Math.abs(s-window.__uz)<0.01;});if(i<0)i=3;i=Math.max(0,Math.min(STEPS.length-1,i+d));set(STEPS[i]);}
function build(){css();el=document.createElement('div');el.setAttribute('data-zoomctl','');el.setAttribute('data-noprint','');el.innerHTML='<button type="button" aria-label="Zoom out" title="Zoom out">−</button><button type="button" data-zl="" title="Fit to window">Fit</button><button type="button" aria-label="Zoom in" title="Zoom in">+</button>';var b=el.querySelectorAll('button');b[0].onclick=function(){step(-1);};b[1].onclick=function(){set(1);};b[2].onclick=function(){step(1);};document.body.appendChild(el);lab();}
setInterval(function(){var h=has();if(h&&!el)build();if(el)el.style.display=h?'':'none';},400);
if(window.__uz!==1)setTimeout(function(){window.dispatchEvent(new Event('resize'));},300);
})();
}
(function () {
  var px = function (v, d) { if (!v) return d; var n = parseFloat(v); if (/in$/.test(v)) return n * 96; if (/mm$/.test(v)) return n * 3.7795; if (/cm$/.test(v)) return n * 37.795; return n || d; };
  var st = document.createElement('style'); st.textContent = '@media print{doc-page{zoom:1 !important}}'; document.head.appendChild(st);
  function fit() {
    document.querySelectorAll('doc-page').forEach(function (dp) {
      if (dp.closest('[data-viewport]')) return;
      var w = px(dp.getAttribute('width'), 8.5 * 96) + 48;
      var aw = (document.documentElement.clientWidth - ((document.documentElement.matches('.has-sidenav,.sn-pre') && window.innerWidth > 980) ? 162 : 0));
      var z = Math.min(1, Math.max(0.3, aw / w)) * (window.__uz || 1); dp.style.zoom = Math.abs(z - 1) < 0.002 ? '' : z.toFixed(3);
    });
  }
  window.addEventListener('resize', fit);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit); else fit();
  setTimeout(fit, 300);
})();
