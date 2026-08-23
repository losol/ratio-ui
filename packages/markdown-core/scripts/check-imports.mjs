#!/usr/bin/env node
// markdown-core is the framework-agnostic tier — see
// ../markdown/docs/adr/0001-engine-renderer-split.md. React belongs in
// @eventuras/markdown-react, design systems in binding packages. (eslint
// carries the same rule, but repo lint is warn-only — this fails the build.)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(pkgRoot, 'src');

// Import-shaped lines only (static, re-export, dynamic).
// Exact package or a subpath of it — `react-router` is not `react`.
const EXACT = '(react|react-dom|react-markdown|@eventuras\\/markdown-react)';
// Any design system in the family: ratio-ui, ratio-ui-shiki, ratio-ui-next —
// a prefix match, matching the eslint rule's `@eventuras/ratio-ui-*`.
const PREFIX = '@eventuras\\/ratio-ui';
const BANNED = [
  new RegExp(`from\\s+['"]${EXACT}(['"/]|$)`),
  new RegExp(`import\\(\\s*['"]${EXACT}(['"/]|$)`),
  new RegExp(`from\\s+['"]${PREFIX}`),
  new RegExp(`import\\(\\s*['"]${PREFIX}`),
];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(name)) files.push(path);
  }
})(srcDir);

const offences = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      // Doc-comment lines may show imports as examples.
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      if (BANNED.some((re) => re.test(line))) {
        offences.push(`${relative(pkgRoot, file)}:${i + 1}  ${line.trim()}`);
      }
    });
}

if (offences.length > 0) {
  console.error(
    'markdown-core must stay framework-agnostic (see @eventuras/markdown docs/adr/0001-engine-renderer-split.md):\n'
  );
  for (const offence of offences) console.error(`  ${offence}`);
  process.exit(1);
}
console.log(`check-imports: ${files.length} files clean`);
