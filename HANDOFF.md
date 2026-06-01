# Savage Skin — Session Handoff (2026-05-30)

Paste the section below into a new Claude Code session to pick up exactly where we left off.
The full state, decisions, and remaining work are captured.

---

## Paste this into a new Claude chat

> Hi Claude — I'm Brianna, solo founder of Savage Skin. Continuing a redesign in progress.
> Read CLAUDE.md, HANDOFF.md, and your memory files (`~/.claude/projects/-Users-brianna/memory/`) before doing anything. The handoff has the full plan and decisions. Pick up at Chunk 2.

---

## What's done in the prior session (2026-05-30)

**Infrastructure (background, no action needed):**
- Cert provisioning re-triggered in GitHub Pages (Settings → Pages). Waiting on Let's Encrypt — 15min to 24h. When `curl -sI https://savageskincare.com/` returns `HTTP/2 200`, tick "Enforce HTTPS" in repo settings.
- Shopify primary domain changed from `savageskincare.com` to `tbqaxz-rg.myshopify.com`. Checkout 404 is fixed. Verified: checkout URL is now `tbqaxz-rg.myshopify.com/checkouts/...`.

**Code (deployed):**
- Product detail pages: `/products/<handle>/` for all 4 products (multi-page Vite build, pulls description/price/availability from Shopify Storefront API).
- README.md + CLAUDE.md updated to hybrid voice + clean product handles (`clean-start-cleanser`, `prime-time-toner`, `power-fix-spot-corrector`, `dew-guard-moisturizer`). These match Shopify admin.
- **Chunk 1 of the redesign (just shipped):**
  - Hero: single "Reserve The Drop" CTA, 3 value-prop bullets (48h early, 15% locked, 500 spots), drop the competing "View The Lineup" button.
  - VIP form: single email field only. Inline validation. Post-signup share/refer button. Klaviyo wiring stays a one-line swap (`onSubmit({email})` callback).
  - Sticky mobile CTA bar pinned to bottom on phones (≤760px). Hides when scrolled past the VIP section. Hidden on desktop.

## Locked design direction

- **Base aesthetic:** Glossier-style clean cream minimalism (Option 3 from a 3-way design comparison)
- **Background:** light cream `#f6f2ec` (or similar bone tone) — flipping FROM `#06060a` dark
- **Primary accent:** keep magenta `#ff2d95`, used boldly as solid blocks (NOT as glow halos)
- **Drop entirely:** custom cursor, magnetic hover effects, cyan/violet neon glows, bg-mesh blurs, neon ring pulses on bottles
- **Type:** heavier sans-serif body, Fraunces italic-serif stays *only* for occasional emphasis words in headlines
- **3D elements (replacing the bottle):**
  - **B + C selected:** Soft mochi-style 3D liquid serum blobs (ambient, gentle scroll-driven deformation) + extruded 3D typography on major section headlines
  - **Drop:** the existing keyframed hero bottle in `src/three-scene.js`
- **Voice (locked, hybrid):** clean, clinical, confident, with a sharper edge than soft skincare-influencer fluff. Never aggressive ("feral / teeth / glow loud" are dead). Phrases that fit: "Clear skin confident," "Real formulas," "Peer-reviewed," "Designed for teen skin."
- **Target demo:** teens (15-19 sweet spot). Less preppy than Bubble, more attitude.

## Remaining chunks (in priority order)

**Chunk 2 — Visual identity flip (3–5 hrs, next up)**
- Swap CSS variables: `--bg` from `#06060a` → cream `#f6f2ec`, update all section backgrounds, contrast tokens, button gradients
- Remove neon-specific UI: custom cursor (`.cursor-dot`, `.cursor-ring`), bg-mesh blurs, magnetic hover effects, neon ring pulses
- Type pass: body weight 400, simpler headlines, Fraunces italic only for emphasis
- Files: `src/styles.css` (heaviest changes), `src/ui.js` (remove cursor + magnetic init), `index.html` (remove `cursor-on` body class, remove cursor divs)

**Chunk 3 — Product cards + trust bar (1–2 hrs)**
- Cards: clearer presale price line, "Reserve" label instead of "Add +", obvious step ordering
- Add trust bar under hero with defensible claims only: "Peer-reviewed actives · 15% L-Ascorbic · Cruelty-free · 30-day returns"
- Files: `src/svg-bottle.js` (card markup), `index.html` (trust bar), `src/styles.css`

**Chunk 4 — Drop bottle, add ambient blobs (4–6 hrs)**
- Remove the keyframed bottle scene in `src/three-scene.js`
- Build new ambient scene: 3–5 soft mochi-style blob shapes in magenta + bone + black, gentle float, subtle scroll-driven deformation
- One WebGL context, capped pixel ratio 1.5, paused offscreen
- Files: `src/three-scene.js` (rewrite), possibly add a `src/blob-scene.js` helper module

**Chunk 5 — 3D extruded headlines (3–4 hrs)**
- Section headlines (`The Goods.`, `Real Results.`, `The Science.`) rendered via Three.js TextGeometry — 3D extruded letters with soft material
- Per-section WebGL micro-canvases OR injected into the main scene (decide based on perf budget)
- Fall back to flat type under `prefers-reduced-motion`
- This is the lowest-priority chunk — aesthetic over conversion. Could skip if launch deadline is tight.

**Chunk 6 — A11y + perf + reduced-motion + legal footer links (2–3 hrs)**
- Real `<label>`s, focus states, alt text, ARIA on interactive bits
- Gate Lenis smooth scroll + 3D animation intensity behind `prefers-reduced-motion`
- Lazy-load reel video, hero LCP must not wait on Three.js
- Wire 4 Shopify-generated policy URLs (Privacy, Terms, Refund, Shipping) into footer
- Files: `index.html`, `src/three-scene.js`, `src/ui.js`

**Chunk 7 — Final build + verify + deploy (1–2 hrs)**
- `npm run build` clean
- Walk all sections at 375 / 768 / 1440px in dev server
- No console errors, VIP form submits + success state shows
- Shopify fallback (env vars removed) still renders
- Cart flow intact

## Open user-side tasks (parallel to coding)

1. **Generate Shopify legal policies.** Shopify admin → Settings → Policies → "Create from template" for Privacy, Terms, Refund, Shipping. Skim each, save. Send the Claude in next session the URLs so they get wired into the footer in Chunk 6.
2. **Once HTTPS cert provisions** (next 24h max): tick "Enforce HTTPS" in repo Settings → Pages.
3. **Set real prices + inventory** on the 3 Shopify products that are still SOLD OUT (only `clean-start-cleanser` has inventory + a price set). Until done, those 3 products show as "Sold Out" on the site.

## Working style for the next session

- Brianna is a solo founder, not an engineer. Give paste-ready commands, explain in plain language.
- The folder path has a trailing space: use `~/Desktop/Savage*/savage-skin` in shell commands.
- Don't migrate frameworks. Vanilla JS + Vite + Three.js + Lenis. No TypeScript. No CSS framework.
- Use `gh` CLI for GitHub queries (it's installed).
- Claude for Chrome MCP integration is set to "On All Sites" but admin.shopify.com / shopify.com are blocked at the MCP-integration level (not the extension level). GitHub navigation works.
- Brianna prefers fast execution over detailed inline diff tables. Show diffs only for user-facing copy changes (per the brief).
- Brand voice rules in CLAUDE.md are the source of truth — read those before writing any copy.

## Files modified in this session

- `index.html` — hero copy + VIP form + sticky CTA markup
- `src/styles.css` — hero bullets, form polish, sticky CTA, PDP styles (from earlier)
- `src/ui.js` — single-email VIP form, sticky CTA init, share button
- `src/main.js` — wire `initStickyCta`
- `src/shopify.js` — added `getProductDetail()` query (earlier)
- `src/product-page.js` — NEW — entry script for `/products/<handle>/` pages
- `src/svg-bottle.js` — product cards link to detail pages
- `products/<handle>/index.html` × 4 — NEW
- `vite.config.js` — multi-page build inputs
- `README.md` — voice + handles
- `CLAUDE.md` — handles only (voice was already correct)
- `HANDOFF.md` — this file

## Verification commands

```bash
cd ~/Desktop/Savage*/savage-skin

# Latest deploy status
gh run list -R briannasavage101010-cpu/savage-skin --limit 3

# HTTPS cert check (when it returns HTTP/2 200, cert is live)
curl -sI https://savageskincare.com/ | head -3

# Run dev server locally
npm run dev      # http://localhost:5173

# Production build
npm run build
```

## Repo

- GitHub: github.com/briannasavage101010-cpu/savage-skin (public, main branch auto-deploys)
- Live: http://savageskincare.com (https pending cert)
- Shopify admin: admin.shopify.com/store/tbqaxz-rg
- Shopify storefront: tbqaxz-rg.myshopify.com
