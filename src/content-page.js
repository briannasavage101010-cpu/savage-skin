/**
 * Shared entry for static content pages (FAQ, Shipping & Returns, Founders).
 * Wires the common chrome — smooth scroll, scroll progress, cart drawer,
 * scroll reveal — so these pages match the rest of the site.
 */
import './styles.css';

import { initCart } from './cart.js';
import { initReveal } from './reveal.js';
import { initSmoothScroll, initScrollProgress, initCursor } from './ui.js';
import { initCookieConsent } from './cookie-consent.js';
import { initMobileNav } from './mobile-nav.js';

function boot() {
  initSmoothScroll();
  initScrollProgress();
  initCart();
  initReveal();
  initCursor();
  initCookieConsent();
  initMobileNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
