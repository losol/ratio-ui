import { defineReactLibConfig } from '@eventuras/vite-config/react-lib';

export default defineReactLibConfig({
  entry: 'src/index.ts',
  external: [
    'react-markdown',
    'remark-gfm',
    'rehype-sanitize',
    '@eventuras/markdown-core',
  ],
});
