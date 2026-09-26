import storybook from 'eslint-plugin-storybook';
import { config as reactLibraryConfig } from '@eventuras/eslint-config/react-library';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactLibraryConfig,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      // Destructuring a prop out of `rest` just to drop it is intended.
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
      // Dev-only warnings check NODE_ENV in the consumer's bundle; the
      // library build never reads it, so turbo has nothing to hash.
      'turbo/no-undeclared-env-vars': ['warn', { allowList: ['^NODE_ENV$'] }],
    },
  },
];
