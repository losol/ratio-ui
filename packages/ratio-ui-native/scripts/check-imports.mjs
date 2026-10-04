#!/usr/bin/env node
// ratio-ui-native renders with React Native only. It shares with the web
// through @eventuras/ratio-ui-core and never imports the web packages or
// the DOM. (eslint carries the same rule, but repo lint is warn-only —
// this fails the build.) Stories are exempt: they run on the web.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(pkgRoot, 'src');

// `react-dom` and `react-native-web` exactly or a subpath; every
// `@eventuras/ratio-ui*` package except core.
const EXACT = '(react-dom|react-native-web)';
const WEB = '@eventuras\\/ratio-ui(?!-core)';
const BANNED = [
  new RegExp(`from\\s+['"]${EXACT}(['"/]|$)`),
  new RegExp(`import\\(\\s*['"]${EXACT}(['"/]|$)`),
  new RegExp(`from\\s+['"]${WEB}`),
  new RegExp(`import\\(\\s*['"]${WEB}`),
];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(ts|tsx)$/.test(name) && !/\.stories\.tsx$/.test(name)) files.push(path);
  }
})(srcDir);

const offences = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      if (BANNED.some(re => re.test(line))) {
        offences.push(`${relative(pkgRoot, file)}:${i + 1}  ${line.trim()}`);
      }
    });
}

if (offences.length > 0) {
  console.error('ratio-ui-native renders with React Native only — share through @eventuras/ratio-ui-core:\n');
  for (const offence of offences) console.error(`  ${offence}`);
  process.exit(1);
}
console.log(`check-imports: ${files.length} files clean`);
