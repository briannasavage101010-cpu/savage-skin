import { defineConfig } from 'vite';

// IMPORTANT — change `base` to match your GitHub Pages URL.
// If your repo is `github.com/your-username/savage-skin`, the site will be served at
// `your-username.github.io/savage-skin/` and base must be `/savage-skin/`.
// If you connect a custom domain (e.g. savageskin.co), set base to `/`.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/savage-skin/' : '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
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
