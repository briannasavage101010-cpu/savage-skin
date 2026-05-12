/**
 * UI module: custom cursor, magnetic hover, scroll progress, countdown, VIP form, hero word stagger.
 */
import Lenis from 'lenis';

export let lenis = null;
export const scroll = { y: 0 };

export function initSmoothScroll() {
  if (!window.Lenis && !Lenis) return;
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });
  lenis.on('scroll', (e) => {
    scroll.y = e.scroll;
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        const t = document.querySelector(href);
        if (t) {
          e.preventDefault();
          lenis.scrollTo(t, { offset: -60, duration: 1.6 });
        }
      }
    });
  });
}

export function initCursor() {
  if (matchMedia('(hover:none)').matches) {
    document.body.classList.remove('cursor-on');
    return;
  }
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = innerWidth / 2,
    my = innerHeight / 2;
  let rx = mx,
    ry = my;
  window.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    },
    { passive: true }
  );
  function loop() {
    rx += (mx - rx) * 0.2;
    ry += (my - ry) * 0.2;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('.magnetic, a, button, input').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'), { passive: true });
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'), { passive: true });
  });

  document
    .querySelectorAll(
      '.btn.magnetic, .nav-cart.magnetic, .product-buy.magnetic, .form .submit.magnetic, .form .opt.magnetic'
    )
    .forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate3d(${x * 0.2}px,${y * 0.2}px,0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
}

export function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';
    requestAnimationFrame(update);
  }
  update();
}

export function initCountdown() {
  const KEY = 'savage_launch_date';
  let target = import.meta.env.VITE_LAUNCH_DATE || localStorage.getItem(KEY);
  if (!target) {
    target = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(KEY, target);
  }
  const t = new Date(target).getTime();
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
  function tick() {
    const diff = Math.max(0, t - Date.now());
    $('cdDays').textContent = pad(Math.floor(diff / 86400000));
    $('cdHours').textContent = pad(Math.floor(diff / 3600000) % 24);
    $('cdMins').textContent = pad(Math.floor(diff / 60000) % 60);
    $('cdSecs').textContent = pad(Math.floor(diff / 1000) % 60);
  }
  tick();
  setInterval(tick, 1000);
}

export function initHeroStagger() {
  const words = document.querySelectorAll('.hero-title .word');
  words.forEach((w, i) => {
    w.style.opacity = 0;
    w.style.transform = 'translate3d(0,40px,0)';
    w.style.transition = `opacity 1s cubic-bezier(.2,.8,.2,1) ${i * 0.12 + 0.2}s, transform 1s cubic-bezier(.2,.8,.2,1) ${i * 0.12 + 0.2}s`;
  });
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      words.forEach((w) => {
        w.style.opacity = 1;
        w.style.transform = 'none';
      });
    })
  );
}

export function initVipForm(onSubmit) {
  const form = document.getElementById('vipForm');
  if (!form) return;
  const opts = document.querySelectorAll('#skinType .opt');
  opts.forEach((o) =>
    o.addEventListener('click', () => {
      opts.forEach((x) => x.classList.remove('active'));
      o.classList.add('active');
    })
  );
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('vipName').value.trim();
    const email = document.getElementById('vipEmail').value.trim();
    const skin = document.querySelector('#skinType .opt.active')?.dataset.val || null;
    if (!name || !email) return;

    // Local backup
    const list = JSON.parse(localStorage.getItem('savage_vip') || '[]');
    list.push({ name, email, skin, ts: Date.now() });
    localStorage.setItem('savage_vip', JSON.stringify(list));

    // Optional: send to Klaviyo / Shopify / your backend
    if (onSubmit) {
      try {
        await onSubmit({ name, email, skin });
      } catch (err) {
        console.warn('VIP submit handler failed:', err);
      }
    }

    document.getElementById('vipSuccess').classList.add('is-visible');
    form.reset();
    opts.forEach((x) => x.classList.remove('active'));
  });
}
