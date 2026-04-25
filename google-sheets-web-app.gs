const FORM_SHEET_NAMES = {
  "home-inquiry": "Home Inquiry",
  "dealer-inquiry": "Dealer Inquiry",
  "project-inquiry": "Project Inquiry"
};

const LEAD_HEADERS = [
  "Submitted At",
  "Form Key",
  "Page",
  "Inquiry Type",
  "Business Type",
  "Business Name",
  "Company",
  "Contact Person",
  "City / Region",
  "Requirement",
  "Project Type",
  "Use Area",
  "Monthly Opportunity",
  "Current Product Focus",
  "Phone",
  "Email",
  "Message",
  "All Fields JSON"
];

function doGet() {
  return ContentService.createTextOutput("KC Fixit form endpoint is live.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const formKey = payload.formKey || "";
    const fields = payload.fields || {};
    const sheetName = FORM_SHEET_NAMES[formKey] || "Website Leads";
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

    ensureHeaders_(sheet);

    sheet.appendRow([
      new Date(),
      formKey,
      payload.page || "",
      fields.inquiryType || "",
      fields.type || "",
      fields.business || "",
      fields.company || "",
      fields.name || "",
      fields.city || "",
      fields.requirement || "",
      fields.project || "",
      fields.useArea || "",
      fields.volume || "",
      fields.focus || "",
      fields.phone || "",
      fields.email || "",
      fields.message || "",
      JSON.stringify(fields)
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error)
    });
  }
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.getRange(1, 1, 1, LEAD_HEADERS.length).setValues([LEAD_HEADERS]);
  sheet.getRange(1, 1, 1, LEAD_HEADERS.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
