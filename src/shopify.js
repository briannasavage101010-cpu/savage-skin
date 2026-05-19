/**
 * Shopify Storefront API client.
 *
 * Reads VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN from .env.
 * If either is missing, all functions resolve safely so the site still renders
 * with static product data from src/products.js.
 *
 * API docs: https://shopify.dev/docs/api/storefront
 */

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || '';
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
const API_VERSION = '2024-10';
const CART_KEY = 'savage_cart_id';

export const shopifyConfigured = Boolean(DOMAIN && TOKEN);

async function gql(query, variables = {}) {
  if (!shopifyConfigured) throw new Error('Shopify not configured');
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

/** Format Shopify Money object to a $XX.XX string */
function fmt(money) {
  if (!money) return null;
  const amt = Number(money.amount);
  const cur = money.currencyCode === 'USD' ? '$' : money.currencyCode + ' ';
  return cur + (Number.isInteger(amt) ? amt : amt.toFixed(2));
}

/**
 * Fetch products by handle. Returns a map: { handle: { price, compareAtPrice, available, variantId, title, image } }
 * Falls back to {} silently if Shopify is unreachable or unconfigured.
 */
export async function getProducts(handles) {
  if (!shopifyConfigured) return {};
  const query = `
    query Products {
      ${handles
        .map(
          (h, i) => `
        p${i}: productByHandle(handle: "${h}") {
          handle
          title
          availableForSale
          featuredImage { url altText }
          variants(first: 1) {
            edges { node {
              id
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
            } }
          }
        }
      `
        )
        .join('')}
    }
  `;
  try {
    const data = await gql(query);
    const out = {};
    handles.forEach((h, i) => {
      const p = data[`p${i}`];
      if (!p) return;
      const v = p.variants?.edges?.[0]?.node;
      out[h] = {
        title: p.title,
        handle: p.handle,
        image: p.featuredImage?.url || null,
        available: p.availableForSale && v?.availableForSale,
        variantId: v?.id || null,
        price: fmt(v?.price),
        compareAtPrice: fmt(v?.compareAtPrice),
      };
    });
    return out;
  } catch (err) {
    console.warn('Shopify product fetch failed (using static fallback):', err.message);
    return {};
  }
}

/** Get or create a persistent cart for this visitor. */
async function getOrCreateCart() {
  if (!shopifyConfigured) return null;
  const existing = localStorage.getItem(CART_KEY);
  if (existing) {
    try {
      const data = await gql(
        `query Cart($id: ID!) { cart(id: $id) { id checkoutUrl } }`,
        { id: existing }
      );
      if (data.cart) return data.cart;
    } catch (err) {
      /* fall through to create */
    }
  }
  const data = await gql(
    `mutation CartCreate { cartCreate { cart { id checkoutUrl } userErrors { message } } }`
  );
  const cart = data.cartCreate?.cart;
  if (cart) {
    localStorage.setItem(CART_KEY, cart.id);
    return cart;
  }
  throw new Error('Could not create cart');
}

/**
 * Add a product variant to the cart, then redirect to Shopify checkout.
 */
export async function addToCartAndCheckout(variantId, quantity = 1) {
  if (!shopifyConfigured || !variantId) {
    // Graceful: scroll to VIP form
    document.querySelector('#vip')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  try {
    const cart = await getOrCreateCart();
    const data = await gql(
      `mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart { id checkoutUrl }
          userErrors { message }
        }
      }`,
      {
        cartId: cart.id,
        lines: [{ merchandiseId: variantId, quantity }],
      }
    );
    const updated = data.cartLinesAdd?.cart;
    if (updated?.checkoutUrl) {
      window.location.href = updated.checkoutUrl;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (err) {
    console.error('Cart add failed:', err);
    alert('Could not add to cart. Please try again or use the VIP signup below.');
  }
}

/** Optional: submit VIP signup as a Shopify customer (requires the right scope). */
export async function submitVipSignup({ name, email, skin }) {
  if (!shopifyConfigured) return;
  // Stub. Wire up your preferred service here (Klaviyo, Mailchimp, Shopify Customer API).
  // Example Klaviyo subscribe:
  //
  //   const listId = import.meta.env.VITE_KLAVIYO_LIST_ID;
  //   const publicKey = import.meta.env.VITE_KLAVIYO_PUBLIC_KEY;
  //   if (!listId || !publicKey) return;
  //   await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${publicKey}`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', revision: '2024-10-15' },
  //     body: JSON.stringify({
  //       data: {
  //         type: 'subscription',
  //         attributes: {
  //           profile: { data: { type: 'profile', attributes: { email, properties: { name, skin } } } },
  //         },
  //         relationships: { list: { data: { type: 'list', id: listId } } },
  //       },
  //     }),
  //   });
}
