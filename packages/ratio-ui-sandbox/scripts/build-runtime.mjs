// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Builds dist/runtime: what a sandbox origin serves. React and Ratio UI as ES
// modules a browser can import directly, the stylesheets and fonts, a manifest
// that maps each bare specifier to its file, and frame.html with frame.js.
//
// Ratio UI's own dist keeps react-aria-components, lucide-react and others as
// bare imports for the app's bundler to resolve. A sandbox frame has no
// bundler, so everything is bundled here. React is the exception that matters:
// it is its own set of entries, and every other module imports those, so the
// frame gets exactly one copy.

import {
  cpSync,
  globSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { buildFrameDocument } from './frame-document.mjs';

process.env.NODE_ENV = 'production';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptsDir, '..');
const outDir = join(packageDir, 'dist', 'runtime');
const workDir = join(packageDir, 'node_modules', '.sandbox-runtime');
const require = createRequire(join(packageDir, 'package.json'));

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** specifier → { name: output path without extension, file: module to bundle } */
const entries = new Map();

// React is CommonJS. An entry that re-exports each name explicitly gives the
// browser real named exports (`import { useState } from 'react'`).
const reactModules = {
  react: 'react',
  'react-dom': 'react-dom',
  'react-dom/client': 'react-dom/client',
  'react/jsx-runtime': 'react/jsx-runtime',
};
rmSync(workDir, { recursive: true, force: true });
mkdirSync(workDir, { recursive: true });
for (const [specifier, module] of Object.entries(reactModules)) {
  const names = Object.keys(require(module)).filter(
    (name) => name !== 'default' && /^[A-Za-z_$][\w$]*$/.test(name),
  );
  const name = specifier.replaceAll('/', '-');
  const file = join(workDir, `${name}.js`);
  writeFileSync(
    file,
    `import module from '${module}';\nexport default module;\nexport const { ${names.join(', ')} } = module;\n`,
  );
  entries.set(specifier, { name, file });
}

// Every JavaScript export of Ratio UI, with `*` patterns expanded from dist.
// Not via require.resolve: the package does not export its package.json.
const ratioUiDir = realpathSync(join(packageDir, 'node_modules', '@eventuras', 'ratio-ui'));
const ratioUi = readJson(join(ratioUiDir, 'package.json'));
for (const [key, target] of Object.entries(ratioUi.exports)) {
  const pattern = typeof target === 'object' ? target.import : null;
  if (!pattern) continue; // stylesheets and other files are not modules
  const subpath = key.replace(/^\.\/?/, '');
  if (!subpath.includes('*')) {
    const specifier = subpath ? `${ratioUi.name}/${subpath}` : ratioUi.name;
    entries.set(specifier, {
      name: subpath ? `ratio-ui/${subpath}` : 'ratio-ui/index',
      file: join(ratioUiDir, pattern),
    });
    continue;
  }
  const [before, after] = pattern.split('*');
  for (const match of globSync(pattern, { cwd: ratioUiDir })) {
    const normalised = `./${match.replaceAll('\\', '/')}`.replace(/^\.\/\.\//, './');
    const star = normalised.slice(before.length, normalised.length - after.length);
    const expanded = subpath.replace('*', star);
    entries.set(`${ratioUi.name}/${expanded}`, {
      name: `ratio-ui/${expanded}`,
      file: join(ratioUiDir, match),
    });
  }
}

if (entries.size <= Object.keys(reactModules).length) {
  throw new Error('No Ratio UI modules found. Build @eventuras/ratio-ui first.');
}

rmSync(outDir, { recursive: true, force: true });
await build({
  configFile: false,
  root: packageDir,
  logLevel: 'warn',
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir,
    emptyOutDir: true,
    copyPublicDir: false,
    minify: true,
    sourcemap: false,
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      input: Object.fromEntries([...entries.values()].map(({ name, file }) => [name, file])),
      preserveEntrySignatures: 'strict',
      // 'use client' means nothing here: the frame is all client.
      onwarn(warning, warn) {
        if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});

// The stylesheet with tokens, themes and component styles, as Ratio UI built
// it, and the brand fonts it names. The fonts are separate files that a
// browser fetches only when a face is used.
cpSync(join(ratioUiDir, ratioUi.exports['./ratio-ui.css']), join(outDir, 'ratio-ui.css'));
const fontsCss = join(ratioUiDir, ratioUi.exports['./fonts.css']);
cpSync(fontsCss, join(outDir, 'fonts.css'));
cpSync(join(dirname(fontsCss), 'fonts'), join(outDir, 'fonts'), { recursive: true });

const manifest = {
  versions: {
    react: require('react/package.json').version,
    'react-dom': require('react-dom/package.json').version,
    [ratioUi.name]: ratioUi.version,
  },
  imports: Object.fromEntries(
    [...entries].sort(([a], [b]) => a.localeCompare(b)).map(([specifier, { name }]) => [specifier, `${name}.js`]),
  ),
  stylesheets: ['fonts.css', 'ratio-ui.css'],
};
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

// The document every sandbox frame loads, and the script that runs in it.
writeFileSync(join(outDir, 'frame.html'), buildFrameDocument(manifest));
cpSync(join(scriptsDir, 'frame.js'), join(outDir, 'frame.js'));
rmSync(workDir, { recursive: true, force: true });

console.log(
  `build-runtime: ${entries.size} modules → ${relative(packageDir, outDir)} ` +
    `(react ${manifest.versions.react}, ${ratioUi.name} ${ratioUi.version})`,
);
