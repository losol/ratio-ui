import { defineReactLibConfig } from '@ratio-ui/vite-config/react-lib';

const banner =
  '/*! @eventuras/ratio-ui-codeeditor · CodeMirror 6 editor with ratio-ui styling · ' +
  'https://github.com/losol/ratio-ui · (c) 2026 Losol AS · MPL-2.0 */';

export default defineReactLibConfig({
  entry: 'src/**/index.{ts,tsx}',
  // CodeMirror packages must stay singletons — keep them external so the app
  // dedupes one copy (multiple @codemirror/state instances break at runtime).
  external: [/^@codemirror\//, /^@lezer\//, 'codemirror'],
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
