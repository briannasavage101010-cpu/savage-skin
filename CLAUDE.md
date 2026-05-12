# Savage Skin — Codebase Context for Claude Code

This file gives Claude Code the context it needs to be useful in this project. Read it before making changes.

## What this is

A marketing site + storefront for **Savage Skin**, a clinical-grade skincare brand. Built with Vite (vanilla JS, no framework). Deploys to GitHub Pages via GitHub Actions. Checkout is wired to Shopify via the Storefront API.

The brand voice is edgy, anti-pretty, clinical-but-loud — "Skincare with teeth," "Stay feral," "Glow loud." When you generate copy, match this voice. Never write soft skincare-influencer copy ("luxurious self-care moment," "treat yourself," etc.).

## Tech stack

- **Build:** Vite 5
- **3D:** Three.js (r160) — npm import, not CDN
- **Scroll:** Lenis (smooth scroll)
- **Hosting:** GitHub Pages (via Actions workflow)
- **Commerce:** Shopify Storefront API (GraphQL)
- **Forms:** localStorage right now; Klaviyo wiring is stubbed

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

- Short sentences. Punchy. Confident.
- Use percentages ("15% L-Ascorbic"), not adjectives ("powerful vitamin C").
- "Receipts" = proof, evidence, peer-reviewed studies.
- Phrases that fit: Stay feral. Glow loud. Skincare with teeth. Clinical, not cute. No watered-down whatever. Receipts always.
- Phrases that DON'T fit: Pamper. Self-care moment. Glow up (too generic). Pretty. Luxurious. Treat yourself.
- Italics + serif (Fraunces) for emphasis words in headlines.

## Colors

- `--bg` `#06060a` — page background
- `--neon` `#ff2d95` — primary accent (magenta-pink)
- `--cyan` `#00f0ff` — secondary accent
- `--violet` `#b026ff` — tertiary accent
- `--gold` `#e5c26b` — premium accent (use sparingly)
- `--bone` `#f2f1ec` — primary text

## Shopify integration

Products are fetched by handle on page load. If `VITE_SHOPIFY_DOMAIN` or `VITE_SHOPIFY_STOREFRONT_TOKEN` is missing, the site falls back to static product data in `src/products.js`. This means the site always renders even without Shopify configured.

Product handles in `src/products.js` MUST match the handles in Shopify admin exactly:
- `war-paint-cleanser`
- `riot-acid-toner`
- `power-fix-serum`
- `feral-glow-oil`

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

### Wire Klaviyo VIP form
Edit `src/ui.js`, find the `vipForm.addEventListener('submit', ...)` block. Replace the localStorage write with a fetch to the Klaviyo subscribe endpoint using `import.meta.env.VITE_KLAVIYO_*`.

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

Match the existing code style. Read 3 nearby functions before writing a new one. Keep it small, fast, and on-brand.
