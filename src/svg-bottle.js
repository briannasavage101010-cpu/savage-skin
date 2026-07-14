/**
 * SVG Bottle generator.
 * Returns an SVG string for a product, with gradient glass, animated liquid,
 * floating bubbles, and neon cap ring. Unique IDs per index to avoid conflicts.
 */

export function svgBottle(product, index) {
  const id = index;
  const serumLight = product.serum.light;
  const serumMain = product.serum.main;
  const serumDark = product.serum.dark;
  const cap = product.cap;
  const headline = product.name.split(' ')[0];
  const subtitle = product.name.split(' ').slice(1).join(' ').toUpperCase();
  const sizeShort = product.size.split('·')[0].trim();

  return `
<svg class="svg-bottle float-anim" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="gradGlass-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#1a1a26" stop-opacity="0.5"/>
      <stop offset="0.35" stop-color="#3a3a52" stop-opacity="0.85"/>
      <stop offset="0.55" stop-color="#1a1a26" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#0a0a14" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="gradSerum-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${serumLight}" stop-opacity="0.85"/>
      <stop offset="0.5" stop-color="${serumMain}" stop-opacity="1"/>
      <stop offset="1" stop-color="${serumDark}" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="gradCap-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#888"/>
      <stop offset="0.5" stop-color="#e6e6f0"/>
      <stop offset="1" stop-color="#555"/>
    </linearGradient>
    <radialGradient id="gradShine-${id}" cx="0.3" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#fff" stop-opacity="0.7"/>
      <stop offset="0.4" stop-color="#fff" stop-opacity="0.15"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow-${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="bodyClip-${id}">
      <path d="M 50 110 Q 50 105 55 100 L 75 88 L 75 70 L 125 70 L 125 88 L 145 100 Q 150 105 150 110 L 150 280 Q 150 295 135 295 L 65 295 Q 50 295 50 280 Z"/>
    </clipPath>
  </defs>
  <circle cx="100" cy="190" r="80" fill="${serumMain}" opacity="0.18" filter="url(#glow-${id})"/>
  <rect x="73" y="86" width="54" height="6" rx="2" fill="#2a2a3a"/>
  <rect x="78" y="62" width="44" height="26" rx="2" fill="url(#gradGlass-${id})" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
  <rect x="74" y="30" width="52" height="36" rx="3" fill="url(#gradCap-${id})" stroke="rgba(0,0,0,0.4)" stroke-width="0.5"/>
  <rect x="78" y="34" width="4" height="28" rx="1" fill="#fff" opacity="0.35"/>
  <rect class="neon-ring-pulse" x="72" y="62" width="56" height="4" rx="2" fill="${cap}" style="color:${cap}"/>
  <path d="M 50 110 Q 50 105 55 100 L 75 88 L 125 88 L 145 100 Q 150 105 150 110 L 150 280 Q 150 295 135 295 L 65 295 Q 50 295 50 280 Z" fill="url(#gradGlass-${id})" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <g clip-path="url(#bodyClip-${id})">
    <rect x="48" y="140" width="104" height="160" fill="url(#gradSerum-${id})" opacity="0.92"/>
    <g class="liquid-wave">
      <path d="M 30 142 Q 60 134 90 142 T 150 142 T 210 142 L 210 152 L 30 152 Z" fill="url(#gradSerum-${id})" opacity="0.95"/>
      <path d="M 30 144 Q 60 138 90 144 T 150 144 T 210 144 L 210 150 L 30 150 Z" fill="${serumLight}" opacity="0.6"/>
    </g>
    <circle cx="80" cy="220" r="3" fill="#fff" opacity="0.4">
      <animate attributeName="cy" values="280;160;280" dur="6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.5;0" dur="6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="110" cy="240" r="2" fill="#fff" opacity="0.5">
      <animate attributeName="cy" values="280;160;280" dur="4.5s" repeatCount="indefinite" begin="1s"/>
      <animate attributeName="opacity" values="0;0.6;0" dur="4.5s" repeatCount="indefinite" begin="1s"/>
    </circle>
    <circle cx="95" cy="200" r="2.5" fill="#fff" opacity="0.4">
      <animate attributeName="cy" values="280;160;280" dur="5.2s" repeatCount="indefinite" begin="2s"/>
      <animate attributeName="opacity" values="0;0.5;0" dur="5.2s" repeatCount="indefinite" begin="2s"/>
    </circle>
  </g>
  <rect x="62" y="180" width="76" height="78" rx="2" fill="rgba(10,10,18,0.65)" stroke="${cap}" stroke-width="0.4" opacity="0.95"/>
  <text x="100" y="200" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6" fill="#f2f1ec" letter-spacing="1.5">SAVAGE / SKIN</text>
  <line x1="68" y1="206" x2="132" y2="206" stroke="${cap}" stroke-width="0.4"/>
  <text x="100" y="226" text-anchor="middle" font-family="Fraunces, serif" font-size="14" font-style="italic" font-weight="600" fill="${serumMain}">${headline}</text>
  <text x="100" y="244" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="4.5" fill="#9a98a8" letter-spacing="1">${subtitle}</text>
  <text x="100" y="254" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="4.5" fill="#9a98a8" letter-spacing="1">${sizeShort}</text>
  <path d="M 50 110 Q 50 105 55 100 L 75 88 L 125 88 L 145 100 Q 150 105 150 110 L 150 280 Q 150 295 135 295 L 65 295 Q 50 295 50 280 Z" fill="url(#gradShine-${id})" opacity="0.6"/>
  <path d="M 52 115 L 52 280" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" fill="none"/>
  <path d="M 148 115 L 148 280" stroke="rgba(0,0,0,0.4)" stroke-width="0.8" fill="none"/>
</svg>`;
}

function escapeAttr(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Product visual. Returns the real packshot (an <img>) when the catalog entry
 * has an `image`, otherwise falls back to the generated SVG bottle.
 *
 * Photos are square 1024×1024 PNGs; width/height are declared so the browser
 * reserves the box and there's no layout shift while it loads. Pass
 * { eager:true } for above-the-fold spots (homepage hero, PDP hero) so the LCP
 * image fetches immediately; everything else lazy-loads.
 */
export function productVisual(product, index, opts = {}) {
  if (product && product.image) {
    const loadAttrs = opts.eager
      ? 'fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"';
    return `<img class="product-photo" src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" width="1024" height="1024" ${loadAttrs}>`;
  }
  return svgBottle(product, index);
}

/**
 * Render a product card with the product visual (photo, or SVG bottle fallback).
 * `liveData` is optional Shopify data (price, available, variantId) — if missing,
 * falls back to the static fields in PRODUCTS.
 */
export function renderProductCard(product, index, _liveData = null) {
  // Drop 02 routine products are NOT on sale yet. Cards are waitlist-only:
  // no buyable price, no add-to-cart — they route to the Drop 01 list + vote.
  const detailUrl = `/products/${product.handle}/`;
  const stepNum = product.step.split(' ')[0];
  const stepLabel = product.step.split('·')[1]?.trim() || product.step;
  return `
    <div class="product-card reveal d${index + 1}" data-product="${product.slug}" data-handle="${product.handle}" style="--accent:${product.accent || '#ff2d95'}">
      <a class="product-visual" href="${detailUrl}" aria-label="View ${product.name}">
        <div class="float-chip"><span class="chip-step">${stepNum}</span> ${stepLabel}</div>
        <div class="float-chip right tag-chip">Drop 02</div>
        <div class="grid-lines"></div>
        <div class="glow-orb"></div>
        ${productVisual(product, index)}
      </a>
      <div class="product-info">
        <div class="product-meta"><span>${product.size}</span></div>
        <a class="product-name product-name-link" href="${detailUrl}">${product.name}</a>
        <div class="product-desc">${product.desc}</div>
        <div class="product-foot">
          <div class="product-price-block">
            <div class="product-waitlist-note">Coming in Drop 02</div>
          </div>
          <a class="product-buy" href="/#join">Join the movement</a>
        </div>
      </div>
    </div>
  `;
}
