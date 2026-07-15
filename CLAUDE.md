@BRAND_BRAIN.md

# Savage Skin — Codebase Context for Claude Code

> **Brand, product, pricing, legal, and voice truth lives in `BRAND_BRAIN.md`, imported above.**
> That file is the single source of truth and is shared with Cowork. THIS file is code context only.
> If anything here ever conflicts with BRAND_BRAIN.md, BRAND_BRAIN.md wins — fix this file.

This file gives Claude Code the context it needs to be useful in this project. Read it (and the
imported BRAND_BRAIN) before making changes.

## What this is

A marketing site + storefront for **Savage Skin**, a Gen Z skincare brand (teens AND young adults).
Built with Vite (vanilla JS, no framework). Deploys to GitHub Pages via GitHub Actions. Checkout is
wired to Shopify via the Storefront API.

**Drop 01 hero = Lip Service (3-in-1 lip treatment).** It launches first and alone. The 4 face SKUs
are Drop 02. See BRAND_BRAIN.md §2 for the full lineup and pricing.

## Tech stack

- **Build:** Vite 4.5.5 (pinned to avoid rollup native-binary npm bug)
- **3D:** Three.js (r160) — npm import, not CDN
- **Scroll:** Lenis (smooth scroll)
- **Hosting:** GitHub Pages (via Actions workflow)
- **Commerce:** Shopify Storefront API (GraphQL)
- **Forms:** Klaviyo VIP form is wired (see `src/ui.js`); some flows still stubbed

No framework. No TypeScript. No CSS framework. Pure vanilla. Keep it that way unless explicitly asked to migrate.

## File map

- `index.html` — minimal entry markup. All sections present here.
- `src/main.js` — entry point. Imports all modules and calls init functions.
- `src/styles.css` — single stylesheet. CSS variables at top.
- `src/products.js` — the product catalog. Each product has: slug, handle (Shopify), step, name, desc, size, fallback price, serum + cap colors, tag.
- `src/svg-bottle.js` — generates the SVG bottle markup per product (gradient glass, animated liquid, bubbles, neon ring).
- `src/three-scene.js` — the flowing 3D hero bottle. Keyframed across scroll progress; one persistent WebGL context.
- `src/molecule.js` — 2D canvas molecular animation in the Science section.
- `src/shopify.js` — Storefront API client. `getProducts(handles)`, `addToCart(variantId, qty)`, `checkout()`.
- `src/ui.js` — custom cursor, magnetic hover, scroll progress bar, countdown, VIP form, hero word stagger.
- `src/reveal.js` — IntersectionObserver-based scroll reveal for `.reveal` elements.

## Conventions

- **Module style:** ES modules. `export function init() {}` pattern.
- **CSS:** BEM-ish but not strict. Use existing CSS variables for colors (`--neon`, `--cyan`, etc.).
- **Performance:** One WebGL context only. Pause render loops when offscreen. Cap devicePixelRatio at 1.5. Lerp scroll-driven values for smoothness.
- **No emojis** in code or copy unless the user asks for them.
- **No console.log** in production code. If needed for debugging, mark with `// TODO: remove`.
- **Don't add new deps casually.** Three and Lenis are the only runtime deps. Justify any addition.

## Brand voice rules (for copy)

**Full voice spec is in BRAND_BRAIN.md §3–4. Short version for in-repo copy edits:**

- "Savage" = an **attitude** — bold, unapologetic, fierce-but-stunning. Litmus test: **"bold, not harsh."**
- Core wedge = **radical transparency**: every ingredient in plain English, what it does and why.
- Short, clear, direct sentences. Honest. Confident.
- **Do NOT** write: fear/disease language, "peer-reviewed", invented testimonials, soft influencer fluff
  ("luxurious self-care moment," "treat yourself"), or "teen skin only" framing.
- Italics + serif (Fraunces) for emphasis words in headlines.

> Note: earlier versions of this file told you to ban "savage attitude" copy and to write "peer-reviewed /
> designed for teen skin." That guidance is RETIRED — see BRAND_BRAIN.md §4.

## Colors (site CSS variables)

- `--bg` `#06060a` — page background
- `--neon` `#ff2d95` — primary accent (magenta-pink)
- `--cyan` `#00f0ff` — secondary accent
- `--violet` `#b026ff` — tertiary accent
- `--gold` `#e5c26b` — premium accent (use sparingly)
- `--bone` `#f2f1ec` — primary text

(Per-product accent hexes for packshots/PDP are in BRAND_BRAIN.md §7.)

## Legal guardrails (apply to any copy/markup you touch)

These are non-negotiable and detailed in BRAND_BRAIN.md §5. The ones that bite in the codebase:

- **Never add fake or placeholder testimonials/reviews** on unshipped products (FTC rule, up to $53,088/violation).
  If you find demo "VERIFIED" / "Mokosh" reviews in markup, flag/remove — don't replicate them.
- **No disease/drug claims.** Cosmetic claims only. Plumper = "fuller look" only.
- Presale copy must not promise a ship date the business can't honor (FTC 30-day rule).

## Shopify integration

Products are fetched by handle on page load. If `VITE_SHOPIFY_DOMAIN` or `VITE_SHOPIFY_STOREFRONT_TOKEN` is missing, the site falls back to static product data in `src/products.js`. This means the site always renders even without Shopify configured.

Product handles in `src/products.js` MUST match the handles in Shopify admin exactly:
- `glass-glow-lip-gloss`   ← **Lip Service, the Drop 01 hero** (legacy handle; SKU SS-LIP-01)
- `clean-start-cleanser`
- `prime-time-toner`
- `power-fix-spot-corrector`
- `dew-guard-moisturizer`

Cart flow: `addToCart()` creates a Shopify cart (cartCreate mutation), adds the variant, then redirects to `cart.checkoutUrl`. The cart ID is stored in localStorage so a return visitor can resume.

## Common tasks

### Add a new product
1. Edit `src/products.js`, add a new object with handle, name, colors, etc.
2. Create the product in Shopify admin with the matching handle.
3. The SVG bottle generator will color it automatically using the `serum` + `cap` hex values you set.

### Change the launch countdown
Set `VITE_LAUNCH_DATE` in `.env` to an ISO string like `2026-06-15T09:00:00-08:00`.

### Add a new section
1. Add the markup to `index.html` between existing `<section>` tags.
2. Add styles to `src/styles.css` following the existing section conventions.
3. Add a keyframe to the `KF` array in `src/three-scene.js` if the 3D bottle should appear/move there.
4. Mark elements `.reveal` for scroll-in animation.

### Klaviyo VIP form
The VIP form in `src/ui.js` is wired to Klaviyo. The decided Founders Circle offer (48h early access +
$18 locked founder price + free shipping) is in BRAND_BRAIN.md §6 — keep on-offer copy consistent with it.

### Add a new ad creative variant
There's a Meta Ads Playbook docx in the parent folder. Ad creative work is separate from the site code — but if you're asked to add a new landing page variant for an ad, duplicate `index.html` into `lp-[variant].html` and update Vite's `rollupOptions.input` to include it.

## What NOT to do

- Don't migrate to React/Vue/Next/Astro without explicit ask. The vanilla approach is intentional — keeps build small and Claude Code edits predictable.
- Don't add a CSS framework. Existing CSS variables cover everything.
- Don't add analytics SDKs unless asked. (Plausible or Fathom would be the right call when added.)
- Don't introduce TypeScript mid-project.
- Don't break the existing keyframe-based bottle flow without showing the user a side-by-side first.

## Useful commands

```bash
npm run dev        # local dev server
npm run build      # production build to dist/
npm run preview    # preview the built site

git add . && git commit -m "..." && git push   # deploy (triggers GH Actions)
```

## When in doubt

Match the existing code style. Read 3 nearby functions before writing a new one. Keep it small, fast,
and on-brand — and "on-brand" is defined by BRAND_BRAIN.md, not by memory.
