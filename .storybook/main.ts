import type { StorybookConfig } from '@storybook/react-vite';
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, sep } from 'node:path';
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

// The sandbox stories need a frame on another origin than Storybook's own.
// Locally `localhost` and `127.0.0.1` are two origins for one dev server, so
// serving the built runtime here is enough: a story opened on one loads its
// frame from the other. Skipped when the runtime has not been built — the
// stories then say what is missing.
const sandboxRuntimeDir = join(packagesDir, 'ratio-ui-sandbox', 'dist', 'runtime');
const sandboxRuntimeTypes: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.woff2': 'font/woff2',
};
const sandboxRuntime = {
  name: 'ratio-ui-sandbox-runtime',
  configureServer(server: {
    middlewares: {
      use: (
        route: string,
        handler: (
          req: { url?: string },
          res: {
            statusCode: number;
            setHeader: (name: string, value: string) => void;
            end: (body?: string) => void;
          } & NodeJS.WritableStream,
          next: () => void,
        ) => void,
      ) => void;
    };
  }) {
    server.middlewares.use('/sandbox-runtime', (req, res, next) => {
      const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
      const file = normalize(join(sandboxRuntimeDir, path));
      const inside = file.startsWith(sandboxRuntimeDir + sep);
      if (!inside || !existsSync(file) || !statSync(file).isFile()) return next();
      res.statusCode = 200;
      res.setHeader('Content-Type', sandboxRuntimeTypes[extname(file)] ?? 'application/octet-stream');
      // The frame is another origin than this server: its module scripts and
      // fonts are cross-origin requests.
      res.setHeader('Access-Control-Allow-Origin', '*');
      createReadStream(file).pipe(res);
    });
  },
};

const config: StorybookConfig = {
  stories: packages.flatMap((name) => [
    { directory: `../packages/${name}/src`, files: '**/*.mdx' },
    { directory: `../packages/${name}/src`, files: '**/*.stories.@(js|jsx|mjs|ts|tsx)' },
  ]),
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
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
  // Resolve workspace `@eventuras/*` packages to their source, so stories that
  // import across packages (e.g. ratio-ui-shiki stories using ratio-ui, or
  // markdown stories using ratio-ui-shiki) pick up components and their
  // per-component CSS without a prior `dist` build — CI installs with
  // `--ignore-scripts`, and the built dist JS no longer imports its own CSS.
  viteFinal: (viteConfig) => {
    const resolve = (viteConfig.resolve ??= {});
    const existing = Array.isArray(resolve.alias)
      ? resolve.alias
      : Object.entries(resolve.alias ?? {}).map(([find, replacement]) => ({ find, replacement }));
    // `$` and the `/` in the subpath variant keep e.g. `@eventuras/ratio-ui`
    // from swallowing `@eventuras/ratio-ui-shiki/...`.
    // Every workspace package a story reaches through its package name has to
    // be listed: nothing here is built before Storybook runs, so an unaliased
    // one resolves to a `dist/` that doesn't exist yet.
    const srcAliases = [
      'ratio-ui',
      'ratio-ui-shiki',
      'ratio-ui-core',
      'ratio-ui-native',
      'markdown-core',
      'markdown-react',
    ].flatMap((pkg) => {
      const src = join(packagesDir, pkg, 'src');
      return [
        { find: new RegExp(`^@eventuras/${pkg}$`), replacement: join(src, 'index.ts') },
        { find: new RegExp(`^@eventuras/${pkg}/(.*)$`), replacement: join(src, '$1') },
      ];
    });
    // ratio-ui-native's stories run on the web through react-native-web,
    // the same way Expo's web target does.
    // react-native-svg (ratio-ui-native's badges) ships its web
    // implementation beside the native one as `.web.js` files, which Metro
    // picks by suffix. Its elements entry is the whole of what a component
    // draws with (`Svg`, `Path`, `Text`, …) and leaves the deprecated XML
    // and asset loaders, with their TurboModules, out.
    const reactNativeWeb = [
      { find: /^react-native$/, replacement: 'react-native-web' },
      {
        find: /^react-native-svg$/,
        replacement: join(packagesDir, 'ratio-ui-native/node_modules/react-native-svg/lib/module/elements.web.js'),
      },
      // Two React Native internals its web build still reaches for, which
      // react-native-web does not ship: the asset registry, and the
      // TurboModules behind its lazy native calls. Both stubbed, for the
      // dev server and the static build alike.
      {
        find: /^@react-native\/assets-registry\/registry$/,
        replacement: join(dirname(fileURLToPath(import.meta.url)), 'stubs/assets-registry.ts'),
      },
      {
        find: /^(\.\.\/)+fabric\/NativeSvg\w+Module$/,
        replacement: join(dirname(fileURLToPath(import.meta.url)), 'stubs/turbo-module.ts'),
      },
    ];
    resolve.alias = [...existing, ...srcAliases, ...reactNativeWeb];
    // …and inside it, `./resolveAssetUri` is `resolveAssetUri.web.js`: the
    // web twin wins wherever there is one, in the dev server and in the
    // dependency optimizer alike.
    const extensions = ['.web.js', '.web.mjs', '.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'];
    resolve.extensions = extensions;
    const optimizeDeps = (viteConfig.optimizeDeps ??= {});
    const rolldownOptions = (optimizeDeps.rolldownOptions ??= {});
    rolldownOptions.resolve = { ...rolldownOptions.resolve, extensions };
    // The optimizer bundles the lazy `require('../fabric/NativeSvg…Module')`
    // calls without the alias above; the TurboModuleRegistry they import is
    // shimmed to `undefined` there, as nothing on the web calls them.
    rolldownOptions.shimMissingExports = true;
    (viteConfig.plugins ??= []).push(sandboxRuntime);
    return viteConfig;
  },
};
export default config;
