/**
 * Product Catalog
 *
 * Each product has:
 * - slug: internal identifier
 * - handle: Shopify product handle (URL slug in Shopify admin). Must match exactly.
 * - step: visual step label on the product card
 * - tag: small badge ("New", "Cult", "Hero")
 * - name, desc, size: copy
 * - price, sale: fallback price strings shown if Shopify data is unavailable
 * - serum: gradient colors for the SVG bottle liquid (light, main, dark)
 * - cap: neon ring color on the bottle cap
 */

export const PRODUCTS = [
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
    serum: { light: '#d99fff', main: '#b026ff', dark: '#3a0a5a' },
    cap: '#00f0ff',
  },
  {
    slug: 'serum',
    handle: 'power-fix-spot-corrector',
    step: '03 · TREAT',
    tag: 'Hero',
    name: 'Power Fix Spot Corrector',
    desc: "15% L-Ascorbic + Matrixyl, formulated to help brighten and even tone. Always follow with SPF.",
    size: '30ml · AM Treatment',
    price: '$34',
    sale: null,
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
    serum: { light: '#f3e07b', main: '#e5c26b', dark: '#4a3a0a' },
    cap: '#ff2d95',
  },
  {
    slug: 'lipgloss',
    handle: 'glass-glow-lip-gloss',
    step: '05 · GLOSS',
    tag: 'New',
    name: 'Glass Glow Lip Gloss',
    desc: 'Peptide + hyaluronic shine. Plumps and softens for a glassy, non-sticky finish.',
    size: '8ml · Anytime',
    price: '$16',
    sale: null,
    serum: { light: '#ffd0e6', main: '#ff7ec4', dark: '#5a0a35' },
    cap: '#b026ff',
  },
];
