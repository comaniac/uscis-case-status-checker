
/**   
* @param {string} receipt_num The I-797 receipt number. Should be something like "YSC0000000000".
* @return {string}            The current status of the case.
*/
function fetchStatus(receipt_num) {
  var response = UrlFetchApp.fetch('https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum=' + receipt_num);
  var lines = response.getContentText().split('\n');
  var fetching = 0;
  var status = 'unknown';
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].search('Your Current Status:') > 0) {
      fetching = 1;
      Logger.log('Found the fetch key');
      continue;
    }
    else if (fetching == 1) {
      status = lines[i].trim();
      break;
    }
  }
  Logger.log('fetched status: ' + status);
  return status;
}

/**   
* @param {string} sheet_id    The Google sheet ID to be used.
* @param {string} sheet_name  The sheet name for logging.
* @param {string} status      The content to be logged.
* @param {number} freq        The frequency to indicate if we should notify the user.
* @return {boolean}           Indicate if we should notify the user.
*/
function logStatus(sheet_id, sheet_name, status, freq) {
  var spreadSheet = SpreadsheetApp.openById(sheet_id);
  var sheetInstance = spreadSheet.getSheetByName(sheet_name);
  sheetInstance.appendRow([Utilities.formatDate(new Date(), 'GMT-7', 'MM/dd/yyyy HH:mm'), status]);
  Logger.log('Status recorded in the Google sheet');
  
  // Ignore the first row (header)
  return (((sheetInstance.getMaxRows() - 1) % freq) == 0);
}

function checkCaseStatus() {
  // The receipt number we want to track.
  var RECEIPT_NUM = // Your receipt number
  
  // The Google sheet ID and name that we will log the tracking history.
  var SHEET_ID = // Your Google sheet ID (make sure it is shared and editable).
  var SHEET_NAME = // The sheet (tab) name you want to log the history.
  
  // The frequency we will send an email to the user for the latest status.
  var FREQ = 4;
  
  // Fetch the latest status
  var status = fetchStatus(RECEIPT_NUM);
  
  // Log status to the sheet
  var notify = logStatus(SHEET_ID, SHEET_NAME, status, FREQ);
  
  // Notify the user if need
  if (notify == true) {
    var email = Session.getActiveUser().getEmail();
    var subject = RECEIPT_NUM + ': ' + status;
    var body = 'Status log: https://docs.google.com/spreadsheets/d/' + SHEET_ID;
    GmailApp.sendEmail(email, subject, body);
  }
}
