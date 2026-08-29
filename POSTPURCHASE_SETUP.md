# Post-purchase → community handoff

Preorderers pay on Shopify, which only gives you **transactional** consent (receipts).
Getting them onto the marketing list is a separate opt-in. This is that path.

**The page:** `/welcome/` → https://savageskincare.com/welcome/
It restates the preorder terms, then asks for the marketing opt-in.
Signups land in Klaviyo list `Ts8XmZ` with `preordered: true`, `source: post-purchase-welcome`
so you can segment preorderers from plain list joiners.
It accepts `?email=` to prefill the field.

---

## 1. Klaviyo flow (the automated one — do this first)

Klaviyo is already connected to Shopify; the `Placed Order` metric is live (`Xc8f8N`).

1. Klaviyo → **Flows** → *Create flow* → *Create from scratch*
2. Trigger: **Metric → Placed Order**
3. Trigger filter (so it only hits Lip Pod preorders):
   `Ordered Product` → *item name* → **equals** → `Lip Pod — Wearable Gloss Case`
4. Add a **Time delay** of ~15 minutes (so your Shopify receipt lands first)
5. Add an **Email** action → *Select template* → **"Preorder → Community invite (Lip Pod)"**
   (already created for you, template id `YeLcGt`)
6. Subject line: `You're one of the 500`
   Preview text: `Your receipt came from Shopify. This is the other thing.`
7. Send yourself a preview, then set the flow **Live**.

> The email is transactional-adjacent (it's about an order they placed), which is why it
> can reach people who haven't opted into marketing yet. The *opt-in* happens on /welcome/.

---

## 2. Thank-you page link (optional, catches people immediately)

Your checkout is on **Checkout Extensibility** (`typOspPagesActive: true`), so the old
Settings → Checkout → *Additional scripts* box no longer exists. You cannot paste a
script there. Options:

- **Shopify admin → Settings → Checkout → Customize** → on the **Thank you** page, add a
  *Custom text* block with:
  > **One more thing.** Your receipt covers your order. To get build updates and a vote on
  > the gloss that goes in your Pod, join the community: savageskincare.com/welcome
- Or leave it — the Klaviyo flow above covers everyone.

---

## 3. Order confirmation email (belt and braces)

Shopify admin → **Settings → Notifications → Order confirmation** → *Edit code*.
Paste this just above the closing `</table>` of the main content block:

```html
<table class="row"><tr><td class="customer-info__item">
  <h3 style="font-family:Georgia,serif;">One more thing.</h3>
  <p>This receipt covers your order. To get a vote on the gloss that goes in your Pod and
  a heads-up the day it ships, join the community &mdash; it's a separate, free opt-in:</p>
  <p><a href="https://savageskincare.com/welcome/?email={{ customer.email | url_encode }}"
     style="color:#ff2d95;font-weight:bold;">Join the Savage Skin community &rarr;</a></p>
</td></tr></table>
```

The `?email=` param prefills the form so they don't retype it.

---

## What the page and email promise

Deliberately limited to things already true, so nothing here creates a new obligation:

- **A vote on the gloss** — the flavor vote is already live on the homepage.
- **First to know when it ships** — true by definition of a list.
- **Email only when there's news** — a restraint promise, not a delivery promise.

Earlier drafts promised weighted votes, tooling photos, real costs, and a "run two."
Those were removed on 2026-08-29 because they were commitments that hadn't been made.
If you ever want them back, they need to be things you'll actually do.
