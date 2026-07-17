import type { StorybookConfig } from '@storybook/react-vite';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve `packages/` relative to THIS config file rather than process.cwd(),
// so story discovery works no matter where Storybook is launched from.
const packagesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'packages');
if (!existsSync(packagesDir)) {
  throw new Error(
    `[.storybook/main.ts] No "packages/" directory found at ${packagesDir}. ` +
    'Storybook expects to run from a repo with a packages/ workspace.',
  );
}

// Aggregate stories from every workspace package that has a `src/` folder.
// New packages (e.g. a datatable package) are picked up automatically — no
// config change needed. A per-package `directory` entry keeps auto-titles
// relative to that package's `src`, so stories without an explicit `title`
// stay `core/Button` rather than `ratio-ui/src/core/Button`.
const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(packagesDir, d.name, 'src')))
  .map((d) => d.name);

const config: StorybookConfig = {
  stories: packages.flatMap((name) => [
    { directory: `../packages/${name}/src`, files: '**/*.mdx' },
    { directory: `../packages/${name}/src`, files: '**/*.stories.@(js|jsx|mjs|ts|tsx)' },
  ]),
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
    '@storybook/addon-themes',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    // The default `react-docgen` engine can't see through the `Readonly<Props>`
    // parameter annotations used across ratio-ui, leaving the docs prop tables
    // nearly empty (only destructured defaults). The TypeScript-based engine
    // resolves them fully — types, JSDoc descriptions, defaults. The propFilter
    // keeps inherited DOM/react-aria props from node_modules out of the tables.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop: { parent?: { fileName: string } }) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  // Resolve the workspace `@eventuras/ratio-ui` to its source, so stories in
  // companion packages (e.g. ratio-ui-shiki) pick up its components and their
  // per-component CSS without a prior `dist` build — CI installs with
  // `--ignore-scripts`, and the built dist JS no longer imports its own CSS.
  viteFinal: (viteConfig) => {
    const resolve = (viteConfig.resolve ??= {});
    const ratioUiSrc = join(packagesDir, 'ratio-ui', 'src');
    const existing = Array.isArray(resolve.alias)
      ? resolve.alias
      : Object.entries(resolve.alias ?? {}).map(([find, replacement]) => ({ find, replacement }));
    resolve.alias = [
      ...existing,
      { find: /^@eventuras\/ratio-ui$/, replacement: join(ratioUiSrc, 'index.ts') },
      { find: /^@eventuras\/ratio-ui\/(.*)$/, replacement: join(ratioUiSrc, '$1') },
    ];
    return viteConfig;
  },
};
export default config;
