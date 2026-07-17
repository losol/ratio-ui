import { defineReactLibConfig } from '@ratio-ui/vite-config/react-lib';

// Prepended to every emitted bundle (see packages/ratio-ui/vite.config.ts).
const banner =
  '/*! @eventuras/ratio-ui-shiki · Shiki syntax highlighting for ratio-ui · ' +
  'https://github.com/losol/ratio-ui · (c) 2026 Losol AS · MPL-2.0 */';

export default defineReactLibConfig({
  entry: 'src/**/index.{ts,tsx}',
  // Keep ratio-ui and shiki (incl. its subpaths, e.g. shiki/engine/javascript)
  // as peer deps — the consumer owns those versions.
  external: ['@eventuras/ratio-ui', /^@eventuras\/ratio-ui\//, /^shiki/],
  viteConfig: {
    build: {
      rollupOptions: {
        output: {
          banner,
        },
      },
    },
  },
});
