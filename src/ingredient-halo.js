/**
 * Ingredient Halo — lazy loader.
 *
 * Watches the dark cinematic section and only pulls in the heavy Three.js scene
 * (halo-scene.js) once it nears the viewport, so the Three.js bundle never
 * blocks first paint on the landing page.
 *
 * a11y / resilience:
 *  - prefers-reduced-motion renders a single still frame (no animation loop)
 *  - if WebGL or the scene import fails, the canvas hides and the CSS layer shows
 */
export function initIngredientHalo() {
  const section = document.querySelector('[data-halo]');
  if (!section) return;
  const canvas = section.querySelector('.halo-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!started && entries.some((e) => e.isIntersecting)) {
        started = true;
        observer.disconnect();
        import('./halo-scene.js')
          .then(({ build }) => build(section, canvas, reduceMotion))
          .catch(() => {
            canvas.style.display = 'none';
            section.classList.add('halo-fallback');
          });
      }
    },
    { rootMargin: '300px' }
  );
  observer.observe(section);
}
