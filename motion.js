/* ═══════════════════════════════════════════════════════════
   SUMAK — motion.js
   GSAP 3.15 + ScrollTrigger enhancement layer.

   Progressive by design: if GSAP is missing or the user prefers
   reduced motion, nothing here runs and every element stays in
   its final, fully visible state.
   ═══════════════════════════════════════════════════════════ */

'use strict';

(function motion() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  var g = window.gsap;
  var ST = window.ScrollTrigger;

  g.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  g.defaults({ ease: 'power3.out', duration: 0.85 });

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------
     Helper: `from` with CSS transitions suspended for the
     duration of the tween (otherwise per-frame inline transforms
     fight the element's own `transition: transform`).
     --------------------------------------------------------- */
  function from(target, vars) {
    var list = g.utils.toArray(target);
    if (!list.length) return null;

    list.forEach(function (el) { el.classList.add('is-anim'); });

    var opts = Object.assign({}, vars);
    var clear = opts.clearProps || 'transform,opacity';
    var done = opts.onComplete;
    delete opts.clearProps;

    opts.onComplete = function () {
      g.set(list, { clearProps: clear });
      list.forEach(function (el) { el.classList.remove('is-anim'); });
      if (done) done.call(this);
    };

    return g.from(list, opts);
  }

  /* ─── 1. Scroll progress bar ─── */
  var bar = document.querySelector('.progress-bar');
  if (bar) {
    g.set(bar, { scaleX: 0 });
    g.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.25 }
    });
  }

  /* ─── 2. Hero intro ─── */
  if (document.querySelector('.hero')) {
    from('.hero .eyebrow', { y: 16, opacity: 0, duration: 0.7 });
    from('.hero-title', { y: 30, opacity: 0, duration: 1.05, delay: 0.05 });
    from('.hero .lead', { y: 20, opacity: 0, duration: 0.85, delay: 0.25 });
    from('.hero-cta .btn', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, delay: 0.38 });
    from('.hero-trust', { y: 14, opacity: 0, duration: 0.6, delay: 0.5 });

    /* The hero image only scales: it stays painted from frame 1
       so the LCP is not delayed, and no clearProps is applied so
       the tilt handler below can keep its own transform. */
    g.from('.hero-figure', { scale: 1.06, duration: 1.5, ease: 'expo.out', delay: 0.15 });

    from('.float-card', { y: 26, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.6 });
  }

  /* ─── 3. Section headings and copy ─── */
  g.utils.toArray('.section-head, .about-copy, .gen-copy, .b2b-copy').forEach(function (block) {
    var items = block.querySelectorAll(
      '.eyebrow, .h2, .lead, .section-lead, .quote, .body-text, .link-arrow, .target-list, .guarantee-list'
    );
    if (!items.length) return;

    from(items, {
      y: 26,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      scrollTrigger: { trigger: block, start: 'top 82%', once: true }
    });
  });

  /* ─── 4. Card batches ─── */
  ST.batch('.value-card, .cert-card, .export-card, .kpi, .highlight, .step', {
    start: 'top 90%',
    once: true,
    onEnter: function (batch) {
      from(batch, { y: 30, opacity: 0, duration: 0.85, stagger: 0.07, overwrite: true });
    }
  });

  /* ─── 5. Big panels ─── */
  g.utils.toArray('.table-card, .gen-steps, .map-card, .form-card').forEach(function (el) {
    from(el, {
      y: 36,
      opacity: 0,
      duration: 0.95,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* The production panel is also a tilt target, so its transform
     must survive untouched (no clearProps, no transition toggle). */
  var prodPanel = document.querySelector('.prod-panel');
  if (prodPanel) {
    g.from(prodPanel, {
      y: 36,
      opacity: 0,
      duration: 0.95,
      scrollTrigger: { trigger: prodPanel, start: 'top 88%', once: true }
    });
  }

  /* ─── 6. Gallery tiles ─── */
  ST.batch('.gal-item', {
    start: 'top 90%',
    once: true,
    onEnter: function (batch) {
      from(batch, {
        y: 40,
        opacity: 0,
        scale: 0.97,
        duration: 1.05,
        stagger: 0.09,
        ease: 'power4.out',
        overwrite: true
      });
    }
  });

  /* ─── 7. Technical table rows ─── */
  ST.batch('.tech-table tbody tr', {
    start: 'top 92%',
    once: true,
    onEnter: function (rows) {
      from(rows, { opacity: 0, x: -16, duration: 0.6, stagger: 0.05, overwrite: true });
    }
  });

  /* ─── 8. Parallax (decorative layers only, never text) ─── */
  function parallax(selector, fromY, toY, scale) {
    g.utils.toArray(selector).forEach(function (el) {
      if (scale) g.set(el, { scale: scale });

      g.fromTo(el, { yPercent: fromY }, {
        yPercent: toY,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.hero, .map-card, .section') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    });
  }

  /* Scale leaves enough bleed for the ±3% travel (no visible edge). */
  parallax('.hero-figure img', -3, 3, 1.1);
  parallax('.map-card img', -3, 3, 1.12);
  parallax('.hero-glow-a', -8, 8);
  parallax('.hero-glow-b', 6, -6);

  /* ─── 9. 3D tilt on key surfaces ─── */
  function tilt(el, max) {
    if (!canHover || !el) return;

    g.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' });

    var rx = g.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    var ry = g.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });

    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max);
      rx(-py * max);
    });

    el.addEventListener('pointerleave', function () {
      rx(0);
      ry(0);
    });
  }

  tilt(document.querySelector('.hero-figure'), 5);
  tilt(prodPanel, 3);

  /* ─── 10. Recalculate once fonts and images settle ─── */
  window.addEventListener('load', function () {
    ST.refresh();
  });
})();
