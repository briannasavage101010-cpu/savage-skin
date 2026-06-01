/**
 * Ingredient Halo — the heavy Three.js scene.
 *
 * Imported dynamically by ingredient-halo.js only when the section nears the
 * viewport, so the ~127KB Three.js chunk never blocks first paint.
 *
 * Smoothness (this scene must NOT look pixelated):
 *  - antialias on + devicePixelRatio capped at 2
 *  - EffectComposer rendered into a 4x-multisampled HDR target (MSAA edges)
 *  - high curve/segment counts on every geometry
 *  - particles use a soft radial sprite, not hard square points
 *  - real environment reflections (RoomEnvironment) on the glass
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const NEON = 0xff2d95;
const CYAN = 0x00f0ff;
const VIOLET = 0xb026ff;
const GOLD = 0xe5c26b;

export function build(section, canvas, reduceMotion) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070610);

  // Environment reflections — what makes the glass read as real glass.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.15, 6.2);

  // --- Lights (brand neon, cinematic) ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const key = new THREE.DirectionalLight(NEON, 2.4);
  key.position.set(-3, 3.5, 3);
  scene.add(key);

  const rim = new THREE.PointLight(CYAN, 22, 24, 2);
  rim.position.set(3.2, 1.5, -3);
  scene.add(rim);

  const fill = new THREE.PointLight(VIOLET, 16, 24, 2);
  fill.position.set(-3.5, -1.5, 1.5);
  scene.add(fill);

  const topGlow = new THREE.SpotLight(0xffffff, 18, 18, Math.PI / 5, 0.6, 1.5);
  topGlow.position.set(0, 5, 2.5);
  scene.add(topGlow);

  // --- Groups ---
  const world = new THREE.Group();
  scene.add(world);

  const bottle = makeBottle();
  world.add(bottle);

  // Orbiting ingredient rings.
  const rings = [];
  rings.push(makeRing({ radius: 2.0, count: 7, tilt: 0.42, speed: 0.13, palette: ['leaf', 'petal', 'drop'] }));
  rings.push(makeRing({ radius: 2.65, count: 9, tilt: -0.32, speed: -0.09, palette: ['leaf', 'pod', 'petal', 'drop'] }));
  rings.push(makeRing({ radius: 3.25, count: 6, tilt: 0.6, speed: 0.06, palette: ['leaf', 'drop', 'pod'] }));
  rings.forEach((r) => world.add(r.group));

  // Drifting light-dust.
  const dust = makeDust(360);
  scene.add(dust.points);

  // --- Postprocessing (MSAA HDR target + bloom + tone-mapped output) ---
  const renderTarget = new THREE.WebGLRenderTarget(2, 2, {
    type: THREE.HalfFloatType,
    samples: 4,
  });
  const composer = new EffectComposer(renderer, renderTarget);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.62, 0.72, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // --- Sizing ---
  function resize() {
    const w = canvas.clientWidth || section.clientWidth;
    const h = canvas.clientHeight || Math.round(w * 0.62);
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Pointer parallax (skipped under reduced motion) ---
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  // --- Pause when offscreen ---
  let visible = false;
  const vis = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !reduceMotion) loop();
    },
    { threshold: 0 }
  );
  vis.observe(section);

  const clock = new THREE.Clock();
  let raf = 0;

  function frame() {
    const t = clock.getElapsedTime();
    world.rotation.y = Math.sin(t * 0.12) * 0.18;
    bottle.rotation.y = t * 0.16;
    bottle.position.y = Math.sin(t * 0.6) * 0.06;

    rings.forEach((r) => {
      r.group.rotation.y = t * r.speed + r.phase;
      r.items.forEach((it, i) => {
        it.rotation.x += it.userData.sx;
        it.rotation.z += it.userData.sz;
        it.position.y = it.userData.baseY + Math.sin(t * 0.8 + i) * 0.08;
      });
    });

    dust.update(t);

    // ease pointer parallax
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = pointer.x * 0.5;
    camera.position.y = 0.15 - pointer.y * 0.35;
    camera.lookAt(0, 0, 0);

    composer.render();
  }

  function loop() {
    cancelAnimationFrame(raf);
    const tick = () => {
      if (!visible) return; // pause when offscreen
      frame();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  // Paint one frame immediately (synchronously) so the section is never blank
  // during a slow first frame or while the tab is backgrounded (rAF is throttled
  // when hidden). The animation loop, if enabled, takes over via the observer.
  camera.lookAt(0, 0, 0);
  composer.render();
}

/* ----------------------------------------------------------------------------
 * Geometry builders
 * ------------------------------------------------------------------------- */

function makeBottle() {
  const group = new THREE.Group();

  // Glass body via a smooth lathe profile (Vector2: x = radius, y = height).
  const profile = [
    [0.0, -1.5],
    [0.46, -1.5],
    [0.56, -1.42],
    [0.58, -1.3],
    [0.58, 0.5],
    [0.56, 0.78],
    [0.36, 0.95],
    [0.3, 1.02],
    [0.3, 1.22],
    [0.0, 1.22],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const bodyGeo = new THREE.LatheGeometry(profile, 128);
  bodyGeo.computeVertexNormals();

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.08,
    transmission: 1,
    thickness: 1.4,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    attenuationColor: new THREE.Color(0xff7ab3),
    attenuationDistance: 2.2,
    envMapIntensity: 1.2,
  });
  group.add(new THREE.Mesh(bodyGeo, glass));

  // Serum fill inside, slightly emissive so it catches the bloom.
  const fillGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.7, 96, 1, false);
  const serum = new THREE.MeshStandardMaterial({
    color: NEON,
    emissive: NEON,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0,
    transparent: true,
    opacity: 0.85,
  });
  const fill = new THREE.Mesh(fillGeo, serum);
  fill.position.y = -0.65;
  group.add(fill);

  // Metal collar at the neck.
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.22, 96),
    new THREE.MeshStandardMaterial({ color: 0xe9e6f0, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 })
  );
  collar.position.y = 1.12;
  group.add(collar);

  // Rubber dropper bulb on top.
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 64, 48),
    new THREE.MeshStandardMaterial({ color: 0x16131f, roughness: 0.5, metalness: 0.1 })
  );
  bulb.scale.set(1, 1.25, 1);
  bulb.position.y = 1.5;
  group.add(bulb);

  group.position.y = -0.1;
  group.scale.setScalar(1.05);
  return group;
}

function makeLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(0.42, -0.18, 0.42, 0.42, 0, 0.78);
  shape.bezierCurveTo(-0.42, 0.42, -0.42, -0.18, 0, -0.5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 4,
    curveSegments: 64,
  });
  geo.center();
  return geo;
}

// Shared, reused geometries.
const GEO = {
  leaf: makeLeafGeometry(),
  petal: makeLeafGeometry(),
  drop: new THREE.IcosahedronGeometry(0.13, 4),
  pod: new THREE.CapsuleGeometry(0.05, 0.18, 12, 32),
};

function makeItem(kind) {
  let mat;
  if (kind === 'leaf') {
    const greens = [0x3f8f56, 0x5aa86c, 0x2f7a48];
    mat = new THREE.MeshStandardMaterial({
      color: greens[Math.floor(Math.random() * greens.length)],
      roughness: 0.55,
      metalness: 0,
      emissive: 0x0a2014,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    });
  } else if (kind === 'petal') {
    mat = new THREE.MeshStandardMaterial({
      color: NEON,
      roughness: 0.4,
      metalness: 0,
      emissive: NEON,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    });
  } else if (kind === 'pod') {
    mat = new THREE.MeshStandardMaterial({
      color: GOLD,
      roughness: 0.45,
      metalness: 0.35,
      emissive: GOLD,
      emissiveIntensity: 0.25,
    });
  } else {
    // drop — glossy faux-water (no transmission, keeps it cheap + crisp)
    mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity: 0.55,
      envMapIntensity: 1.6,
    });
  }
  const mesh = new THREE.Mesh(GEO[kind], mat);
  const s = 0.7 + Math.random() * 0.6;
  mesh.scale.setScalar(s);
  return mesh;
}

function makeRing({ radius, count, tilt, speed, palette }) {
  const group = new THREE.Group();
  group.rotation.x = tilt;
  const items = [];
  for (let i = 0; i < count; i++) {
    const kind = palette[i % palette.length];
    const item = makeItem(kind);
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const r = radius + (Math.random() - 0.5) * 0.25;
    item.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.5, Math.sin(a) * r);
    item.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    item.userData.baseY = item.position.y;
    item.userData.sx = (Math.random() - 0.5) * 0.01;
    item.userData.sz = (Math.random() - 0.5) * 0.01;
    group.add(item);
    items.push(item);
  }
  return { group, items, speed, phase: Math.random() * Math.PI * 2 };
}

/* ----------------------------------------------------------------------------
 * Drifting light-dust (soft sprite, additive) — the cheap "expensive" lever
 * ------------------------------------------------------------------------- */

function makeDustTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDust(count) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(NEON), new THREE.Color(CYAN), new THREE.Color(VIOLET), new THREE.Color(0xffffff)];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    speeds[i] = 0.05 + Math.random() * 0.12;
    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.09,
    map: makeDustTexture(),
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);

  function update(t) {
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.016;
      pos[i * 3] += Math.sin(t * 0.3 + i) * 0.0009;
      if (pos[i * 3 + 1] > 3.2) pos[i * 3 + 1] = -3.2;
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { points, update };
}
