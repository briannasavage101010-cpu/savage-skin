/**
 * /ingredients — controller for the scroll "fall through the formula".
 *
 * Builds the product switcher + per-ingredient annotation blocks, scrubs the
 * pre-rendered hero video to scroll position, and lights up each ingredient
 * label as you reach its section.
 */
import './styles.css';
import { INGREDIENT_PRODUCTS, getIngredientProduct } from './ingredients-data.js';
import { createIngredientsVideo } from './ingredients-video.js';
import { initCookieConsent } from './cookie-consent.js';

const video = document.getElementById('ingVideo');
const tint = document.getElementById('ingTint');
const switchEl = document.getElementById('ingSwitch');
const scrollEl = document.getElementById('ingScroll');

let controller = null;
let current = null;
let blocks = [];
let activeIndex = -1;

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
  if (index === activeIndex) return;
  activeIndex = index;
  blocks.forEach((b, i) => b.classList.toggle('is-active', i === index));
}

// Which ingredient label is active for a given scroll progress. Sections are
// [intro, ...layers, outro] = (count + 2) full-height blocks, so layer k is
// centred at p_k = (1.5 + k) / (count + 1).
function activeForProgress(p) {
  const count = current.layers.length;
  const band = 0.5 / (count + 1);
  for (let k = 0; k < count; k++) {
    const pk = (1.5 + k) / (count + 1);
    if (Math.abs(p - pk) <= band) return k;
  }
  return -1;
}

function selectProduct(slug) {
  current = getIngredientProduct(slug);
  setActiveTab(current.slug);
  buildBlocks(current);
  controller.setProduct(current);
  window.scrollTo(0, 0);
  controller.setProgress(0);
  setActiveBlock(-1);
  applyTint(0);
  document.documentElement.style.setProperty('--ing-accent', current.accent);
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

// --- Color-layer wash over the video ---------------------------------------
function hexToRgb(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function smoothstep(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
function mixRgb(a, b, f) { return a.map((v, i) => Math.round(v + (b[i] - v) * f)); }

// The liquid colour at a given scroll progress: holds each ingredient's colour
// at its station (p_k = (1.5+k)/(count+1)) and blends between stations, so the
// bottle visibly descends through colour layers — perfectly aligned to labels.
function tintForProgress(p) {
  const ls = current.layers;
  const n = ls.length;
  const pk = (k) => (1.5 + k) / (n + 1);
  if (p <= pk(0)) return ls[0].color;
  if (p >= pk(n - 1)) return ls[n - 1].color;
  for (let k = 0; k < n - 1; k++) {
    if (p >= pk(k) && p <= pk(k + 1)) {
      const f = smoothstep((p - pk(k)) / (pk(k + 1) - pk(k)));
      return rgbToCss(mixRgb(hexToRgb(ls[k].color), hexToRgb(ls[k + 1].color), f));
    }
  }
  return ls[0].color;
}
function rgbToCss(a) { return `rgb(${a[0]},${a[1]},${a[2]})`; }

function applyTint(p) {
  tint.style.backgroundColor = tintForProgress(p);
  // Fade the wash in after the intro and out before the outro.
  const edge = 1 / (current.layers.length + 1);
  const inFade = smoothstep((p - edge * 0.4) / (edge * 0.8));
  const outFade = smoothstep((1 - p - edge * 0.4) / (edge * 0.8));
  tint.style.opacity = (Math.min(inFade, outFade) * 0.7).toFixed(3);
}

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  initCookieConsent();
  buildSwitcher();
  controller = createIngredientsVideo(video, { reduceMotion });

  const startSlug = new URLSearchParams(location.search).get('p') || INGREDIENT_PRODUCTS[0].slug;
  selectProduct(getIngredientProduct(startSlug).slug);

  window.addEventListener('scroll', () => {
    const p = scrollProgress();
    controller.setProgress(p);
    setActiveBlock(activeForProgress(p));
    applyTint(p);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) controller.stop();
    else controller.start();
  });

  controller.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
