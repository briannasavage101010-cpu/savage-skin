/**
 * Savage Skin — Product detail page entry.
 * Each products/<handle>/index.html sets window.__PRODUCT_HANDLE__
 * before importing this script.
 */
import './styles.css';

import { PRODUCTS } from './products.js';
import { productVisual } from './svg-bottle.js';
import { initSmoothScroll, initCursor, initScrollProgress } from './ui.js';
import { initReveal } from './reveal.js';
import { initCookieConsent } from './cookie-consent.js';
import { initMobileNav } from './mobile-nav.js';

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
  // These JS-rendered PDPs are all Drop 02 face products — not on sale yet.
  // No buyable price, no add-to-cart: the hero routes to the Drop 01 list + vote.
  const title = live?.title || STATIC.name;

  return `
    <section class="pdp-hero" data-scene="hero">
      <div class="container pdp-grid">
        <div class="pdp-visual reveal" style="--accent:${STATIC.accent || '#ff2d95'}">
          <div class="float-chip">/ ${STATIC.step}</div>
          <div class="float-chip right">Drop 02</div>
          <div class="grid-lines"></div>
          <div class="glow-orb"></div>
          ${productVisual(STATIC, STATIC_INDEX, { eager: true })}
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
            <div class="pdp-price"><span class="pdp-waitlist-note">Coming in Drop 02</span></div>
            <a class="btn btn-primary magnetic" href="/#join"><span>Join the movement <span class="arr">→</span></span></a>
          </div>
          <div class="pdp-trust reveal d3">
            <span>✓ Real actives, real percentages</span>
            <span>✓ Every ingredient in plain English</span>
            <span>✓ Cruelty-free</span>
          </div>
          <p class="pdp-help reveal d3">Vote on what drops next · <a href="/shipping-returns/">Shipping &amp; Returns</a> · <a href="/faq/">FAQ</a></p>
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
        <p class="pdp-safety">New to active ingredients? Patch-test before first use, introduce one product at a time, and always wear a broad-spectrum SPF during the day — acids and vitamin C can increase sun sensitivity. Results vary. Not medical advice.</p>
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
              <a class="pdp-routine-card reveal d${i + 1} magnetic" href="/products/${p.handle}/" style="--accent:${p.accent || '#ff2d95'}">
                <div class="pdp-routine-visual">
                  <div class="grid-lines"></div>
                  <div class="glow-orb"></div>
                  ${productVisual(p, PRODUCTS.indexOf(p) + 100)}
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
}

/**
 * Custom pages author their own markup in <main id="pdpRoot" data-custom>.
 * We only inject the SVG bottle into the [data-bottle] slot and, once Shopify
 * data arrives, sync the live price + variant — never overwriting the page.
 */
function renderCustomBottle() {
  const slot = document.querySelector('[data-bottle]');
  if (slot && !slot.dataset.rendered) {
    slot.innerHTML = productVisual(STATIC, STATIC_INDEX, { eager: true });
    slot.dataset.rendered = 'true';
  }
}

function boot() {
  if (!STATIC) {
    console.error('Unknown product handle:', HANDLE);
    return;
  }
  const root = document.getElementById('pdpRoot');
  const custom = Boolean(root && root.hasAttribute('data-custom'));

  // Custom pages own their <title> + meta description; only JS-rendered pages
  // get them filled in from the static catalog.
  if (!custom) {
    document.title = `${STATIC.name} — Savage Skin`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', STATIC.desc);
  }

  initSmoothScroll();
  initScrollProgress();
  initCookieConsent();
  initMobileNav();

  // Nothing is for sale yet — pages render from the static catalog only.
  // Lip Service is community-only (Drop 01, coming soon); the four face SKUs
  // are Drop 02. No Shopify fetch, no cart, no buyable prices.
  if (custom) {
    renderCustomBottle();
  } else {
    renderPage(null);
  }
  initReveal();
  initCursor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
