# USCIS Status Checker
A simple Google App Script that checks the status of cases being processed by USCIS.

## Introduction
This script has two functions for tracking the status of one case and a section of cases, respectively.
You can simply clone this project as a Google Apps Script, deploy the project and create triggers to
keep tracking the case status and receive the notify about the status change.

If you are not familiar with Google Apps Script, here are some useful official references:
* https://developers.google.com/apps-script/overview
* https://developers.google.com/apps-script/articles/tutorials

## Check One Case

### Features
1. Parse the current status from USCIS website and log it to the assigned sheet.
2. Send an e-mail notification in specific hours or when the status is changed.
3. Only make requests to USCIS for status checking in USCIS working hours.
4. Each execution takes less than 1 second.

### Deployment
1. Create a new sheet in a new or an exist Google spreadshet.
2. Set the permission of the Google spreadsheet to "everyone with the link can edit".
3. Modify the parameters in `config.gs:ONE_CASE` accordingly.
4. Create a trigger for function `checkOneCaseStatus`.

## Check A Section of Cases

### Features
1. Parse the current status of a section of cases from USCIS website and log them to the assigned sheet.
2. Each execution will create a new column in the sheet, and the first row of the column will indicate
   the status time and the number of new "approvals" from the last execution.
3. Fonts of the changed status will be in bold if the status is changed from the last execution.
4. Send an e-mail notification after each execution.
5. Only make requests to USCIS for status checking in USCIS working hours.
6. The execution time depends on the case number in the specified section.
   For example, checking 1000 cases usually takes 1-2 minutes.

### Deployment
1. Create a new sheet in a new or an exist Google spreadsheet.
2. Set the permission of the Google spreadsheet to "everyone with the link can edit".
3. Modify the parameters in `config.gs:SECTION_CASE` accordingly.
4. Create a trigger for function `checkSectionCaseStatus`.

## Contributions
Since I am not a Javascript expert, you are welcome to submit pull requets to make this project better.

