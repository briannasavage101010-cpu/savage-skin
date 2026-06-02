/**
 * /ingredients — controller for the scroll-driven "fall through the formula".
 *
 * Builds the product switcher + per-ingredient annotation blocks from
 * ingredients-data.js, maps page scroll to the 3D scene's progress, and keeps
 * the active label in sync with the layer the bottle is currently passing.
 */
import './styles.css';
import { INGREDIENT_PRODUCTS, getIngredientProduct } from './ingredients-data.js';
import { createIngredientsScene } from './ingredients-scene.js';
import { initCookieConsent } from './cookie-consent.js';

const canvas = document.getElementById('ingCanvas');
const switchEl = document.getElementById('ingSwitch');
const scrollEl = document.getElementById('ingScroll');

let scene = null;
let current = null;
let blocks = [];

function buildSwitcher() {
  switchEl.innerHTML = INGREDIENT_PRODUCTS.map(
    (p) => `<button type="button" class="ing-tab" role="tab" data-slug="${p.slug}" style="--accent:${p.accent}">${p.name}</button>`
  ).join('');
  switchEl.querySelectorAll('.ing-tab').forEach((btn) => {
    btn.addEventListener('click', () => selectProduct(btn.dataset.slug));
  });
}

function setActiveTab(slug) {
  switchEl.querySelectorAll('.ing-tab').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.slug === slug);
  });
}

function buildBlocks(product) {
  const layerHtml = product.layers
    .map(
      (l, i) => `
      <section class="ing-step" data-index="${i}">
        <div class="ing-card">
          <div class="ing-card-num">/ ${String(i + 1).padStart(2, '0')}</div>
          <h2 class="ing-card-name">${l.name}${l.pct ? `<span class="ing-card-pct">${l.pct}</span>` : ''}</h2>
          <p class="ing-card-effect">${l.effect}</p>
          <div class="ing-card-type">${l.type === 'powder' ? 'Powder / extract' : 'Active liquid'}</div>
        </div>
      </section>`
    )
    .join('');

  scrollEl.innerHTML = `
    <section class="ing-intro">
      <div class="ing-intro-inner">
        <div class="ing-tagline">${product.tagline}</div>
        <h1 class="ing-title">Inside <em>${product.name}.</em></h1>
        <p class="ing-lead">Scroll to fall through the formula — one ingredient at a time. Here's exactly what's inside, and what each layer does for your skin.</p>
        <div class="ing-scroll-hint" aria-hidden="true"><span></span> Scroll</div>
      </div>
    </section>
    ${layerHtml}
    <section class="ing-outro">
      <div class="ing-outro-inner">
        <h2>That's the whole formula.</h2>
        <p>No filler, no mystery. Just actives that are designed to help — results vary.</p>
        <a class="btn btn-primary" href="/products/${product.handle}/"><span>Shop ${product.name} <span class="arr">&#8594;</span></span></a>
      </div>
    </section>
  `;
  blocks = Array.from(scrollEl.querySelectorAll('.ing-step'));
}

function setActiveBlock(index) {
  blocks.forEach((b, i) => b.classList.toggle('is-active', i === index));
}

function selectProduct(slug) {
  current = getIngredientProduct(slug);
  setActiveTab(current.slug);
  buildBlocks(current);
  scene.setProduct(current);
  window.scrollTo(0, 0);
  scene.setProgress(0);
  document.documentElement.style.setProperty('--ing-accent', current.accent);
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  initCookieConsent();
  buildSwitcher();
  scene = createIngredientsScene(canvas, { reduceMotion });
  scene.onLayer(setActiveBlock);

  const startSlug = new URLSearchParams(location.search).get('p') || INGREDIENT_PRODUCTS[0].slug;
  selectProduct(getIngredientProduct(startSlug).slug);

  window.addEventListener('scroll', () => scene.setProgress(scrollProgress()), { passive: true });

  // Pause rendering when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) scene.stop();
    else scene.start();
  });

  scene.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
