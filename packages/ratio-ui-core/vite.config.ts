import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

// One entry per public subpath: `.`, `./chat`, `./badges`, `./fx`, `./charts` and `./themes/<name>`.
export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    'chat/index': 'src/chat/index.ts',
    'badges/index': 'src/badges/index.ts',
    'fx/index': 'src/fx/index.ts',
    'charts/index': 'src/charts/index.ts',
    'themes/bureau': 'src/themes/bureau.ts',
  },
});
