# Save signups to a Google Sheet (optional, ~5 minutes)

Your homepage form already saves every signup to **Klaviyo** (email + phone + SMS
consent + their vote). This guide adds a **second copy into a Google Sheet** so you
can eyeball leads in a spreadsheet. It's optional — skip it and everything still works.

## Steps

1. Go to **sheets.google.com** and create a new blank sheet. Name it anything (e.g. "Savage Skin Leads").
2. In the menu: **Extensions → Apps Script**. A code editor opens in a new tab.
3. Delete whatever is in there, and paste this in:

   ```javascript
   function doPost(e) {
     var ss = SpreadsheetApp.getActiveSpreadsheet();
     var sheet = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(['Timestamp', 'Email', 'Phone', 'SMS consent', 'Vote', 'Source']);
     }
     var p = e.parameter;
     sheet.appendRow([p.ts || '', p.email || '', p.phone || '', p.sms_consent || '', p.vote || '', p.source || '']);
     return ContentService.createTextOutput('ok');
   }
   ```

4. Click the **Save** icon (💾).
5. Click **Deploy → New deployment**.
6. Click the gear ⚙️ next to "Select type" and choose **Web app**.
7. Set:
   - **Execute as:** Me
   - **Who has access:** **Anyone**
8. Click **Deploy**. Google will ask you to **authorize** — click through (choose your
   account, "Advanced" → "Go to (unsafe)" if it warns, then Allow). This is normal for
   your own script.
9. Copy the **Web app URL** it gives you (it looks like
   `https://script.google.com/macros/s/AKfy..../exec`).

## Turn it on

Open `index.html`, find this line near the bottom (in the `<script>` section):

```javascript
var SHEET_ENDPOINT = '';
```

Paste your URL inside the quotes:

```javascript
var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfy..../exec';
```

Save, then redeploy the site (`npm run build`, commit, push). New signups will now land
in both Klaviyo **and** your Google Sheet.

> Tip: to test, submit the form once on the live site and check the sheet for a new row.
