# Savage Skin

Skincare with teeth. Clinical-grade formulas, savage attitude.

This is the marketing site for Savage Skin — a Vite-powered storefront with Three.js 3D product visuals, Lenis smooth scroll, and Shopify Storefront API integration for real checkout.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (opens http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Full Setup — Step by Step

### 1. Install Node.js

If you don't have Node, install version 20+ from [nodejs.org](https://nodejs.org). Check with:

```bash
node --version
```

### 2. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Then in this project folder, run `claude` to start it. Claude Code will read `CLAUDE.md` automatically for context.

### 3. Install Project Dependencies

```bash
cd savage-skin
npm install
```

### 4. Set Up Shopify Storefront API

1. Log into your Shopify admin.
2. Go to **Settings → Apps and sales channels → Develop apps**.
3. Click **Create an app**, name it "Savage Skin Storefront".
4. Click **Configure Storefront API scopes** and enable:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_read_customers` (optional, for VIP signup)
5. Click **Install app** in the top right.
6. Copy the **Storefront API access token**.
7. Note your `*.myshopify.com` domain (NOT your custom domain).

Copy `.env.example` to `.env` and fill in:

```
VITE_SHOPIFY_DOMAIN=savage-skin.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx
```

### 5. Create Your Products in Shopify

The site expects 4 products with these **handles** (URL slugs). Create them in Shopify admin:

| Product Name | Handle | Notes |
|---|---|---|
| War Paint Cleanser | `war-paint-cleanser` | Step 1, Cleanse |
| Riot Acid Toner | `riot-acid-toner` | Step 2, Tone |
| Power Fix Serum | `power-fix-serum` | Step 3, Treat (hero) |
| Feral Glow Oil | `feral-glow-oil` | Step 4, Protect |

If you want different handles, edit them in `src/products.js`.

The site will gracefully fall back to static prices/data if Shopify is unreachable or products don't exist yet — so you can deploy before products are ready.

### 6. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/savage-skin.git
git push -u origin main
```

### 7. Enable GitHub Pages Deployment

1. Go to your repo on GitHub → **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Add your secrets at **Settings → Secrets and variables → Actions → New repository secret**:
   - `VITE_SHOPIFY_DOMAIN`
   - `VITE_SHOPIFY_STOREFRONT_TOKEN`
   - (optional) `VITE_KLAVIYO_LIST_ID`, `VITE_KLAVIYO_PUBLIC_KEY`, `VITE_LAUNCH_DATE`
4. Push any commit to `main` — GitHub Actions will build and deploy automatically.

Your site will be live at `https://YOUR-USERNAME.github.io/savage-skin/` in ~2 minutes.

### 8. Custom Domain (Optional)

When you're ready to point `savageskin.co` (or your domain) at the site:

1. In `vite.config.js`, change the `base` line to `base: '/'`.
2. In GitHub: **Settings → Pages → Custom domain** → enter your domain → save.
3. At your domain registrar, add a CNAME record: `www` → `YOUR-USERNAME.github.io`.
4. Check **Enforce HTTPS**.

## Project Structure

```
savage-skin/
├── .github/workflows/deploy.yml   # Auto-deploy on push to main
├── public/                        # Static assets (logo, videos, mockups)
├── src/
│   ├── main.js                    # Entry point — orchestrates init
│   ├── styles.css                 # All styles (dark luxe + neon)
│   ├── three-scene.js             # Flowing 3D bottle (Three.js)
│   ├── molecule.js                # 2D canvas molecule animation
│   ├── svg-bottle.js              # SVG bottle template + factory
│   ├── products.js                # Product catalog (handles, copy, colors)
│   ├── shopify.js                 # Storefront API client + cart
│   ├── ui.js                      # Cursor, smooth scroll, countdown, VIP form
│   └── reveal.js                  # Scroll reveal observer
├── index.html                     # Vite entry markup
├── package.json
├── vite.config.js
├── .env.example                   # Copy to .env for your secrets
├── CLAUDE.md                      # Context for Claude Code
└── README.md
```

## Working with Claude Code

In this folder, run `claude` to start an interactive session. Helpful prompts:

- `"Add a new product to the catalog called X with handle Y"` — Claude will edit `src/products.js` and add the matching Shopify entry.
- `"Wire the VIP form to Klaviyo"` — Claude will implement the Klaviyo subscribe API call in `src/ui.js`.
- `"Add a press section between manifesto and reviews"` — Claude will add markup, styles, and reveal triggers.
- `"Optimize the hero 3D bottle for mobile"` — Claude will tune the keyframes and pixel ratio.

See `CLAUDE.md` for full codebase context that Claude Code reads on startup.

## Brand & Copy

- **Voice:** Edgy, anti-pretty, clinical-but-loud. "Skincare with teeth." "Stay feral." "Glow loud."
- **Tagline:** Skincare with teeth.
- **Hero copy:** Clinical-grade actives. Savage attitude. Engineered for skin that refuses to be polite, predictable, or perfect.
- **Pillars:** Clinical Not Cute · Loud Skin Energy · Receipts Always
- **Ritual:** Cleanse → Tone → Treat → Protect

## Performance Notes

- One shared WebGL context renders the hero 3D scene — no duplicate canvases.
- Product bottles are SVG (not 3D) — gorgeous and fast.
- Three.js, Lenis are split into separate chunks for caching.
- Reduced motion is respected for accessibility.

## License

MIT
