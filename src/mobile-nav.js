/**
 * Mobile nav — makes the fixed top bar usable on phones.
 *
 * On desktop the nav links sit in a row in the top bar. On screens <=760px that
 * row is hidden (see styles.css), which previously left no way to reach pages
 * like Ingredients or the Journal/blog. This injects a hamburger button into the
 * bar and turns the existing .nav-links into a tap-to-open dropdown.
 *
 * It works on every page because it reads whatever links the page already has in
 * its own .nav-links — so each page's mobile menu mirrors its own desktop nav.
 * Desktop (>760px) is untouched: the hamburger is display:none there.
 */
export function initMobileNav() {
  const nav = document.querySelector('nav.top');
  if (!nav) return;
  const links = nav.querySelector('.nav-links');
  if (!links) return;
  if (nav.querySelector('.nav-toggle')) return; // guard against double init

  if (!links.id) links.id = 'navLinks';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', links.id);
  toggle.innerHTML =
    '<span class="nav-toggle-bar"></span>' +
    '<span class="nav-toggle-bar"></span>' +
    '<span class="nav-toggle-bar"></span>';

  // Hamburger sits at the far right of the bar.
  nav.appendChild(toggle);

  const setOpen = (open) => {
    nav.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('nav-open'));
  });

  // Tapping a link closes the menu (so in-page anchors don't leave it open).
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Escape closes it.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Tapping anywhere outside the bar closes it.
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('nav-open') && !nav.contains(e.target)) {
      setOpen(false);
    }
  });
}
