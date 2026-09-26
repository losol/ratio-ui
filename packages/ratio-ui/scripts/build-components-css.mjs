#!/usr/bin/env node
// Builds dist/components.css: ratio-ui.css without the page-level base
// styles (html, body, headings, paragraphs) that live in src/ratio-ui.css.
//
// Vite emits one stylesheet for the library: the Tailwind build of
// src/ratio-ui.css plus the plain CSS the components import (Button.css,
// Tree.css, …). This script rebuilds the Tailwind part the same way, finds it
// in dist/ratio-ui.css, and swaps in the Tailwind build of
// src/components.css. Everything else is kept byte for byte, so the two
// stylesheets can only differ in the page-level styles. If the rebuilt part
// can't be found, the build fails rather than ship a partial stylesheet.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (file) => join(pkgRoot, 'src', file);

// Optimised but not minified, the way Vite's Tailwind plugin builds ratio-ui.css.
const compile = async (file) =>
  (await postcss([tailwindcss({ optimize: { minify: false } })]).process(readFileSync(src(file), 'utf8'), { from: src(file) })).css;

const bundled = readFileSync(join(pkgRoot, 'dist/ratio-ui.css'), 'utf8');
const [full, components] = await Promise.all([compile('ratio-ui.css'), compile('components.css')]);

const at = bundled.indexOf(full);
if (at < 0 || bundled.indexOf(full, at + 1) >= 0) {
  console.error(
    'build-components-css: the Tailwind build of src/ratio-ui.css does not appear exactly once in dist/ratio-ui.css.\n' +
      'The Vite and PostCSS Tailwind builds have drifted apart; components.css was not written.',
  );
  process.exit(1);
}

writeFileSync(
  join(pkgRoot, 'dist/components.css'),
  bundled.slice(0, at) + components + bundled.slice(at + full.length),
);
console.log('build-components-css: wrote dist/components.css');
