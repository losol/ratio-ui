import { config as baseConfig } from '@eventuras/eslint-config/base';

export default [
  ...baseConfig,
  {
    // Build scripts run in node.
    files: ['scripts/**'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
  {
    // The native renderer: React Native and the theme data, never the web's
    // DOM or its components (see ratio-ui-core's docs/adr/0001-vanilla-tier.md).
    files: ['src/**'],
    ignores: ['src/**/*.stories.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react-dom',
                'react-dom/**',
                'react-native-web',
                'react-native-web/**',
                '@eventuras/ratio-ui',
                '@eventuras/ratio-ui/**',
                '@eventuras/ratio-ui-next',
                '@eventuras/ratio-ui-next/**',
                '@eventuras/ratio-ui-shiki',
                '@eventuras/ratio-ui-shiki/**',
              ],
              message:
                'ratio-ui-native renders with React Native only; share through @eventuras/ratio-ui-core, not the web packages.',
            },
          ],
        },
      ],
    },
  },
];
