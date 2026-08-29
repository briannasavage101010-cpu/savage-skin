/**
 * Lightweight, privacy-first cookie consent.
 *
 * - Shows a bar pinned to the bottom of the viewport on first visit. It stays
 *   frozen there through scrolling and CANNOT be dismissed — it only goes away
 *   once the visitor accepts or declines. Choice is stored in localStorage.
 * - Non-essential (analytics/marketing) stay OFF until the visitor accepts.
 * - Exposes window.savageConsent so future pixel code can gate itself:
 *       if (window.savageConsent.marketing) { /* load Meta Pixel *\/ }
 *   and re-check on the 'savage:consent' event after the visitor chooses.
 * - Any element with [data-cookie-reopen] re-opens the bar (used on the
 *   Cookie Policy page).
 *
 * The bar ships its own <style> on purpose. index.html does NOT load
 * src/styles.css — it only loads consent-boot.js — so the old version, which
 * relied on page CSS, rendered unstyled and static ~5600px down the homepage.
 * It was effectively invisible, so consent was never granted and Clarity / the
 * Meta Pixel never loaded. Keep this module self-contained; don't move its
 * styles back into a stylesheet.
 */
const KEY = 'savage_cookie_consent'; // 'granted' | 'denied'
const STYLE_ID = 'cookieConsentStyles';

const CSS = `
.cookie-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#fff;
  border-top:1px solid rgba(10,10,18,.14);box-shadow:0 -10px 40px rgba(10,10,18,.16);
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  animation:cookieUp .3s cubic-bezier(.2,.7,.3,1)}
.cookie-inner{max-width:1180px;margin:0 auto;padding:16px 24px;
  display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.cookie-bar-text{flex:1 1 340px;margin:0;font-size:13.5px;line-height:1.55;color:#4a4858}
.cookie-bar-text b{color:#0a0a14;font-weight:700}
.cookie-bar-text a{color:#ff2d95;text-decoration:underline}
.cookie-bar-actions{display:flex;gap:10px;flex:0 0 auto}
.cookie-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;
  padding:13px 22px;border-radius:999px;font-family:'JetBrains Mono',ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;
  transition:background .15s ease,color .15s ease,transform .15s ease}
.cookie-btn:focus-visible{outline:2px solid #ff2d95;outline-offset:3px}
.cookie-btn-ghost{background:#fff;color:#0a0a14;border:1.5px solid rgba(10,10,18,.22)}
.cookie-btn-ghost:hover{background:#f7f3ed;transform:translateY(-1px)}
.cookie-btn-primary{background:#ff2d95;color:#fff;border:1.5px solid #ff2d95}
.cookie-btn-primary:hover{background:#e81b80;transform:translateY(-1px)}
@keyframes cookieUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}
@media (max-width:760px){
  .cookie-inner{padding:13px 16px;gap:11px}
  .cookie-bar-text{flex:1 1 100%;font-size:12.5px;line-height:1.5}
  .cookie-bar-actions{width:100%;gap:8px}
  .cookie-btn{flex:1 1 0;min-width:0;padding:13px 8px;font-size:10px;letter-spacing:.1em}
}
@media (prefers-reduced-motion:reduce){
  .cookie-bar{animation:none}
  .cookie-btn:hover{transform:none}
}`;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function save(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* storage blocked — treat as session-only */
  }
}

function publish(value) {
  const granted = value === 'granted';
  window.savageConsent = {
    analytics: granted,
    marketing: granted,
    choice: value,
    reopen: openBanner,
  };
  document.dispatchEvent(new CustomEvent('savage:consent', { detail: { choice: value } }));
}

let repositionHandler = null;

/**
 * The homepage has its own fixed "Join the list" CTA pinned to the bottom
 * on mobile (.sticky). Sit above it rather than covering it.
 */
function positionAboveSticky(bar) {
  const sticky = document.querySelector('.sticky');
  const visible = sticky && getComputedStyle(sticky).display !== 'none' && sticky.offsetHeight > 0;
  bar.style.bottom = visible ? `${sticky.offsetHeight}px` : '0px';
}

function removeBanner() {
  if (repositionHandler) {
    window.removeEventListener('resize', repositionHandler);
    repositionHandler = null;
  }
  document.getElementById('cookieBar')?.remove();
}

function decide(value) {
  save(value);
  publish(value);
  removeBanner();
}

function openBanner() {
  if (document.getElementById('cookieBar')) return;
  injectStyles();

  const bar = document.createElement('div');
  bar.className = 'cookie-bar';
  bar.id = 'cookieBar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Cookie consent');
  bar.innerHTML = `
    <div class="cookie-inner">
      <p class="cookie-bar-text"><b>Cookies.</b> Essential ones keep the site running. With your OK we'd also use analytics and advertising cookies, so we can see what's working instead of guessing. Your call — here's the <a href="/cookies/">Cookie Policy</a>.</p>
      <div class="cookie-bar-actions">
        <button type="button" class="cookie-btn cookie-btn-ghost" data-cookie-decline>Essential only</button>
        <button type="button" class="cookie-btn cookie-btn-primary" data-cookie-accept>Accept all</button>
      </div>
    </div>`;
  document.body.appendChild(bar);

  bar.querySelector('[data-cookie-accept]').addEventListener('click', () => decide('granted'));
  bar.querySelector('[data-cookie-decline]').addEventListener('click', () => decide('denied'));

  positionAboveSticky(bar);
  repositionHandler = () => positionAboveSticky(bar);
  window.addEventListener('resize', repositionHandler);
}

export function initCookieConsent() {
  const choice = stored();
  // Publish current state immediately (defaults to denied until a choice exists).
  publish(choice === 'granted' ? 'granted' : 'denied');

  // Let the Cookie Policy page (or anywhere) re-open the bar on demand.
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cookie-reopen]')) {
      e.preventDefault();
      openBanner();
    }
  });

  if (!choice) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', openBanner);
    } else {
      openBanner();
    }
  }
}
