function getConfig(mode) {
  var config = {
    ONE_CASE: {
      RECEIPT_NUM: 'YSC1990000000', // The receipt number we want to track
      SHEET_ID: 'XXXXXX', // The Google sheet ID that we will log the tracking history
      SHEET_NAME: 'Sheet1', // The sheet name that we will log the tracking history
      NOTIFY_HOURS: [10, 12, 14, 16, 18, 20] // The hours (EST) that we will send an email for the status
    },
    SECTION_CASE: {
      RECEIPT_NUM: 'YSC1990000*',
      WIDTH: 3,
      START: 0,
      END: 999,
      SHEET_ID: 'XXXXXX', // The Google sheet ID that we will log the tracking history
      SHEET_NAME: 'Sheet2', // The sheet name that we will log the tracking history
    }
  }
  
  if (mode in config) {
    return config[mode];
  }
  return undefined;
}

