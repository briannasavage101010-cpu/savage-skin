/**
 * Molecule animation — 2D canvas, 3D-projected nodes + edges.
 * Lightweight, no Three.js dependency.
 */
export function initMolecule() {
  const canvas = document.getElementById('moleculeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = 0,
    H = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let visible = false;

  const N = 18;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const r = 1 + Math.random() * 0.6;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    nodes.push({
      x: r * Math.sin(theta) * Math.cos(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(theta),
      size: 4 + Math.random() * 3,
      accent: Math.random() > 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function fit() {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  new ResizeObserver(fit).observe(canvas);
  fit();

  const obs = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
  }, { threshold: 0.05 });
  obs.observe(canvas);

  let mx = 0,
    my = 0;
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  function project(p, rotY, rotX, scale) {
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = p.y * Math.sin(rotX) + z * Math.cos(rotX);
    const f = 3 / (3 + z);
    return { x: W / 2 + x * scale * f, y: H / 2 + y * scale * f, z, f };
  }

  let t = 0;
  function loop() {
    if (!visible) {
      requestAnimationFrame(loop);
      return;
    }
    t += 0.012;
    ctx.clearRect(0, 0, W, H);
    const rotY = t * 0.4 + mx * 0.5;
    const rotX = my * 0.4 + Math.sin(t * 0.3) * 0.15;
    const scale = Math.min(W, H) * 0.28;
    const pts = nodes.map((n) => Object.assign(project(n, rotY, rotX, scale), { ref: n }));

    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i],
          b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < scale * 1.0) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / (scale * 1.0)) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    pts.sort((a, b) => a.z - b.z);
    pts.forEach((p) => {
      const pulse = 1 + Math.sin(t * 2 + p.ref.phase) * 0.25;
      const r = p.ref.size * p.f * pulse;
      const color = p.ref.accent ? '255,45,149' : '0,240,255';
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      grad.addColorStop(0, `rgba(${color},${0.9 * p.f})`);
      grad.addColorStop(0.5, `rgba(${color},${0.3 * p.f})`);
      grad.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgb(${color})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
}
