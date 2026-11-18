/**
 * Gloss on the headline: the giant "lip gloss?" can be swatched like gloss on skin.
 *
 * - Mouse: moving the cursor over the words lays down a gloss trail (pressing lays
 *   it on thicker), and the light follows the cursor, so the shine glides over it.
 * - Touch: a sideways swipe across the words swatches; an up-down swipe still scrolls.
 * - Once, after the intro, a swatch swipes across the words on its own and flicks
 *   the question mark (skipped when the visitor prefers reduced motion).
 *
 * The film is a small height field on the CPU: each stroke stamps soft bumps into
 * it, it levels out a little every frame, and it fades a moment after you stop.
 * Every frame that changes, the field becomes a slope + thickness texture that one
 * tiny WebGL pass lights: a sheer pink film, deeper where it is thick, a sharp
 * highlight toward the light and two studio strip lights mirrored in it (the renders
 * are lit the same way). Nothing runs while nothing is wet, and nothing runs off
 * screen. Without WebGL the headline simply stays as it is.
 */
const title = document.querySelector('.hero-title');
const keyLine = document.querySelector('.t-key');
const qMark = document.querySelector('.t-key .q');
const host = document.querySelector('.hero-inner');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // v = 0 at the top, like the field
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uField;  // rg: surface slope, a: film thickness
uniform vec2 uLight;       // where the light is, in the same 0..1 space (follows the cursor)
uniform float uAspect;     // canvas width / height
uniform vec2 uCell;        // one field cell, in 0..1 space

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec4 f = texture2D(uField, vUv);
  float th = f.a;
  vec2 toLight = normalize((uLight - vUv) * vec2(uAspect, 1.0) + vec2(1e-4));
  // the film's crisp edge, and the soft shadow it casts away from the light
  float cov = smoothstep(0.05, 0.1, th);
  float covS = smoothstep(0.05, 0.1, texture2D(uField, vUv + toLight * uCell * 1.8).a);
  float shade = covS * (1.0 - cov);
  if (cov <= 0.0 && shade <= 0.0) { gl_FragColor = vec4(0.0); return; }
  vec2 s = f.rg * 2.0 - 1.0;
  // a liquid is never perfectly flat: a faint ripple breaks the shine up the way real gloss does
  vec2 np = vUv * vec2(uAspect, 1.0) * 24.0;
  vec2 ripple = (vec2(noise(np), noise(np + 17.3)) - 0.5) * 0.24 * smoothstep(0.2, 0.55, th);
  vec3 N = normalize(vec3(s + ripple, 1.0));
  // a long strip light (a studio softbox) centred on the cursor, so the shine runs along a stroke
  // instead of sitting on one spot, and slides along it as the cursor moves
  vec2 lp = vec2(clamp(vUv.x, uLight.x - 0.32, uLight.x + 0.32), uLight.y);
  vec3 L = normalize(vec3((lp - vUv) * vec2(uAspect, 1.0) * 1.1, 0.5));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float nh = max(dot(N, H), 0.0);
  float core = pow(nh, 46.0);                        // the bright band along the edge facing the light
  float sheen = pow(nh, 9.0);                        // the soft wet sheen over the whole film
  float shoulder = pow(clamp(length(s), 0.0, 1.0), 2.0);
  // sheer pink, a little deeper where the film is thick; the letters show through it
  vec3 tint = mix(vec3(0.95, 0.56, 0.64), vec3(0.83, 0.36, 0.48), smoothstep(0.25, 0.62, th));
  float a = cov * (0.2 + 0.16 * smoothstep(0.1, 0.6, th));
  float g = cov * (core * 1.2 + sheen * 0.15 + shoulder * 0.08);
  float sa = shade * 0.07;
  float alpha = min(1.0, a + g + sa);
  vec3 col = tint * a + vec3(1.0, 0.99, 0.99) * g + vec3(0.16, 0.06, 0.08) * sa;
  gl_FragColor = vec4(min(col, vec3(alpha)), alpha);  // premultiplied
}`;

if (title && keyLine && host) start();

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'gloss-layer';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power',
  });
  if (!gl) return;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const uLight = gl.getUniformLocation(prog, 'uLight');
  const uAspect = gl.getUniformLocation(prog, 'uAspect');
  const uCell = gl.getUniformLocation(prog, 'uCell');
  gl.uniform1i(gl.getUniformLocation(prog, 'uField'), 0);

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.clearColor(0, 0, 0, 0);

  title.appendChild(canvas);
  document.documentElement.classList.add('has-gloss');

  /* ---------------- the height field ---------------- */
  const CAP = 0.62;    // a film levels out at this thickness, however often you go over it
  // field height difference -> surface slope. Scaled by the brush, so a phone's smaller strokes
  // (fewer cells across) get the same rounded edge and the same thin shine as a desktop's.
  let slope = 2.4;
  let cssW = 0, cssH = 0, W = 0, H = 0, field, scratch, pixels, brush = 8, keySize = 100;
  function layout() {
    cssW = title.offsetWidth;
    cssH = title.offsetHeight;
    if (!cssW || !cssH) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const cell = cssW > 700 ? 3 : 2;
    W = Math.max(8, Math.ceil(cssW / cell));
    H = Math.max(8, Math.ceil(cssH / cell));
    field = new Float32Array(W * H);
    scratch = new Float32Array(W * H);
    pixels = new Uint8Array(W * H * 4);
    for (let i = 0; i < W * H; i++) { pixels[i * 4] = 128; pixels[i * 4 + 1] = 128; }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    keySize = parseFloat(getComputedStyle(keyLine).fontSize) || 100;
    brush = Math.max(4, Math.min(30, (keySize * 0.085) / cell));
    slope = 2.4 * Math.min(1.2, brush / 10);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uAspect, cssW / cssH);
    gl.uniform2f(uCell, 1 / W, 1 / H);
    wet = 0;
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function stamp(gx, gy, r, amt) {
    const r2 = r * r;
    const x0 = Math.max(1, Math.floor(gx - r)), x1 = Math.min(W - 2, Math.ceil(gx + r));
    const y0 = Math.max(1, Math.floor(gy - r)), y1 = Math.min(H - 2, Math.ceil(gy + r));
    for (let y = y0; y <= y1; y++) {
      const row = y * W;
      for (let x = x0; x <= x1; x++) {
        const dx = x - gx, dy = y - gy, d2 = dx * dx + dy * dy;
        if (d2 >= r2) continue;
        const k = d2 / r2;
        const i = row + x;
        // flat on top, rounded at the shoulder: a film, not a bump
        const v = field[i] + (1 - k * k) * amt;
        field[i] = v > CAP ? CAP : v;
      }
    }
  }

  // one frame of the film: level out a little, fade once nobody is painting, encode
  function step(now) {
    const drying = now - lastPaint > 900 && !demo;
    const keep = drying ? 0.986 : 1;
    const evap = drying ? 0.0012 : 0;
    let sum = 0;
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      for (let x = 1; x < W - 1; x++) {
        const i = row + x;
        const c = field[i];
        const n = field[i - 1] + field[i + 1] + field[i - W] + field[i + W];
        if (c === 0 && n === 0) { scratch[i] = 0; continue; }
        let v = (c + (n * 0.25 - c) * 0.2) * keep - evap;
        if (v < 0.004) v = 0;
        scratch[i] = v;
        sum += v;
      }
    }
    const t = field; field = scratch; scratch = t;
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      for (let x = 1; x < W - 1; x++) {
        const i = row + x, o = i * 4, v = field[i];
        if (v === 0 && pixels[o + 3] === 0) continue;
        let sx = (field[i - 1] - field[i + 1]) * slope;
        let sy = (field[i - W] - field[i + W]) * slope;
        sx = sx > 1 ? 1 : sx < -1 ? -1 : sx;
        sy = sy > 1 ? 1 : sy < -1 ? -1 : sy;
        pixels[o] = (sx * 0.5 + 0.5) * 255;
        pixels[o + 1] = (sy * 0.5 + 0.5) * 255;
        pixels[o + 3] = v * 255;
      }
    }
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return sum;
  }

  /* ---------------- light, painting, loop ---------------- */
  const REST = { x: 0.16, y: -0.25 };          // light up and to the left, like the renders
  const light = { x: REST.x, y: REST.y }, target = { x: REST.x, y: REST.y };
  let raf = 0, wet = 0, lastPaint = 0, last = null, visible = true, demo = null;

  function paintTo(px, py, amt, size) {
    const gx = (px / cssW) * W, gy = (py / cssH) * H, r = brush * size;
    if (last) {
      const dx = gx - last.x, dy = gy - last.y;
      const n = Math.min(80, Math.ceil(Math.hypot(dx, dy) / Math.max(1, r * 0.3)));
      for (let k = 1; k <= n; k++) stamp(last.x + (dx * k) / n, last.y + (dy * k) / n, r, amt);
    } else {
      stamp(gx, gy, r, amt);
    }
    last = { x: gx, y: gy };
    lastPaint = performance.now();
    wake();
  }

  function frame(now) {
    raf = 0;
    if (!visible || !W) return;
    if (demo) runDemo(now);
    wet = step(now);
    light.x += (target.x - light.x) * 0.14;
    light.y += (target.y - light.y) * 0.14;
    gl.uniform2f(uLight, light.x, light.y);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (wet > 0) gl.drawArrays(gl.TRIANGLES, 0, 3);
    // painting during this frame may already have queued the next one (wake); never queue two
    if ((wet > 0 || demo) && !raf) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  const local = (e) => {
    const r = title.getBoundingClientRect(); // includes the scroll drift transform
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  title.addEventListener('pointermove', (e) => {
    const p = local(e);
    // the light rides above and a little left of the cursor (like a studio light, never on top
    // of the film, where a flat film would mirror it everywhere and turn white)
    target.x = (p.x - keySize * 0.15) / cssW;
    target.y = (p.y - keySize * 0.9) / cssH;
    if (e.pointerType === 'mouse') {
      if (e.buttons & 1) paintTo(p.x, p.y, 0.24, 1);      // pressing: a proper swatch
      else paintTo(p.x, p.y, 0.1, 0.72);                  // just moving: a light trail
    } else if (down) {
      paintTo(p.x, p.y, 0.24, 1);
    }
  });
  let down = false;
  title.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    down = true;
    last = null;
    const p = local(e);
    paintTo(p.x, p.y, 0.24, 1);
  });
  const lift = () => { down = false; last = null; };
  title.addEventListener('pointerup', lift);
  title.addEventListener('pointercancel', lift);
  title.addEventListener('pointerleave', () => { lift(); target.x = REST.x; target.y = REST.y; wake(); });

  /* ---------------- the swatch that runs once on its own ---------------- */
  // One swatch swoosh, the way a finger swipes gloss: it starts low and full on the g, curves up
  // across "oss" thinning out as the finger lifts, and knocks the question mark on its hook.
  // (A straight band through the middle of the words read as crossing them out.)
  function runDemo(now) {
    const t = Math.min(1, (now - demo.t0) / demo.dur);
    const e = 1 - (1 - t) * (1 - t);
    const u = 1 - e;
    const x = u * u * demo.p0.x + 2 * u * e * demo.p1.x + e * e * demo.p2.x;
    const y = u * u * demo.p0.y + 2 * u * e * demo.p1.y + e * e * demo.p2.y;
    paintTo(x, y, 0.34 - 0.14 * e, 1.32 - 0.6 * e);
    target.x = x / cssW;
    target.y = (y - keySize * 0.9) / cssH;
    if (t >= 0.9 && !demo.flicked) { demo.flicked = true; flick(); }
    if (t >= 1) { demo = null; last = null; target.x = REST.x; target.y = REST.y; hint.classList.add('on'); }
  }
  function startDemo() {
    if (reduce || !visible || window.scrollY > title.offsetHeight * 0.6) { hint.classList.add('on'); return; }
    const tr = title.getBoundingClientRect();
    const kr = keyLine.getBoundingClientRect();
    const gEl = keyLine.querySelector('.g');
    const gr = gEl ? gEl.getBoundingClientRect() : kr;
    const qr = qMark ? qMark.getBoundingClientRect() : kr;
    const top = kr.top - tr.top + keySize * 0.04;        // the key line's own line box
    const base = top + keySize * 0.75;                   // its baseline
    const gx = gr.left - tr.left, qx = qr.left - tr.left;
    demo = {
      t0: performance.now(), dur: 1050, flicked: false,
      p0: { x: gx + keySize * 0.05, y: base - keySize * 0.13 },
      p1: { x: gx + (qx - gx) * 0.45, y: base - keySize * 0.05 },
      p2: { x: qx - keySize * 0.02, y: top + keySize * 0.31 },
    };
    last = null;
    wake();
  }
  function flick() {
    if (!qMark || !qMark.animate) return;
    // pushed from the left, so its foot swings right first, then it settles
    qMark.animate([
      { transform: 'rotate(0deg)', easing: 'ease-out' },
      { transform: 'rotate(-11deg)', offset: 0.15, easing: 'ease-in-out' },
      { transform: 'rotate(6.5deg)', offset: 0.37, easing: 'ease-in-out' },
      { transform: 'rotate(-3.4deg)', offset: 0.57, easing: 'ease-in-out' },
      { transform: 'rotate(1.3deg)', offset: 0.78, easing: 'ease-in-out' },
      { transform: 'rotate(0deg)' },
    ], { duration: 2200 });
  }

  /* ---------------- the hint (wide screens), size, visibility ---------------- */
  const hint = document.createElement('p');
  hint.className = 'gloss-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = '<span class="gh-mouse">Run your cursor over the words to swatch the gloss.</span>'
    + '<span class="gh-touch">Swipe sideways across the words to swatch the gloss.</span>'
    + '<small>Concept shade. The formula isn’t final.</small>';
  host.appendChild(hint);

  layout();
  let resizeTimer = 0;
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); }).observe(title);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }).observe(title);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) wake(); });

  // after the intro has landed (the lines rise, the question mark settles)
  const wait = Math.max(0, 2400 - performance.now());
  setTimeout(startDemo, wait);
}
