import { config as reactLibraryConfig } from '@eventuras/eslint-config/react-library';

export default [
  ...reactLibraryConfig,
  {
    // src/core is the design-system-agnostic engine (see docs/adr/0001):
    // Ratio imports belong in src/ratio, so the engine stays extractable to a
    // standalone markdown-core package.
    files: ['src/core/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@eventuras/ratio-ui',
                '@eventuras/ratio-ui/**',
                '@eventuras/ratio-ui-*',
                '@eventuras/ratio-ui-*/**',
                '../ratio',
                '../ratio/**',
              ],
              message: 'src/core/ must stay free of design-system imports — map components in src/ratio/ instead.',
            },
          ],
        },
      ],
    },
  },
];
