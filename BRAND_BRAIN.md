# Savage Skin — BRAND BRAIN (single source of truth)

**This file is the canonical truth for brand, product, pricing, legal, and voice.**
Both Cowork and Claude Code read it. When something about the brand changes, edit it
HERE — do not scatter brand decisions into code comments, prompt docs, or one tool's memory.

> Claude Code loads this automatically via the `@BRAND_BRAIN.md` import at the top of `CLAUDE.md`.
> Cowork loads it because the project instructions point here.

Last updated: 2026-08-31

---

## 1. What it is / who it's for

- DTC skincare brand. Audience: **Gen Z — teens AND young adults.** Broad, not teens-only.
  (The old "designed for teen skin" framing is retired — it's too narrow.)
- Founder: Brianna Savage. "Savage" is also her surname.
- **Founder presence = present but low-key.** Credit her as founder; keep personal specifics private.
- In AI ad/social content: **18+ talent only — never generate or depict minors.**

## 2. Hero product & lineup

**HERO — Drop 01 (the ONLY thing launching first): the Lip Pod — a wearable gloss.**
A refillable gloss tube that snaps magnetically into an ivory + champagne-gold case, worn clipped to
a phone, a bag, or a wrist. Positioning: **"skincare for your lips" + you stop losing it.**

> **RENAMED 2026-08-29 (Brianna's call).** "Lip Service" and the Lip Pod are now ONE product, and its
> name is **Lip Pod**. The old Lip Service framing — a 12ml 3-in-1 tube (daily balm + overnight mask +
> plumper) — is RETIRED; do not reintroduce it. Full product mechanics are in §11, which now describes
> the hero, not a side concept.
> **Shopify — CORRECTED 2026-08-30 (autopilot, verified live via Admin API).** There are now TWO
> products in Shopify, and the earlier note in this file was wrong:
> 1. **LIVE HERO —** "Lip Pod — Wearable Gloss Case", handle `lip-pod-wearable-gloss-case`,
>    SKU `SS-POD-01`, **ACTIVE at $24.00** (compare-at $32.00, reset 2026-09-11), created 2026-08-29. This is the real preorder product.
>    Orders #1003 and #1004 (2026-08-29, $28.90 each, PAID, unfulfilled) are against it, which is why
>    its inventory reads **-2**.
> 2. **STALE —** "Lip Service — 3-in-1 Lip Treatment", handle `glass-glow-lip-gloss`, SKU `SS-LIP-01`,
>    still **ACTIVE at $18.00 with 100 units**. This is the RETIRED product under the RETIRED name at
>    the RETIRED price, and it is still publicly buyable. Decide whether to archive it — but check what
>    the site links to first, because some site code still points at `glass-glow-lip-gloss`.

- Price: **$24 founder preorder / $32 at launch.** (Hard reset 2026-09-11, Brianna's call.) SKU `SS-POD-01`. Shopify handle:
  `lip-pod-wearable-gloss-case`. Preorder is charged at purchase, with estimated shipping early 2027
  and a full refund available any time before it ships.
  > **⛔️ OBSOLETE — DO NOT PUSH `price-fix-2399` (superseded 2026-08-31, autopilot).** Brianna rolled
  > the price back to $18/$24 and pushed it herself: `origin/main` is now `cd58df8` ("Move preorder
  > checkout to Shopify, sell refills, add free-shipping offer"). The live site and Shopify both say
  > **$18.00 / compare-at $24.00** and agree — verified on orders #1005 and #1006 (both $18.00 exactly).
  > The `price-fix-2399` / `launch-fixes-0830` branches would push the site BACK to $23.99 and re-break
  > the match. **Delete them, do not merge them.** The paragraph below is kept only as history.
  >
  > <details><summary>Superseded $23.99 warning (kept for history)</summary>
  >
  > **⚠️ PRICE WAS NOT CONSISTENT LIVE — FIX IS COMMITTED, NOT YET PUSHED (2026-08-30, 2nd run).**
  > The problem was far wider than `/preorder/`: the LIVE site said **$18 / $24 in 80 places across
  > 10 pages** (homepage, /shop/, both landing pages, the PDP, FAQ, shipping-returns, welcome, the
  > pitch deck) while Shopify charged $23.99. Shipping only Brianna's corrected `/preorder/` page
  > would have made it *worse* — every button on the site would still have read "Preorder — $18" and
  > then charged $23.99 at the till. **Do not ship a partial price change.**
  > A complete fix is committed as branch **`price-fix-2399`** (commit `41d3db7`), sitting exactly one
  > commit on top of `origin/main`. It is one push from live. See TODO `auto-0830-1`.
  > **Also found and fixed in the same commit:** `products/lip-pod/index.html` set
  > `window.__PRODUCT_HANDLE__ = 'glass-glow-lip-gloss'` — i.e. the live Lip Pod product page was
  > loading and selling the **RETIRED $18 "Lip Service"** product, not the real Pod. `src/products.js`
  > and `src/ingredients-data.js` pointed at the same dead handle. All three now point at
  > `lip-pod-wearable-gloss-case`.
  > </details>
  >
  > **SUPERSEDED 2026-09-11 by the $24/$32 reset below — kept because the checkout mechanics still apply.**
  > **Set 2026-08-30 (Brianna's call, applied site-wide + in Shopify), confirmed live 2026-08-31.** Checkout moved
  > **back to Shopify** (`node scripts/set-checkout.mjs shopify` — every Preorder button now points at
  > the cart permalink `.../cart/53828394680685:1`) and the price went **back to $18 / $24**. Shopify
  > variant `SS-POD-01` is $18.00 with compare-at $24.00, and its product description was updated to
  > match. The saving is $6, so all "you save $6" copy is still true. The Stripe / Founders Weekend
  > pay link is no longer reachable from any button; `/preorder/` still exists and is internally
  > consistent at $18 (`POD_CENTS = 1800`), but nothing links to it.
  > **Why the switch:** the Stripe pay link had no shipping-address field, so buyers could pay without
  > giving an address. Shopify's checkout requires one — verified on orders #1003/#1004, both of which
  > carry full shipping addresses.
  > **⭐ CURRENT — HARD RESET 2026-09-11 (Brianna's call): $24 founding-member price / $32 after
  > launch.** Applied everywhere in one pass: all site copy (homepage, /shop/, the PDP, /faq/,
  > /shipping-returns/, /welcome/, both landing pages, /preorder/), `src/products.js`, the
  > `scripts/set-checkout.mjs` copy lines, and the Shopify variant `SS-POD-01`
  > ($24.00, compare-at $32.00) plus its product description. **The saving is now $8**, so
  > "you save $6" copy is dead — it is "$8 off" and "$12.90 saved in total" ($8 + $4.90 shipping).
  > Derived numbers that moved with it: Pod + refill 3-pack bundle $29 → **$35**; second-Pod add-on
  > on `/preorder/` $16 → **$22** (still $2 off the first Pod); `POD_CENTS = 2400`, `POD2_CENTS = 2200`.
  > Refill pricing did NOT change ($11 preorder / $15 launch; 6-pack $20/$30).
  > **Buyers who already preordered at $18 keep what they paid** — this is a forward price, not a
  > re-charge.
  *(Price history: $18/$24 through 2026-08-29; raised to $23.99/$29.99 that day; returned to $18/$24 on
  2026-08-30; hard-reset to **$24/$32 on 2026-09-11** — this is the live pair. The older $18/$24 and
  $23.99/$29.99 pairs are dead; do not reintroduce them.)*

- **FREE SHIPPING — limited-time preorder offer (Brianna's call, 2026-08-30).** The site now says
  shipping is **free on every preorder with no minimum spend**, framed as a limited-time offer that
  ends when preorders close, and quotes the total saving as **$12.90** ($8 off the price + $4.90
  shipping). That number appears on the homepage, /shop/, the PDP, /faq/, /shipping-returns/, both
  landing pages, /welcome/ and /preorder/ — if the shipping rate ever changes, all of them change.
  > **✅ RESOLVED 2026-08-31 (autopilot, verified on live orders).** A Domestic rate named
  > **"Free shipping — preorder offer"** is now ACTIVE at **$0.00**, and the old $4.90 / $0-over-$50
  > Economy rates are both INACTIVE. Verified on real orders, not in the admin UI: **#1005 and #1006
  > (2026-08-31) both charged exactly $18.00 with `shippingLine = "Free shipping — preorder offer"`
  > at $0.00.** The site's free-shipping copy is now TRUE at the till. Still-active Domestic rates for
  > reference: Standard $6.90 (0–1 lb), Standard $9.90 (1–5 lb), Economy $19.90 (5–70 lb) — none of
  > which fire on a Pod because the free rate wins. *(Historical note: orders #1003/#1004 predate both
  > the price rollback and the free rate, so those two buyers paid $23.99 + $4.90 = $28.90 for the
  > same thing later buyers got for $18.00 — a $10.90 gap worth a goodwill refund.)*
  >
  > <details><summary>Superseded warning (kept for history)</summary>
  >
  > **⚠️ BLOCKING — the Shopify rate does not match the copy yet.** The Domestic zone's free
  > "Economy" rate is conditioned on **TOTAL_PRICE ≥ $50**, and a **$4.90** Economy rate (0–5 lb)
  > applies below that. An $18 Pod is therefore charged $4.90 at the till — which is exactly what
  > happened on order #1004 ($23.99 + $4.90 = $28.90). **Do not deploy the free-shipping copy until
  > the rate is fixed in Shopify admin:** Settings → Shipping and delivery → General profile →
  > Domestic → set the $0.00 Economy rate's condition to no minimum (rename it "Free shipping —
  > preorder offer"), and turn OFF the $4.90 Economy rate. Rate IDs:
  > free `gid://shopify/DeliveryMethodDefinition/993011990893` (condition
  > `gid://shopify/DeliveryCondition/57246351725`), paid `.../DeliveryMethodDefinition/993012023661`.
  > </details>
- **Refills — DECIDED 2026-08-29, priced 2026-08-30.** Every Pod ships with the gloss **plus 1 refill
  tube** (2 tubes in the box). Extra refills sell as a **3-pack: $11.00 preorder / $15.00 after launch**,
  positioned as an **add-on to the Pod**, not a standalone browse product. Shopify: `Lip Pod Refills —
  3-Pack`, SKU `SS-POD-01-RF3`, ACTIVE, $11 with compare-at $15, inventory policy CONTINUE (oversell)
  so preorders go through at 0 stock. On the site it is a checkbox on `/preorder/` (Pod + 3-pack =
  $35.00 as of the 2026-09-11 reset), riding the SAME pay link — `amount` and `name` are query params on the Founders Weekend
  endpoint, so there is no second checkout to maintain. Do not describe the box as "gloss only" or
  promise 2+ included refills; both were briefly on the site and are superseded.
  > **Verified live in Shopify 2026-08-30:** `Lip Pod Refills — 3-Pack`, SKU `SS-POD-01-RF3`, ACTIVE,
  > $11.00, inventory policy CONTINUE, tracked, qty 0 — so it sells at zero stock. Correct.

- **Two more preorder add-ons exist on `/preorder/` and were NOT recorded here until now (2026-08-30).**
  Anything quoting Pod pricing must account for them:
  - **Second Pod in the same box — $22** (i.e. $2 off the $24 first Pod, no extra shipping).
    Line item name becomes `2x Savage Lips`.
  - **Refill 6-pack — $20.00 preorder / $30.00 after launch.** Positioned as "about two years of
    gloss at one tube a season."
  Neither has a Shopify product yet — they exist only as query-param amounts on the Founders Weekend
  pay link. If someone buys a duo or a 6-pack, **Shopify will not have a matching SKU or order line.**

- The "you swallow your lip products every day" insight is what makes clean undeniable.
  Standard line: **"nothing in it you'd be afraid to swallow."** This is NOT a literal edible / eat-it claim.
- Plumper = cosmetic **"fuller look"** claims only. No sting / irritant / injury / active-drug claims.

**Drop 02 (later / secondary) — the 4 face SKUs.** Do not lead with these; strong acids hold for Drop 02.
- Clean Start Cleanser (50ml)
- Prime Time Toner (100ml, 10% glycolic + lactic)
- Power Fix Spot Corrector (30ml, 15% L-Ascorbic + Matrixyl) — airless packaging mandatory (vit C oxidizes)
- Dew Guard Moisturizer (30ml, squalane + bakuchiol)
- Recommended face pricing (not yet final): cleanser $20, toner $26, Power Fix $34, moisturizer $24; founders bundle ~$84.
- Gap/risk: **no SPF in the lineup** yet, while marketing strong actives. Flagged.

## 3. Positioning

- **"Savage" = an ATTITUDE** — bold, unapologetic, fierce-but-stunning. You don't have to smile or
  shrink to be beautiful. It is NOT harsh ingredients and NOT edgy-for-its-own-sake.
- **Litmus test for every asset: "bold, not harsh."**
- **Core moat = radical transparency.** Every ingredient in plain English — what it does and why.
  "Clean that actually works." This is a bigger wedge than "natural."
- **Do NOT build a fear brand.** No "toxic / cancer / will kill you" language. Cosmetics legally
  cannot make disease claims. Use label-frustration as the emotional spark, then pivot to
  truth/transparency — never fear.

## 4. Voice — do / don't

**DO:** short, clear, direct sentences · bold, confident, honest · plain-English ingredient truth ·
real percentages over vague adjectives where the actives are genuinely there.

**DON'T:** fear or disease/medical claims · **"peer-reviewed"** (overclaim — remove everywhere) ·
fake hype or invented social proof · soft influencer fluff ("luxurious self-care moment," "treat yourself") ·
narrow "teen skin only" framing.

> RETIRED guidance (do not follow): the old CLAUDE.md banned "savage attitude / glow loud / stay feral"
> and pushed "peer-reviewed science / designed for teen skin." That is reversed now — bold attitude is
> correct; peer-reviewed and teen-only are wrong.

## 5. Legal / compliance guardrails (pre-launch, non-negotiable)

1. **No fake reviews/testimonials.** FTC Consumer Reviews Rule — up to $53,088 per violation. Remove all
   "VERIFIED" / "Mokosh" / demo testimonials on unshipped products. Never add invented reviews.
2. **Presale = FTC 30-day ship rule.** A real ship date must appear in the post-purchase email; if it
   slips, notify customers and offer a refund.
3. **No disease / drug claims.** Cosmetic claims only.
4. **Actives safety:** include patch-test + SPF lines on any face-actives content.
5. **Mission / cause:** keep values-level only ("stands with women globally facing violence and injustice")
   until a real donation % + a named partner org are locked. No percentage or named org publicly yet.

## 6. Commerce / infrastructure

- Shopify Basic · USD · US (CDT). Dev store: `tbqaxz-rg.myshopify.com`.
  - **VERIFIED (2026-08-20, autopilot, live Shopify API):** the store has BOTH domain strings and they
    are different things — `shop.myshopifyDomain` = **`tbqaxz-rg.myshopify.com`** (permanent, immutable,
    always resolves) and `shop.primaryDomain` = **`savageskincare-store.myshopify.com`** (SSL enabled).
    So existing `tbqaxz-rg` links (Meta ad landing URLs, `privacy/` + `dist/privacy` opt-out links) are
    NOT broken — they resolve and redirect to the primary. Prefer `savageskincare-store.myshopify.com`
    in NEW links; no emergency rewrite of existing ones is needed.
    OPEN QUESTION: this contradicts the "primary stays tbqaxz-rg on purpose" line below — the primary
    HAS changed. Nobody has smoke-tested checkout since. Do that before launch (see item auto-0820-7).
- **Sender domain — DECIDED 2026-06-08: `savageskincare.com`** (Brianna owns it; bought via Shopify). The SITE
  is LIVE on this domain via **GitHub Pages** (repo `briannasavage101010-cpu/savage-skin`, `CNAME`=savageskincare.com).
  **Shopify primary domain stays `tbqaxz-rg.myshopify.com` ON PURPOSE** (headless checkout — do NOT switch it back
  or checkout 404s). Signups already flow to **Klaviyo list `Ts8XmZ`** (public key `XNMhJw`), wired in `src/shopify.js`.
  Only TODO before sending campaigns: authenticate `savageskincare.com` as the **Klaviyo sending domain** (DKIM/SPF
  CNAMEs added in the domain's DNS — managed in Shopify admin since bought there); set from = `hello@savageskincare.com`.
  Retire `savageskin.co`.
- **ESP = Klaviyo.**
- **Founder preorder offer:** 500-unit first run + **$24 founding-member price** ($32 at launch) + free
  shipping + full refund any time before it ships. Do NOT add a 3rd signup perk (dilutes). Save
  gift-with-purchase for the launch-day buy moment. In winback, do NOT undercut $24 for non-buyers —
  use access/scarcity only.
  **TODO:** confirm a free-shipping rate is actually configured in Shopify. The site promises "nothing
  added at checkout", but checkout currently shows shipping as "Enter shipping address" — if a rate gets
  added there, that claim is false.

## 7. Per-product accent colors (used in code + packshots)

- Cleanser `#1D9E75` · Toner `#7F77DD` · Power Fix corrector `#EF9F27` · Moisturizer `#378ADD` · Lip `#D4537E`

## 8. How to work with the founder

Brutally honest, direct, concise. Lead with the verdict. Name risks plainly (legal, financial, conversion).
Pair every criticism with a concrete next step. No padding, no flattery.

## 9. Goals (honest framing)

Launch Drop 01 (the Lip Pod) with strong presales. Ambition: $500k in 6 months; billion-dollar long game.
Budget $1k–$10k. Honest read: $500k/6mo on a sub-$10k budget is a viral-lottery outcome, not a plannable
one — plan for the controllable inputs (offer, list, content cadence, conversion), treat virality as upside.

---

## 10. Keeping the two tools in sync (the bridge)

- **This file is the source of truth.** Edit brand/product/legal/voice facts here.
- **Claude Code** picks it up via `@BRAND_BRAIN.md` at the top of `CLAUDE.md` (and `CLAUDE.md` covers
  code-specific context: stack, file map, conventions).
- **Cowork** picks it up via the project instructions line: *"At the start of every session, read
  savage-skin/BRAND_BRAIN.md and treat it as the authoritative source for brand, pricing, legal, and voice."*
- If you change a core fact (price, hero, a legal rule), update it here once and both tools stay aligned.

## 11. Lip Pod V2 "Slide" (in development — signed off July 13, 2026)

- Concept: 1.5 ml soft squeeze tube of gloss (doe-foot tip) that magnetically snaps into a small
  metal sleeve case worn as a bag charm. Three fidget clicks (cap off / cap on / tube seated).
- **Colorway LOCKED: ivory + champagne gold.** Gloss shade = light pink, possibly pH-reactive
  color-adjusting (Dior Lip Glow-style); it shows only through the kept gloss window. #FF4D7D
  reserved for packaging/site accents. Reads jewelry (Dior / Parfums de Marly cues), not a toy.
- Decisions July 13: window KEPT; logo "SAVAGE" on the cap face; case = coated polymer preferred
  (confirm via blind feel test vs aluminum sample; both quoted; pick most-expensive-looking per dollar).
- Canonical docs (root folder): `Lip_Pod_V2_Manufacturing_Spec.md` (**Rev D** — current),
  `Lip_Pod_V2_Spec_Review_RevC.md` (engineering review), and
  **`Lip_Pod_V2_Mechanism_Render.html` — SIGNED-OFF visual reference.** Every mockup, photo,
  and video of this product must match that rendering exactly (dimensions, part placement,
  magnet in case BASE, cap proud 12 mm, gold mouth rim, keyed seat).
- Key engineering rules: force hierarchy cap 0.55–0.70 kg > case 0.25–0.35 kg; cap retention is
  mechanical (snap-bead) + magnet for feel only; seal = plug on orifice, never the magnet;
  zinc case forbidden (weight); stock mini tube is the sourcing baseline; bag-charm lanyard only.
- Positioning guardrail: sell it as jewelry/fidget/ritual — never on gloss volume (1.5 ml ≈ $6–8/ml).

## 12. Lip Charm V3 (in development — July 14, 2026)

- Second wearable: nearly FLAT bracelet bar charm (40×12×7.5 mm, arc rise ≤2.5 mm — hard rule),
  white opalescent moonstone-look stone (NO crystals, NO pearls — Brianna vetoed both as tacky)
  under champagne-gold filigree cage; flush gold dome end-cap = handle of slide-out micro wand
  (smooth tip, wiper). Reads as fine jewelry; nobody would guess it's gloss.
- Refill = SEALED CARTRIDGE swap (vial+wiper+stem+tip in one unit; liquid never re-poured; every
  refill = new tip+wiper). Hygiene is a core selling point.
- Canonical docs: `Lip_Charm_V3_Manufacturing_Spec.md` (Rev A), `Lip_Charm_V3_Mechanism_Render.html`
  (signed-off drawing incl. exploded refill view); geometry-of-record photo = hf_20260714_013227.
- Business: charm $45–65, cartridge $10–14 subscription-able; shares formula + smooth-tip spec
  with Lip Pod V2. Nickel-free metals mandatory; treat jewelry limits as children's-adjacent.

### 12a. V3 Charm — APPROVED usage video (July 14, 2026)

- **Canonical product film:** `Lip Pod V2 Renders/Lip_Charm_V3_Usage_FULL.mp4` (15s, saved locally —
  no CDN expiry). Sequence: charm at rest as pure jewelry → hand enters, magnetic click, wand slides
  visibly out of the bar → pan wrist-to-lips → gloss applied. Brianna: "basically perfect."
- This video + `Lip_Charm_V3_Mechanism_Render.html` + wrist still hf_20260714_013227 together define
  the product. All future content must match: flat filigree bar, white moonstone glow, flush gold
  dome end-cap = wand handle, straight gold stem, smooth black doe-foot tip (gold meets black
  directly — NO brown/wooden collar), fine gold chain, lugs both ends.
