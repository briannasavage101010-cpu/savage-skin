/**
 * Consent-gated analytics + advertising loaders.
 *
 * Microsoft Clarity and the Meta Pixel load ONLY after the visitor grants
 * consent through the cookie banner (see cookie-consent.js, which publishes
 * window.savageConsent and fires the 'savage:consent' event). Visitors who
 * choose "Essential only" — or who send a Global Privacy Control signal — are
 * never loaded into either tool.
 *
 * initAnalytics() is called on every page right after initCookieConsent(), so
 * analytics/advertising are gated site-wide, not just on the homepage.
 */
const CLARITY_ID = 'xn19wal8i4';
const META_PIXEL_ID = '966865199562134';

let clarityLoaded = false;
let metaLoaded = false;

// Global Privacy Control: an explicit browser opt-out signal. Treat as "deny".
function gpcOptOut() {
  try {
    return navigator.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

function loadClarity() {
  if (clarityLoaded) return;
  clarityLoaded = true;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
}

function loadMetaPixel() {
  if (metaLoaded) return;
  metaLoaded = true;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ?
    n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function applyConsent() {
  if (gpcOptOut()) return;
  const consent = window.savageConsent || {};
  if (consent.analytics) loadClarity();
  if (consent.marketing) loadMetaPixel();
}

export function initAnalytics() {
  // Load immediately if the visitor already granted consent on a past visit.
  applyConsent();
  // And react the moment they make (or change) their choice this visit.
  document.addEventListener('savage:consent', applyConsent);
}
