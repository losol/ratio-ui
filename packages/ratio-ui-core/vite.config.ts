import { defineVanillaLibConfig } from '@eventuras/vite-config/vanilla-lib';

// One entry per public subpath: `.` and `./themes/<name>`.
export default defineVanillaLibConfig({
  entry: {
    index: 'src/index.ts',
    'themes/bureau': 'src/themes/bureau.ts',
  },
});
