/* ═══════════════════════════════════════════════════════
   SUMAK AGROPECUARIA — app.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── Loader ─── */
(function loader() {
  const overlay = document.getElementById('loader');
  const bar = document.getElementById('ldBar');
  if (!overlay || !bar) return;

  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      setTimeout(() => overlay.classList.add('hidden'), 350);
    }
    bar.style.width = progress + '%';
  }, 90);

  document.addEventListener('DOMContentLoaded', () => {
    clearInterval(tick);
    bar.style.width = '100%';
    setTimeout(() => overlay.classList.add('hidden'), 600);
  });
})();

/* ─── Custom cursor ─── */
(function cursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animRing() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    rafId = requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .pc, .acard, .cert-item, .gi').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();

/* ─── Navbar scroll behavior ─── */
(function navbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });
})();

/* ─── Mobile menu ─── */
(function mobileMenu() {
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('mobileOverlay');
  const close = document.getElementById('moClose');
  if (!burger || !overlay || !close) return;

  const open = () => overlay.classList.add('open');
  const shut = () => overlay.classList.remove('open');

  burger.addEventListener('click', open);
  close.addEventListener('click', shut);

  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
})();

/* ─── Smooth anchor scroll ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── Intersection Observer: reveal animations ─── */
(function reveals() {
  const elements = document.querySelectorAll('.rv');
  if (!elements.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => io.observe(el));
})();

/* ─── Animated counters ─── */
(function counters() {
  const elements = document.querySelectorAll('.counter');
  if (!elements.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = easeOutQuart(elapsed);
      const value = Math.floor(eased * target);
      el.textContent = value >= 1000 ? value.toLocaleString('es-PE') : value;
      if (elapsed < 1) requestAnimationFrame(tick);
      else el.textContent = target >= 1000 ? target.toLocaleString('es-PE') : target;
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  elements.forEach(el => io.observe(el));
})();

/* ─── Stat bar fills ─── */
(function statBars() {
  const bars = document.querySelectorAll('.stb-fill');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(b => io.observe(b));
})();

/* ─── B2B form submission ─── */
(function b2bForm() {
  const form = document.getElementById('b2bForm');
  const modal = document.getElementById('successModal');
  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    /* Basic validation */
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ef4444';
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    if (!valid) return;

    /* Simulate send */
    const btn = form.querySelector('.bform-submit');
    const origText = btn.querySelector('span').textContent;
    btn.querySelector('span').textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      btn.querySelector('span').textContent = origText;
      btn.disabled = false;
      form.reset();
      modal.style.display = 'flex';
    }, 1400);
  });
})();

/* ─── Subtle parallax on hero orbs ─── */
(function parallax() {
  const orbs = document.querySelectorAll('.hbg-orb');
  if (!orbs.length || window.innerWidth < 900) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
})();

/* ─── Gallery hover: cursor-aware tilt ─── */
(function galleryTilt() {
  const items = document.querySelectorAll('.gi');
  if (!items.length || window.innerWidth < 900) return;

  items.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
})();

/* ─── Active nav link on scroll ─── */
(function activeNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const links = document.querySelectorAll('.nm-link');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

/* ─── Lazy load for gallery bg ─── */
(function lazyImages() {
  if ('loading' in HTMLImageElement.prototype) return;
  const images = document.querySelectorAll('img[loading="lazy"]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        io.unobserve(img);
      }
    });
  });
  images.forEach(img => io.observe(img));
})();
