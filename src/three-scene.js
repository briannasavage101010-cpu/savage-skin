/**
 * Hero 3D scene — ambient mochi-style blobs floating across the page.
 * Soft material, gentle squish + bob, subtle scroll-driven drift.
 * One persistent WebGL context. Pauses when tab is hidden.
 */
import * as THREE from 'three';
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
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 50);
  camera.position.set(0, 0, 8);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Cream-friendly lighting: soft hemisphere + one directional key light.
  scene.add(new THREE.HemisphereLight(0xfff5e8, 0xe5d8c2, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(4, 6, 5);
  scene.add(key);

  // Blob palette — brand colors used at different roles.
  const BLOB_DEFS = [
    { color: 0xff2d95, size: 1.05, x: -2.6, y: 0.8, z: -1.0, roughness: 0.4, metalness: 0.05 },
    { color: 0x0a0a14, size: 0.9,  x:  2.9, y: -1.2, z: -1.8, roughness: 0.55, metalness: 0.1 },
    { color: 0xe5c26b, size: 0.7,  x:  3.2, y: 1.6, z: -2.5, roughness: 0.5, metalness: 0.05 },
    { color: 0xf2e6d8, size: 1.2,  x: -3.4, y: -1.4, z: -2.8, roughness: 0.7, metalness: 0.0 },
    { color: 0xff7ab8, size: 0.55, x: -1.2, y: -2.2, z: -1.4, roughness: 0.45, metalness: 0.05 },
  ];

  const blobs = BLOB_DEFS.map((def, i) => {
    // IcosahedronGeometry detail=3 ~ 42 verts; smooth enough at the size we use.
    const geo = new THREE.IcosahedronGeometry(def.size, 3);
    const mat = new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: def.roughness,
      metalness: def.metalness,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(def.x, def.y, def.z);
    mesh.userData = {
      basePos: new THREE.Vector3(def.x, def.y, def.z),
      bobSpeed: 0.25 + (i * 0.07) % 0.4,
      bobAmp: reducedMotion ? 0 : 0.18 + (i * 0.05) % 0.15,
      squishFreq: 0.4 + (i * 0.13) % 0.3,
      squishAmp: reducedMotion ? 0 : 0.08,
      phase: (i * Math.PI * 0.7) % (Math.PI * 2),
      rotSpeed: reducedMotion ? 0 : 0.04 + (i * 0.02) % 0.06,
      driftX: i % 2 === 0 ? -0.6 : 0.6,
      driftY: i % 2 === 0 ? 0.4 : -0.4,
    };
    scene.add(mesh);
    return mesh;
  });

  // Visibility pause
  let pageVisible = true;
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
  });

  // Pause when canvas is offscreen (e.g., user has scrolled way past hero — saves CPU)
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

  // Lerp factor scales with frame delta for stable motion at any fps.
  const lerp = (a, b, t) => a + (b - a) * t;

  const mobileFactor = () => (innerWidth < 760 ? 0.65 : innerWidth < 980 ? 0.85 : 1);

  const clock = new THREE.Clock();
  let scrollLerp = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!pageVisible || !stageInView) return;

    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    const m = mobileFactor();

    const docH = document.documentElement.scrollHeight - innerHeight;
    const scrollProgress = Math.max(0, Math.min(1, scroll.y / Math.max(1, docH)));
    scrollLerp = lerp(scrollLerp, scrollProgress, Math.min(1, dt * 4));

    blobs.forEach((b) => {
      const u = b.userData;

      // Gentle bob on Y, plus subtle scroll drift.
      const bobY = Math.sin(t * u.bobSpeed + u.phase) * u.bobAmp;
      b.position.x = (u.basePos.x + scrollLerp * u.driftX) * m;
      b.position.y = u.basePos.y + bobY + scrollLerp * u.driftY;
      b.position.z = u.basePos.z;

      // Mochi squish — per-axis scale wobble, counter-phased for that jelly feel.
      if (u.squishAmp > 0) {
        const sx = 1 + Math.sin(t * u.squishFreq + u.phase) * u.squishAmp;
        const sy = 1 + Math.sin(t * u.squishFreq + u.phase + Math.PI) * u.squishAmp;
        const sz = 1 + Math.sin(t * u.squishFreq + u.phase + Math.PI / 2) * u.squishAmp * 0.6;
        b.scale.set(sx * m, sy * m, sz * m);
      } else {
        b.scale.setScalar(m);
      }

      // Slow rotation.
      b.rotation.y += u.rotSpeed * dt;
      b.rotation.x = Math.sin(t * 0.15 + u.phase) * 0.25;
    });

    renderer.render(scene, camera);
  }
  animate();
}
