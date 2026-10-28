(function(){
var GROUPS=[['Prepare',['consignments','checklist','catalog']],['Install',['shipping','walkthrough']],['Press',['outreach','press kit','events']],['Sell',['offers']]];
var LABEL={'consignments':'Consignments','checklist':'Checklist','catalog':'Catalog','shipping':'Shipping','walkthrough':'Walkthrough','outreach':'Outreach','press kit':'Press kit','events':'Events','offers':'Offers','desk':'Desk'};
var ARTISTS=['Aramis Gutierrez','Benjamin Cowan','Charlie Goering','Doug Crocco','Ellen R Hanson','Henry Swanson','Kenny Curwood','L','Megan Lindeman','Meredith Sellers','Pandele Radu','Srijon Chowdhury','Tom DeLaney','unitedfutures'];
var M="font-family:'Space Mono',monospace;";
function norm(s){s=(s||'').replace(/[\u2190\u2197\u2302]/g,'').trim().toLowerCase();return s==='press tracker'?'outreach':s;}
function css(){if(document.getElementById('sn-css'))return;var st=document.createElement('style');st.id='sn-css';st.textContent=
"[data-sidenav]{display:none;position:fixed;top:0;left:0;bottom:0;width:224px;box-sizing:border-box;z-index:70;background:#0d0c0b;border-right:1px solid #2a2722;padding:20px 14px 18px;flex-direction:column;gap:16px;overflow-y:auto;"+M+"}"+
"[data-sidenav] img{display:block;height:16px;width:auto}"+
"[data-sn-item]{display:flex;align-items:center;justify-content:space-between;font-family:'EB Garamond',serif;font-size:15.5px;line-height:1.2;color:#e9e3d6;text-decoration:none;padding:5px 9px;border:1px solid transparent}"+
"[data-sn-item]:hover{color:#7fa39b;background:#16150f}[data-sn-item][data-cur]{background:#e9e3d6;color:#0d0c0b}"+
"[data-sn-desk]{"+M+"font-size:10px !important;letter-spacing:0.12em;text-transform:uppercase;border-color:#3a3630 !important;padding:8px 9px !important}"+
"[data-sn-h]{font-size:8.5px;letter-spacing:0.2em;text-transform:uppercase;color:#6d675c;padding:0 9px 3px}"+
"[data-sn-search]{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;box-sizing:border-box;"+M+"font-size:10px;color:#8f887c;background:#16150f;border:1px solid #3a3630;padding:8px 9px;cursor:pointer;text-align:left}"+
"[data-sn-search]:hover{border-color:#7fa39b;color:#e9e3d6}"+
"[data-sn-live]{margin-top:auto;"+M+"font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:#7fa39b;text-decoration:none;padding:6px 9px}[data-sn-live]:hover{color:#e9e3d6}"+
"[data-snq]{display:none}"+
"@media (min-width:981px){html.has-sidenav body{padding-left:224px !important}html.has-sidenav [data-sidenav]{display:flex}html.has-sidenav nav[data-tabs],html.has-sidenav [data-navlogo],html.has-sidenav [data-navbtn]{display:none !important}html.has-sidenav [data-topbar]:not(:has(> :not(nav):not([data-navlogo]):not([data-navbtn]):not([data-livelink]):not([data-snq]):not(script):not(style))){display:none !important}}"+
"@media (max-width:980px){[data-snq]{display:flex;align-items:center;flex:0 0 auto;"+M+"font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#e9e3d6;background:#16150f;border:1px solid #3a3630;padding:12px 12px;cursor:pointer;margin-left:auto}[data-snq]+[data-navbtn]{margin-left:6px !important}}"+
"@media print{[data-sidenav],[data-snpal]{display:none !important}html.has-sidenav body{padding-left:0 !important}}"+
"[data-snpal]{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:flex-start;padding-top:12vh}"+
"[data-snpal]>div{width:min(540px,92vw);background:#16150f;border:1px solid #3a3630;box-shadow:0 18px 40px rgba(0,0,0,0.6);"+M+"}"+
"[data-snpal] input{width:100%;box-sizing:border-box;"+M+"font-size:13px;padding:14px 16px;background:#0d0c0b;color:#e9e3d6;border:none;border-bottom:1px solid #2a2722;outline:none}"+
"[data-snpal] ul{list-style:none;margin:0;padding:6px 0;max-height:52vh;overflow-y:auto}"+
"[data-snpal] li{display:flex;gap:14px;align-items:baseline;padding:9px 16px;cursor:pointer;font-size:11px;color:#e9e3d6}"+
"[data-snpal] li[data-on]{background:#24211c}[data-snpal] li span:first-child{width:64px;flex:0 0 64px;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#6d675c}"+
"[data-snpal] .ft{display:flex;justify-content:space-between;padding:8px 16px;border-top:1px solid #2a2722;font-size:9.5px;color:#6d675c}";
document.head.appendChild(st);}
var links={},nav=null;
function collect(){nav=document.querySelector('nav[data-tabs]');if(!nav)return false;links={};nav.querySelectorAll('a').forEach(function(a){var k=norm(a.textContent);if(k&&!links[k])links[k]=a;});return true;}
function isCur(a){var p=location.pathname.split('/').pop()||'index.html';var raw=(a.getAttribute('data-ag')||a.getAttribute('href')||'');if(/^https?:/.test(raw))return false;var h=raw.split('#')[0].split('?')[0].split('/').pop();if(norm(a.textContent)==='walkthrough')return false;return h===p;}
function mk(a,label,extra){var c=a.cloneNode(false);c.removeAttribute('style');c.removeAttribute('class');c.textContent=label;c.setAttribute('data-sn-item','');if(extra)c.setAttribute(extra,'');if(isCur(a))c.setAttribute('data-cur','');return c;}
function buildSide(){if(document.querySelector('[data-sidenav]'))return;var s=document.createElement('aside');s.setAttribute('data-sidenav','');s.setAttribute('data-noprint','');
var lg=document.createElement('a');var d=links['desk'];if(d){lg=d.cloneNode(false);lg.removeAttribute('style');}else lg.href='desk.html';lg.title='Exhibition Desk';var im=document.createElement('img');var bl=document.querySelector('img[src*="ccj-logo-light"]');im.src=bl?bl.getAttribute('src'):'art/ccj-logo-light.png';im.alt='CC Jasper';lg.textContent='';lg.appendChild(im);s.appendChild(lg);
var sb=document.createElement('button');sb.type='button';sb.setAttribute('data-sn-search','');sb.innerHTML='<span>Jump to…</span><span>'+(/Mac|iP/.test(navigator.platform)?'⌘K':'Ctrl K')+'</span>';sb.onclick=openPal;s.appendChild(sb);
if(d)s.appendChild(mk(d,'⌂ Desk','data-sn-desk'));
GROUPS.forEach(function(g){var box=document.createElement('div');box.style.cssText='display:flex;flex-direction:column;gap:1px';var h=document.createElement('div');h.setAttribute('data-sn-h','');h.textContent=g[0];box.appendChild(h);var any=false;g[1].forEach(function(k){if(links[k]){box.appendChild(mk(links[k],LABEL[k]));any=true;}});if(any)s.appendChild(box);});
var lv=links['live site'];if(lv){var l=lv.cloneNode(false);l.removeAttribute('style');l.textContent='Live site ↗';l.setAttribute('data-sn-live','');s.appendChild(l);}
document.body.appendChild(s);document.documentElement.classList.add('has-sidenav');}
function buildQ(){var b=document.querySelector('[data-navbtn]');if(!b||document.querySelector('[data-snq]'))return;var q=document.createElement('button');q.type='button';q.setAttribute('data-snq','');q.setAttribute('data-noprint','');q.setAttribute('aria-label','Jump to');q.textContent='⌕ Jump';q.onclick=openPal;b.parentNode.insertBefore(q,b);}
function entries(){var E=[];Object.keys(links).forEach(function(k){if(k==='live site')return;E.push({k:'Page',t:LABEL[k]||links[k].textContent.trim(),a:links[k]});});ARTISTS.forEach(function(n){E.push({k:'Artist',t:n+' — agreement',artist:n});});if(links['live site'])E.push({k:'Link',t:'Live site ↗',a:links['live site']});return E;}
function go(e){if(e.a){e.a.click();return;}var c=links['consignments'];if(!c)return;var t=c.cloneNode(false);var q='?artist='+encodeURIComponent(e.artist);if(t.hasAttribute('data-ag'))t.setAttribute('data-ag',t.getAttribute('data-ag').split('?')[0]+q);t.setAttribute('href',(c.getAttribute('href')||'').split('?')[0]+q);t.style.display='none';document.body.appendChild(t);t.click();}
var pal=null;
function closePal(){if(pal){pal.remove();pal=null;}}
function openPal(){if(pal)return;collect();var E=entries();pal=document.createElement('div');pal.setAttribute('data-snpal','');pal.setAttribute('data-noprint','');pal.innerHTML='<div><input placeholder="Jump to a page or artist…" aria-label="Jump to"><ul></ul><div class="ft"><span>↑↓ to move · Enter to open</span><span>Esc to close</span></div></div>';document.body.appendChild(pal);
var inp=pal.querySelector('input'),ul=pal.querySelector('ul'),cur=0,shown=[];
function draw(){var v=inp.value.trim().toLowerCase();shown=E.filter(function(e){return !v||(e.t+' '+e.k).toLowerCase().indexOf(v)>=0;}).slice(0,12);if(cur>=shown.length)cur=0;ul.innerHTML='';shown.forEach(function(e,i){var li=document.createElement('li');if(i===cur)li.setAttribute('data-on','');li.innerHTML='<span></span><span></span>';li.children[0].textContent=e.k;li.children[1].textContent=e.t;li.onmouseenter=function(){cur=i;draw();};li.onclick=function(){closePal();go(e);};ul.appendChild(li);});if(!shown.length){var li=document.createElement('li');li.textContent='No matches';li.style.color='#6d675c';ul.appendChild(li);}}
inp.oninput=function(){cur=0;draw();};inp.onkeydown=function(ev){if(ev.key==='ArrowDown'){ev.preventDefault();cur=Math.min(cur+1,shown.length-1);draw();}else if(ev.key==='ArrowUp'){ev.preventDefault();cur=Math.max(cur-1,0);draw();}else if(ev.key==='Enter'){ev.preventDefault();var e=shown[cur];if(e){closePal();go(e);}}else if(ev.key==='Escape'){closePal();}};
pal.addEventListener('mousedown',function(ev){if(ev.target===pal)closePal();});draw();setTimeout(function(){inp.focus();},0);}
document.addEventListener('keydown',function(ev){if((ev.metaKey||ev.ctrlKey)&&(ev.key==='k'||ev.key==='K')){if(!document.querySelector('nav[data-tabs]'))return;ev.preventDefault();pal?closePal():openPal();}else if(ev.key==='Escape'&&pal){closePal();}});
var n=0,iv=setInterval(function(){if(collect()){css();buildSide();buildQ();if(document.querySelector('[data-snq]')||++n>60){clearInterval(iv);}}else if(++n>100)clearInterval(iv);},150);
})();
