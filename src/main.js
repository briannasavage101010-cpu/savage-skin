/**
 * Savage Skin — entry point.
 * Orchestrates module initialization in the right order.
 */
import './styles.css';

import { PRODUCTS } from './products.js';
import { renderProductCard } from './svg-bottle.js';
import { getProducts, addToCartAndCheckout, submitVipSignup, shopifyConfigured } from './shopify.js';
import { initReveal } from './reveal.js';
import { initMolecule } from './molecule.js';
import { initThreeScene } from './three-scene.js';
import {
  initSmoothScroll,
  initCursor,
  initScrollProgress,
  initCountdown,
  initHeroStagger,
  initVipForm,
} from './ui.js';

async function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Render with static fallback data immediately for fast first paint
  grid.innerHTML = PRODUCTS.map((p, i) => renderProductCard(p, i)).join('');
  bindProductCards();

  // Then fetch live Shopify data and re-render in place (if configured)
  if (shopifyConfigured) {
    const handles = PRODUCTS.map((p) => p.handle);
    const liveByHandle = await getProducts(handles);
    if (Object.keys(liveByHandle).length > 0) {
      grid.innerHTML = PRODUCTS.map((p, i) =>
        renderProductCard(p, i, liveByHandle[p.handle] || null)
      ).join('');
      bindProductCards();
    }
  }
}

function bindProductCards() {
  document.querySelectorAll('.product-card .product-buy').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      const variantId = card?.dataset.variant;
      if (variantId) {
        await addToCartAndCheckout(variantId, 1);
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
  // then reveal, then 3D.
  initSmoothScroll();
  renderProducts().then(() => {
    initReveal();
    initCursor();
  });
  initScrollProgress();
  initCountdown();
  initHeroStagger();
  initVipForm(submitVipSignup);
  initMolecule();
  initThreeScene();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
