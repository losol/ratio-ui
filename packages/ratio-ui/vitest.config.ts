import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'ratio-ui',
    environment: 'jsdom',
    include: ['tests/**/*.test.tsx'],
  },
});
