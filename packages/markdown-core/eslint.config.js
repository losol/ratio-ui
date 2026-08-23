import { config as baseConfig } from '@eventuras/eslint-config/base';

export default [
  ...baseConfig,
  {
    // Framework-agnostic tier: no React, no renderer, no design system (see
    // ../markdown/docs/adr/0001-engine-renderer-split.md). React lives in
    // @eventuras/markdown-react; design systems in binding packages.
    files: ['src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react/**',
                'react-dom',
                'react-dom/**',
                'react-markdown',
                '@eventuras/markdown-react',
                '@eventuras/ratio-ui',
                '@eventuras/ratio-ui/**',
                '@eventuras/ratio-ui-*',
                '@eventuras/ratio-ui-*/**',
              ],
              message: 'markdown-core is framework-agnostic — React belongs in @eventuras/markdown-react, design systems in binding packages.',
            },
          ],
        },
      ],
    },
  },
];
