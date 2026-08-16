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

## Brand assets

`pulse-logo.png` in the repo root is the master artwork. It is not served — it
is 1536×1024, ~1 MB, and has an **opaque white background**, so dropping it
straight onto the navy footer would show a white rectangle.

```bash
npm run assets
```

`scripts/generate-logo-assets.mjs` keys out the white background (ramping the
anti-aliased edge so the result is not jagged), locates the PG monogram by
detecting blank rows between the lockup's bands rather than hardcoded offsets,
and box-filters each downscale. It writes to `public/`:

| File | Used for |
| --- | --- |
| `logo-mark.png` | header — the stacked lockup is 3:2, so at 80px header height the wordmark and tagline would be a few pixels tall |
| `logo-full.png` | full lockup, transparent, for light backgrounds |
| `logo-full-light.png` | white knockout for the navy footer |
| `favicon-32.png`, `favicon-180.png` | browser tab and iOS home screen (flattened onto white — transparency renders black there) |
| `og-image.png` | 1200×630 social preview, knockout lockup on brand navy |

Outputs are committed, so this only needs re-running when the master changes.

## Responsive behaviour

Breakpoints are Tailwind defaults plus `xs: 420px`. Verified with no horizontal overflow
at 320 / 640 / 768 / 1024 px on every page.

- **Navigation** collapses to a slide-in drawer below `xl` — with the logo mark in the
  brand lockup, seven nav links plus the CTA start wrapping at `lg`. The drawer traps
  focus, closes on Escape, overlay click, or resize past `xl`, and locks page scroll
  without losing position. The breakpoint is duplicated in `src/main.js` (`min-width:
  1280px`) and must stay in step with the `xl:hidden` classes in `partials/header.html`.
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

## Inquiry email

The quote and contact forms POST to `/api/send-inquiry`, a Vercel serverless function
(the only server-side code here) that emails **sales@pulseglobaltrade.com** via Resend.
`reply_to` is set to the enquirer, so replying in the mail client goes straight back to
them.

**It will not send until `RESEND_API_KEY` is set** in Vercel → Settings → Environment
Variables. See `.env.example`. Until then the function returns 500 and the form shows a
fallback pointing at the email address, so nothing silently disappears.

`MAIL_FROM` defaults to Resend's shared sending domain, which works with no DNS setup.
Verify pulseglobaltrade.com in Resend and switch it to an address on the domain for
better deliverability.

Notes on the implementation:

- Only known field names are read off the request, so a crafted payload cannot stuff
  arbitrary content into the email; values are HTML-escaped.
- A hidden honeypot field (`company_website`) returns 200 without sending, so bots see
  success and do not retry with variations.
- Provider errors are logged server-side and never reflected to the client — an invalid
  key must not echo back to the browser.
- On failure the form keeps what the user typed, and only resets on success.

The products filter bar is `data-local-form` — presentational, client-side only.

## Not wired up

The footer LinkedIn link is `href="#"` pending the real company page URL. Product imagery
still points at the Google-hosted URLs from the Stitch export; move these to your own
asset host before launch.
