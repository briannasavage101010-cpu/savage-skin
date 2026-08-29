# Savage Skin — BRAND BRAIN (single source of truth)

**This file is the canonical truth for brand, product, pricing, legal, and voice.**
Both Cowork and Claude Code read it. When something about the brand changes, edit it
HERE — do not scatter brand decisions into code comments, prompt docs, or one tool's memory.

> Claude Code loads this automatically via the `@BRAND_BRAIN.md` import at the top of `CLAUDE.md`.
> Cowork loads it because the project instructions point here.

Last updated: 2026-08-29

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
> **Shopify:** the product is titled **"Lip Pod — Wearable Gloss Case"**. It still sits on handle `glass-glow-lip-gloss` / SKU `SS-LIP-01` —
> the site code points at that handle on purpose, so do NOT change it or checkout breaks.

- Price: **$18 founder preorder / $24 at launch.** SKU `SS-LIP-01`. Shopify handle:
  `glass-glow-lip-gloss` (legacy). Preorder is charged at purchase, with estimated shipping early 2027
  and a full refund available any time before it ships.
  *(A $24/$32 scheme briefly appeared in the site copy on 2026-08-29; Brianna reverted it to $18/$24,
  which has always been the documented offer. Do not reintroduce $24/$32.)*
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
- **Founder preorder offer:** 500-unit first run + **$18 founder price** ($24 at launch) + free shipping
  + full refund any time before it ships. Do NOT add a 3rd signup perk (dilutes). Save gift-with-purchase
  for the launch-day buy moment. In winback, do NOT undercut $18 for non-buyers — use access/scarcity only.
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
