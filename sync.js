/* Death Is a Door — shared save file sync (Google Sheet via Apps Script).
   Syncs every localStorage key starting with "didad-" across everyone using the pages. */
(function () {
  if (window.__didadSync) return; window.__didadSync = true;
  var URL = 'https://script.google.com/macros/s/AKfycbxFcWwhdD7p_ik8z8d4CxQK38QbWZ8na921Riq3deBbDcswPMJPL_MFHpkR5TZmkV6hPg/exec';
  var SKIP = { 'didad-pass': 1, 'didad-pass-ts': 1, 'didad-name-asked': 1, 'didad-sync-ts': 1, 'didad-who': 1, 'didad-desk-lastsent': 1, 'didad-sync-logts': 1 };
  var LS = window.localStorage, rawSet = LS.setItem.bind(LS), rawRemove = LS.removeItem.bind(LS);
  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.dc\.html$|\.html$/, '');
  var synced = function (k) { return k && k.indexOf('didad-') === 0 && !SKIP[k]; };
  var ts = function () { try { return JSON.parse(LS.getItem('didad-sync-ts') || '{}'); } catch (e) { return {}; } };
  var setTs = function (k, v) { var t = ts(); t[k] = v; rawSet('didad-sync-ts', JSON.stringify(t)); };
  var who = function () { return LS.getItem('didad-who') || ''; };
  var pending = {}, timer = null, state = 'idle', authAsked = false;
  var PRIV = /[?&]p=/.test(location.search);
  var PASS_DAYS = 7;
  /* Outside the live site (e.g. the Claude project preview) the Sheet can't be reached: show a dated read-only snapshot instead of stale data. */
  var HOSTED = /(^|\.)github\.io$/.test(location.hostname);
  var cut = false, snapAt = '', snapTried = false;
  var LIVE = 'https://dougcrocco.github.io/death-is-a-door-site/';
  var liveUrl = function () { var f = (location.pathname.split('/').pop() || 'index.html').replace(/\.dc\.html$/, '.html'); return LIVE + (/\/agreements\//.test(location.pathname) ? 'agreements/' : '') + f; };
  var when = function (iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
  (function () { var t = +LS.getItem('didad-pass-ts') || 0; if (LS.getItem('didad-pass') && (!t || Date.now() - t > PASS_DAYS * 864e5)) { rawRemove('didad-pass'); rawRemove('didad-pass-ts'); } })();
  var pass = function () { return LS.getItem('didad-pass') || ''; };
  var ro = function () { return cut || (!PRIV && (!who() || !pass())); };
  /* In-page sign-in box (replaces browser prompt() pop-ups, which embedded previews block). */
  var signBox = null;
  function signIn(why, opts, done) {
    opts = opts || {}; if (signBox || !document.body) return;
    var F = '"Space Mono",monospace';
    var ov = document.createElement('div'); ov.setAttribute('data-didad-ui', ''); ov.setAttribute('data-noprint', '');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147482000;background:rgba(13,12,11,0.72);display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;';
    var bx = document.createElement('form'); bx.setAttribute('role', 'dialog'); bx.setAttribute('aria-modal', 'true'); bx.setAttribute('aria-label', 'Sign in to edit'); bx.noValidate = true;
    bx.style.cssText = 'width:min(100%,380px);background:#16150f;border:1px solid #3a3630;padding:22px 22px 18px;box-sizing:border-box;color:#e9e3d6;font-family:"EB Garamond",Georgia,serif;box-shadow:0 18px 48px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:14px;';
    var h = document.createElement('div'); h.textContent = 'Sign in to edit'; h.style.cssText = 'font:11px ' + F + ';letter-spacing:0.16em;text-transform:uppercase;color:#7fa39b;';
    bx.appendChild(h);
    if (why) { var w = document.createElement('p'); w.textContent = why; w.style.cssText = 'margin:0;font-size:16px;line-height:1.4;color:#c4bcae;'; bx.appendChild(w); }
    var fld = function (label, type, val, ac) {
      var l = document.createElement('label'); l.style.cssText = 'display:flex;flex-direction:column;gap:6px;font:10px ' + F + ';letter-spacing:0.14em;text-transform:uppercase;color:#8f887c;';
      var sp = document.createElement('span'); sp.textContent = label; l.appendChild(sp);
      var i = document.createElement('input'); i.type = type; i.value = val || ''; i.autocomplete = ac;
      i.style.cssText = 'font:16px "EB Garamond",Georgia,serif;letter-spacing:0;text-transform:none;background:#0d0c0b;color:#e9e3d6;border:1px solid #3a3630;padding:9px 10px;border-radius:0;outline:none;width:100%;box-sizing:border-box;';
      i.addEventListener('focus', function () { i.style.borderColor = '#7fa39b'; }); i.addEventListener('blur', function () { i.style.borderColor = '#3a3630'; });
      l.appendChild(i); bx.appendChild(l); return i;
    };
    var nIn = fld('Your name (shown in the change log)', 'text', who(), 'name');
    var pIn = opts.nameOnly ? null : fld('Team password', 'password', '', 'current-password');
    var err = document.createElement('div'); err.setAttribute('role', 'alert'); err.style.cssText = 'font:10px ' + F + ';letter-spacing:0.08em;color:#e0614f;min-height:12px;'; bx.appendChild(err);
    var row = document.createElement('div'); row.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
    var bs = 'font:10.5px ' + F + ';letter-spacing:0.12em;text-transform:uppercase;padding:9px 14px;cursor:pointer;border-radius:0;';
    var cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Cancel'; cancel.style.cssText = bs + 'background:transparent;color:#c4bcae;border:1px solid #3a3630;';
    var ok = document.createElement('button'); ok.type = 'submit'; ok.textContent = opts.nameOnly ? 'Save' : 'Sign in'; ok.style.cssText = bs + 'background:#e9e3d6;color:#0d0c0b;border:1px solid #e9e3d6;';
    row.appendChild(cancel); row.appendChild(ok); bx.appendChild(row); ov.appendChild(bx);
    var prev = document.activeElement;
    var close = function (res) { if (!signBox) return; ov.remove(); signBox = null; document.removeEventListener('keydown', esc, true); try { prev && prev.focus && prev.focus(); } catch (e) {} if (done) done(res); };
    var esc = function (e) { if (e.key === 'Escape') { e.preventDefault(); close(false); } };
    cancel.onclick = function () { close(false); };
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(false); });
    bx.onsubmit = function (e) {
      e.preventDefault(); var n = nIn.value.trim(), pw = pIn ? pIn.value.trim() : '';
      if (!n) { err.textContent = 'Enter your name so the team can see who changed what.'; nIn.focus(); return; }
      if (pIn && !pw) { err.textContent = 'Enter the team password.'; pIn.focus(); return; }
      rawSet('didad-who', n); if (pIn) { rawSet('didad-pass', pw); rawSet('didad-pass-ts', String(Date.now())); }
      paintName(); paintRo(); close(true);
    };
    document.addEventListener('keydown', esc, true);
    signBox = ov; document.body.appendChild(ov);
    setTimeout(function () { (nIn.value && pIn ? pIn : nIn).focus(); }, 0);
  }
  var askPass = function (why, done) { signIn(why, {}, done); return false; };
  var askName = function (why, done) { if (who() && pass()) { if (done) done(true); return true; } signIn(why || '', {}, done); return false; };
  var lastToast = 0;
  function blockEdit(e) {
    if (!ro()) return;
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('[data-didad-ui]')) return;
    var ed = t.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]');
    if (!ed && (e.type === 'click' || e.type === 'mousedown')) { var bt = t.closest('button, [role="button"]'); if (bt && !bt.closest('nav, [data-sidenav], [data-topbar]')) { var lbl = ((bt.getAttribute('title') || '') + ' ' + (bt.getAttribute('aria-label') || '') + ' ' + (bt.textContent || '')).trim(); if (/^[×✕+−]$|delete|remove|clear|mark|add|save|done|undo|✓|sent|signed|reset|even out/i.test(lbl)) ed = bt; } }
    if (!ed) return;
    e.preventDefault(); e.stopPropagation(); if (ed.blur) ed.blur();
    if (cut) return;
    if (Date.now() - lastToast > 800) { lastToast = Date.now(); setTimeout(function () { askName('This page is view-only until you enter your name.'); }, 0); }
  }
  ['focusin', 'mousedown', 'click', 'beforeinput', 'keydown', 'paste', 'drop'].forEach(function (ev) { document.addEventListener(ev, blockEdit, true); });

  function label(k) { return ({ 'didad-tracker-v1': 'Consignment Tracker', 'didad-shipping-v1': 'Shipping Tracker', 'didad-press-v1': 'Press Tracker', 'didad-consign-v1': 'Agreements', 'didad-desk-custom': 'Desk · items', 'didad-desk-hidden': 'Desk · deleted items', 'didad-desk-urg': 'Desk · urgency', 'didad-desk-order': 'Desk · order', 'didad-desk-events': 'Calendar · events', 'didad-desk-evo': 'Calendar · built-in dates', 'didad-desk-log': 'Desk · log', 'didad-desk-eds': 'Desk · edited items', 'didad-install-versions': 'Install · versions' })[k] || k.replace('didad-', ''); }

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
      fetch(URL, { method: 'POST', keepalive: true, body: JSON.stringify({ key: k, value: val, by: who(), page: page, log: log, pass: pass() }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok === false && j.error === 'auth') { rawRemove('didad-pass'); paintName(); paintRo(); setStatus('locked'); if (!authAsked) { authAsked = true; setTimeout(function () { askPass('That password didn’t work. Try again.', function (ok) { authAsked = false; if (ok) { pending[k] = 1; schedule(); paintName(); paintRo(); } }); }, 0); } return; } setTs(k, Date.parse(j.updated) || Date.now()); setStatus('saved'); })
        .catch(function () { pending[k] = 1; setStatus('offline'); setTimeout(schedule, 15000); });
    });
  }
  function schedule() { if (!timer) timer = setTimeout(flush, 1200); }
  var roNote = 0; function roWarn() { if (cut) return; if (Date.now() - roNote < 4000) return; roNote = Date.now(); setTimeout(function () { if (!ro()) return; askName('View only — that change wasn’t saved. Sign in with your name and the team password to edit.'); }, 0); }
  LS.setItem = function (k, v) { if (synced(k) && ro()) { roWarn(); return; } rawSet(k, v); if (synced(k)) { pending[k] = 1; schedule(); } };
  LS.removeItem = function (k) { if (synced(k) && ro()) { roWarn(); return; } rawRemove(k); if (synced(k)) { pending[k] = 1; schedule(); } };

  function pull(auto) {
    return fetch(URL + '?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (all) {
      var t = ts(), changed = [];
      Object.keys(all || {}).forEach(function (k) {
        if (!synced(k)) return; var rem = all[k], rt = Date.parse(rem.updated) || 0;
        if (rt > (t[k] || 0) && !pending[k]) {
          var cur = LS.getItem(k), nv = rem.value == null ? null : JSON.stringify(rem.value);
          if (cur !== nv) changed.push({ k: k, nv: nv, rt: rt, by: rem.by }); else setTs(k, rt);
        } else if (rt && rt === (t[k] || 0) && !pending[k] && k !== 'didad-desk-log') {
          var cv = LS.getItem(k); if (cv !== (rem.value == null ? null : JSON.stringify(rem.value))) { pending[k] = 1; schedule(); }
        }
      });
      Object.keys(localStorage).forEach(function (k) { if (synced(k) && !(k in (all || {})) && !t[k]) { pending[k] = 1; schedule(); } });
      if (!changed.length) { setStatus(state === 'idle' ? 'saved' : state); return; }
      if (auto || /[?&]p=/.test(location.search)) { apply(changed); return; }
      showBanner(changed);
    }).catch(function () { if (HOSTED) setStatus('offline'); else goCut(); });
  }
  function goCut() {
    if (snapTried) return; snapTried = true; cut = true; pending = {}; paintName(); paintRo(); setStatus('offline');
    fetch('didad-snapshot.json?t=' + Date.now()).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      if (!j || !j.data) return;
      snapAt = j.at || '';
      var SS = null; try { SS = window.sessionStorage; } catch (e) {}
      var changed = 0;
      Object.keys(j.data).forEach(function (k) {
        if (!synced(k)) return; var rem = j.data[k], nv = rem && rem.value != null ? JSON.stringify(rem.value) : null;
        if (LS.getItem(k) !== nv) { changed++; if (nv == null) rawRemove(k); else rawSet(k, nv); }
      });
      paintRo(); setStatus('snapshot');
      if (changed && SS && SS.getItem('didad-snap-done') !== snapAt) { try { SS.setItem('didad-snap-done', snapAt); } catch (e) {} location.reload(); }
    }).catch(function () { paintRo(); });
  }
  function apply(changed) {
    if (document.querySelector('canvas[data-sig]')) { setTimeout(function () { apply(changed); }, 5000); return; }
    changed.forEach(function (c) { if (c.nv == null) rawRemove(c.k); else rawSet(c.k, c.nv); setTs(c.k, c.rt); });
    try { sessionStorage.setItem('didad-sync-reloaded', String(Date.now())); } catch (e) {}
    location.reload();
  }

  var box, dot, txt, nameBtn, banner;
  function ui() {
    if (box || !document.body) return;
    box = document.createElement('div');
    box.setAttribute('data-noprint', ''); box.setAttribute('data-didad-ui', '');
    box.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:9999;display:flex;align-items:center;gap:8px;white-space:nowrap;opacity:0.85;background:#16150f;border:1px solid #3a3630;padding:5px 9px;font:10px "Space Mono",monospace;letter-spacing:0.1em;text-transform:uppercase;color:#c4bcae;box-shadow:0 6px 18px rgba(0,0,0,0.4);';
    dot = document.createElement('span'); dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#6d675c;';
    txt = document.createElement('span'); txt.style.display = 'none'; box.addEventListener('mouseenter', function () { txt.style.display = ''; box.style.opacity = '1'; }); box.addEventListener('mouseleave', function () { if (state === 'offline' || state === 'locked') return; txt.style.display = 'none'; box.style.opacity = '0.85'; });
    nameBtn = document.createElement('button');
    nameBtn.style.cssText = 'white-space:nowrap;background:transparent;border:none;border-left:1px solid #3a3630;padding:0 0 0 8px;color:#7fa39b;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;';
    nameBtn.onclick = function () { if (cut) return; signIn('', pass() ? { nameOnly: true } : {}); };
    box.appendChild(dot); box.appendChild(txt); box.appendChild(nameBtn); document.body.appendChild(box);
    var st = document.createElement('style'); st.textContent = '@media print{[data-noprint]{display:none!important}}'; document.head.appendChild(st);
    paintName(); setStatus(state);
    paintRo();
    var SS = (function () { try { return window.sessionStorage; } catch (e) { return null; } })(); if (ro() && !(SS && SS.getItem('didad-name-asked'))) setTimeout(function () { if (cut || document.querySelector('canvas[data-sig]') || document.getElementById('didad-gate')) return; try { SS && SS.setItem('didad-name-asked', '1'); } catch (e) {} askName('Welcome to the Death Is a Door desk.'); }, 1200);
  }
  function paintName() { if (nameBtn) nameBtn.textContent = cut ? 'Read only' : who() && pass() ? 'You: ' + who() : who() ? 'To edit, enter password' : 'To edit, enter name'; }
  var roStyle;
  var roBar; function paintRo() { if (!roBar && document.body) { roBar = document.createElement('div'); roBar.setAttribute('data-noprint', ''); roBar.setAttribute('data-didad-ui', ''); roBar.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9998;display:none;align-items:center;gap:12px;background:#e0a24f;color:#0d0c0b;padding:8px 14px;font:10.5px "Space Mono",monospace;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 6px 18px rgba(0,0,0,0.45);'; var t = document.createElement('span'); t.setAttribute('data-ro-t', ''); t.textContent = 'View only · changes aren’t saved'; var b = document.createElement('button'); b.setAttribute('data-ro-b', ''); b.textContent = 'Sign in'; b.style.cssText = 'background:#0d0c0b;color:#e9e3d6;border:none;padding:5px 10px;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer;'; b.onclick = function () { if (cut) window.open(liveUrl(), '_blank', 'noopener'); else askName(); }; roBar.appendChild(t); roBar.appendChild(b); document.body.appendChild(roBar); } if (roBar) { roBar.style.display = ro() ? 'flex' : 'none'; roBar.style.background = cut ? '#c9a24f' : '#e0a24f'; roBar.querySelector('[data-ro-t]').textContent = cut ? (snapAt ? 'Snapshot of live data · ' + when(snapAt) + ' · read only' : 'Not live data · read only') : 'View only · changes aren’t saved'; roBar.querySelector('[data-ro-b]').textContent = cut ? 'Open live page ↗' : 'Sign in'; } if (!roStyle) { roStyle = document.createElement('style'); document.head.appendChild(roStyle); } roStyle.textContent = (cut ? '[data-undo]{display:none !important}' : '') + (ro() ? '[contenteditable]{-webkit-user-modify:read-only !important;cursor:default !important}input,textarea,select{pointer-events:none !important;opacity:0.85}' : ''); if (nameBtn) nameBtn.style.color = ro() ? '#e0a24f' : '#7fa39b'; }
  function setStatus(s) { state = s; if (!dot) return; var m = { idle: ['#6d675c', 'Connecting…'], saving: ['#e08a3c', 'Saving…'], saved: ['#5fa08f', 'Shared · saved'], offline: ['#e0614f', 'Offline · saved here'], locked: ['#e0a24f', 'Not saved · password needed'], snapshot: ['#c9a24f', 'Snapshot · ' + when(snapAt)] }[s] || ['#6d675c', s]; dot.style.background = m[0]; txt.textContent = m[1]; box.title = m[1]; txt.style.display = (s === 'offline' || s === 'locked' || s === 'snapshot') ? '' : 'none'; }
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
