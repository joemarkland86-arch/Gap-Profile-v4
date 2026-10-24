/**
 * GAP Profile completion tracker.
 *
 * Paste this into a NEW Google Sheet (Extensions > Apps Script).
 * It records one row per completed assessment: the time (UK) and a random attempt ID.
 * No names, emails, answers or career-action text are ever sent to it.
 */
var COMPLETIONS = 'Completions';
var SUMMARY = 'Summary';
var ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

/** Run once from the editor to create the tabs. Safe to run again. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Europe/London');

  var sheet = ss.getSheetByName(COMPLETIONS) || ss.insertSheet(COMPLETIONS);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Completed at (UK time)', 'Attempt ID']);
    sheet.setFrozenRows(1);
  }
  sheet.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');

  var summary = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  summary.getRange('A1:B1').setValues([['Measure', 'Count']]);
  summary.getRange('A2').setValue('Total completions');
  summary.getRange('B2').setFormula('=COUNTA(' + COMPLETIONS + '!B2:B)');
  summary.getRange('A3').setValue('Completions in the last 7 days');
  summary.getRange('B3').setFormula('=COUNTIFS(' + COMPLETIONS + '!A2:A,">="&(NOW()-7))');
  summary.getRange('A5').setValue('Counts completed attempts, not unique people. Times are UK time.');
}

/** Receives { "attemptId": "..." } from gapprofile.co.uk when results are shown. */
function doPost(e) {
  var id = '';
  try {
    id = JSON.parse(e.postData.contents).attemptId;
  } catch (err) {
    return reply('ignored');
  }
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return reply('ignored');

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return reply('busy');
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(COMPLETIONS);
    if (!sheet) {
      setup();
      sheet = ss.getSheetByName(COMPLETIONS);
    }
    var last = sheet.getLastRow();
    if (last > 1) {
      var existing = sheet.getRange(2, 2, last - 1, 1)
        .createTextFinder(id).matchEntireCell(true).findNext();
      if (existing) return reply('duplicate');
    }
    sheet.appendRow([new Date(), id]);
    return reply('recorded');
  } finally {
    lock.releaseLock();
  }
}

/** Lets you check the deployment is live by opening its URL in a browser. */
function doGet() {
  return reply('GAP Profile completion tracker is running.');
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
