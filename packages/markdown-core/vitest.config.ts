import { defineConfig } from 'vitest/config'

// Pure functions only — tests run in plain node, no DOM needed.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
