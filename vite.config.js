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
        ingredients: resolve(__dirname, 'ingredients/index.html'),
        cleanser: resolve(__dirname, 'products/clean-start-cleanser/index.html'),
        toner: resolve(__dirname, 'products/prime-time-toner/index.html'),
        serum: resolve(__dirname, 'products/power-fix-spot-corrector/index.html'),
        moisturizer: resolve(__dirname, 'products/dew-guard-moisturizer/index.html'),
        lipgloss: resolve(__dirname, 'products/glass-glow-lip-gloss/index.html'),
        faq: resolve(__dirname, 'faq/index.html'),
        shippingReturns: resolve(__dirname, 'shipping-returns/index.html'),
        founders: resolve(__dirname, 'founders/index.html'),
        cookies: resolve(__dirname, 'cookies/index.html'),
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
