/**
 * Derives the site's logo assets from the master artwork (pulse-logo.png).
 *
 * The master is a 1536x1024 RGB PNG with an opaque white background and a
 * stacked lockup: PG monogram, "PULSEGLOBAL TRADE" wordmark, and the tagline.
 * Two problems have to be solved before it can be used:
 *
 *   1. No alpha channel — dropping it straight onto the navy footer would show
 *      a white rectangle.
 *   2. Stacked proportions (3:2) — at the 80px header height the wordmark and
 *      tagline render a few pixels tall and turn to mush, so the header needs
 *      the monogram alone.
 *
 * Run with `npm run assets`. Outputs are committed, so this only needs
 * re-running when the master artwork changes.
 */
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(root, 'public');
mkdirSync(OUT, { recursive: true });

const src = PNG.sync.read(readFileSync(resolve(root, 'pulse-logo.png')));

/* ---------------------------------------------------------------- *
 * Background removal
 *
 * The artwork is dark ink on white, so the lightest channel is a good
 * proxy for coverage. Anything at/above BG_MAX is background, anything
 * at/below INK_MAX is solid ink whose original color is preserved, and
 * the narrow band between the two is the anti-aliased edge, ramped so
 * the result does not get a hard jagged outline.
 * ---------------------------------------------------------------- */
const BG_MAX = 248;
const INK_MAX = 232;

function withAlpha(image, { knockout = null } = {}) {
  const out = new PNG({ width: image.width, height: image.height });
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
    const lightest = Math.max(r, g, b);

    let a;
    if (lightest >= BG_MAX) a = 0;
    else if (lightest <= INK_MAX) a = 255;
    else a = Math.round(((BG_MAX - lightest) / (BG_MAX - INK_MAX)) * 255);

    if (knockout) {
      out.data[i] = knockout[0];
      out.data[i + 1] = knockout[1];
      out.data[i + 2] = knockout[2];
    } else {
      out.data[i] = r;
      out.data[i + 1] = g;
      out.data[i + 2] = b;
    }
    out.data[i + 3] = a;
  }
  return out;
}

/* Bounding box of everything with meaningful coverage. */
function inkBounds(image, y0 = 0, y1 = image.height) {
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < image.width; x++) {
      if (image.data[(image.width * y + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function crop(image, { x, y, w, h }) {
  const out = new PNG({ width: w, height: h });
  for (let row = 0; row < h; row++) {
    src.data.copy;
    const from = ((y + row) * image.width + x) * 4;
    image.data.copy(out.data, row * w * 4, from, from + w * 4);
  }
  return out;
}

/* Area-average downscale — box filtering keeps fine strokes such as the
   swoosh and the tagline readable, which bilinear sampling does not. */
function resize(image, targetW) {
  const scale = targetW / image.width;
  const targetH = Math.max(1, Math.round(image.height * scale));
  const out = new PNG({ width: targetW, height: targetH });

  for (let y = 0; y < targetH; y++) {
    const sy0 = (y / targetH) * image.height;
    const sy1 = ((y + 1) / targetH) * image.height;
    for (let x = 0; x < targetW; x++) {
      const sx0 = (x / targetW) * image.width;
      const sx1 = ((x + 1) / targetW) * image.width;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = Math.floor(sy0); sy < Math.min(Math.ceil(sy1), image.height); sy++) {
        for (let sx = Math.floor(sx0); sx < Math.min(Math.ceil(sx1), image.width); sx++) {
          const i = (sy * image.width + sx) * 4;
          const pa = image.data[i + 3] / 255;
          // Weight color by alpha so transparent pixels do not wash out edges.
          r += image.data[i] * pa;
          g += image.data[i + 1] * pa;
          b += image.data[i + 2] * pa;
          a += image.data[i + 3];
          n++;
        }
      }
      const o = (y * targetW + x) * 4;
      const alpha = a / n;
      const cover = alpha / 255 || 1;
      out.data[o] = Math.round(r / n / cover);
      out.data[o + 1] = Math.round(g / n / cover);
      out.data[o + 2] = Math.round(b / n / cover);
      out.data[o + 3] = Math.round(alpha);
    }
  }
  return out;
}

/* Flatten onto an opaque background — iOS home-screen icons and social
   preview cards both render transparency as black otherwise. */
function onBackground(image, [br, bg, bb], size, padding = 0) {
  const out = new PNG({ width: size, height: size });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = br;
    out.data[i + 1] = bg;
    out.data[i + 2] = bb;
    out.data[i + 3] = 255;
  }
  const inner = size - padding * 2;
  const scaled = resize(image, inner);
  const offY = Math.round((size - scaled.height) / 2);
  for (let y = 0; y < scaled.height; y++) {
    const ty = y + offY;
    if (ty < 0 || ty >= size) continue;
    for (let x = 0; x < scaled.width; x++) {
      const s = (y * scaled.width + x) * 4;
      const t = (ty * size + x + padding) * 4;
      const a = scaled.data[s + 3] / 255;
      out.data[t] = Math.round(scaled.data[s] * a + out.data[t] * (1 - a));
      out.data[t + 1] = Math.round(scaled.data[s + 1] * a + out.data[t + 1] * (1 - a));
      out.data[t + 2] = Math.round(scaled.data[s + 2] * a + out.data[t + 2] * (1 - a));
    }
  }
  return out;
}

function save(name, image) {
  const buf = PNG.sync.write(image, { deflateLevel: 9 });
  writeFileSync(resolve(OUT, name), buf);
  console.log(`  ${name.padEnd(26)} ${image.width}x${image.height}  ${(buf.length / 1024).toFixed(1)} kB`);
}

/* ---------------------------------------------------------------- */

const keyed = withAlpha(src);
const full = crop(keyed, inkBounds(keyed));

/* Split the lockup into horizontal bands separated by blank rows, so the
   monogram is located by measurement rather than hardcoded pixel offsets
   that would silently drift if the artwork is ever re-exported. */
const rowHasInk = [];
for (let y = 0; y < full.height; y++) {
  let ink = false;
  for (let x = 0; x < full.width && !ink; x++) {
    if (full.data[(full.width * y + x) * 4 + 3] > 24) ink = true;
  }
  rowHasInk.push(ink);
}
const bands = [];
let start = null;
for (let y = 0; y <= full.height; y++) {
  if (rowHasInk[y] && start === null) start = y;
  else if (!rowHasInk[y] && start !== null) {
    bands.push([start, y - 1]);
    start = null;
  }
}
console.log(`  detected ${bands.length} bands:`, bands.map(([a, b]) => `${a}-${b}`).join(', '));

const [markTop, markBottom] = bands[0];
const mark = crop(full, inkBounds(full, markTop, markBottom + 1));
const markLight = crop(withAlpha(src, { knockout: [255, 255, 255] }), inkBounds(full, markTop, markBottom + 1));
const fullLight = crop(withAlpha(src, { knockout: [255, 255, 255] }), inkBounds(keyed));

console.log('\nGenerated assets:');
save('logo-mark.png', resize(mark, 160)); // header, 2x of ~46px tall
save('logo-full.png', resize(full, 640)); // light backgrounds
save('logo-full-light.png', resize(fullLight, 640)); // navy footer
save('favicon-32.png', onBackground(mark, [255, 255, 255], 32, 1));
save('favicon-180.png', onBackground(mark, [255, 255, 255], 180, 14));

/* Social preview card: knockout lockup centred on brand navy. */
const og = new PNG({ width: 1200, height: 630 });
for (let i = 0; i < og.data.length; i += 4) {
  og.data[i] = 0x0d;
  og.data[i + 1] = 0x1c;
  og.data[i + 2] = 0x32;
  og.data[i + 3] = 255;
}
const ogLogo = resize(fullLight, 620);
const ox = Math.round((1200 - ogLogo.width) / 2);
const oy = Math.round((630 - ogLogo.height) / 2);
for (let y = 0; y < ogLogo.height; y++) {
  for (let x = 0; x < ogLogo.width; x++) {
    const s = (y * ogLogo.width + x) * 4;
    const t = ((y + oy) * 1200 + x + ox) * 4;
    const a = ogLogo.data[s + 3] / 255;
    og.data[t] = Math.round(ogLogo.data[s] * a + og.data[t] * (1 - a));
    og.data[t + 1] = Math.round(ogLogo.data[s + 1] * a + og.data[t + 1] * (1 - a));
    og.data[t + 2] = Math.round(ogLogo.data[s + 2] * a + og.data[t + 2] * (1 - a));
  }
}
save('og-image.png', og);
