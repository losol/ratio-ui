import { defineReactLibConfig } from '@ratio-ui/vite-config/react-lib';

// Prepended to every emitted bundle. The slogan + repo URL live here (in the
// published output where consumers see them), so source files stay minimal.
const banner =
  '/*! ratio-ui · design system for knowledge sharing · ' +
  'https://github.com/losol/ratio-ui · (c) 2026 Losol AS · MPL-2.0 */';

export default defineReactLibConfig({
  entry: 'src/**/index.{ts,tsx}',
  tailwind: true,
  preserveUseClientDirectives: true,
  external: [
    'react-aria-components',
    'react-stately',
    /^@react-aria\//,
    /^@react-stately\//,
    /^@internationalized\//,
    /^@swc\/helpers/,
    /^lucide-react/,
    'clsx',
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
