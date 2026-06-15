import { config as baseConfig } from '@ratio-ui/eslint-config/base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/storybook-static/**'],
  },
];
