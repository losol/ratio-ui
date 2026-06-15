import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { config as baseConfig } from './base.js';
import { builtinModules } from 'module';

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
    settings: { react: { version: 'detect' } },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,

      // Disable built-in sorter (a bit rigid)
      'sort-imports': 'off',

      // Main import sorting rule
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Node builtins
            ['^node:', `^(${builtinModules.join('|')})(/|$)`],
            // 2. Packages (react first)
            ['^react', String.raw`^@?\w`],
            // 3. Eventuras packages
            ['^@eventuras/'],
            // 4. Absolute imports (Next.js aliases etc.)
            ['^(@|~)/'],
            // 5. Relative imports
            [String.raw`^\.\/`, String.raw`^\.\.\/`],
            // 6. Styles
            [String.raw`\.s?css$`],
          ],
        },
      ],

      // Sort exported members
      'simple-import-sort/exports': 'error',
    },
  },
];
