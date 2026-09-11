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
import { initAnalytics } from './analytics.js';
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

// NOTE: renderHero/renderDescription/renderHowToUse/renderRoutine/renderPage are
// currently unreachable. They drove the four Drop 02 face SKUs, which were pulled
// on 2026-09-11. The only PDP left — the Lip Pod — sets data-custom on #pdpRoot and
// takes the renderCustomBottle() path below. Kept for when a second SKU lands.
function renderHero(live) {
  const title = live?.title || STATIC.name;

  return `
    <section class="pdp-hero" data-scene="hero">
      <div class="container pdp-grid">
        <div class="pdp-visual reveal" style="--accent:${STATIC.accent || '#ff2d95'}">
          <div class="float-chip">/ ${STATIC.step}</div>
          <div class="float-chip right">Coming soon</div>
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
            <div class="pdp-price"><span class="pdp-waitlist-note">Coming soon</span></div>
            <a class="btn btn-primary magnetic" href="/#join"><span>Join the list <span class="arr">→</span></span></a>
          </div>
          <div class="pdp-trust reveal d3">
            <span>✓ Clean, plant-based ingredients</span>
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
    'lip-pod-wearable-gloss-case': [
      ['Wear it', 'Clip the Pod to your phone strap, your bag or your wrist. That is the whole trick — it stays on you.'],
      ['Use it', 'Swipe on whenever. The tube snaps back into the case magnetically, so the two halves stay together.'],
      ['Refill it', 'When the tube runs out, swap it and keep the case. One refill ships in the box; extras come in $11 packs of three.'],
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
        <p class="pdp-safety">Patch-test before first use if you have sensitive skin or a known allergy, and stop if it irritates. The full ingredient list goes on the label in plain English. Results vary. Not medical advice.</p>
      </div>
    </section>
  `;
}

function renderRoutine() {
  const others = PRODUCTS.filter((p) => p.handle !== HANDLE);
  // Drop 01 is a single product. With nothing to pair, skip the section entirely
  // rather than rendering an empty "Pair it up." heading.
  if (!others.length) return '';
  return `
    <section class="pdp-section">
      <div class="container">
        <div class="reveal"><div class="section-tag">/ Complete the routine</div></div>
        <h2 class="section-title reveal d1">Pair it <em>up.</em></h2>
        <div class="pdp-routine">
          ${others
            .map(
              (p, i) => `
              <a class="pdp-routine-card reveal d${i + 1} magnetic" href="${p.url || `/products/${p.handle}/`}" style="--accent:${p.accent || '#ff2d95'}">
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
  initAnalytics();
  initMobileNav();

  // Nothing is for sale yet — pages render from the static catalog only.
  // Lip Pod is community-only (Drop 01, coming soon); the four face SKUs
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
