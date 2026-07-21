import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Storybook play tests run in real Chromium via Playwright. They're useful
// locally and in Storybook UI but require a browser binary, so we opt out
// of running them during CI builds to keep `pnpm test` fast and dependency-free.
const isCI = process.env.CI === 'true';

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      // Package unit tests. Listing the package (rather than a glob of test
      // files) makes vitest load its own config, so the environment, globals
      // and setup files each package declares actually apply — a plain include
      // pattern would run them in the default node environment and fail.
      './packages/markdown',

      // Browser-backed Storybook tests: local only, see note above.
      ...(isCI
        ? []
        : [
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
          ]),
    ],
  },
});
