import { defineReactLibConfig } from '@ratio-ui/vite-config/react-lib';

// Prepended to every emitted bundle (see packages/ratio-ui/vite.config.ts).
const banner =
  '/*! @eventuras/ratio-ui-shiki · Shiki syntax highlighting for ratio-ui · ' +
  'https://github.com/losol/ratio-ui · (c) 2026 Losol AS · MPL-2.0 */';

export default defineReactLibConfig({
  entry: 'src/**/index.{ts,tsx}',
  // Keep ratio-ui, shiki (incl. subpaths like shiki/engine/javascript), and the
  // fine-grained grammar/theme packages (@shikijs/langs, @shikijs/themes) as
  // peer deps — the consumer owns those versions and dedupes them with shiki.
  external: [
    '@eventuras/ratio-ui',
    /^@eventuras\/ratio-ui\//,
    /^shiki/,
    /^@shikijs\//,
  ],
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
