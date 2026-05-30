/**
 * Hero 3D scene — central liquid splash using marching-cubes metaballs.
 * Metaballs orbit a center point and merge into one continuous fluid mass,
 * reading as a frozen-moment serum splash.
 * One persistent WebGL context. Pauses when tab is hidden or offscreen.
 */
import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { scroll } from './ui.js';

export function initThreeScene() {
  const stage = document.getElementById('stage');
  if (!stage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({
    canvas: stage,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 50);
  camera.position.set(0, 0, 9);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Cream-friendly lighting: soft hemisphere + warm directional key + cool fill.
  scene.add(new THREE.HemisphereLight(0xfff5e8, 0xe5d8c2, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(5, 7, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffc6dc, 0.55);
  fill.position.set(-5, -3, 4);
  scene.add(fill);

  // Glossy serum material — magenta with strong specular highlights.
  const material = new THREE.MeshStandardMaterial({
    color: 0xff2d95,
    roughness: 0.18,
    metalness: 0.12,
    flatShading: false,
  });

  // Marching cubes: produces a single continuous mesh from overlapping metaballs.
  const resolution = innerWidth < 760 ? 28 : innerWidth < 1200 ? 40 : 52;
  const splash = new MarchingCubes(resolution, material, true, true, 60000);
  splash.position.set(innerWidth > 980 ? 1.6 : 0, 0, 0);
  splash.scale.set(3.4, 3.4, 3.4);
  splash.enableUvs = false;
  splash.enableColors = false;
  splash.isolation = 50;
  scene.add(splash);

  // Visibility pause
  let pageVisible = true;
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
  });

  let stageInView = true;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        stageInView = entries[0].isIntersecting;
      },
      { rootMargin: '200px 0px 200px 0px' }
    );
    obs.observe(stage);
  }

  const clock = new THREE.Clock();
  let scrollLerp = 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  // 7 metaballs orbiting/dancing around a center — produces a splash silhouette.
  const NUM_BALLS = 7;

  function animate() {
    requestAnimationFrame(animate);
    if (!pageVisible || !stageInView) return;

    const dt = clock.getDelta();
    const t = reducedMotion ? 0 : clock.elapsedTime;

    const docH = document.documentElement.scrollHeight - innerHeight;
    const scrollProgress = Math.max(0, Math.min(1, scroll.y / Math.max(1, docH)));
    scrollLerp = lerp(scrollLerp, scrollProgress, Math.min(1, dt * 3));

    splash.reset();

    // One large anchor ball at center — the "drop body".
    splash.addBall(0.5, 0.5, 0.5, 0.95, 12);

    // Satellites orbit the anchor; their distance pulses gently.
    for (let i = 0; i < NUM_BALLS; i++) {
      const angle = (i / NUM_BALLS) * Math.PI * 2 + t * 0.18;
      const ringR = 0.18 + Math.sin(t * 0.5 + i * 1.3) * 0.05 + scrollLerp * 0.08;
      const polar = Math.sin(t * 0.32 + i * 0.7) * 0.18;
      const x = 0.5 + Math.cos(angle) * ringR;
      const y = 0.5 + Math.sin(angle) * ringR + polar;
      const z = 0.5 + Math.sin(t * 0.41 + i) * 0.12;
      const strength = 0.55 + Math.sin(t * 0.7 + i * 0.5) * 0.1;
      splash.addBall(x, y, z, strength, 12);
    }

    // Slow rotation of the whole splash for ambient motion.
    if (!reducedMotion) {
      splash.rotation.y = t * 0.08;
      splash.rotation.x = Math.sin(t * 0.12) * 0.18;
    }

    splash.update();
    renderer.render(scene, camera);
  }
  animate();
}
