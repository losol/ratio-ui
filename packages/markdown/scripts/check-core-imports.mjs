#!/usr/bin/env node
// src/core/ is the design-system-agnostic markdown engine — see
// docs/adr/0001-engine-renderer-split.md. Ratio imports belong in src/ratio/;
// this guard keeps core extractable to a standalone markdown-core package.
// (eslint carries the same rule, but repo lint is warn-only — this fails.)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const coreDir = join(pkgRoot, 'src/core');

// Import-shaped lines only (static, re-export, dynamic) — doc comments may
// mention e.g. ratio-ui-shiki as the codeBlock example. `@eventuras/ratio-ui`
// is a prefix match (subpaths, ratio-ui-shiki, ratio-ui-next); `../ratio`
// matches bare and subpath specifiers alike.
const BANNED = [
  /from\s+['"](@eventuras\/ratio-ui|\.\.\/ratio['"/])/,
  /import\(\s*['"](@eventuras\/ratio-ui|\.\.\/ratio['"/])/,
];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(name)) files.push(path);
  }
})(coreDir);

const offences = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      // Doc-comment lines may show imports as examples (the shiki seam).
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      if (BANNED.some((re) => re.test(line))) {
        offences.push(`${relative(pkgRoot, file)}:${i + 1}  ${line.trim()}`);
      }
    });
}

if (offences.length > 0) {
  console.error(
    'src/core/ must stay free of design-system imports (docs/adr/0001-engine-renderer-split.md):\n'
  );
  for (const offence of offences) console.error(`  ${offence}`);
  process.exit(1);
}
console.log(`check-core-imports: ${files.length} core files clean`);
