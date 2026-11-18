/**
 * Homepage behaviour that every visitor gets (no animation library needed):
 * the mobile menu, the nav that condenses on scroll, and the mobile sticky
 * preorder button. The motion layer (GSAP + ScrollTrigger + Lenis) is loaded
 * later, after first paint, and only when the visitor allows motion.
 */
const head = document.getElementById('siteHead');
const toggle = document.getElementById('navToggle');
const toggleLabel = document.getElementById('navToggleLabel');
const links = document.getElementById('navLinks');

/* ---------- mobile menu ---------- */
function setMenu(open) {
  head.classList.toggle('nav-open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggleLabel.textContent = open ? 'Close' : 'Menu';
}
toggle.addEventListener('click', () => setMenu(!head.classList.contains('nav-open')));
links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && head.classList.contains('nav-open')) { setMenu(false); toggle.focus(); }
});

/* ---------- nav condenses after the first 24px of scroll ---------- */
const sentinel = document.createElement('div');
sentinel.setAttribute('aria-hidden', 'true');
sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([entry]) => {
  head.classList.toggle('is-condensed', !entry.isIntersecting);
}).observe(sentinel);

/* ---------- mobile sticky preorder button ----------
   Shows only once the hero button has scrolled away, and never while the
   cookie banner is open, another buy button or the join form is on screen,
   or someone is typing in a form. So it never covers the first screen. */
const sticky = document.getElementById('stickyCta');
const heroCta = document.getElementById('heroCta');
const blockers = ['offerCta', 'closeCta', 'join', 'podCapture'].map((id) => document.getElementById(id)).filter(Boolean);
const inView = new Set();
let heroPassed = false;

function update() {
  const typing = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  const show = heroPassed && inView.size === 0 && !document.getElementById('cookieBar') && !typing;
  sticky.classList.toggle('show', show);
  sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
  sticky.tabIndex = show ? 0 : -1;
}
new IntersectionObserver(([entry]) => {
  heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  update();
}).observe(heroCta);
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) inView.add(en.target); else inView.delete(en.target); });
  update();
});
blockers.forEach((el) => io.observe(el));
document.addEventListener('savage:consent', () => setTimeout(update, 0));
document.addEventListener('focusin', update);
document.addEventListener('focusout', () => setTimeout(update, 0));

/* ---------- cookie banner: early in the keyboard order ----------
   The shared banner (src/cookie-consent.js) appends itself at the end of <body>,
   so keyboard users reached it last. Here it is moved to sit right after the
   skip link. Its wording, choices and behaviour are untouched. */
const skip = document.querySelector('.skip');
function hoistCookieBar() {
  const bar = document.getElementById('cookieBar');
  if (bar && skip && skip.nextElementSibling !== bar) skip.after(bar);
}
hoistCookieBar();
new MutationObserver(hoistCookieBar).observe(document.body, { childList: true });

/* ---------- motion layer: after first paint, only if motion is welcome ---------- */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionStarted = false;
function startMotion() {
  if (motionStarted || reduce.matches) return;
  motionStarted = true;
  ['scroll', 'pointermove', 'touchstart', 'keydown'].forEach((ev) => window.removeEventListener(ev, startMotion));
  import('./home-motion.js').catch(() => { /* motion is optional; the page is complete without it */ });
}
function scheduleMotion() {
  ['scroll', 'pointermove', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, startMotion, { passive: true, once: true }));
  if ('requestIdleCallback' in window) requestIdleCallback(startMotion, { timeout: 2500 });
  else setTimeout(startMotion, 1200);
}
if (document.readyState === 'complete') scheduleMotion();
else window.addEventListener('load', scheduleMotion, { once: true });
