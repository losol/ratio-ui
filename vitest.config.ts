import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Storybook play tests run in real Chromium via Playwright, so they need a
// browser binary (`pnpm exec playwright install chromium`). CI runs them in
// their own job; `pnpm test:unit` skips them, `pnpm test:storybook` runs
// only them.

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      // Package unit tests. Listing the package (rather than a glob of test
      // files) makes vitest load its own config, so the environment, globals
      // and setup files each package declares actually apply — a plain include
      // pattern would run them in the default node environment and fail.
      './packages/markdown',
      './packages/markdown-react',
      './packages/markdown-core',

      // Browser-backed Storybook tests, see note above.
      {
        plugins: [
          storybookTest({
            configDir: '.storybook',
            storybookScript: 'pnpm run storybook -- --ci',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
