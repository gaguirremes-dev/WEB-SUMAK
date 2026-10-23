/* ═══════════════════════════════════════════════════════════
   SUMAK AGROPECUARIA — app.js
   Lightweight, dependency-free progressive enhancement.
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Navbar scroll state ─── */
(function navbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let ticking = false;
  const update = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
})();

/* ─── Mobile menu ─── */
(function mobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('mobileClose');
  if (!burger || !menu || !closeBtn) return;

  const open = () => {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const shut = () => {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  };

  burger.addEventListener('click', open);
  closeBtn.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', shut));
  menu.addEventListener('click', (e) => { if (e.target === menu) shut(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) shut();
  });
})();

/* ─── Smooth anchor scroll (offset for the floating pill) ─── */
(function anchorScroll() {
  const OFFSET = 96;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
    });
  });
})();

/* ─── Active nav link on scroll ─── */
(function activeNav() {
  const links = [...document.querySelectorAll('.nav-link')];
  if (!links.length) return;

  const sections = links
    .map((link) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return null;
      const el = document.querySelector(id);
      return el ? { el, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sections.forEach(({ el, link }) => {
        link.classList.toggle('active', el === entry.target);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(({ el }) => io.observe(el));
})();

/* Scroll reveals live in motion.js (GSAP). Nothing is hidden here,
   so the page stays fully visible if GSAP fails to load. */

/* ─── Animated counters ─── */
(function counters() {
  const els = document.querySelectorAll('.counter');
  if (!els.length) return;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = Math.floor(easeOutQuart(t) * target);
      el.textContent = value >= 1000 ? value.toLocaleString('es-PE') : value;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target >= 1000 ? target.toLocaleString('es-PE') : target;
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  els.forEach((el) => io.observe(el));
})();

/* ─── Production photo selector ─── */
(function prodSelector() {
  const root = document.getElementById('prodSelector');
  if (!root) return;

  const img = document.getElementById('prodImg');
  const tag = document.getElementById('prodTag');
  const title = document.getElementById('prodTitle');
  const text = document.getElementById('prodText');
  const chips = document.getElementById('prodChips');
  if (!img || !tag || !title || !text || !chips) return;

  const base = 'assets/img/opt/';
  const DATA = {
    vacuno: {
      img: 'vacuno',
      tag: 'Ganadería mayor',
      title: 'Producción vacuna',
      text: 'Hatos ganaderos de raza pura y comercial bajo estrictos controles sanitarios automatizados. Razas Angus, Simmental, Brahman y Holstein con trazabilidad RFID completa.',
      chips: ['Trazabilidad RFID', 'Control sanitario', 'Registro genético']
    },
    porcino: {
      img: 'porcinos',
      tag: 'Ganadería menor',
      title: 'Producción porcina',
      text: 'Granjas tecnificadas con alimentación automatizada, ventilación controlada y bioseguridad nivel A en cada nave de producción.',
      chips: ['Bioseguridad A', 'Automatización', 'Conversión eficiente']
    },
    ovino: {
      img: 'ovinos',
      tag: 'Ganadería menor',
      title: 'Producción ovina',
      text: 'Rebaños de alta calidad para producción de carne y lana fina con manejo extensivo e intensivo supervisado.',
      chips: ['Pastoreo rotacional', 'Lana premium', 'Bienestar animal']
    },
    bioseguridad: {
      img: 'bioseguridad',
      tag: 'Infraestructura',
      title: 'Bioseguridad certificada',
      text: 'Protocolos de bioseguridad internacional con filtración de aire, barreras sanitarias y monitoreo IoT 24/7 en todas las instalaciones.',
      chips: ['IoT 24/7', 'SENASA', 'OMSA']
    },
    planta: {
      img: 'planta-beneficio',
      tag: 'Procesamiento',
      title: 'Planta de beneficio',
      text: 'Beneficio, maduración y desposte con cadena de frío controlada por sensores TI y empaque al vacío de alta barrera.',
      chips: ['Cadena de frío', 'Empaque al vacío', 'HACCP']
    },
    horeca: {
      img: 'canal-horeca',
      tag: 'Distribución',
      title: 'Canal HORECA',
      text: 'Suministro de alta capacidad para supermercados, hoteles, restaurantes e industrias procesadoras nacionales.',
      chips: ['Entrega oportuna', 'Volumen industrial', 'Cobertura nacional']
    }
  };

  const buttons = [...root.querySelectorAll('.sel-item')];

  const render = (key) => {
    const d = DATA[key];
    if (!d) return;

    img.src = base + d.img + '-800.webp';
    img.srcset = `${base}${d.img}-800.webp 800w, ${base}${d.img}-1600.webp 1600w`;
    img.alt = d.title;

    tag.textContent = d.tag;
    title.textContent = d.title;
    text.textContent = d.text;

    chips.innerHTML = '';
    d.chips.forEach((c) => {
      const li = document.createElement('li');
      li.className = 'chip';
      li.textContent = c;
      chips.appendChild(li);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      render(btn.dataset.target);
    });
  });

  /* keyboard navigation between tabs */
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = buttons.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length];
    next.focus();
    next.click();
  });
})();

/* ─── B2B form ─── */
(function b2bForm() {
  const form = document.getElementById('b2bForm');
  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');
  if (!form || !modal) return;

  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit ? submit.querySelector('span') : null;

  const clearInvalid = (field) => field.classList.remove('is-invalid');

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => clearInvalid(field));
    field.addEventListener('change', () => clearInvalid(field));
  });

  const openModal = () => {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((field) => {
      const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
      if (empty) {
        field.classList.add('is-invalid');
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearInvalid(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Enviando…';

    /* Simulated send — replace with the real endpoint */
    setTimeout(() => {
      if (submit) submit.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Enviar solicitud corporativa';
      form.reset();
      openModal();
    }, 1200);
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
