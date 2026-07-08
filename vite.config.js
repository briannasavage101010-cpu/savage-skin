import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Storefront (the previous homepage, preserved here so it stays live at /shop/)
        shop: resolve(__dirname, 'shop/index.html'),
        // Audience ad landing pages (see CLAUDE.md ad-landing-page convention)
        lpTeens: resolve(__dirname, 'lp-teens.html'),
        lpParents: resolve(__dirname, 'lp-parents.html'),
        ingredients: resolve(__dirname, 'ingredients/index.html'),
        cleanser: resolve(__dirname, 'products/clean-start-cleanser/index.html'),
        toner: resolve(__dirname, 'products/prime-time-toner/index.html'),
        serum: resolve(__dirname, 'products/power-fix-spot-corrector/index.html'),
        moisturizer: resolve(__dirname, 'products/dew-guard-moisturizer/index.html'),
        lipgloss: resolve(__dirname, 'products/glass-glow-lip-gloss/index.html'),
        // NOTE: lip-service entry removed — products/lip-service/index.html is an
        // unfinished stub and isn't committed. Finish + commit that page, then
        // re-add this input to publish the Lip Service PDP.
        faq: resolve(__dirname, 'faq/index.html'),
        shippingReturns: resolve(__dirname, 'shipping-returns/index.html'),
        founders: resolve(__dirname, 'founders/index.html'),
        cookies: resolve(__dirname, 'cookies/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blog_how_to_fix_chapped_lips: resolve(__dirname, 'blog/how-to-fix-chapped-lips/index.html'),
        blog_lip_balm_vs_mask_vs_oil: resolve(__dirname, 'blog/lip-balm-vs-mask-vs-oil/index.html'),
        blog_do_lip_plumpers_work: resolve(__dirname, 'blog/do-lip-plumpers-work/index.html'),
        blog_teen_skincare_routine: resolve(__dirname, 'blog/teen-skincare-routine/index.html'),
        blog_can_teens_use_actives: resolve(__dirname, 'blog/can-teens-use-actives/index.html'),
        blog_how_to_get_rid_of_teen_acne: resolve(__dirname, 'blog/how-to-get-rid-of-teen-acne/index.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
          lenis: ['lenis'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
