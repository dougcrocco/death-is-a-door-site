/* Death Is a Door — direct email sender. Paste the mailer's web app URL below. */
window.DIAD_MAIL_URL = '';
window.DIAD_MAIL_SECRET = 'ccj-diad-mail-2026';
window.diadSendMail = function (o) { if (!window.DIAD_MAIL_URL) return Promise.reject(new Error('no-mailer'));
  var go = function (pdf) { return fetch(window.DIAD_MAIL_URL, { method: 'POST', body: JSON.stringify({ secret: window.DIAD_MAIL_SECRET, to: o.to, subject: o.subject, body: o.body, pdf: pdf || '', filename: o.filename || '' }) }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.error || 'send failed'); return j; }); };
  if (!o.blob) return go('');
  return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result)); }; fr.onerror = rej; fr.readAsDataURL(o.blob); }).then(go); };
