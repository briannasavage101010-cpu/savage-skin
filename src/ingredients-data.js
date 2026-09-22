/**
 * Ingredient layer data for the /ingredients scroll experience.
 *
 * DRAFT COPY — Brianna to correct. No percentages are stated anywhere: the
 * site does not claim active percentages any more, and none are confirmed for
 * the Lip Pod formula. Keep claims cosmetic, gentle + teen-appropriate
 * and consistent with the site's "designed to help / results vary" voice.
 *
 * Per ingredient:
 *  - name:   ingredient name (the layer label)
 *  - pct:    optional percentage string ("" to hide)
 *  - type:   'liquid' (wobbling liquid the bottle splashes through) or
 *            'powder' (particle-puff layer that scatters)
 *  - color:  the liquid/powder color — keyed to the ingredient's REAL color but
 *            boosted so layers stay distinct (clear/watery actives get a soft
 *            translucent tint rather than going invisible). Tweak freely.
 *  - effect: one plain-English line on what it does
 *
 * SCOPE — 2026-09-21: Savage Skin is a ONE-PRODUCT brand (the Lip Pod). The four
 * face SKUs (Power Fix, Clean Start, Prime Time, Dew Guard) were shelved on
 * 2026-09-11 and their entries are removed from this file. Do not re-add them,
 * and do not reintroduce active percentages ("15% vitamin C", "3% Matrixyl") —
 * that copy is retired sitewide per BRAND_BRAIN.md §2 and §5.
 */

export const INGREDIENT_PRODUCTS = [
  {
    slug: 'lipgloss',
    handle: 'lip-pod-wearable-gloss-case',
    name: 'Lip Pod',
    tagline: 'Step 01 · Lips',
    accent: '#ff7ec4',
    layers: [
      { name: 'Hyaluronic Acid', pct: '', type: 'liquid', color: '#d6e6ee', effect: 'Draws water into lips for a cushioned, hydrated plump — no sting, no irritation.' },
      { name: 'Squalane', pct: '', type: 'liquid', color: '#ecdfc8', effect: 'A weightless emollient that seals everything in — the overnight-mask step, in one tube.' },
      { name: 'Glycerin', pct: '', type: 'liquid', color: '#d3e4ea', effect: 'A humectant that keeps lips soft and hydrated all day — your daily balm.' },
      { name: 'Vitamin E', pct: '', type: 'powder', color: '#e0a94f', effect: 'An antioxidant that conditions and softens lips against daily wear.' },
    ],
  },
];

export const getIngredientProduct = (slug) =>
  INGREDIENT_PRODUCTS.find((p) => p.slug === slug) || INGREDIENT_PRODUCTS[0];
