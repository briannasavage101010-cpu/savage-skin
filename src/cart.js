/**
 * Cart module — owns cart state, the slide-out drawer UI, and the Shopify
 * cart operations. The drawer DOM is injected at init so the cart works on
 * every page (home + product detail pages) without editing each HTML file.
 *
 * Public API:
 *   initCart()                  — inject drawer, bind nav button, restore cart
 *   addToCart(variantId, qty)   — add a line and open the drawer
 *   openCart() / closeCart()
 */
import {
  shopifyConfigured,
  CART_KEY,
  cartFetch,
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
} from './shopify.js';

let cart = null; // normalized cart, or null when empty
let busy = false;
let booted = false;
let els = {};

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function initCart() {
  if (booted) return;
  booted = true;

  injectDrawer();
  cacheEls();
  bindEvents();
  render();

  // Restore an existing cart for returning visitors.
  const existing = localStorage.getItem(CART_KEY);
  if (shopifyConfigured && existing) {
    cartFetch(existing).then((restored) => {
      if (restored && restored.lines.length) {
        cart = restored;
        render();
      } else {
        localStorage.removeItem(CART_KEY);
      }
    });
  }
}

function injectDrawer() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="cart-overlay" id="cartOverlay"></div>
    <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Your cart" aria-hidden="true">
      <div class="cart-head">
        <div class="cart-title">Your Cart <span class="cart-head-count" id="cartHeadCount"></span></div>
        <button class="cart-close" id="cartClose" type="button" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-foot" id="cartFoot" hidden>
        <div class="cart-error" id="cartError" role="alert" aria-live="polite"></div>
        <div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">$0</span></div>
        <p class="cart-note">Shipping &amp; taxes calculated at checkout.</p>
        <button class="btn btn-primary cart-checkout" id="cartCheckout" type="button">Checkout <span class="arr">&rarr;</span></button>
      </div>
    </aside>
  `;
  document.body.appendChild(wrap);
}

function cacheEls() {
  els = {
    overlay: document.getElementById('cartOverlay'),
    drawer: document.getElementById('cartDrawer'),
    close: document.getElementById('cartClose'),
    body: document.getElementById('cartBody'),
    foot: document.getElementById('cartFoot'),
    headCount: document.getElementById('cartHeadCount'),
    subtotal: document.getElementById('cartSubtotal'),
    checkout: document.getElementById('cartCheckout'),
    error: document.getElementById('cartError'),
    toggle: document.getElementById('cartToggle'),
  };
}

function bindEvents() {
  els.toggle?.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });
  els.close?.addEventListener('click', closeCart);
  els.overlay?.addEventListener('click', closeCart);
  els.checkout?.addEventListener('click', () => {
    if (cart?.checkoutUrl && !busy) window.location.href = cart.checkoutUrl;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.drawer?.classList.contains('is-open')) closeCart();
  });

  // Event delegation for per-line qty +/- and remove.
  els.body?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn || busy) return;
    const lineEl = btn.closest('.cart-line');
    const lineId = lineEl?.dataset.line;
    if (!lineId) return;
    const line = cart?.lines.find((l) => l.id === lineId);
    if (!line) return;
    const act = btn.dataset.act;
    if (act === 'inc') changeQty(lineId, line.quantity + 1);
    else if (act === 'dec') changeQty(lineId, line.quantity - 1);
    else if (act === 'remove') changeQty(lineId, 0);
  });
}

export function openCart() {
  clearError();
  els.overlay?.classList.add('is-open');
  els.drawer?.classList.add('is-open');
  els.drawer?.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('cart-open');
}

export function closeCart() {
  els.overlay?.classList.remove('is-open');
  els.drawer?.classList.remove('is-open');
  els.drawer?.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('cart-open');
}

function setBusy(v) {
  busy = v;
  els.drawer?.classList.toggle('is-busy', v);
}

function clearError() {
  if (els.error) els.error.textContent = '';
}

function showError(msg) {
  if (els.error) els.error.textContent = msg;
}

/** Add a variant to the cart and open the drawer. */
export async function addToCart(variantId, quantity = 1) {
  if (!shopifyConfigured || !variantId) {
    // No Shopify variant yet — fall back to the VIP signup.
    const vip = document.querySelector('#vip');
    if (vip) vip.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = '/#vip';
    return;
  }

  openCart();
  setBusy(true);
  clearError();
  try {
    let id = cart?.id || localStorage.getItem(CART_KEY);
    if (!id) {
      const created = await cartCreate();
      cart = created;
      id = created.id;
      localStorage.setItem(CART_KEY, id);
    }
    let updated;
    try {
      updated = await cartLinesAdd(id, variantId, quantity);
    } catch (err) {
      // Stored cart was stale/expired — start a fresh one and retry once.
      const created = await cartCreate();
      cart = created;
      localStorage.setItem(CART_KEY, created.id);
      updated = await cartLinesAdd(created.id, variantId, quantity);
    }
    if (updated) {
      cart = updated;
      localStorage.setItem(CART_KEY, cart.id);
    }
  } catch (err) {
    console.error('Add to cart failed:', err);
    showError('Could not add that item. Please try again.');
  } finally {
    setBusy(false);
    render();
  }
}

async function changeQty(lineId, quantity) {
  if (!cart) return;
  setBusy(true);
  clearError();
  try {
    const updated =
      quantity <= 0
        ? await cartLinesRemove(cart.id, lineId)
        : await cartLinesUpdate(cart.id, lineId, quantity);
    cart = updated;
    if (cart && !cart.lines.length) {
      // Keep the cart id around; Shopify reuses an empty cart fine.
    }
  } catch (err) {
    console.error('Cart update failed:', err);
    showError('Could not update your cart. Please try again.');
  } finally {
    setBusy(false);
    render();
  }
}

function lineMarkup(line) {
  const img = line.image
    ? `<img src="${escapeHtml(line.image)}" alt="${escapeHtml(line.productTitle)}" loading="lazy">`
    : `<span class="ph">S/S</span>`;
  return `
    <div class="cart-line" data-line="${escapeHtml(line.id)}">
      <div class="cart-line-img">${img}</div>
      <div class="cart-line-mid">
        <div class="cart-line-name">${escapeHtml(line.productTitle)}</div>
        ${line.variantTitle ? `<div class="cart-line-variant">${escapeHtml(line.variantTitle)}</div>` : ''}
        <div class="cart-qty">
          <button class="cart-qty-btn" type="button" data-act="dec" aria-label="Decrease quantity">&minus;</button>
          <span class="cart-qty-n">${line.quantity}</span>
          <button class="cart-qty-btn" type="button" data-act="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-line-right">
        <div class="cart-line-price">${escapeHtml(line.lineTotal || line.price || '')}</div>
        <button class="cart-line-remove" type="button" data-act="remove">Remove</button>
      </div>
    </div>
  `;
}

function render() {
  const count = cart?.totalQuantity || 0;

  // Nav badge (present on every page).
  if (els.toggle) {
    const badge = els.toggle.querySelector('[data-cart-count]');
    if (badge) {
      badge.textContent = count;
      badge.hidden = count === 0;
    }
  }

  if (els.headCount) els.headCount.textContent = count ? `(${count})` : '';

  const hasLines = Boolean(cart && cart.lines.length);
  if (els.body) {
    els.body.innerHTML = hasLines
      ? cart.lines.map(lineMarkup).join('')
      : `<div class="cart-empty">
           <div class="cart-empty-title">Your cart is empty</div>
           <p>Add a formula to get started.</p>
           <button class="btn btn-ghost" type="button" id="cartKeepShopping">Keep shopping</button>
         </div>`;
  }
  if (!hasLines) {
    document.getElementById('cartKeepShopping')?.addEventListener('click', closeCart);
  }

  if (els.foot) els.foot.hidden = !hasLines;
  if (els.subtotal) els.subtotal.textContent = cart?.subtotal || '$0';
}
