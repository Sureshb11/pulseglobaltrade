import './styles.css';
import { initHeroShader } from './hero-shader.js';

/* ------------------------------------------------------------------ *
 * Mobile drawer
 * ------------------------------------------------------------------ */

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('menu-close');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  if (!toggle || !menu || !overlay) return;

  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea';
  let lastFocused = null;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  function open() {
    lastFocused = document.activeElement;
    menu.hidden = false;
    overlay.hidden = false;
    // Force a reflow so the transition runs from the translated state.
    void menu.offsetWidth;
    menu.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    // Lock the page behind the drawer without losing scroll position.
    document.body.dataset.scrollY = String(window.scrollY);
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = '100%';
    menu.querySelector(FOCUSABLE)?.focus();
  }

  function hide() {
    if (!isOpen()) return;
    menu.classList.add('translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');

    const y = Number(document.body.dataset.scrollY || 0);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, y);

    // Keep the panel out of the tab order once the slide-out finishes.
    const done = () => {
      if (!isOpen()) {
        menu.hidden = true;
        overlay.hidden = true;
      }
    };
    menu.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 350);

    lastFocused?.focus?.();
  }

  toggle.addEventListener('click', () => (isOpen() ? hide() : open()));
  close?.addEventListener('click', hide);
  overlay.addEventListener('click', hide);

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      hide();
      return;
    }
    if (e.key !== 'Tab') return;
    // Trap focus inside the drawer while it is modal.
    const items = [...menu.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Resizing past the lg breakpoint reveals the desktop nav; a drawer left
  // open would keep the body scroll-locked.
  const desktop = window.matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', (e) => e.matches && hide());
}

/* ------------------------------------------------------------------ *
 * Header elevation on scroll
 * ------------------------------------------------------------------ */

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;
  const update = () => {
    header.classList.toggle('shadow-ambient-2', window.scrollY > 10);
    header.classList.toggle('shadow-sm', window.scrollY <= 10);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ------------------------------------------------------------------ *
 * Product gallery (product detail page)
 * ------------------------------------------------------------------ */

function initGallery() {
  const main = document.querySelector('[data-gallery-main]');
  const thumbs = document.querySelectorAll('[data-gallery-thumb]');
  if (!main || !thumbs.length) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const img = thumb.querySelector('img');
      if (!img) return;
      main.src = img.src;
      main.alt = img.alt;
      thumbs.forEach((t) => {
        t.classList.remove('border-secondary');
        t.classList.add('border-transparent');
        t.setAttribute('aria-selected', 'false');
      });
      thumb.classList.add('border-secondary');
      thumb.classList.remove('border-transparent');
      thumb.setAttribute('aria-selected', 'true');
    });
  });
}

/* ------------------------------------------------------------------ *
 * Demo form handling — no backend is wired up, so acknowledge inline
 * rather than navigating to a dead action URL.
 * ------------------------------------------------------------------ */

function initForms() {
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector('[data-form-status]');
      if (status) {
        status.hidden = false;
        status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      form.reset();
    });
  });
}

/* ------------------------------------------------------------------ */

function init() {
  initMobileMenu();
  initHeaderScroll();
  initGallery();
  initForms();
  initHeroShader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
