import { defineReactLibConfig } from '@ratio-ui/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  tailwind: true,
  external: [
    'react-markdown',
    'remark-gfm',
    'rehype-raw',
    'rehype-sanitize',
    '@eventuras/ratio-ui',
    // for deep imports..:
    /^@eventuras\/ratio-ui\//
  ],
});
