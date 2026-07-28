/**
 * Minimal boot for pages that are otherwise static and don't load a full page
 * module — notably the homepage (index.html). It wires up ONLY the cookie
 * consent banner and the consent-gated analytics/advertising loaders, so the
 * banner shows and Microsoft Clarity / the Meta Pixel stay off until the
 * visitor accepts. It intentionally pulls in nothing else from main.js.
 */
import { initCookieConsent } from './cookie-consent.js';
import { initAnalytics } from './analytics.js';

function boot() {
  initCookieConsent();
  initAnalytics();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
