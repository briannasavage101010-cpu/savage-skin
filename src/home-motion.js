/**
 * Homepage motion layer. Loaded lazily by src/home.js after first paint.
 *
 * Thesis (DESIGN.md): the Pod arrives once and settles. One scrubbed signature
 * (the design drawing developing into the concept render), slow unmask reveals
 * on large imagery only, a slow drift on the hero and the gloss macro image.
 * Everything runs on GSAP's ticker (Lenis included), animates only transform,
 * opacity and clip-path, and is reverted by gsap.matchMedia() when the visitor
 * prefers reduced motion.
 *
 * Two separate matchMedia contexts on purpose: the scroll choreography depends
 * only on reduced motion and width, so a change in pointer type (a tablet
 * keyboard attaching, a screenshot tool resizing) can never revert it and leave
 * revealed content hidden again.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'expo.out'; // the CSS side uses cubic-bezier(.16,1,.3,1), the same family
const mm = gsap.matchMedia();

/* ---------------- scroll choreography ---------------- */
mm.add(
  { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 901px)' },
  (ctx) => {
    const { motion, wide } = ctx.conditions;
    if (!motion) return;

    const vh = window.innerHeight;
    const belowFold = (el) => el.getBoundingClientRect().top > vh * 0.9;

    // Hero: the photo drifts slower than the page as you leave it.
    const heroImg = document.querySelector('[data-parallax]');
    if (heroImg) {
      gsap.to(heroImg, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // Signature: the design drawing develops into the concept render.
    const stage = document.getElementById('stage');
    if (stage) {
      const render = stage.querySelector('.stage-render');
      const line = stage.querySelector('.stage-line');
      const frame = stage.querySelector('.stage-frame');
      gsap.set(render, { clipPath: 'inset(0% 0% 100% 0%)' });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: wide
          ? { trigger: stage, start: 'top 72%', endTrigger: '.how-steps', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
          : { trigger: stage, start: 'top 78%', end: 'bottom 40%', scrub: 0.6, invalidateOnRefresh: true },
      });
      // The scan line fades in as the wipe starts and out as it lands, so it is
      // never a stray rule sitting on the drawing at rest.
      tl.to(render, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 0)
        .fromTo(line, { y: 0 }, { y: () => frame.offsetHeight, duration: 1 }, 0)
        .fromTo(line, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0)
        .to(line, { autoAlpha: 0, duration: 0.08 }, 0.92);
    }

    // Large imagery unmasks once, rising from the bottom edge.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      if (!belowFold(el)) return;
      const img = el.querySelector('img');
      gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 86%',
        once: true,
        onEnter: () => {
          gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: EASE });
          if (img) gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.7, ease: EASE });
        },
      });
    });

    // The three big statements settle into place once.
    gsap.utils.toArray('[data-rise]').forEach((el) => {
      if (!belowFold(el)) return;
      gsap.from(el, {
        y: 28,
        autoAlpha: 0,
        duration: 1.1,
        ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // The gloss macro drifts against the scroll.
    const drift = document.querySelector('[data-drift]');
    if (drift) {
      gsap.fromTo(drift, { yPercent: -4 }, {
        yPercent: 4,
        ease: 'none',
        scrollTrigger: { trigger: drift.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    // The progress line draws down to "Happening now".
    const bar = document.querySelector('[data-bar]');
    if (bar && belowFold(bar)) {
      gsap.from(bar, {
        scaleY: 0,
        duration: 1.4,
        ease: EASE,
        scrollTrigger: { trigger: '.timeline', start: 'top 82%', once: true },
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
);

/* ---------------- mouse and trackpad only ---------------- */
mm.add(
  {
    motion: '(prefers-reduced-motion: no-preference)',
    fine: '(hover: hover) and (pointer: fine)',
    wide: '(min-width: 901px)',
  },
  (ctx) => {
    const { motion, fine, wide } = ctx.conditions;
    if (!motion || !fine) return undefined;
    const cleanups = [];

    // Smooth scroll on the GSAP clock.
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const headH = () => document.getElementById('siteHead').offsetHeight;
    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('skip')) return;
      const id = a.getAttribute('href');
      const target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -(headH() + 20), duration: 1.25 });
      history.pushState(null, '', id);
    };
    document.addEventListener('click', onAnchor);
    cleanups.push(() => {
      document.removeEventListener('click', onAnchor);
      gsap.ticker.remove(tick);
      lenis.destroy();
    });

    // Hero: a slight float under the pointer.
    if (wide) {
      const hero = document.querySelector('.hero');
      const float = document.querySelector('[data-float]');
      if (hero && float) {
        const xTo = gsap.quickTo(float, 'x', { duration: 1.4, ease: 'power3' });
        const yTo = gsap.quickTo(float, 'y', { duration: 1.4, ease: 'power3' });
        const onMove = (e) => {
          const r = hero.getBoundingClientRect();
          xTo(((e.clientX - r.left) / r.width - 0.5) * -14);
          yTo(((e.clientY - r.top) / r.height - 0.5) * -10);
        };
        const onLeave = () => { xTo(0); yTo(0); };
        hero.addEventListener('pointermove', onMove);
        hero.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          hero.removeEventListener('pointermove', onMove);
          hero.removeEventListener('pointerleave', onLeave);
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }
);
