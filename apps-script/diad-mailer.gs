/**
 * Death Is a Door — CC Jasper · email sender
 * A separate Google Apps Script web app. Sends offer sheets and checklists
 * (with the PDF attached) straight from the workroom pages — no mail app needed.
 *
 * SET UP (once, ~3 minutes):
 * 1. Go to script.google.com → New project. Name it "DIAD mailer".
 *    Sign in as the account emails should come FROM (ideally gallery@ccjasper.nyc).
 * 2. Delete the sample code, paste this whole file, click Save.
 * 3. Deploy → New deployment → type: Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy, approve the permissions (Gmail send), copy the Web app URL.
 * 4. Send that URL to Claude — it gets pasted into the pages.
 */

var SECRET = 'ccj-diad-mail-2026';            // must match the pages
var ALWAYS_CC = ['s@ccjasper.nyc', 'gallery@ccjasper.nyc', 'doug@allart.la'];
var FROM_NAME = 'CC Jasper';
var REPLY_TO = 'gallery@ccjasper.nyc';
var DAILY_LIMIT = 60;                          // safety cap on sends per day

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.secret !== SECRET) return out({ ok: false, error: 'not allowed' });
    var to = String(d.to || '').trim();
    if (!/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(to)) return out({ ok: false, error: 'bad address' });
    var props = PropertiesService.getScriptProperties(), day = Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd');
    var n = Number(props.getProperty('n-' + day) || 0);
    if (n >= DAILY_LIMIT) return out({ ok: false, error: 'daily limit reached' });
    var opts = { name: FROM_NAME, replyTo: REPLY_TO, cc: ALWAYS_CC.filter(function (c) { return c.toLowerCase() !== to.toLowerCase(); }).join(',') };
    if (d.pdf) opts.attachments = [Utilities.newBlob(Utilities.base64Decode(String(d.pdf).replace(/^data:[^,]+,/, '')), 'application/pdf', String(d.filename || 'Death Is a Door.pdf'))];
    var subject = String(d.subject || 'Death Is a Door — CC Jasper').slice(0, 200);
    var body = String(d.body || '').slice(0, 20000);
    MailApp.sendEmail(to, subject, body, opts);
    props.setProperty('n-' + day, String(n + 1));
    return out({ ok: true, sentAt: new Date().toISOString() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function doGet() { return out({ ok: true, service: 'DIAD mailer' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
