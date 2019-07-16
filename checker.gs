
function checkOneCaseStatus() {
  // Load required properties
  var RECEIPT_NUM = getConfig('ONE_CASE')['RECEIPT_NUM'];
  var SHEET_ID = getConfig('ONE_CASE')['SHEET_ID'];
  var SHEET_NAME = getConfig('ONE_CASE')['SHEET_NAME'];
  var NOTIFY_HOURS = getConfig('ONE_CASE')['NOTIFY_HOURS'];
  
  Logger.log('Checking status of the case ' + RECEIPT_NUM);

  // Open the sheet and get the previous status
  var sheet_instance = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  var prev_status = sheet_instance.getRange('B' + sheet_instance.getLastRow()).getValue();
  
  var status = 'unknown';
  if (isUSCISWorking() == false) {
    // Not USCIS working hours so the status must remain the same
    Logger.log('USCIS is now sleeping. Do not make a request.');
    status = prev_status;
  }
  else {
    // Fetch the latest status from USCIS website.
    status = fetchStatus(RECEIPT_NUM);
    
    // Log status to the sheet
    logStatus(sheet_instance, status);
    Logger.log('Fetched status: ' + status);    
  }
  
  // Notify the user periodically or when the status changes
  if (NOTIFY_HOURS.indexOf(getESTDate().getUTCHours()) > -1 || status != prev_status) {
    Logger.log('E-mail notification in certain hours or status change');
    var subject = RECEIPT_NUM + ': ' + status;
    var body = 'Status log: https://docs.google.com/spreadsheets/d/' + SHEET_ID;    
    sendNotify(subject, body);
  }
  else {
    Logger.log('Do not notify the user');
  }
}

function checkSectionCaseStatus() {
  // Load required properties
  var RECEIPT_NUM = getConfig('SECTION_CASE')['RECEIPT_NUM'];
  var WIDTH = getConfig('SECTION_CASE')['WIDTH'];
  var START = getConfig('SECTION_CASE')['START'];
  var END = getConfig('SECTION_CASE')['END'];
  var SHEET_ID = getConfig('SECTION_CASE')['SHEET_ID'];
  var SHEET_NAME = getConfig('SECTION_CASE')['SHEET_NAME'];
  
  var start_receipt = genReceiptNum(RECEIPT_NUM, START, WIDTH);
  var end_receipt = genReceiptNum(RECEIPT_NUM, END, WIDTH);
  Logger.log('Checking status from ' + start_receipt + ' to ' + end_receipt);
  
  if (isUSCISWorking() == false) {
    Logger.log('USCIS is now sleeping, stop checking');
    return ;
  }
  
  // Open the sheet
  var sheet_instance = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);  

  // Generate receipt list
  var receipts = []
  for (i = START; i <= END; i++) {
    receipts.push(genReceiptNum(RECEIPT_NUM, i, WIDTH));
  }
  
  // Check list in the sheet
  if (sheet_instance.getRange('A2').getValue() == '') {
    Logger.log('Inserting receipt list in Column A');
    var trans_receipts = [];
    for (i = 0; i < receipts.length; i++){
      trans_receipts.push([receipts[i]]);
    }
    sheet_instance.getRange(2, 1, trans_receipts.length, 1).setValues(trans_receipts);
  }
  if (sheet_instance.getRange('A2').getValue() != start_receipt ||
      sheet_instance.getRange('A' + (receipts.length + 1)).getValue() != end_receipt) {
    Logger.log('Error: Receipt number mismatch');
    return ;
  }
  
  // Get a new column to work with
  col = sheet_instance.getLastColumn() + 1;
  
  // Fetch status and log to the sheet
  var status = receipts.map(function(receipt) {
    return [fetchStatus(receipt)];
  });
  sheet_instance.getRange(2, col, status.length, 1).setValues(status);
  //var status = sheet_instance.getRange(2, col, receipts.length, 1).getValues();
  
  // Highlight changes
  var change = 0;
  var prev_status = sheet_instance.getRange(2, col - 1, receipts.length, 1).getValues();
  if (prev_status[0] != receipts[0]) {
    for (i = 0; i < receipts.length; i++) {
      if (prev_status[i].toString() != status[i][0].toString()) {
        Logger.log('Update ' + receipts[i] + ': ' + prev_status[i] + ' -> ' + status[i][0]);
        sheet_instance.getRange(i + 2, col).setFontWeight('bold');
        
        // Count the new case being approved since the last check
        if (status[i][0] == 'New Card Is Being Produced') {
          change = change + 1;
        }
      }
    }
  }
  
  sheet_instance.getRange(1, col).setValue(Utilities.formatDate(new Date(), 'America/New_York', 'MM/dd/yyyy HH') + ' (' + change + ')');
  
  // Send notify
  var subject = 'Change ' + change + ' in ' + start_receipt + '-' + end_receipt;
  var body = 'Detail: https://docs.google.com/spreadsheets/d/' + SHEET_ID;
  sendNotify(subject, body);
  
  Logger.log('Finished');
}

