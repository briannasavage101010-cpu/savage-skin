/**
 * Product Catalog
 *
 * Each product has:
 * - slug: internal identifier
 * - handle: Shopify product handle (URL slug in Shopify admin). Must match exactly.
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
    handle: 'glass-glow-lip-gloss',
    hero: true,
    step: '01 · LIPS',
    tag: 'Hero',
    name: 'Lip Service',
    desc: 'Daily balm, overnight mask, and hydration-plumper in one tube. Skincare for your lips — not another wax stick that quits by 10am.',
    size: '12ml · Day + Night',
    price: '$24',
    sale: '$18',
    image: '/images/products/lip-service.png',
    accent: '#D4537E',
    serum: { light: '#ffd0e6', main: '#ff7ec4', dark: '#5a0a35' },
    cap: '#b026ff',
  },
  {
    slug: 'cleanser',
    handle: 'clean-start-cleanser',
    step: '01 · CLEANSE',
    tag: 'New',
    name: 'Clean Start Cleanser',
    desc: 'Salicylic + amino-acid foam. Strips the day, not your barrier.',
    size: '50ml · Daily',
    price: '$20',
    sale: null,
    image: '/images/products/clean-start-cleanser.png',
    accent: '#1D9E75',
    serum: { light: '#7cf3ff', main: '#00f0ff', dark: '#0a2a3a' },
    cap: '#ff2d95',
  },
  {
    slug: 'toner',
    handle: 'prime-time-toner',
    step: '02 · TONE',
    tag: 'Cult',
    name: 'Prime Time Toner',
    desc: '10% glycolic + lactic. Resurfaces and refines. Smooth, clear skin.',
    size: '100ml · 3x weekly',
    price: '$26',
    sale: null,
    image: '/images/products/prime-time-toner.png',
    accent: '#7F77DD',
    serum: { light: '#d99fff', main: '#b026ff', dark: '#3a0a5a' },
    cap: '#00f0ff',
  },
  {
    slug: 'serum',
    handle: 'power-fix-spot-corrector',
    step: '03 · TREAT',
    tag: 'Cult',
    name: 'Power Fix Spot Corrector',
    desc: "15% L-Ascorbic + Matrixyl, formulated to help brighten and even tone. Always follow with SPF.",
    size: '30ml · AM Treatment',
    price: '$34',
    sale: null,
    image: '/images/products/power-fix-spot-corrector.png',
    accent: '#EF9F27',
    serum: { light: '#ff8fc5', main: '#ff2d95', dark: '#5a0a30' },
    cap: '#e5c26b',
  },
  {
    slug: 'moisturizer',
    handle: 'dew-guard-moisturizer',
    step: '04 · HYDRATE',
    tag: 'New',
    name: 'Dew Guard Moisturizer',
    desc: 'Squalane + bakuchiol blend. Hydrates and seals everything in. Barrier locked.',
    size: '30ml · PM Seal',
    price: '$24',
    sale: null,
    image: '/images/products/dew-guard-moisturizer.png',
    accent: '#378ADD',
    serum: { light: '#f3e07b', main: '#e5c26b', dark: '#4a3a0a' },
    cap: '#ff2d95',
  },
];
