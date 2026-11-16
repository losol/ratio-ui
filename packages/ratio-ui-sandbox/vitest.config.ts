import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'ratio-ui-sandbox',
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
