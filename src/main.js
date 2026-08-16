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

  // Resizing past the xl breakpoint reveals the desktop nav; a drawer left
  // open would keep the body scroll-locked. Must match the `xl:hidden` in
  // partials/header.html.
  const desktop = window.matchMedia('(min-width: 1280px)');
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
 * Inquiry forms
 *
 * Posts to /api/send-inquiry, which emails the sales inbox. Forms marked
 * data-local-form (the products filter) stay client-side.
 * ------------------------------------------------------------------ */

const STATUS_STYLES = {
  success: ['text-secondary', 'bg-secondary-container/40'],
  error: ['text-on-error-container', 'bg-error-container'],
};

function setStatus(el, kind, message) {
  if (!el) return;
  el.classList.remove(...STATUS_STYLES.success, ...STATUS_STYLES.error);
  el.classList.add(...STATUS_STYLES[kind]);
  el.textContent = message;
  el.hidden = false;
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function initForms() {
  // Client-only forms: acknowledge inline, nothing to send.
  document.querySelectorAll('form[data-local-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('[data-form-status]');
      if (status) {
        status.hidden = false;
        status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('form[data-inquiry-form]').forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');
    const buttonLabel = button?.innerHTML;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.formType = form.dataset.inquiryForm;

      if (button) {
        button.disabled = true;
        button.classList.add('opacity-70', 'pointer-events-none');
        button.textContent = 'Sending…';
      }
      if (status) status.hidden = true;

      try {
        const res = await fetch('/api/send-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          setStatus(
            status,
            'success',
            "Thank you — your request has reached our trade desk. We'll respond within 24 hours.",
          );
          form.reset();
        } else {
          setStatus(
            status,
            'error',
            data.error ||
              'Something went wrong sending that. Please email sales@pulseglobaltrade.com directly.',
          );
        }
      } catch {
        // Offline, blocked, or the function is unreachable — always leave the
        // enquirer a way to reach us rather than a dead end.
        setStatus(
          status,
          'error',
          'We could not reach the server. Please email sales@pulseglobaltrade.com directly.',
        );
      } finally {
        if (button) {
          button.disabled = false;
          button.classList.remove('opacity-70', 'pointer-events-none');
          button.innerHTML = buttonLabel;
        }
      }
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
