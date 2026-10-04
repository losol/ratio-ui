import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

// One entry per public subpath: `.`, `./chat` and `./themes/<name>`.
export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    'chat/index': 'src/chat/index.ts',
    'themes/bureau': 'src/themes/bureau.ts',
  },
});
