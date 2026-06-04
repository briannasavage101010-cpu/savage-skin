/**
 * Ingredients hero controller — buttery scroll scrubbing via image frames.
 *
 * Seeking a <video> 60x/second stutters (every seek flushes the decoder), so on
 * desktop we instead pre-slice the clip into JPG frames and flip through them on
 * a <canvas> as you scroll — drawing a preloaded image is instant, so it's
 * perfectly smooth (the technique Apple uses for scroll-driven product videos).
 *
 * Mobile / reduced-motion: frame preloading is heavy and scrubbing is awkward on
 * touch, so we fall back to the <video> as a muted autoplay loop.
 *
 * Frames live in /public/ingredient-frames/ and are regenerated from the clip:
 *   ffmpeg -i public/ingredient-descent.mp4 -vf "fps=20,scale=1280:-2" -q:v 5 \
 *     public/ingredient-frames/f_%03d.jpg
 * If you swap the clip, regenerate the frames and update FRAME_COUNT.
 */
const FRAME_COUNT = 121;
const FRAME_SRC = (i) => `/ingredient-frames/f_${String(i + 1).padStart(3, '0')}.jpg?v=2`;
export const PLACEHOLDER_VIDEO = '/ingredient-descent.mp4?v=2';

export function createIngredientsVideo(video, { reduceMotion = false } = {}) {
  const canvas = document.getElementById('ingFrames');
  const canScrub = !reduceMotion && !window.matchMedia('(max-width: 760px)').matches && !!canvas;

  // ---- Mobile / reduced-motion: simple autoplay-loop video ----
  if (!canScrub) {
    if (canvas) canvas.style.display = 'none';
    video.style.display = 'block';
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    return {
      setProduct(p) { const u = p.videoUrl || PLACEHOLDER_VIDEO; if (video.dataset.src !== u) { video.dataset.src = u; video.src = u; video.load(); } },
      setProgress() {},
      start() { video.play().catch(() => {}); },
      stop() { video.pause(); },
    };
  }

  // ---- Desktop: canvas frame scrubber ----
  video.style.display = 'none';
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const frames = new Array(FRAME_COUNT);
  let loaded = 0;
  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = FRAME_SRC(i);
    img.onload = () => { loaded++; if (i === 0) draw(0); };
    frames[i] = img;
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    draw(curFrame);
  }
  window.addEventListener('resize', resize);

  function nearestLoaded(idx) {
    if (frames[idx] && frames[idx].complete && frames[idx].naturalWidth) return frames[idx];
    for (let d = 1; d < FRAME_COUNT; d++) {
      const a = frames[idx - d], b = frames[idx + d];
      if (a && a.complete && a.naturalWidth) return a;
      if (b && b.complete && b.naturalWidth) return b;
    }
    return null;
  }

  function draw(idx) {
    const img = nearestLoaded(Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(idx))));
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let w, h;
    if (cr > ir) { w = cw; h = cw / ir; } else { h = ch; w = ch * ir; }
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  let targetFrame = 0;
  let curFrame = 0;
  let raf = 0;
  let running = false;

  function setProgress(p) { targetFrame = Math.max(0, Math.min(1, p)) * (FRAME_COUNT - 1); }

  function loop() {
    if (!running) return;
    curFrame += (targetFrame - curFrame) * 0.18;
    if (Math.abs(targetFrame - curFrame) < 0.05) curFrame = targetFrame;
    draw(curFrame);
    raf = requestAnimationFrame(loop);
  }

  resize();

  return {
    setProduct() {},
    setProgress,
    start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } },
    stop() { running = false; cancelAnimationFrame(raf); },
  };
}
