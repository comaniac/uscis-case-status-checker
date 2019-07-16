
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
      continue;
    }
    else if (fetching == 1) {
      status = lines[i].trim();
      break;
    }
  }
  return status;
}

/**
* @return {Object} The hacked date object in EST time zone.
*/
function getESTDate() {
  var date = new Date();

  // Hack the date object so that it is actually EST instead of UTC
  date.setUTCHours(date.getUTCHours() - 4);  
  return date;
}

/**
* @return {boolean} Indicate if USCIS is working right now.
*/
function isUSCISWorking() {
  var date = getESTDate();
  var day = date.getUTCDay();
  var hour = date.getUTCHours();
  Logger.log('EST Day & Hour: ' + day + ', ' + hour);
  return (day != 0 && hour >= 7 && hour <= 18);
}

/**   
* @param {Object} sheet_instance The Google sheet object to be used.
* @param {string} status         The content to be logged.
*/
function logStatus(sheet_instance, status) {  
  sheet_instance.appendRow([Utilities.formatDate(new Date(), 'America/New_York', 'MM/dd/yyyy HH:mm'), status]);
  row_num = sheet_instance.getLastRow();
  Logger.log('Status recorded in the Google sheet. Total ' + row_num + ' rows now');
}

/**
* @param {string} subject  The subject of the notification.
* @param {string} body     The content of the notification.
*/
function sendNotify(subject, body) {
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), subject, body);
}

/**
* @param {string} receipt_num  The receipt number with "*" to be replaced.
* @param {number} num          The number to replace the "*" in receipt.
* @param {number} width        The fixed width of the number.
* @return {string}             The valid receipt number.
*/
function genReceiptNum(receipt_num, num, width) {
  if (receipt_num.indexOf('*') < 0) {
    Logger.log('WARNING: receipt number ' + receipt_num + ' does not have "*"');
    return receipt_num;
  }
  return receipt_num.replace('*', Utilities.formatString('%0' + width + 'd', num));
}

