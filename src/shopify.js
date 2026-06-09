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
export const CART_KEY = 'savage_cart_id';

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

/**
 * Fetch full product detail for the product detail page.
 * Returns null if not configured, not found, or on any error.
 */
export async function getProductDetail(handle) {
  if (!shopifyConfigured) return null;
  const query = `
    query ProductDetail($handle: String!) {
      productByHandle(handle: $handle) {
        id
        handle
        title
        descriptionHtml
        availableForSale
        featuredImage { url altText }
        images(first: 8) { edges { node { url altText } } }
        variants(first: 10) {
          edges { node {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          } }
        }
      }
    }
  `;
  try {
    const data = await gql(query, { handle });
    const p = data.productByHandle;
    if (!p) return null;
    const variants = (p.variants?.edges || []).map((e) => ({
      id: e.node.id,
      title: e.node.title,
      available: e.node.availableForSale,
      price: fmt(e.node.price),
      compareAtPrice: fmt(e.node.compareAtPrice),
    }));
    const firstAvailable = variants.find((v) => v.available) || variants[0] || null;
    return {
      id: p.id,
      handle: p.handle,
      title: p.title,
      descriptionHtml: p.descriptionHtml || '',
      available: p.availableForSale,
      featuredImage: p.featuredImage?.url || null,
      images: (p.images?.edges || []).map((e) => ({ url: e.node.url, alt: e.node.altText })),
      variants,
      price: firstAvailable?.price || null,
      compareAtPrice: firstAvailable?.compareAtPrice || null,
      variantId: firstAvailable?.id || null,
    };
  } catch (err) {
    console.warn('Shopify product detail fetch failed:', err.message);
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Cart line operations.
 * Every function returns a normalized cart (or null) so the UI in
 * src/cart.js never has to touch raw Shopify response shapes.
 * ------------------------------------------------------------------ */

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 50) {
      edges { node {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url altText }
            product { title handle featuredImage { url altText } }
          }
        }
      } }
    }
  }
`;

function normalizeCart(cart) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity || 0,
    subtotal: fmt(cart.cost?.subtotalAmount) || '$0',
    lines: (cart.lines?.edges || []).map((e) => {
      const n = e.node;
      const m = n.merchandise || {};
      const variantTitle = m.title && m.title !== 'Default Title' ? m.title : '';
      return {
        id: n.id,
        quantity: n.quantity,
        variantId: m.id,
        variantTitle,
        productTitle: m.product?.title || 'Product',
        handle: m.product?.handle || '',
        image: m.image?.url || m.product?.featuredImage?.url || null,
        price: fmt(m.price),
        lineTotal: fmt(n.cost?.totalAmount),
      };
    }),
  };
}

function firstUserError(errors) {
  if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '));
}

/** Fetch an existing cart by id. Returns null if missing/expired/unreachable. */
export async function cartFetch(id) {
  if (!shopifyConfigured || !id) return null;
  try {
    const data = await gql(
      `query Cart($id: ID!) { cart(id: $id) { ...CartFields } } ${CART_FRAGMENT}`,
      { id }
    );
    return normalizeCart(data.cart);
  } catch (err) {
    return null;
  }
}

/** Create a fresh empty cart. */
export async function cartCreate() {
  const data = await gql(
    `mutation { cartCreate { cart { ...CartFields } userErrors { message } } } ${CART_FRAGMENT}`
  );
  firstUserError(data.cartCreate?.userErrors);
  const cart = normalizeCart(data.cartCreate?.cart);
  if (!cart) throw new Error('Could not create cart');
  return cart;
}

/** Add a variant to the cart. */
export async function cartLinesAdd(cartId, variantId, quantity = 1) {
  const data = await gql(
    `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
    } ${CART_FRAGMENT}`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
  );
  firstUserError(data.cartLinesAdd?.userErrors);
  return normalizeCart(data.cartLinesAdd?.cart);
}

/** Set a line's quantity. */
export async function cartLinesUpdate(cartId, lineId, quantity) {
  const data = await gql(
    `mutation Upd($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
    } ${CART_FRAGMENT}`,
    { cartId, lines: [{ id: lineId, quantity }] }
  );
  firstUserError(data.cartLinesUpdate?.userErrors);
  return normalizeCart(data.cartLinesUpdate?.cart);
}

/** Remove a line entirely. */
export async function cartLinesRemove(cartId, lineId) {
  const data = await gql(
    `mutation Rem($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { message } }
    } ${CART_FRAGMENT}`,
    { cartId, lineIds: [lineId] }
  );
  firstUserError(data.cartLinesRemove?.userErrors);
  return normalizeCart(data.cartLinesRemove?.cart);
}

/**
 * Subscribe a VIP signup to the Klaviyo list via Klaviyo's client-side endpoint
 * (public key only — safe to call from the browser). No-ops if Klaviyo isn't
 * configured yet, so the form still succeeds via its localStorage backup.
 */
export async function submitVipSignup({ email }) {
  const listId = import.meta.env.VITE_KLAVIYO_LIST_ID;
  const publicKey = import.meta.env.VITE_KLAVIYO_PUBLIC_KEY;
  if (!listId || !publicKey) return;

  const res = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${publicKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', revision: '2024-10-15' },
    body: JSON.stringify({
      data: {
        type: 'subscription',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: { email },
            },
          },
        },
        relationships: { list: { data: { type: 'list', id: listId } } },
      },
    }),
  });

  if (!res.ok) throw new Error(`Klaviyo subscribe failed (${res.status})`);
}
