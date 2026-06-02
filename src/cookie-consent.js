/**
 * Lightweight, privacy-first cookie consent.
 *
 * - Shows a banner on first visit; choice is stored in localStorage.
 * - Non-essential (analytics/marketing) stay OFF until the visitor accepts.
 * - Exposes window.savageConsent so future pixel code can gate itself:
 *       if (window.savageConsent.marketing) { /* load Meta Pixel *\/ }
 *   and re-check on the 'savage:consent' event after the visitor chooses.
 * - Any element with [data-cookie-reopen] re-opens the banner (used on the
 *   Cookie Policy page).
 */
const KEY = 'savage_cookie_consent'; // 'granted' | 'denied'

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

function removeBanner() {
  document.getElementById('cookieBanner')?.remove();
}

function decide(value) {
  save(value);
  publish(value);
  removeBanner();
}

function openBanner() {
  if (document.getElementById('cookieBanner')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="cookie-banner" id="cookieBanner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p class="cookie-banner-text">We use essential cookies to run the site. With your OK, we'd also use analytics and advertising cookies to improve Savage Skin. See our <a href="/cookies/">Cookie Policy</a>.</p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-ghost cookie-decline" data-cookie-decline>Essential only</button>
        <button type="button" class="btn btn-primary cookie-accept" data-cookie-accept><span>Accept all</span></button>
      </div>
    </div>`;
  document.body.appendChild(wrap.firstElementChild);
  document.querySelector('[data-cookie-accept]')?.addEventListener('click', () => decide('granted'));
  document.querySelector('[data-cookie-decline]')?.addEventListener('click', () => decide('denied'));
}

export function initCookieConsent() {
  const choice = stored();
  // Publish current state immediately (defaults to denied until a choice exists).
  publish(choice === 'granted' ? 'granted' : 'denied');

  // Let the Cookie Policy page (or anywhere) re-open the banner on demand.
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
