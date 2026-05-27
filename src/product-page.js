/**
 * Savage Skin — Product detail page entry.
 * Each products/<handle>/index.html sets window.__PRODUCT_HANDLE__
 * before importing this script.
 */
import './styles.css';

import { PRODUCTS } from './products.js';
import { svgBottle } from './svg-bottle.js';
import { getProductDetail, addToCartAndCheckout, shopifyConfigured } from './shopify.js';
import { initSmoothScroll, initCursor, initScrollProgress } from './ui.js';
import { initReveal } from './reveal.js';

const HANDLE = window.__PRODUCT_HANDLE__;
const STATIC = PRODUCTS.find((p) => p.handle === HANDLE);
const STATIC_INDEX = PRODUCTS.findIndex((p) => p.handle === HANDLE);

function fmtPrice(s) {
  return s || '';
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHero(live) {
  const price = live?.price || STATIC.price;
  const compareAt = live?.compareAtPrice || STATIC.sale;
  const available = live?.available !== false;
  const variantId = live?.variantId || '';
  const title = live?.title || STATIC.name;

  return `
    <section class="pdp-hero" data-scene="hero">
      <div class="container pdp-grid">
        <div class="pdp-visual reveal">
          <div class="float-chip">/ ${STATIC.step}</div>
          <div class="float-chip right">${escapeHtml(price)}</div>
          <div class="grid-lines"></div>
          <div class="glow-orb"></div>
          ${svgBottle(STATIC, STATIC_INDEX)}
        </div>
        <div class="pdp-info">
          <div class="reveal"><div class="section-tag">/ ${STATIC.step}</div></div>
          <h1 class="pdp-title reveal d1">${escapeHtml(title)}</h1>
          <div class="pdp-meta reveal d1">
            <span>${escapeHtml(STATIC.size)}</span>
            <span class="tag">${escapeHtml(STATIC.tag)}</span>
          </div>
          <p class="pdp-tagline reveal d2">${escapeHtml(STATIC.desc)}</p>
          <div class="pdp-price-row reveal d2">
            <div class="pdp-price">
              ${compareAt ? `<s>${escapeHtml(compareAt)}</s>` : ''}
              ${escapeHtml(price)}
            </div>
            <button
              class="btn btn-primary magnetic pdp-buy"
              type="button"
              data-variant="${escapeHtml(variantId)}"
              ${available ? '' : 'disabled'}>
              <span>${available ? 'Add to Cart' : 'Sold Out'} ${available ? '<span class="arr">→</span>' : ''}</span>
            </button>
          </div>
          <div class="pdp-trust reveal d3">
            <span>✓ Clinical percentages</span>
            <span>✓ Peer-reviewed</span>
            <span>✓ Cruelty-free</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderDescription(live) {
  const html =
    live?.descriptionHtml ||
    `<p>${escapeHtml(STATIC.desc)}</p>`;
  return `
    <section class="pdp-section">
      <div class="container pdp-narrow">
        <div class="reveal"><div class="section-tag">/ The formula</div></div>
        <h2 class="section-title reveal d1">What it <em>does.</em></h2>
        <div class="pdp-prose reveal d2">${html}</div>
      </div>
    </section>
  `;
}

function renderHowToUse() {
  const usage = {
    'clean-start-cleanser': [
      ['AM + PM', 'Massage onto damp skin in circular motions. Rinse with lukewarm water.'],
      ['Pair with', 'Prime Time Toner three nights a week.'],
    ],
    'prime-time-toner': [
      ['3x weekly · PM only', 'Apply with cotton pad after cleansing. Avoid the eye area.'],
      ['Always follow with', 'Dew Guard Moisturizer to seal in hydration.'],
    ],
    'power-fix-spot-corrector': [
      ['AM · daily', '3–4 drops onto clean, dry skin before moisturizer.'],
      ['Always layer', 'SPF 30+ during the day. Vitamin C + sun = your team.'],
    ],
    'dew-guard-moisturizer': [
      ['AM + PM', 'A pearl-sized amount, pressed into skin as the last step.'],
      ['Bonus', 'Use over Power Fix in the morning to lock in actives.'],
    ],
  };
  const steps = usage[HANDLE] || [['Apply', 'Use as part of your daily routine.']];
  return `
    <section class="pdp-section pdp-section-tint">
      <div class="container pdp-narrow">
        <div class="reveal"><div class="section-tag">/ How to use</div></div>
        <h2 class="section-title reveal d1">The <em>ritual.</em></h2>
        <div class="pdp-steps">
          ${steps
            .map(
              ([when, how], i) => `
              <div class="pdp-step reveal d${i + 1}">
                <div class="pdp-step-n">/ 0${i + 1}</div>
                <div class="pdp-step-when">${escapeHtml(when)}</div>
                <div class="pdp-step-how">${escapeHtml(how)}</div>
              </div>`
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderRoutine() {
  const others = PRODUCTS.filter((p) => p.handle !== HANDLE);
  return `
    <section class="pdp-section">
      <div class="container">
        <div class="reveal"><div class="section-tag">/ Complete the routine</div></div>
        <h2 class="section-title reveal d1">Pair it <em>up.</em></h2>
        <div class="pdp-routine">
          ${others
            .map(
              (p, i) => `
              <a class="pdp-routine-card reveal d${i + 1} magnetic" href="/products/${p.handle}/">
                <div class="pdp-routine-visual">
                  <div class="grid-lines"></div>
                  <div class="glow-orb"></div>
                  ${svgBottle(p, PRODUCTS.indexOf(p) + 100)}
                </div>
                <div class="pdp-routine-info">
                  <div class="product-meta"><span>${escapeHtml(p.step)}</span><span class="tag">${escapeHtml(p.tag)}</span></div>
                  <div class="product-name">${escapeHtml(p.name)}</div>
                  <div class="pdp-routine-cta">View product <span class="arr">→</span></div>
                </div>
              </a>`
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function renderPage(live) {
  const root = document.getElementById('pdpRoot');
  if (!root) return;
  root.innerHTML =
    renderHero(live) +
    renderDescription(live) +
    renderHowToUse() +
    renderRoutine();

  // Bind add-to-cart
  const buyBtn = root.querySelector('.pdp-buy');
  if (buyBtn) {
    buyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = buyBtn.dataset.variant;
      if (variantId) {
        buyBtn.disabled = true;
        buyBtn.querySelector('span').textContent = 'Adding…';
        try {
          await addToCartAndCheckout(variantId, 1);
        } finally {
          buyBtn.disabled = false;
        }
      } else {
        window.location.href = '/#vip';
      }
    });
  }
}

async function boot() {
  if (!STATIC) {
    console.error('Unknown product handle:', HANDLE);
    return;
  }
  document.title = `${STATIC.name} — Savage Skin`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', STATIC.desc);

  initSmoothScroll();
  initScrollProgress();
  renderPage(null);
  initReveal();
  initCursor();

  if (shopifyConfigured) {
    const live = await getProductDetail(HANDLE);
    if (live) {
      renderPage(live);
      initReveal();
      initCursor();
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
