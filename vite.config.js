import { defineConfig } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const SITE_ORIGIN = 'https://www.pulseglobaltrade.com';

/**
 * Inlines `<!-- @include partials/name.html -->` at transform time so the header,
 * footer and <head> block live in exactly one file. Runs in dev and in build, so
 * the shipped HTML is complete markup — no client-side layout injection.
 *
 * Includes may nest. `data-page="products"` on the <html> element drives the
 * active nav state, which the partials read via `{{page}}`.
 */
function htmlPartials() {
  const INCLUDE = /<!--\s*@include\s+([\w./-]+)\s*-->/g;

  const expand = (html, depth = 0) => {
    if (depth > 5) throw new Error('partial include nested too deeply (circular include?)');
    return html.replace(INCLUDE, (_, file) =>
      expand(readFileSync(resolve(root, file), 'utf8'), depth + 1),
    );
  };

  return {
    name: 'html-partials',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = html.match(/data-page="([\w-]+)"/)?.[1] ?? '';
        const title = html.match(/data-title="([^"]*)"/)?.[1] ?? 'PulseGlobal Trade';
        const description = html.match(/data-description="([^"]*)"/)?.[1] ?? '';

        // www is the canonical host: the apex 308-redirects to it in Vercel.
        const path = (ctx?.path ?? '/').replace(/^\/?/, '/');
        const canonical = SITE_ORIGIN + (path === '/index.html' ? '/' : path);
        return expand(html)
          // `{{active:products}}` becomes aria-current="page" on the matching
          // page and nothing elsewhere, so the active nav state is real markup
          // rather than something JS paints in after first render.
          .replace(/\{\{active:([\w-]+)\}\}/g, (_, name) =>
            name === page ? 'aria-current="page"' : '',
          )
          .replaceAll('{{page}}', page)
          .replaceAll('{{title}}', title)
          .replaceAll('{{description}}', description)
          .replaceAll('{{canonical}}', canonical);
      },
    },
    // Editing a partial should reload the pages that include it.
    handleHotUpdate({ file, server }) {
      if (file.includes('/partials/')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

const pages = Object.fromEntries(
  readdirSync(root)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), resolve(root, f)]),
);

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    rollupOptions: { input: pages },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
  },
});
