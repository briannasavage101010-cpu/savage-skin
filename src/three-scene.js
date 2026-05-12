/**
 * Hero 3D scene — one persistent bottle that flows across the page on scroll.
 * Keyframed position, rotation, scale, opacity, and material colors.
 * Single WebGL context. Pauses when tab is hidden.
 */
import * as THREE from 'three';
import { scroll } from './ui.js';

export function initThreeScene() {
  const stage = document.getElementById('stage');
  if (!stage) return;

  const renderer = new THREE.WebGLRenderer({
    canvas: stage,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  const lights = {
    key: new THREE.PointLight(0xff2d95, 3.2, 30),
    fill: new THREE.PointLight(0x00f0ff, 2.4, 30),
    rim: new THREE.PointLight(0xb026ff, 1.8, 30),
  };
  lights.key.position.set(-4, 3, 4);
  lights.fill.position.set(5, 1, 3);
  lights.rim.position.set(0, -2, -3);
  scene.add(lights.key, lights.fill, lights.rim);

  // Bottle group
  const bottle = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x12121e,
    metalness: 0.55,
    roughness: 0.18,
    transparent: true,
    opacity: 0.82,
  });
  bottle.add(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.1, 3.2, 32), bodyMat));

  const serumMat = new THREE.MeshStandardMaterial({
    color: 0xff2d95,
    emissive: 0xff2d95,
    emissiveIntensity: 0.85,
    metalness: 0.2,
    roughness: 0.4,
    transparent: true,
    opacity: 0.92,
  });
  const serum = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.02, 2.6, 32), serumMat);
  serum.position.y = -0.2;
  bottle.add(serum);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.06, 12, 48),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 1.1;
  bottle.add(innerRing);

  const shoulder = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.13, 12, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1a28, metalness: 0.9, roughness: 0.22 })
  );
  shoulder.rotation.x = Math.PI / 2;
  shoulder.position.y = 1.62;
  bottle.add(shoulder);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.5, 0.45, 24),
    new THREE.MeshStandardMaterial({
      color: 0x12121e,
      metalness: 0.65,
      roughness: 0.18,
      transparent: true,
      opacity: 0.9,
    })
  );
  neck.position.y = 1.85;
  bottle.add(neck);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.52, 0.7, 24),
    new THREE.MeshStandardMaterial({ color: 0xe6e6f0, metalness: 1, roughness: 0.12 })
  );
  cap.position.y = 2.42;
  bottle.add(cap);

  const capRingMat = new THREE.MeshStandardMaterial({
    color: 0xff2d95,
    emissive: 0xff2d95,
    emissiveIntensity: 2.2,
    metalness: 1,
    roughness: 0.2,
  });
  const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.045, 12, 48), capRingMat);
  capRing.rotation.x = Math.PI / 2;
  capRing.position.y = 2.07;
  bottle.add(capRing);

  // Label
  function makeLabelTex() {
    const lc = document.createElement('canvas');
    lc.width = 512;
    lc.height = 384;
    const x = lc.getContext('2d');
    x.fillStyle = '#f2f1ec';
    x.font = '500 18px "JetBrains Mono", monospace';
    x.fillText('/ SAVAGE SKIN', 30, 60);
    x.font = '300 76px "Fraunces", serif';
    x.fillText('Power', 30, 170);
    x.fillStyle = '#ff2d95';
    x.font = 'italic 600 76px "Fraunces", serif';
    x.fillText('Fix.', 30, 250);
    x.fillStyle = '#9a98a8';
    x.font = '400 14px "JetBrains Mono", monospace';
    x.fillText('15% L-ASCORBIC · pH 3.5 · 30ml', 30, 310);
    x.strokeStyle = '#ff2d95';
    x.lineWidth = 2;
    x.strokeRect(8, 8, 496, 368);
    const t = new THREE.CanvasTexture(lc);
    t.anisotropy = 4;
    return t;
  }
  const labelMat = new THREE.MeshBasicMaterial({
    map: makeLabelTex(),
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), labelMat);
  labelMesh.position.set(0, 0.1, 1.06);
  bottle.add(labelMesh);
  const labelBack = labelMesh.clone();
  labelBack.position.z = -1.06;
  labelBack.rotation.y = Math.PI;
  bottle.add(labelBack);

  scene.add(bottle);

  // Particles
  const partCount = 100;
  const partGeo = new THREE.BufferGeometry();
  const partPos = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount; i++) {
    partPos[i * 3] = (Math.random() - 0.5) * 10;
    partPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    partPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const particles = new THREE.Points(
    partGeo,
    new THREE.PointsMaterial({
      color: 0xff2d95,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(particles);

  // Glow
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff2d95,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.7, 24, 16), glowMat);
  scene.add(glow);

  // Keyframes for scroll-driven flow
  const KF = [
    { at: 0.0, x: 2.6, y: 0.0, z: 0, scale: 1.0, rotSpeed: 0.4, op: 1.0, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0x00f0ff, 0xb026ff] },
    { at: 0.08, x: 2.4, y: -0.3, z: -1, scale: 0.85, rotSpeed: 0.5, op: 0.85, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0x00f0ff, 0xb026ff] },
    { at: 0.18, x: 2.0, y: -0.8, z: -3, scale: 0.5, rotSpeed: 0.6, op: 0.0, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0x00f0ff, 0xb026ff] },
    { at: 0.3, x: -2.0, y: 0.0, z: -3, scale: 0.5, rotSpeed: 0.4, op: 0.0, serum: 0x00f0ff, glow: 0x00f0ff, cap: 0x00f0ff, lights: [0x00f0ff, 0xff2d95, 0xb026ff] },
    { at: 0.4, x: 0.0, y: 0.0, z: -5, scale: 0.6, rotSpeed: 0.3, op: 0.0, serum: 0x00f0ff, glow: 0x00f0ff, cap: 0x00f0ff, lights: [0x00f0ff, 0xff2d95, 0xb026ff] },
    { at: 0.5, x: -2.4, y: 0.0, z: 0, scale: 0.9, rotSpeed: 0.6, op: 0.85, serum: 0x00f0ff, glow: 0x00f0ff, cap: 0xff2d95, lights: [0x00f0ff, 0xb026ff, 0xff2d95] },
    { at: 0.6, x: -2.6, y: 0.2, z: 0, scale: 1.0, rotSpeed: 0.7, op: 0.95, serum: 0xb026ff, glow: 0xb026ff, cap: 0xff2d95, lights: [0xb026ff, 0x00f0ff, 0xff2d95] },
    { at: 0.7, x: 0.0, y: 0.0, z: -2, scale: 1.6, rotSpeed: 0.3, op: 0.45, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0xb026ff, 0x00f0ff] },
    { at: 0.8, x: 2.8, y: 0.8, z: 1, scale: 0.6, rotSpeed: 0.9, op: 0.7, serum: 0xff2d95, glow: 0xff2d95, cap: 0xe5c26b, lights: [0xff2d95, 0xe5c26b, 0xb026ff] },
    { at: 0.88, x: 0.0, y: 0.0, z: -4, scale: 0.7, rotSpeed: 0.5, op: 0.0, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0x00f0ff, 0xb026ff] },
    { at: 0.95, x: 0.0, y: 0.0, z: -1, scale: 1.4, rotSpeed: 0.8, op: 0.5, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0xb026ff, 0x00f0ff] },
    { at: 1.0, x: 0.0, y: 0.0, z: 0, scale: 1.5, rotSpeed: 1.0, op: 0.55, serum: 0xff2d95, glow: 0xff2d95, cap: 0xff2d95, lights: [0xff2d95, 0xb026ff, 0x00f0ff] },
  ];

  const smoothstep = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  function lerpColor(a, b, t) {
    const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    return (Math.round(lerp(ar, br, t)) << 16) | (Math.round(lerp(ag, bg, t)) << 8) | Math.round(lerp(ab, bb, t));
  }
  function getState(progress) {
    for (let i = 0; i < KF.length - 1; i++) {
      if (progress >= KF[i].at && progress <= KF[i + 1].at) {
        const t = (progress - KF[i].at) / (KF[i + 1].at - KF[i].at);
        const ts = smoothstep(t);
        const a = KF[i], b = KF[i + 1];
        return {
          x: lerp(a.x, b.x, ts),
          y: lerp(a.y, b.y, ts),
          z: lerp(a.z, b.z, ts),
          scale: lerp(a.scale, b.scale, ts),
          rotSpeed: lerp(a.rotSpeed, b.rotSpeed, ts),
          op: lerp(a.op, b.op, ts),
          serum: lerpColor(a.serum, b.serum, ts),
          glow: lerpColor(a.glow, b.glow, ts),
          cap: lerpColor(a.cap, b.cap, ts),
          lights: [
            lerpColor(a.lights[0], b.lights[0], ts),
            lerpColor(a.lights[1], b.lights[1], ts),
            lerpColor(a.lights[2], b.lights[2], ts),
          ],
        };
      }
    }
    return KF[0];
  }

  let pageVisible = true;
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
  });

  const mobileScale = () => (innerWidth < 980 ? 0.65 : 1);

  const clock = new THREE.Clock();
  let accRot = 0;
  let cur = null;

  function animate() {
    requestAnimationFrame(animate);
    if (!pageVisible) return;

    const dt = clock.getDelta();
    const docH = document.documentElement.scrollHeight - innerHeight;
    const progress = Math.max(0, Math.min(1, scroll.y / Math.max(1, docH)));
    const state = getState(progress);

    if (!cur) cur = { ...state };
    else {
      const k = Math.min(1, dt * 8);
      cur.x = lerp(cur.x, state.x, k);
      cur.y = lerp(cur.y, state.y, k);
      cur.z = lerp(cur.z, state.z, k);
      cur.scale = lerp(cur.scale, state.scale, k);
      cur.rotSpeed = lerp(cur.rotSpeed, state.rotSpeed, k);
      cur.op = lerp(cur.op, state.op, k);
    }

    const m = mobileScale();
    bottle.position.set(cur.x * m, cur.y + Math.sin(clock.elapsedTime * 0.7) * 0.12, cur.z);
    accRot += cur.rotSpeed * dt;
    bottle.rotation.y = accRot;
    bottle.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.08;
    bottle.scale.setScalar(cur.scale * 1.05 * m);

    bodyMat.opacity = 0.82 * cur.op;
    serumMat.opacity = 0.92 * cur.op;
    serumMat.color.setHex(state.serum);
    serumMat.emissive.setHex(state.serum);
    serumMat.emissiveIntensity = 0.7 + Math.sin(clock.elapsedTime * 1.2) * 0.25;
    capRingMat.color.setHex(state.cap);
    capRingMat.emissive.setHex(state.cap);
    capRingMat.emissiveIntensity = 2.0 + Math.sin(clock.elapsedTime * 2.2) * 0.7;
    labelMat.opacity = 0.95 * cur.op;

    glow.position.copy(bottle.position);
    glow.scale.setScalar(cur.scale * 1.2);
    glowMat.color.setHex(state.glow);
    glowMat.opacity = 0.18 * cur.op + Math.sin(clock.elapsedTime * 1.5) * 0.04 * cur.op;

    lights.key.color.setHex(state.lights[0]);
    lights.fill.color.setHex(state.lights[1]);
    lights.rim.color.setHex(state.lights[2]);
    const t = clock.elapsedTime;
    lights.key.position.set(Math.cos(t * 0.5) * 4 + bottle.position.x, 3, Math.sin(t * 0.5) * 4 + 2);
    lights.fill.position.set(Math.cos(t * 0.4 + Math.PI) * 5 + bottle.position.x, 1, Math.sin(t * 0.4 + Math.PI) * 4 + 2);
    lights.rim.position.set(bottle.position.x, -2, -3);

    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < partCount; i++) {
      pos[i * 3 + 1] += 0.005;
      if (pos[i * 3 + 1] > 5) {
        pos[i * 3 + 1] = -5;
        pos[i * 3] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.position.x = bottle.position.x;
    particles.material.color.setHex(state.serum);
    particles.material.opacity = 0.5 * cur.op;

    renderer.render(scene, camera);
  }
  animate();
}
