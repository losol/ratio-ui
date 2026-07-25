import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Kept in src/ so its jest-dom import also augments the matcher types
    // that `tsc` sees when typechecking the tests.
    setupFiles: ['./src/setupTests.ts'],
  },
})
