import { config as reactLibraryConfig } from '@eventuras/eslint-config/react-library';

export default [
  ...reactLibraryConfig,
  {
    // This package is the design-system-agnostic engine (see
    // ../markdown/docs/adr/0001-engine-renderer-split.md): design-system
    // mappings live in binding packages like @eventuras/markdown.
    files: ['src/**'],
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
              ],
              message: 'The engine must stay free of design-system imports — map components in a binding package instead.',
            },
          ],
        },
      ],
    },
  },
];
