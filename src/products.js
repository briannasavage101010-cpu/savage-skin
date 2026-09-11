/**
 * Product Catalog
 *
 * Each product has:
 * - slug: internal identifier
 * - handle: Shopify product handle (URL slug in Shopify admin). Must match exactly.
 * - url: optional page URL override. Defaults to /products/<handle>/ when absent.
 * - hero: optional flag — the hero launch product. Shown in the homepage hero
 *   section, so it is filtered OUT of the secondary "routine" grid.
 * - step: visual step label on the product card
 * - tag: small badge ("New", "Cult", "Hero")
 * - name, desc, size: copy
 * - price, sale: fallback price strings shown if Shopify data is unavailable
 *   (price = current price, sale = struck-through compare-at price)
 * - image: product packshot (square 1024×1024 white-bg PNG in public/images/products/).
 *   When set, it is shown instead of the generated SVG bottle.
 * - accent: per-product brand accent color (BRAND_BRAIN.md §7). Drives card glow,
 *   border, and hover via the CSS `--accent` custom property.
 * - serum: gradient colors for the SVG bottle liquid (light, main, dark) — fallback only
 * - cap: neon ring color on the bottle cap — fallback only
 */

export const PRODUCTS = [
  {
    slug: 'lipgloss',
    handle: 'lip-pod-wearable-gloss-case',
    // Page URL is decoupled from the Shopify handle: the handle is a legacy name
    // ("Glass Glow Lip Gloss") that must not change or checkout breaks, but the
    // page lives at the product's real name. Old slug 302s here via a stub.
    url: '/products/lip-pod/',
    hero: true,
    step: '01 · LIPS',
    tag: 'Hero',
    name: 'Lip Pod',
    desc: 'A refillable gloss tube that snaps into a jewelry-grade case and clips to your phone, your bag, or your wrist — so you stop losing it.',
    size: '1.5 ml · Refillable',
    price: '$32',
    sale: '$24',
    image: '/lip-pod/pod-hero.jpg',
    accent: '#D4537E',
    serum: { light: '#ffd0e6', main: '#ff7ec4', dark: '#5a0a35' },
    cap: '#b026ff',
  },
];
