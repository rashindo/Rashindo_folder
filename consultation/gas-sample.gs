const SHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "consultation";

/**
 * 推奨ヘッダー（1行目）:
 * timestamp | businessType | industry | monthlyRevenue | employeeCount | concerns | consultationIntent | consultationPreference | consultationDetails | userAgent | referrer | source
 */
function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(`Sheet not found: ${SHEET_NAME}`);
    }

    const concernsValue = Array.isArray(payload.concerns)
      ? payload.concerns.join(" | ")
      : String(payload.concerns || "");

    sheet.appendRow([
      payload.timestamp || new Date().toISOString(),
      payload.businessType || "",
      payload.industry || "",
      payload.monthlyRevenue || "",
      payload.employeeCount || "",
      concernsValue,
      payload.consultationIntent || "",
      payload.consultationPreference || "",
      payload.consultationDetails || "",
      payload.userAgent || "",
      payload.referrer || "",
      payload.source || "line_richmenu_consultation"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: false,
          message: error && error.message ? error.message : "Unknown error"
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}
