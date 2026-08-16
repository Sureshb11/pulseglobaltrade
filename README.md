# PulseGlobal Trade

Marketing site for PulseGlobal Trade, built from the Stitch design export in
`stitch_pulseglobal_export_hub/` (kept in the repo as the design reference, along with
`pulseglobal/DESIGN.md` which defines the token system).

## Running it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run preview` serves the built `dist/` output.

## Structure

```
index.html  about.html  products.html  product.html  export-process.html
global-reach.html  quality.html  quote.html  contact.html
partials/       head.html, header.html, footer.html — inlined at build time
src/styles.css  Tailwind entry + component layer (buttons, cards, fields, nav)
src/main.js     mobile drawer, header scroll state, gallery, form handling
src/hero-shader.js  decorative WebGL trade-route backdrop (home hero)
tailwind.config.js  design tokens from DESIGN.md
vite.config.js      MPA config + the partial-include plugin
```

### Partials

Vite's `transformIndexHtml` expands `<!-- @include partials/header.html -->` before the
page is served or built, so the header and footer exist in one place but ship as real
markup — nothing is injected client-side.

Each page declares its identity on the `<html>` element:

```html
<html lang="en" data-page="products" data-title="…" data-description="…">
```

`data-page` drives the active nav state: partials write `{{active:products}}`, which
expands to `aria-current="page"` on the matching page and to nothing elsewhere. Adding a
page means creating `<name>.html` at the root — Vite picks it up automatically.

## Responsive behaviour

Breakpoints are Tailwind defaults plus `xs: 420px`. Verified with no horizontal overflow
at 320 / 640 / 768 / 1024 px on every page.

- **Navigation** collapses to a slide-in drawer below `lg` (the seven-item nav needs the
  room). The drawer traps focus, closes on Escape, overlay click, or resize past `lg`, and
  locks page scroll without losing position.
- **Page gutters** use the `.container-page` helper: 20px on mobile, 64px from `md`. The
  export applied the 64px desktop margin unconditionally, which consumed a third of a
  375px screen.
- **The export-process timeline** runs as a vertical rail with connectors on phones and as
  a six-column horizontal rail from `lg`.
- **The quality verification pathway** wraps 2 → 3 → 6 across breakpoints. It was
  previously an 800px-wide row inside a horizontal scroller, so five of six steps were off
  screen on a phone.
- **Forms** are single column on mobile, and inputs use 16px text so iOS Safari does not
  zoom the viewport on focus.
- **Touch targets** are at least 44px for buttons and nav items, 32px for breadcrumbs and
  inline links.
- **The hero WebGL animation** is skipped below `md`, under `prefers-reduced-motion`, and
  without WebGL. It renders at half resolution and pauses when scrolled out of view or the
  tab is hidden.

## Notes on the port

A few things in the export were broken rather than merely unresponsive, and were fixed
here:

- `.btn-primary`, `.btn-secondary` and the quote-form field styles used `@apply` inside a
  plain `<style>` block. The Tailwind Play CDN only processes `@apply` in a
  `type="text/tailwindcss"` block, so those rules did nothing and the buttons rendered
  unstyled. They now live in `src/styles.css` and are compiled properly.
- Every link was `href="#"`; the nine pages had no way to reach each other. All navigation,
  footer, card and CTA links are now wired up.
- `rounded-DEFAULT` is not a valid class (`rounded` is) and was silently dropped.
- On several pages the `fixed` header and the footer also carried
  `max-w-container-max mx-auto`, so their backgrounds stopped short of the viewport edges.
  The constraint now sits on an inner wrapper.
- The Tailwind Play CDN is a development tool and is not used; CSS is compiled at build
  time (~7 kB gzipped).

## Not wired up

The quote and contact forms validate and acknowledge inline but do not submit anywhere —
see `initForms` in `src/main.js` and point them at your CRM or mail service. The products
filter bar is presentational for the same reason. Product imagery still points at the
Google-hosted URLs from the export; move these to your own asset host before launch.
