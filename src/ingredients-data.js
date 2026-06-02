/**
 * Ingredient layer data for the /ingredients scroll experience.
 *
 * DRAFT COPY — Brianna to correct. Percentages are only included where they
 * already appear on the live site (Power Fix actives, Prime Time acid blend);
 * everything else is left without a number on purpose, to avoid stating a
 * percentage that hasn't been confirmed. Keep claims gentle + teen-appropriate
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
 */

export const INGREDIENT_PRODUCTS = [
  {
    slug: 'serum',
    handle: 'power-fix-spot-corrector',
    name: 'Power Fix Spot Corrector',
    tagline: 'Step 03 · Treat',
    accent: '#ff2d95',
    layers: [
      { name: 'L-Ascorbic Acid', pct: '15%', type: 'liquid', color: '#f3b53b', effect: 'Pure vitamin C. Brightens dull skin and helps fade dark spots over time.' },
      { name: 'Niacinamide', pct: '5%', type: 'powder', color: '#cdd9e4', effect: 'Calms redness, helps with the look of pores, and strengthens your skin barrier.' },
      { name: 'Matrixyl-3000', pct: '3%', type: 'liquid', color: '#e3d6a6', effect: 'A peptide blend that signals your skin to firm up and smooth fine lines.' },
      { name: 'Bakuchiol', pct: '1%', type: 'powder', color: '#d6a94e', effect: 'A gentle, plant-based alternative to retinol — smooths texture without the irritation.' },
    ],
  },
  {
    slug: 'cleanser',
    handle: 'clean-start-cleanser',
    name: 'Clean Start Cleanser',
    tagline: 'Step 01 · Cleanse',
    accent: '#00f0ff',
    layers: [
      { name: 'Salicylic Acid', pct: '', type: 'liquid', color: '#bfe0e0', effect: 'An oil-loving acid that gets inside pores and clears out what causes breakouts.' },
      { name: 'Amino-Acid Cleansers', pct: '', type: 'liquid', color: '#eef2ee', effect: 'Gentle, plant-derived cleansers that lift off dirt and sunscreen without stripping skin.' },
      { name: 'Glycerin', pct: '', type: 'liquid', color: '#d3e4ea', effect: 'Pulls water into the skin so it never feels tight or squeaky after washing.' },
      { name: 'Allantoin', pct: '', type: 'powder', color: '#e6edf0', effect: 'Soothes irritation and calms redness while you cleanse.' },
    ],
  },
  {
    slug: 'toner',
    handle: 'prime-time-toner',
    name: 'Prime Time Toner',
    tagline: 'Step 02 · Tone',
    accent: '#b026ff',
    layers: [
      { name: 'Glycolic Acid', pct: '', type: 'liquid', color: '#dde9ef', effect: 'The smallest exfoliating acid — dissolves dead surface cells for smoother, brighter skin.' },
      { name: 'Lactic Acid', pct: '', type: 'liquid', color: '#ecefe0', effect: 'A gentler exfoliating acid that resurfaces while it hydrates. (10% blend with glycolic.)' },
      { name: 'Niacinamide', pct: '', type: 'powder', color: '#cdd9e4', effect: 'Evens out tone and keeps the barrier strong so exfoliating doesn’t irritate.' },
      { name: 'Panthenol (Pro-Vitamin B5)', pct: '', type: 'liquid', color: '#dceae6', effect: 'Replenishes moisture and soothes skin right after the acids do their work.' },
    ],
  },
  {
    slug: 'moisturizer',
    handle: 'dew-guard-moisturizer',
    name: 'Dew Guard Moisturizer',
    tagline: 'Step 04 · Hydrate',
    accent: '#e5c26b',
    layers: [
      { name: 'Squalane', pct: '', type: 'liquid', color: '#ecdfc8', effect: 'A weightless oil (a lot like your skin’s own) that seals in moisture without feeling greasy.' },
      { name: 'Hyaluronic Acid', pct: '', type: 'liquid', color: '#d6e6ee', effect: 'Holds many times its weight in water to plump and deeply hydrate.' },
      { name: 'Bakuchiol', pct: '', type: 'powder', color: '#d6a94e', effect: 'Plant-based retinol alternative that smooths and renews while you sleep.' },
      { name: 'Ceramides', pct: '', type: 'powder', color: '#efe6d4', effect: 'Rebuild the skin barrier so moisture stays in and irritation stays out.' },
    ],
  },
  {
    slug: 'lipgloss',
    handle: 'glass-glow-lip-gloss',
    name: 'Glass Glow Lip Gloss',
    tagline: 'Step 05 · Gloss',
    accent: '#ff7ec4',
    layers: [
      { name: 'Lip Peptides', pct: '', type: 'liquid', color: '#e9d3d8', effect: 'Help soften and plump the look of lips with continued use.' },
      { name: 'Hyaluronic Acid', pct: '', type: 'liquid', color: '#d6e6ee', effect: 'Draws in water for a fuller, hydrated, glassy finish.' },
      { name: 'Vitamin E', pct: '', type: 'powder', color: '#e0a94f', effect: 'An antioxidant that softens and helps protect against daily wear.' },
    ],
  },
];

export const getIngredientProduct = (slug) =>
  INGREDIENT_PRODUCTS.find((p) => p.slug === slug) || INGREDIENT_PRODUCTS[0];
