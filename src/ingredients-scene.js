/**
 * Ingredients scene — scroll-driven "fall through the formula".
 *
 * A procedural frosted-glass bottle hangs at screen-center while stacked
 * ingredient layers rise past it as you scroll. Each liquid layer splashes
 * (crown of droplets + expanding ripples) when the bottle punches through it;
 * powder layers scatter into drifting dust instead.
 *
 * Public API (driven by ingredients-page.js):
 *   const scene = createIngredientsScene(canvas);
 *   scene.setProduct(product);   // rebuild layers + retint bottle
 *   scene.setProgress(p);        // 0..1 scroll progress (target, eased)
 *   scene.onLayer(cb);           // cb(activeIndex) when the active layer changes
 *   scene.start(); scene.stop();
 *
 * Smoothness: antialias + dpr<=2, MSAA HDR composer, bloom, soft sprite
 * particles, high-segment geometry, real environment reflections.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const SPACING = 4.2; // world-units between layers
const RADIUS = 3.0; // layer disc radius

export function createIngredientsScene(canvas, { reduceMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = makeBackdrop('#1a0f2e', '#05040a');

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.15, 7.4);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rimA = new THREE.PointLight(0xff2d95, 20, 30, 2);
  rimA.position.set(4, 2, -2);
  scene.add(rimA);
  const rimB = new THREE.PointLight(0x00f0ff, 16, 30, 2);
  rimB.position.set(-4, -1, 1);
  scene.add(rimB);

  // Bottle (stays centered)
  const bottle = makeBottle();
  scene.add(bottle);

  // Layers live in a group we slide vertically with scroll.
  const layersGroup = new THREE.Group();
  scene.add(layersGroup);

  const dustTex = makeSoftSprite();

  let layers = [];
  let count = 0;
  let totalTravel = 1;
  let offset0 = 0;
  let activeIndex = -1;
  let layerCb = null;

  function clearLayers() {
    layers.forEach((l) => l.dispose());
    layersGroup.clear();
    layers = [];
  }

  function setProduct(product) {
    clearLayers();
    count = product.layers.length;
    // The page lays out: intro + one section per layer + outro = (count + 2)
    // full-height sections, so scroll spans (count + 1) viewports. We want
    // layer k to cross the bottle exactly when its card is centred, i.e. at
    // scroll progress p_k = (1.5 + k) / (count + 1). Solving the slide eqn
    // (p*T - O - k*SPACING = 0) for those crossings gives:
    totalTravel = SPACING * (count + 1);
    offset0 = 1.5 * SPACING;

    const accent = new THREE.Color(product.accent);
    product.layers.forEach((data, k) => {
      const hue = accent.clone().offsetHSL((k - count / 2) * 0.04, 0, (k % 2 ? 0.05 : -0.03));
      const layer = data.type === 'powder'
        ? makePowderLayer(hue, dustTex)
        : makeLiquidLayer(hue);
      layer.group.position.y = -k * SPACING;
      layersGroup.add(layer.group);
      layers.push(layer);
    });

    // Tint the serum inside the bottle to match the product.
    bottle.userData.setSerum(accent);
    activeIndex = -1;
  }

  function onLayer(cb) { layerCb = cb; }

  // --- Postprocessing ---
  const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.7, 0.7, 0.78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Scroll progress (eased) ---
  let targetP = 0;
  let p = 0;
  function setProgress(v) { targetP = Math.max(0, Math.min(1, v)); }

  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    p += (targetP - p) * 0.08;

    // Slide the layer stack; each layer crosses y=0 in sequence.
    layersGroup.position.y = p * totalTravel - offset0;

    // Bottle idle motion + a tilt that leans into the fall.
    // Skipped under prefers-reduced-motion (the labels stay the point).
    if (!reduceMotion) {
      bottle.rotation.y = t * 0.25;
      bottle.position.y = Math.sin(t * 0.8) * 0.05;
      bottle.rotation.z = Math.sin(t * 0.5) * 0.04;
    }

    let nearest = -1;
    let nearestDist = Infinity;
    for (let k = 0; k < count; k++) {
      const layer = layers[k];
      const worldY = layersGroup.position.y - k * SPACING;
      // Splash on zero-crossing (works scrolling either direction).
      if (layer.lastY != null && Math.sign(worldY) !== Math.sign(layer.lastY) && Math.abs(layer.lastY) < SPACING) {
        layer.splash();
      }
      layer.lastY = worldY;
      layer.update(dt, worldY);
      const d = Math.abs(worldY);
      if (d < nearestDist) { nearestDist = d; nearest = k; }
    }

    // Only consider a layer "active" when the bottle is genuinely near it,
    // so the intro/outro don't falsely highlight the first/last card.
    if (nearestDist > SPACING * 0.6) nearest = -1;

    if (nearest !== activeIndex) {
      activeIndex = nearest;
      if (layerCb) layerCb(activeIndex);
    }

    composer.render();
  }

  function tick() {
    if (!running) return;
    frame();
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  return { setProduct, setProgress, onLayer, start, stop, renderOnce: frame };
}

/* ---------------------------------------------------------------- backdrop */

function makeBackdrop(top, bottom) {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ bottle */

function makeBottle() {
  const group = new THREE.Group();
  const profile = [
    [0.0, -1.5], [0.46, -1.5], [0.56, -1.42], [0.58, -1.3],
    [0.58, 0.5], [0.56, 0.78], [0.36, 0.95], [0.3, 1.02],
    [0.3, 1.22], [0.0, 1.22],
  ].map((q) => new THREE.Vector2(q[0], q[1]));
  const bodyGeo = new THREE.LatheGeometry(profile, 128);
  bodyGeo.computeVertexNormals();
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.06, transmission: 1,
    thickness: 1.4, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.15,
    attenuationColor: new THREE.Color(0xffb3d6), attenuationDistance: 2.4, envMapIntensity: 1.3,
  });
  group.add(new THREE.Mesh(bodyGeo, glass));

  const serumMat = new THREE.MeshStandardMaterial({
    color: 0xff2d95, emissive: 0xff2d95, emissiveIntensity: 0.4,
    roughness: 0.3, metalness: 0, transparent: true, opacity: 0.85,
  });
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.7, 96), serumMat);
  fill.position.y = -0.65;
  group.add(fill);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.22, 96),
    new THREE.MeshStandardMaterial({ color: 0xe9e6f0, metalness: 1, roughness: 0.22, envMapIntensity: 1.4 })
  );
  collar.position.y = 1.12;
  group.add(collar);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 64, 48),
    new THREE.MeshStandardMaterial({ color: 0x16131f, roughness: 0.5, metalness: 0.1 })
  );
  bulb.scale.set(1, 1.25, 1);
  bulb.position.y = 1.5;
  group.add(bulb);

  group.userData.setSerum = (color) => {
    serumMat.color.copy(color);
    serumMat.emissive.copy(color);
    glass.attenuationColor.copy(color).lerp(new THREE.Color(0xffffff), 0.4);
  };
  return group;
}

/* ------------------------------------------------------------- liquid layer */

function makeLiquidLayer(color) {
  const group = new THREE.Group();

  // Glossy translucent pool.
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(RADIUS, 96),
    new THREE.MeshPhysicalMaterial({
      color, roughness: 0.12, metalness: 0, transmission: 0.55, thickness: 0.6,
      transparent: true, opacity: 0.9, clearcoat: 1, clearcoatRoughness: 0.1,
      side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.12,
      envMapIntensity: 1.2,
    })
  );
  disc.rotation.x = -Math.PI / 2;
  group.add(disc);

  // Glowing rim.
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(RADIUS, 0.035, 16, 160),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6) })
  );
  rim.rotation.x = -Math.PI / 2;
  group.add(rim);

  // Two reusable ripple rings.
  const ripples = [0, 1].map(() => {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.0, 96),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(2), transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    r.rotation.x = -Math.PI / 2;
    r.visible = false;
    group.add(r);
    r.userData.life = 0;
    return r;
  });

  // Crown droplets.
  const dropCount = 34;
  const dropPos = new Float32Array(dropCount * 3);
  const dropVel = new Float32Array(dropCount * 3);
  const dropGeo = new THREE.BufferGeometry();
  dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
  const dropMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.8), transparent: true, opacity: 0 });
  const dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 12, 8), dropMat, dropCount);
  dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dropMesh.count = 0;
  group.add(dropMesh);
  let dropLife = 0;
  const dummy = new THREE.Object3D();

  function splash() {
    ripples.forEach((r, i) => { r.visible = true; r.userData.life = 1 + i * 0.15; r.scale.setScalar(0.6); r.material.opacity = 0.9; });
    dropLife = 1;
    dropMesh.count = dropCount;
    dropMat.opacity = 1;
    for (let i = 0; i < dropCount; i++) {
      const a = (i / dropCount) * Math.PI * 2 + Math.random();
      const sp = 1.6 + Math.random() * 2.2;
      dropVel[i * 3] = Math.cos(a) * sp * 0.5;
      dropVel[i * 3 + 1] = 2.4 + Math.random() * 2.6;
      dropVel[i * 3 + 2] = Math.sin(a) * sp * 0.5;
      dropPos[i * 3] = Math.cos(a) * 0.2;
      dropPos[i * 3 + 1] = 0;
      dropPos[i * 3 + 2] = Math.sin(a) * 0.2;
    }
  }

  function update(dt, worldY) {
    // Subtle surface shimmer scaled by closeness to the bottle.
    const near = Math.max(0, 1 - Math.abs(worldY) / SPACING);
    disc.material.emissiveIntensity = 0.12 + near * 0.25;

    ripples.forEach((r) => {
      if (!r.visible) return;
      r.userData.life -= dt * 1.4;
      if (r.userData.life <= 0) { r.visible = false; return; }
      const s = (1 - r.userData.life) * 6 + 0.6;
      r.scale.setScalar(s);
      r.material.opacity = Math.max(0, r.userData.life) * 0.8;
    });

    if (dropLife > 0) {
      dropLife -= dt * 0.9;
      dropMat.opacity = Math.max(0, dropLife);
      for (let i = 0; i < dropCount; i++) {
        dropVel[i * 3 + 1] -= 9.8 * dt; // gravity
        dropPos[i * 3] += dropVel[i * 3] * dt;
        dropPos[i * 3 + 1] += dropVel[i * 3 + 1] * dt;
        dropPos[i * 3 + 2] += dropVel[i * 3 + 2] * dt;
        dummy.position.set(dropPos[i * 3], dropPos[i * 3 + 1], dropPos[i * 3 + 2]);
        const sc = 0.6 + Math.max(0, dropLife);
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        dropMesh.setMatrixAt(i, dummy.matrix);
      }
      dropMesh.instanceMatrix.needsUpdate = true;
      if (dropLife <= 0) dropMesh.count = 0;
    }
  }

  function dispose() {
    group.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  }

  return { group, splash, update, dispose, lastY: null };
}

/* ------------------------------------------------------------- powder layer */

function makePowderLayer(color, sprite) {
  const group = new THREE.Group();
  const n = 700;
  const pos = new Float32Array(n * 3);
  const home = new Float32Array(n * 3);
  const vel = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * RADIUS;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = (Math.random() - 0.5) * 0.35;
    pos[i * 3] = home[i * 3] = x;
    pos[i * 3 + 1] = home[i * 3 + 1] = y;
    pos[i * 3 + 2] = home[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(color).multiplyScalar(1.4), size: 0.085, map: sprite,
    transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  group.add(points);

  let scatter = 0;

  function splash() {
    scatter = 1;
    for (let i = 0; i < n; i++) {
      const dx = pos[i * 3] - 0, dz = pos[i * 3 + 2] - 0;
      const d = Math.hypot(dx, dz) || 1;
      const sp = 1.5 + Math.random() * 3;
      vel[i * 3] = (dx / d) * sp;
      vel[i * 3 + 1] = (Math.random() - 0.2) * 3;
      vel[i * 3 + 2] = (dz / d) * sp;
    }
  }

  function update(dt, worldY) {
    const near = Math.max(0, 1 - Math.abs(worldY) / SPACING);
    mat.opacity = 0.55 + near * 0.4;
    if (scatter > 0) {
      scatter -= dt * 0.55;
      for (let i = 0; i < n; i++) {
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3 + 1] -= 2.5 * dt;
        // ease back toward home as the burst settles
        const back = (1 - Math.max(0, scatter)) * 0.04;
        pos[i * 3] += (home[i * 3] - pos[i * 3]) * back;
        pos[i * 3 + 1] += (home[i * 3 + 1] - pos[i * 3 + 1]) * back;
        pos[i * 3 + 2] += (home[i * 3 + 2] - pos[i * 3 + 2]) * back;
      }
      geo.attributes.position.needsUpdate = true;
    } else {
      points.rotation.y += dt * 0.15;
    }
  }

  function dispose() { geo.dispose(); mat.dispose(); }

  return { group, splash, update, dispose, lastY: null };
}

/* ------------------------------------------------------------------ sprite */

function makeSoftSprite() {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
