/**
 * Savage Skin — entry point.
 * Orchestrates module initialization in the right order.
 */
import './styles.css';

import { PRODUCTS } from './products.js';
import { renderProductCard } from './svg-bottle.js';
import { getProducts, submitVipSignup, shopifyConfigured } from './shopify.js';
import { initCart, addToCart } from './cart.js';
import { initReveal } from './reveal.js';
import { initCookieConsent } from './cookie-consent.js';
import { initMobileNav } from './mobile-nav.js';
import {
  initSmoothScroll,
  initCursor,
  initScrollProgress,
  initCountdown,
  initHeroStagger,
  initVipForm,
  initStickyCta,
} from './ui.js';

async function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // The hero product (Lip Service) leads the homepage hero section, so the grid
  // below shows only the secondary skincare routine.
  const routine = PRODUCTS.filter((p) => !p.hero);

  // Render with static fallback data immediately for fast first paint
  grid.innerHTML = routine.map((p, i) => renderProductCard(p, i)).join('');
  bindProductCards();

  // Then fetch live Shopify data and re-render in place (if configured)
  if (shopifyConfigured) {
    const handles = routine.map((p) => p.handle);
    const liveByHandle = await getProducts(handles);
    if (Object.keys(liveByHandle).length > 0) {
      grid.innerHTML = routine.map((p, i) =>
        renderProductCard(p, i, liveByHandle[p.handle] || null)
      ).join('');
      bindProductCards();
    }
  }
}

const BUNDLE_HANDLE = 'the-full-ritual';

async function initBundle() {
  const btn = document.getElementById('bundleBuy');
  if (!btn) return;

  const priceEl = document.querySelector('[data-bundle-price]');
  const compareEl = document.querySelector('[data-bundle-compare]');
  const saveEl = document.querySelector('[data-bundle-save]');

  // Bind the buy button. addToCart falls back to the VIP signup when there is
  // no Shopify variant yet (e.g. the bundle product hasn't been created).
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    await addToCart(btn.dataset.variant || null, 1);
  });

  if (!shopifyConfigured) return;
  const live = (await getProducts([BUNDLE_HANDLE]))[BUNDLE_HANDLE];
  if (!live) return;

  if (live.variantId && live.available) btn.dataset.variant = live.variantId;
  if (live.price && priceEl) priceEl.textContent = live.price;
  if (live.compareAtPrice && compareEl) {
    compareEl.textContent = live.compareAtPrice;
    const save = Math.round(Number(live.compareAtPrice.replace(/[^0-9.]/g, '')) - Number(live.price.replace(/[^0-9.]/g, '')));
    if (saveEl && save > 0) saveEl.textContent = `Founders price · save $${save}`;
  }
  if (!live.available) {
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sold out';
  }
}

function bindProductCards() {
  document.querySelectorAll('.product-card .product-buy').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      const variantId = card?.dataset.variant;
      if (variantId) {
        await addToCart(variantId, 1);
      } else {
        // No Shopify variant yet — send to VIP signup
        document.querySelector('#vip')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
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
  initCountdown();
  initHeroStagger();
  initVipForm(submitVipSignup);
  initStickyCta();
  initCart();
  initBundle();
  initCookieConsent();
  initMobileNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
// Trigger deployment
