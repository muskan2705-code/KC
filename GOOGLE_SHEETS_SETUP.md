# Google Sheets Setup

The homepage inquiry form, `project-inquiry.html`, and `dealer-inquiry.html` are wired to submit to one Google Apps Script Web App.

## 1. Create the spreadsheet

1. Create a new Google Sheet.
2. Open that spreadsheet.
3. Use `Extensions` -> `Apps Script`.

## 2. Add the Apps Script

1. Copy the contents of [google-sheets-web-app.gs](</C:/Users/hello/Downloads/kc fixit website/google-sheets-web-app.gs>).
2. Paste it into the Apps Script editor.
3. Save the project.

The script automatically creates these tabs if they do not already exist:

- `Home Inquiry`
- `Dealer Inquiry`
- `Project Inquiry`

## 3. Deploy the script

1. Click `Deploy` -> `New deployment`.
2. Choose `Web app`.
3. Set `Execute as` to `Me`.
4. Set access to `Anyone`.
5. Deploy and copy the `Web app URL`.

## 4. Add the Web App URL to the website

Open [script.js](</C:/Users/hello/Downloads/kc fixit website/script.js>) and paste the deployed URL into:

```js
const KC_FIXIT_GOOGLE_SHEETS_WEB_APP_URL = "";
```

It should look like:

```js
const KC_FIXIT_GOOGLE_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

## 5. Test

1. Open the homepage and submit a test inquiry from the home form.
2. Open `dealer-inquiry.html` and submit a test inquiry.
3. Open `project-inquiry.html` and submit a test inquiry.
4. Confirm the rows appear in the correct Google Sheet tabs.
