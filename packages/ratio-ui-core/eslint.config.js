import { config as baseConfig } from '@eventuras/eslint-config/base';

export default [
  ...baseConfig,
  {
    // Build scripts run in node.
    files: ['scripts/**'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
  {
    // The vanilla tier: values and rules, never a renderer (see
    // docs/adr/0001-vanilla-tier.md). React and the DOM belong in
    // @eventuras/ratio-ui; React Native in @eventuras/ratio-ui-native.
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
                'react-native',
                'react-native/**',
                '@eventuras/ratio-ui',
                '@eventuras/ratio-ui/**',
                '@eventuras/ratio-ui-*',
                '@eventuras/ratio-ui-*/**',
              ],
              message:
                'ratio-ui-core holds values and rules only — renderers live in @eventuras/ratio-ui and @eventuras/ratio-ui-native.',
            },
          ],
        },
      ],
    },
  },
];
