import { defineNextLibConfig } from '@ratio-ui/vite-config/next-lib';
import { resolve } from 'node:path';

// Prepended to every emitted bundle (see packages/ratio-ui/vite.config.ts).
const banner =
  '/*! @eventuras/ratio-ui-next · Next.js wrappers for ratio-ui · ' +
  'https://github.com/losol/ratio-ui · (c) 2026 Losol AS · MPL-2.0 */';

export default defineNextLibConfig({
  entry: {
    'Image/index': resolve(__dirname, 'src/Image/index.ts'),
    'Link/index': resolve(__dirname, 'src/Link/index.ts'),
    index: resolve(__dirname, 'src/index.ts'),
  },
  external: ['@eventuras/ratio-ui'],
  preserveModules: false,
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
