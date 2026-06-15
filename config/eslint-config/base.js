import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import onlyWarn from 'eslint-plugin-only-warn';
import ratioUiPlugin from './rules/index.js';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    plugins: {
      'ratio-ui': ratioUiPlugin,
    },
    rules: {
      'ratio-ui/no-invalid-testid': 'error',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: [
      'dist/**',
      'test-results/**',
      'coverage/**',
      'build/**',
      'playwright-auth/**',
      'playwright-report/**',
      'out/**',
      '**/migrations/**',
      '**/.next/**',
      '**/next-env.d.ts',
    ],
  },
];
