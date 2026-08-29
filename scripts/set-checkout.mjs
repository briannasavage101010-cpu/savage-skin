#!/usr/bin/env node
/**
 * Checkout link switch.
 *
 * Every "Preorder" button on the site points at one checkout URL. This script
 * swaps that URL across all pages in one shot, and swaps it back just as
 * easily — nothing else about the pages changes.
 *
 *   node scripts/set-checkout.mjs stripe    -> Founders Weekend / Stripe pay link
 *   node scripts/set-checkout.mjs shopify   -> original Shopify cart permalink
 *   node scripts/set-checkout.mjs status    -> report which one is live
 *
 * Ampersands are written as &amp; inside href="" because that is what HTML
 * requires; browsers send the real & to the payment page.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = {
  shopify: 'https://savageskincare-store.myshopify.com/cart/53828394680685:1',
  stripe:
    'https://www.foundersweekends.com/api/pay?venture=1e3b7f39-179f-4624-beed-87c49d3fba01&amount=1800&name=Savage+Lips',
};

// Copy that names the payment processor by name. Flips with the link so the
// page never claims a checkout it isn't actually using.
const COPY = [
  {
    shopify: 'Secure checkout on Shopify',
    stripe: 'Secure checkout on Stripe',
  },
  {
    shopify: "$18 goes through today, on Shopify's checkout.",
    stripe: '$18 goes through today, on a secure Stripe checkout.',
  },
];

// Pages that contain preorder buttons.
const FILES = [
  'index.html',
  'shop/index.html',
  'lp-teens.html',
  'lp-parents.html',
  'products/glass-glow-lip-gloss/index.html',
];

const forHtml = (url) => url.replace(/&/g, '&amp;');
const bothForms = (url) => [forHtml(url), url];

function run(mode) {
  if (mode === 'status') {
    for (const [name, url] of Object.entries(TARGETS)) {
      let hits = 0;
      for (const f of FILES) {
        const src = readFileSync(join(ROOT, f), 'utf8');
        for (const form of new Set(bothForms(url))) {
          hits += src.split(form).length - 1;
        }
      }
      let copyHits = 0;
      for (const f of FILES) {
        const src = readFileSync(join(ROOT, f), 'utf8');
        for (const pair of COPY) copyHits += src.split(pair[name]).length - 1;
      }
      console.log(
        `${name.padEnd(8)} ${hits} link${hits === 1 ? '' : 's'}, ${copyHits} copy mention${copyHits === 1 ? '' : 's'}`
      );
    }
    return;
  }

  const to = TARGETS[mode];
  if (!to) {
    console.error('Usage: node scripts/set-checkout.mjs <stripe|shopify|status>');
    process.exit(1);
  }
  const from = Object.entries(TARGETS).filter(([k]) => k !== mode).map(([, v]) => v);

  let total = 0;
  for (const f of FILES) {
    const path = join(ROOT, f);
    let src = readFileSync(path, 'utf8');
    const before = src;
    for (const old of from) {
      for (const form of new Set(bothForms(old))) {
        const n = src.split(form).length - 1;
        if (n) {
          src = src.split(form).join(forHtml(to));
          total += n;
        }
      }
    }
    for (const pair of COPY) {
      for (const [name, phrase] of Object.entries(pair)) {
        if (name !== mode) src = src.split(phrase).join(pair[mode]);
      }
    }
    if (src !== before) {
      writeFileSync(path, src);
      console.log(`updated ${f}`);
    }
  }
  console.log(`\nCheckout now points at: ${mode} (${total} link${total === 1 ? '' : 's'} changed)`);
}

run(process.argv[2]);
