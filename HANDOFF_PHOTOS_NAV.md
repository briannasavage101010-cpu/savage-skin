# Savage Skin — Session Handoff (2026-06-09): Product Photos + Navigation

One-line: swapped the five generated SVG "bottle" placeholders for the real product packshots
(single source of truth), added per-product brand accents, made Lip Service the hero image, and
standardized the top nav across every page. **Nothing is committed yet** (per Brianna's request).

---

## Paste this into a new Claude chat

> Hi Claude — I'm Brianna, solo founder of Savage Skin (non-engineer; give me paste-ready commands,
> explain in plain language). Read `BRAND_BRAIN.md`, `CLAUDE.md`, `HANDOFF_PHOTOS_NAV.md`, and your
> memory files (`~/.claude/projects/-Users-brianna/memory/`) before doing anything. The repo folder
> has a trailing space — use `~/Desktop/Savage*/savage-skin` in shell commands. Last session added
> the real product photos and fixed the navigation; that work is on disk but **uncommitted**.

---

## What shipped this session

### 1. Real product photos (replaces the generated SVG bottles)
- Downloaded the five 1024×1024 white-background packshots to `public/images/products/`:
  `clean-start-cleanser.png`, `prime-time-toner.png`, `power-fix-spot-corrector.png`,
  `dew-guard-moisturizer.png`, `lip-service.png`.
- **Single source of truth:** added `image` + `accent` to each product in `src/products.js`.
- Added `productVisual(product, index, {eager})` in `src/svg-bottle.js`: returns an `<img>` when the
  product has an `image`, otherwise falls back to the old `svgBottle()`. Every render path now uses it:
  - homepage product grid (`renderProductCard`)
  - homepage hero — Lip Service packshot (`<img class="hero-product-img">` in `index.html`)
  - 4 JS product pages (`renderHero` + the "complete the routine" cross-sell)
  - the static Lip Service page (`renderCustomBottle` hydrates `[data-bottle]`)
- Removed the unused old placeholder `public/cleanser-mockup.png`.

### 2. Brand polish
- Per-product accent via a single `--accent` CSS custom property on each card/visual; tints/borders
  use `color-mix()`. Hexes match **BRAND_BRAIN.md §7** exactly: cleanser `#1D9E75`, toner `#7F77DD`,
  Power Fix `#EF9F27`, moisturizer `#378ADD`, lip `#D4537E`.
- Photo tiles are pure white so the white-bg PNGs sit seamlessly.

### 3. Quality
- Lazy-load everything except the two above-the-fold hero packshots, which are eager +
  `fetchpriority="high"` (LCP). Intrinsic `width/height="1024"` → no layout shift. `alt` = product name.

### 4. Consistent navigation (every page)
- Standardized the top nav to **Shop · Ingredients · Science · Journal · Story · VIP** on all 13 pages.
  Previously each page template had a different hand-written nav, so Journal (blog) and Story only
  showed on some pages.
- Blog pages are generated — the nav lives in `scripts/build-blog.mjs`; regenerate with `npm run blog`.
- Raised the mobile hamburger breakpoint 760 → 960px so the 6-item row only shows where it fits.

## Files changed (all uncommitted)

**Photos:** `src/products.js`, `src/svg-bottle.js`, `src/product-page.js`, `src/styles.css`,
`index.html`, `products/glass-glow-lip-gloss/index.html`, deleted `public/cleanser-mockup.png`,
added `public/images/products/*.png` (5).

**Nav:** `index.html`, `founders/index.html`, `faq/index.html`, `shipping-returns/index.html`,
`cookies/index.html`, `ingredients/index.html`, `products/*/index.html` (5), `scripts/build-blog.mjs`,
and the regenerated `blog/**/index.html` (7). Breakpoint change in `src/styles.css`.

> Note: `BRAND_BRAIN.md` / `CLAUDE.md` also show as modified in git — that was Brianna's tooling
> (the `@BRAND_BRAIN.md` import), not this session's code work.

---

## ✅ What worked

- **One helper, one data file.** Putting `image`/`accent` in `src/products.js` and routing every
  visual through `productVisual()` meant a single change propagated to the grid, hero, and all PDPs.
  Keeping `svgBottle()` as the fallback means nothing breaks if a photo is ever missing.
- **Pure-white tiles for white-bg PNGs.** The live palette is cream/light (`--bg:#f7f3ed`), so a pure
  `#fff` tile makes the white packshot edges disappear — clean, seamless, editorial.
- **`--accent` custom property + `color-mix()`.** Threaded one variable per card; accent flows to the
  chips, hover border, and glow without per-product CSS rules.
- **Vite `public/` is zero-config.** `/images/products/*.png` worked in dev and copied to `dist/` on
  build with no `vite.config` change.
- **Exact-string Node script for the multi-file nav edits.** Replacing identical nav blocks across ~10
  files with a fixed-string (non-regex) script was fast and safe; verified after with a grep.
- **Editing the blog *generator*, not the generated HTML.** Changed `scripts/build-blog.mjs` then ran
  `npm run blog`; hand-edits to `blog/**/index.html` would have been overwritten.
- **Verifying in the browser, not by eyeballing code.** Used the preview tools to confirm each image
  loaded (`naturalWidth`), the eager/lazy attributes, accents, and that the nav fit at each width.

## ⚠️ What didn't work (and the fixes)

- **Demoting "Story" to the footer read as deleting it.** When standardizing the nav I moved Story out
  of the top nav into the footer — right after Brianna had asked where the story went. It looked gone
  *again*. **Lesson: don't remove a user-facing link the user just asked about; keep visible things
  visible.** Final nav keeps both Journal and Story.
- **The 6-item nav overflowed at tablet widths (~760–960px).** Fixed by raising the hamburger
  breakpoint to 960px (`src/styles.css` line ~73). `mobile-nav.js` has no width logic — it's pure CSS.
- **Preview screenshots came back BLANK right after a scroll/navigation.** Repaint/Lenis timing. Fix:
  take a second screenshot, or read back the scroll state first, then shoot.
- **Lenis smooth scroll fights `window.scrollTo` + the reveal animation.** `.reveal` elements stay at
  `opacity:0` until scrolled into view, so deep-scroll screenshots were empty. For screenshots I
  injected a temporary `.reveal{opacity:1 !important;transform:none}` style (not committed).
- **Opaque white PNGs hide anything behind them.** "Glow behind the image" effects were invisible —
  the photo covers them. Moved accents to chips/hover/borders; enlarged the hero glow to 116% so it
  peeks *around* the packshot.
- **Faint square seam** where a white photo met a tinted tile → fixed by making tiles pure `#fff`.
- **The preview MCP server dropped mid-session** ("Server not found"); restarted via `preview_start`.
- **`preview_resize` ignored `preset` + custom width together** (reset to native); explicit
  `width`/`height` worked.
- **CLAUDE.md is stale** ("Dark luxe + neon"). The site is cream/light. **BRAND_BRAIN.md is the real
  source of truth** — verify against live CSS, not the doc.
- **Sync hazard (known):** repo lives on iCloud Desktop and is open in GitHub Desktop; tracked config
  files (`vite.config.js`, `package.json`) can revert mid-edit. Didn't bite content files this session,
  but re-assert config edits right before building.

---

## Current state

- Dev server runs at `http://localhost:5173` (`npm run dev`).
- `npm run build` is clean (~0.5s). All five images ship to `dist/images/products/`.
- **Uncommitted by request.** Verified visually: homepage grid, homepage hero (desktop + mobile),
  cleanser PDP, Lip Service PDP, founders page nav, and nav fit at 796/1000/1280px.

## Open items / next steps

1. **Commit + deploy when ready** (see commands below). Pushing to `main` auto-deploys via GitHub Pages.
2. **Cart/checkout still shows Shopify's images, not these files** (`cart.js` uses Shopify `line.image`).
   To show these packshots in-cart, upload the same five images to the matching Shopify products.
3. **Blog cover / OG images** are still placeholder gradient SVGs (separate system, not touched).
4. **Footers still differ page-to-page** — offered to standardize them too; Brianna hasn't decided.
5. Power Fix (amber) + Dew Guard (blue) cards were verified by data + identical code path; only
   cleanser/toner/lip were visually screenshotted. Worth an eyeball before launch.
6. Optional: update CLAUDE.md's stale "Dark luxe" Colors section to the cream palette.

## Commit + deploy (paste-ready, when Brianna says go)

```bash
cd ~/Desktop/Savage*/savage-skin

# see everything that changed
git status

# stage + commit
git add -A
git commit -m "Add real product photos + standardize site navigation"

# deploy (pushes to main, triggers the GitHub Pages build)
git push origin main

# watch the deploy
gh run list -R briannasavage101010-cpu/savage-skin --limit 3
```

## Verification commands

```bash
cd ~/Desktop/Savage*/savage-skin
npm run dev        # local preview at http://localhost:5173
npm run build      # production build to dist/  (runs `npm run blog` separately if blog changed)
npm run blog       # regenerate blog/**/index.html from scripts/build-blog.mjs (after nav/template edits)
```

## Repo

- GitHub: github.com/briannasavage101010-cpu/savage-skin (public, `main` auto-deploys)
- Live: http://savageskincare.com
- Shopify: admin `tbqaxz-rg`, storefront `tbqaxz-rg.myshopify.com`
