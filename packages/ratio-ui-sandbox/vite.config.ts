import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

const banner =
  '/*! @eventuras/ratio-ui-sandbox · isolated frames for interactive examples · ' +
  'https://github.com/losol/ratio-ui · (c) 2026 Losol AS · MPL-2.0 */';

export default defineReactLibConfig({
  entry: 'src/**/index.{ts,tsx}',
  preserveUseClientDirectives: true,
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
