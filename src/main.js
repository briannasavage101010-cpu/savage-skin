/**
 * Savage Skin — entry point.
 * Orchestrates module initialization in the right order.
 */
import './styles.css';

import { PRODUCTS } from './products.js';
import { renderProductCard } from './svg-bottle.js';
import { initCart } from './cart.js';
import { initReveal } from './reveal.js';
import { initCookieConsent } from './cookie-consent.js';
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

  // The hero product (Lip Service) leads the homepage hero section, so the grid
  // below shows only the secondary skincare routine.
  const routine = PRODUCTS.filter((p) => !p.hero);

  // Drop 02 routine products are waitlist-only (not on sale yet). Cards render
  // once from static data and route to the Drop 01 list — no Shopify fetch,
  // no add-to-cart, no buyable prices.
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
  initCart();
  initCookieConsent();
  initMobileNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// Trigger deployment
