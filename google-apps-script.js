// ==========================================
// PMS - Google Apps Script Backend
// ==========================================
// 1. Go to your Google Sheet
// 2. Click Extensions > Apps Script
// 3. Paste this entire code into Code.gs (replace what is there)
// 4. Click Deploy > New deployment
// 5. Select type: "Web app"
// 6. Execute as: "Me"
// 7. Who has access: "Anyone"
// 8. Click Deploy, authorize the permissions, and copy the "Web app URL"
// ==========================================

const SHEET_ID = '1zsPFBwkTpgJd2zXsL8AaXdXJTFBBB-yecCWJCMz5YGE';
const MAIN_SHEET = 'PMS 1';
const DROPDOWNS_SHEET = 'DROPDOWNS';
const USERS_SHEET = 'USERS';

function doGet(e) {
  try {
    const type = e.parameter.type;
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    if (type === 'dropdowns') {
      const sheet = ss.getSheetByName(DROPDOWNS_SHEET);
      if (!sheet) throw new Error("DROPDOWNS sheet not found");
      const data = sheet.getRange("A2:B").getValues();
      const machines = data.map(r => String(r[0])).filter(String);
      const dyeingHouses = data.map(r => String(r[1])).filter(String);
      return sendJsonResponse({ success: true, data: { machines, dyeingHouses } });
    }
    
    if (type === 'users') {
      const sheet = ss.getSheetByName(USERS_SHEET);
      if (!sheet) throw new Error("USERS sheet not found");
      const data = sheet.getDataRange().getValues();
      data.shift(); // Remove header row
      return sendJsonResponse({ success: true, data });
    }
    
    // Default: return all orders
    const sheet = ss.getSheetByName(MAIN_SHEET);
    if (!sheet) throw new Error("MAIN sheet not found");
    const data = sheet.getRange("A2:AB").getValues();
    return sendJsonResponse({ success: true, data });

  } catch(error) {
    return sendJsonResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(MAIN_SHEET);
    if (!sheet) throw new Error("MAIN sheet not found");
    
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    if (action === 'update') {
      const { rowIndex, columnIndex, value } = body;
      // Apps Script uses 1-indexed for both row and column. Our columnIndex is 0-indexed.
      sheet.getRange(rowIndex, columnIndex + 1).setValue(value);
      return sendJsonResponse({ success: true });
    }
    
    if (action === 'batchUpdate') {
      const { updates } = body;
      for (let i = 0; i < updates.length; i++) {
        sheet.getRange(updates[i].rowIndex, updates[i].columnIndex + 1).setValue(updates[i].value);
      }
      return sendJsonResponse({ success: true });
    }
    
    if (action === 'append') {
      const { values } = body;
      sheet.appendRow(values);
      return sendJsonResponse({ success: true });
    }
    
    return sendJsonResponse({ success: false, error: 'Unknown action' });
  } catch(error) {
    return sendJsonResponse({ success: false, error: error.toString() });
  }
}

function sendJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
