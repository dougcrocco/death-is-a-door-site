/* Death Is a Door — shared save file sync (Google Sheet via Apps Script).
   Syncs every localStorage key starting with "didad-" across everyone using the pages. */
(function () {
  if (window.__didadSync) return; window.__didadSync = true;
  var URL = 'https://script.google.com/macros/s/AKfycbx1oGNDtZypqwhi-4FzUSwwPeCPrJ3oEUH_e_oRsCY2XJIMdTsh_9BsxpvRlKK2ylgrtg/exec';
  var SKIP = { 'didad-sync-ts': 1, 'didad-who': 1, 'didad-desk-lastsent': 1, 'didad-sync-logts': 1 };
  var LS = window.localStorage, rawSet = LS.setItem.bind(LS), rawRemove = LS.removeItem.bind(LS);
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.dc\.html$|\.html$/, '');
  var synced = function (k) { return k && k.indexOf('didad-') === 0 && !SKIP[k]; };
  var ts = function () { try { return JSON.parse(LS.getItem('didad-sync-ts') || '{}'); } catch (e) { return {}; } };
  var setTs = function (k, v) { var t = ts(); t[k] = v; rawSet('didad-sync-ts', JSON.stringify(t)); };
  var who = function () { return LS.getItem('didad-who') || ''; };
  var pending = {}, timer = null, state = 'idle';

  function label(k) { return ({ 'didad-tracker-v1': 'Consignment Tracker', 'didad-shipping-v1': 'Shipping Tracker', 'didad-consign-v1': 'Agreements', 'didad-desk-custom': 'Desk · items', 'didad-desk-hidden': 'Desk · deleted items', 'didad-desk-urg': 'Desk · urgency', 'didad-desk-order': 'Desk · order', 'didad-desk-events': 'Calendar · events', 'didad-desk-evo': 'Calendar · built-in dates', 'didad-desk-log': 'Desk · log' })[k] || k.replace('didad-', ''); }

  function flush() {
    timer = null; var keys = Object.keys(pending); if (!keys.length) return; pending = {};
    keys.forEach(function (k) {
      var raw = LS.getItem(k), val = null; try { val = raw == null ? null : JSON.parse(raw); } catch (e) { val = raw; }
      var log = [];
      if (k === 'didad-desk-log' && Array.isArray(val)) {
        var last = +LS.getItem('didad-sync-logts') || 0;
        log = val.filter(function (l) { return l.ts > last; }).reverse();
        if (log.length) rawSet('didad-sync-logts', String(log[log.length - 1].ts));
      } else if (k !== 'didad-desk-log' && k.indexOf('didad-desk-') !== 0) {
        log = [{ ts: Date.now(), action: 'Updated', text: label(k) }];
      }
      setStatus('saving');
      fetch(URL, { method: 'POST', body: JSON.stringify({ key: k, value: val, by: who(), page: page, log: log }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { setTs(k, Date.parse(j.updated) || Date.now()); setStatus('saved'); })
        .catch(function () { pending[k] = 1; setStatus('offline'); setTimeout(schedule, 15000); });
    });
  }
  function schedule() { if (!timer) timer = setTimeout(flush, 1200); }
  LS.setItem = function (k, v) { rawSet(k, v); if (synced(k)) { pending[k] = 1; schedule(); } };
  LS.removeItem = function (k) { rawRemove(k); if (synced(k)) { pending[k] = 1; schedule(); } };

  function pull(auto) {
    return fetch(URL + '?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (all) {
      var t = ts(), changed = [];
      Object.keys(all || {}).forEach(function (k) {
        if (!synced(k)) return; var rem = all[k], rt = Date.parse(rem.updated) || 0;
        if (rt > (t[k] || 0) && !pending[k]) {
          var cur = LS.getItem(k), nv = rem.value == null ? null : JSON.stringify(rem.value);
          if (cur !== nv) changed.push({ k: k, nv: nv, rt: rt, by: rem.by }); else setTs(k, rt);
        }
      });
      Object.keys(localStorage).forEach(function (k) { if (synced(k) && !(k in (all || {})) && !t[k]) { pending[k] = 1; schedule(); } });
      if (!changed.length) { setStatus(state === 'idle' ? 'saved' : state); return; }
      if (auto) { apply(changed); return; }
      showBanner(changed);
    }).catch(function () { setStatus('offline'); });
  }
  function apply(changed) {
    changed.forEach(function (c) { if (c.nv == null) rawRemove(c.k); else rawSet(c.k, c.nv); setTs(c.k, c.rt); });
    try { sessionStorage.setItem('didad-sync-reloaded', String(Date.now())); } catch (e) {}
    location.reload();
  }

  var box, dot, txt, nameBtn, banner;
  function ui() {
    if (box || !document.body) return;
    box = document.createElement('div');
    box.setAttribute('data-noprint', '');
    box.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:9999;display:flex;align-items:center;gap:10px;background:#16150f;border:1px solid #3a3630;padding:7px 12px;font:10px "Space Mono",monospace;letter-spacing:0.1em;text-transform:uppercase;color:#c4bcae;box-shadow:0 6px 18px rgba(0,0,0,0.4);';
    dot = document.createElement('span'); dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#6d675c;';
    txt = document.createElement('span');
    nameBtn = document.createElement('button');
    nameBtn.style.cssText = 'background:transparent;border:none;border-left:1px solid #3a3630;padding:0 0 0 10px;color:#7fa39b;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;';
    nameBtn.onclick = function () { var n = prompt('Your name (shown in the change log):', who()); if (n != null) { rawSet('didad-who', n.trim()); paintName(); } };
    box.appendChild(dot); box.appendChild(txt); box.appendChild(nameBtn); document.body.appendChild(box);
    var st = document.createElement('style'); st.textContent = '@media print{[data-noprint]{display:none!important}}'; document.head.appendChild(st);
    paintName(); setStatus(state);
  }
  function paintName() { if (nameBtn) nameBtn.textContent = who() ? 'You: ' + who() : 'Set your name'; }
  function setStatus(s) { state = s; if (!dot) return; var m = { idle: ['#6d675c', 'Connecting…'], saving: ['#e08a3c', 'Saving…'], saved: ['#5fa08f', 'Shared · saved'], offline: ['#e0614f', 'Offline · saved here'] }[s] || ['#6d675c', s]; dot.style.background = m[0]; txt.textContent = m[1]; }
  function showBanner(changed) {
    if (banner) return; ui();
    banner = document.createElement('div'); banner.setAttribute('data-noprint', '');
    banner.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:12px;background:#e9e3d6;color:#0d0c0b;padding:9px 14px;font:11px "Space Mono",monospace;letter-spacing:0.08em;box-shadow:0 6px 18px rgba(0,0,0,0.45);';
    var by = changed.map(function (c) { return c.by; }).filter(Boolean)[0];
    banner.innerHTML = '<span>Updates from ' + (by ? by.replace(/</g, '') : 'the team') + '</span>';
    var b = document.createElement('button'); b.textContent = 'LOAD'; b.style.cssText = 'background:#0d0c0b;color:#e9e3d6;border:none;padding:6px 12px;font:inherit;cursor:pointer;';
    b.onclick = function () { apply(changed); }; banner.appendChild(b); document.body.appendChild(banner);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
  var justReloaded = false; try { justReloaded = Date.now() - (+sessionStorage.getItem('didad-sync-reloaded') || 0) < 8000; } catch (e) {}
  if (!justReloaded) pull(true); else setStatus('saved');
  setInterval(function () { if (!document.hidden) pull(false); }, 45000);
  window.addEventListener('beforeunload', function () { if (Object.keys(pending).length) flush(); });
})();
