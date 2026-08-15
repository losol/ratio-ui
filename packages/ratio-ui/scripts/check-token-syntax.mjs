#!/usr/bin/env node
// One syntax per token utility — see docs/adr/0002-token-utility-syntax.md.
//
// The `--color-*: var(--*)` aliases in theme.css give every semantic token two
// working spellings (`bg-card` vs `bg-(--card)`). Rule: canonical when the
// alias reads as a color (`bg-card`, `bg-success`); arbitrary when the
// canonical form stutters (`text-text-muted`) or the token is brand-scoped
// (`text-primary` reads like a scale). Run with `--fix` to rewrite in place.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fix = process.argv.includes('--fix');
const scanDirs = process.argv.slice(2).filter((a) => a !== '--fix');
if (scanDirs.length === 0) scanDirs.push(join(pkgRoot, 'src'));

// Aliases from the @theme block. Color scales (`--color-primary-500: oklch…`)
// have no var() and are not aliases.
const aliases = new Map();
for (const line of readFileSync(join(pkgRoot, 'src/tokens/theme.css'), 'utf8').split('\n')) {
  const m = line.match(/^\s*--color-([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/);
  if (m) aliases.set(m[1], m[2]);
}

// Tokens written in the arbitrary form. Everything else canonical.
const ARBITRARY = new Set([
  'text', 'text-muted', 'text-subtle', 'text-light', 'text-dark',
  'text-on-primary', 'text-on-secondary', 'text-on-accent',
  'primary', 'secondary', 'accent',
]);

// `shadow` is deliberately absent: `shadow-card-hover` is `--shadow-card-hover`,
// not a color alias.
const PREFIXES = [
  'bg', 'text', 'border', 'ring', 'outline', 'fill', 'stroke',
  'divide', 'accent', 'caret', 'decoration', 'from', 'via', 'to',
];

// Boundaries: start/quote/whitespace/variant-colon/bracket before; nothing
// word-like after, so `bg-card` never matches inside `bg-card-hover`.
const BEFORE = String.raw`(^|['"\`\s:\[])`;
const AFTER = String.raw`(?![a-zA-Z0-9-])`;

const files = [];
for (const dir of scanDirs) {
  (function walk(d) {
    for (const entry of readdirSync(d)) {
      if (['node_modules', 'dist', '.turbo'].includes(entry)) continue;
      const p = join(d, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(entry)) files.push(p);
    }
  })(dir);
}

let violations = 0;
for (const file of files) {
  let text = readFileSync(file, 'utf8');
  const report = (line, found, expected) => {
    violations++;
    if (!fix) console.error(`${relative(process.cwd(), file)}:${line}  ${found} → ${expected}`);
  };

  for (const [alias, target] of aliases) {
    for (const pre of PREFIXES) {
      const wrong = ARBITRARY.has(alias)
        ? { re: new RegExp(`${BEFORE}(${pre}-${alias})${AFTER}`, 'g'), to: `${pre}-(--${target})` }
        : { re: new RegExp(`${BEFORE}(${pre}-\\(--${target}\\))`, 'g'), to: `${pre}-${alias}` };

      text.split('\n').forEach((line, i) => {
        for (const m of line.matchAll(wrong.re)) report(i + 1, m[2], wrong.to);
      });
      if (fix) text = text.replace(wrong.re, `$1${wrong.to}`);
    }
  }
  if (fix) writeFileSync(file, text);
}

if (fix) console.log(`check-token-syntax: fixed ${violations} occurrence(s)`);
else if (violations) {
  console.error(`\ncheck-token-syntax: ${violations} violation(s). Run with --fix, or see docs/adr/0002-token-utility-syntax.md.`);
  process.exit(1);
} else console.log('check-token-syntax: ok');
