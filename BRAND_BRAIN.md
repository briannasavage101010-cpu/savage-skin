# Savage Skin — BRAND BRAIN (single source of truth)

**This file is the canonical truth for brand, product, pricing, legal, and voice.**
Both Cowork and Claude Code read it. When something about the brand changes, edit it
HERE — do not scatter brand decisions into code comments, prompt docs, or one tool's memory.

> Claude Code loads this automatically via the `@BRAND_BRAIN.md` import at the top of `CLAUDE.md`.
> Cowork loads it because the project instructions point here.

Last updated: 2026-06-08

---

## 1. What it is / who it's for

- DTC skincare brand. Audience: **Gen Z — teens AND young adults.** Broad, not teens-only.
  (The old "designed for teen skin" framing is retired — it's too narrow.)
- Founder: Brianna Savage. "Savage" is also her surname.
- **Founder presence = present but low-key.** Credit her as founder; keep personal specifics private.
- **The founder is a minor.** A guardian must be in the loop on anything involving money, ads,
  contracts, claims, ship dates, refunds, discounts, or review/referral incentives. Keep all
  content age-appropriate. In AI ad/social content: **18+ talent only — never generate or depict minors.**

## 2. Hero product & lineup

**HERO — Drop 01 (the ONLY thing launching first): Lip Service — 3-in-1 Lip Treatment.**
A hybrid: daily lip balm/treatment + intensive overnight lip mask + plumper, in one.
Positioning: **"skincare for your lips."**
- Price: **$18 presale / $24 compare-at.** SKU `SS-LIP-01`. Shopify handle: `glass-glow-lip-gloss` (legacy).
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
- **Sender domain — DECIDED 2026-06-08: `savageskincare.com`** (Brianna owns it; bought via Shopify). The SITE
  is LIVE on this domain via **GitHub Pages** (repo `briannasavage101010-cpu/savage-skin`, `CNAME`=savageskincare.com).
  **Shopify primary domain stays `tbqaxz-rg.myshopify.com` ON PURPOSE** (headless checkout — do NOT switch it back
  or checkout 404s). Signups already flow to **Klaviyo list `Ts8XmZ`** (public key `XNMhJw`), wired in `src/shopify.js`.
  Only TODO before sending campaigns: authenticate `savageskincare.com` as the **Klaviyo sending domain** (DKIM/SPF
  CNAMEs added in the domain's DNS — managed in Shopify admin since bought there); set from = `hello@savageskincare.com`.
  Retire `savageskin.co`.
- **ESP = Klaviyo.**
- **Founders Circle offer (decided):** 48h early access (500 spots — scarcity) + **$18 founder price locked**
  ($24 compare-at after) + free shipping. Do NOT add a 3rd signup perk (dilutes). Save gift-with-purchase
  for the launch-day buy moment. In winback, do NOT undercut $18 for non-buyers — use access/scarcity only.

## 7. Per-product accent colors (used in code + packshots)

- Cleanser `#1D9E75` · Toner `#7F77DD` · Power Fix corrector `#EF9F27` · Moisturizer `#378ADD` · Lip `#D4537E`

## 8. How to work with the founder

Brutally honest, direct, concise. Lead with the verdict. Name risks plainly (legal, financial, conversion).
Pair every criticism with a concrete next step. No padding, no flattery.

## 9. Goals (honest framing)

Launch Drop 01 (Lip Service) with strong presales. Ambition: $500k in 6 months; billion-dollar long game.
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
