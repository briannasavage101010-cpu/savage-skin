/**
 * Savage Skin — entry point.
 * Orchestrates module initialization in the right order.
 */
import './styles.css';

import { PRODUCTS } from './products.js';
import { renderProductCard } from './svg-bottle.js';
import { initReveal } from './reveal.js';
import { initCookieConsent } from './cookie-consent.js';
import { initAnalytics } from './analytics.js';
import { initMobileNav } from './mobile-nav.js';
import {
  initSmoothScroll,
  initCursor,
  initScrollProgress,
  initHeroStagger,
  initStickyCta,
} from './ui.js';

async function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // The hero product (Lip Pod) leads the hero section, so the grid below shows
  // only non-hero SKUs. Empty since the Drop 02 face line was pulled (2026-09-11).
  const routine = PRODUCTS.filter((p) => !p.hero);

  // Non-hero cards are waitlist-only: they render once from static data and route
  // to the list — no Shopify fetch, no add-to-cart, no buyable prices.
  grid.innerHTML = routine.map((p, i) => renderProductCard(p, i)).join('');
}

function boot() {
  // Order matters: smooth scroll first so UI binds to lenis events,
  // then products (so cards exist before reveal observer attaches),
  // then reveal.
  initSmoothScroll();
  renderProducts().then(() => {
    initReveal();
    initCursor();
  });
  initScrollProgress();
  initHeroStagger();
  initStickyCta();
  initCookieConsent();
  initAnalytics();
  initMobileNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// Trigger deployment
