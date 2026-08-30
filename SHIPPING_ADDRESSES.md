# Where preorder shipping addresses go

**The problem this solves:** the payment page (Stripe, via Founders Weekend) only asks for
an email, a card, and a phone number. It has **no address field**, and you can't add one —
that checkout is created by Founders Weekend under *Alpha School 78701, LLC*, not by you,
so it isn't in your Stripe dashboard to change.

**The fix:** every "Preorder" button now goes to **savageskincare.com/preorder/** first.
That page asks for the shipping address, saves it, *then* forwards to the payment page.

```
Preorder button  →  /preorder/  (address saved here)  →  Stripe (card charged there)
```

---

## Where the addresses land

### 1. Klaviyo — automatic, already on

Every address is written to your Klaviyo account (the same one everything else uses)
as a profile on the **VIP list `Ts8XmZ`**.

It lands in two places on the profile:

- **The profile's address fields** (Klaviyo's built-in Location: Address 1, Address 2,
  City, Region, Zip, Country) — this is what mail-merge tags like `{{ person.location.address1 }}` read.
- **Custom properties**, which are easier to eyeball and export:
  | Property | Example |
  |---|---|
  | `shipping_name` | Alex Rivera |
  | `shipping_address` | 1400 Rio Grande St, Austin, TX 78701, US |
  | `address_captured_at` | 2026-08-30T01:13:38Z |
  | `preorder_intent` | true |
  | `source` | preorder-address |

**To get the list out of Klaviyo:** Klaviyo → **Lists & Segments** → *VIP Waitlist* →
**Manage List → Export list to CSV**. The address columns come with it.

**Tip — build a clean segment:** Klaviyo → *Create Segment* → condition
`Properties about someone` → `source` → **equals** → `preorder-address`.
That gives you a live list of exactly the people who filled in an address.

### 2. Google Sheet — optional, off by default (recommended)

This gives you a plain spreadsheet, one row per address, that you can sort, print,
or hand to whoever packs the boxes. **Setup below takes about five minutes.**

---

## Turn the Google Sheet on

1. Go to **sheets.google.com** → create a blank sheet → name it "Savage Skin Preorders".
2. Menu: **Extensions → Apps Script**. A code editor opens.
3. Delete everything in there and paste this in:

   ```javascript
   function doPost(e) {
     var p = e.parameter || {};
     // Also accept a JSON body, so this keeps working if a form ever sends one.
     try {
       if ((!p.email) && e.postData && e.postData.contents) {
         var j = JSON.parse(e.postData.contents);
         for (var k in j) { if (p[k] === undefined) p[k] = j[k]; }
       }
     } catch (err) {}

     var ss = SpreadsheetApp.getActiveSpreadsheet();

     // Addresses go on their own tab so they don't mix with plain email signups.
     if (p.source === 'preorder-address') {
       var sh = ss.getSheetByName('Addresses') || ss.insertSheet('Addresses');
       if (sh.getLastRow() === 0) {
         sh.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Address 1',
                       'Address 2', 'City', 'State', 'ZIP', 'Country', 'Shipped?']);
       }
       sh.appendRow([p.ts || '', p.name || '', p.email || '', p.phone || '',
                     p.address1 || '', p.address2 || '', p.city || '', p.state || '',
                     "'" + (p.zip || ''), p.country || 'US', '']);
       return ContentService.createTextOutput('ok');
     }

     // Everything else (homepage signups, votes) keeps going to the Leads tab.
     var sheet = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
     if (sheet.getLastRow() === 0) {
       sheet.appendRow(['Timestamp', 'Email', 'Phone', 'SMS consent', 'Vote', 'Source']);
     }
     sheet.appendRow([p.ts || '', p.email || '', p.phone || '', p.sms_consent || '',
                      p.vote || '', p.source || '']);
     return ContentService.createTextOutput('ok');
   }
   ```

   > The `"'" +` in front of the ZIP is deliberate — it stops Google Sheets turning
   > `07030` into `7030`.

4. Click the **Save** icon (💾).
5. **Deploy → New deployment** → gear ⚙️ next to "Select type" → **Web app**.
6. Set **Execute as: Me** and **Who has access: Anyone**.
7. Click **Deploy**, then **authorize** when Google asks (choose your account →
   "Advanced" → "Go to (unsafe)" → Allow). That warning is normal for your own script.
8. Copy the **Web app URL** — it looks like `https://script.google.com/macros/s/AKfy..../exec`.

Then paste that URL into the site. In `preorder/index.html`, find:

```javascript
var SHEET_ENDPOINT = '';
```

and put your URL between the quotes:

```javascript
var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfy..../exec';
```

Rebuild and deploy, and every new address shows up as a row on the **Addresses** tab.

> Do the same in `index.html` (two places) if you also want homepage signups mirrored.

---

## Matching an address to a payment

Klaviyo/the Sheet knows the **address**. Stripe knows the **payment**. The thing that
joins them is the **email**, which is why `/preorder/` says *"use this same email on the
payment page"* right next to the email field.

To reconcile, roughly monthly or before a shipping run:

1. Get the paid orders from Founders Weekend / the Stripe receipts you have access to.
2. Export the Addresses tab (or the Klaviyo segment).
3. Match on email address.

**Anyone paid but with no address?** Email them for it — they're the drop-offs who
skipped the form or typed a different email. **Anyone with an address but no payment?**
That's an abandoned checkout: they gave you an address and then didn't pay. Worth one
follow-up email; they were about as warm as a lead gets.

---

## Things worth knowing

- **Someone can still reach payment without an address** if they have the old direct pay
  link bookmarked or from an older email. Nothing on the site points there any more.
- **If the address won't save**, the page tells the customer, offers a retry, and then
  lets them pay anyway rather than losing the sale — with a prompt to email
  hello@savageskincare.com. So a broken save costs you an address, never an order.
- **The address is also cached in the customer's own browser**, so if they come back to
  the page it's already filled in.
- **The better long-term fix** is to ask Founders Weekend to switch on Stripe's
  `shipping_address_collection` on their `/api/pay` endpoint. Then the address is captured
  *inside* the payment and can never go missing. Until they do, this page is the workaround.
- **Switching back to Shopify** (`node scripts/set-checkout.mjs shopify`) makes this page
  unnecessary — Shopify's checkout collects addresses natively.

---

## Test it before you trust it

Do one real run end to end:

1. Go to savageskincare.com/preorder/, fill it in with your own details, submit.
2. **Don't finish the payment** — just confirm you land on the Stripe page.
3. Check Klaviyo (and the Sheet, if you set it up) for your row.

If the row is there, it's working.
