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
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
};
export default config;
