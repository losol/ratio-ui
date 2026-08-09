// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * Fails the build when a `'use client'` module attaches compound statics to
 * one of its own exports.
 *
 * Why this exists: across the RSC boundary a server component sees a client
 * module's exports as *references*, not as the functions themselves. A
 * property lookup on a reference yields `undefined`, so `<Navbar.Brand>` in a
 * server component throws "Element type is invalid: … got: undefined" — at
 * request time, on non-prerendered pages only. That shipped in 2.9 and took
 * 15 days and a production incident to find, because typecheck, unit tests and
 * `next build` are all blind to it.
 *
 * The fix is to attach statics in a directive-free module, onto a plain local
 * function that renders the client root (see `core/Navbar/index.tsx`). This
 * script enforces that shape on the built output, which is the only place the
 * directive and the assignment are both visible.
 *
 * Run against `dist/` after a build. Exits non-zero on any offender.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not `.pathname`: the latter keeps percent-encoding (a repo
// path containing a space arrives as `%20`) and yields `/C:/…` on Windows.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/** `'use client'` as the first statement, allowing the emitted banner above it. */
const DIRECTIVE = /^(?:\s*\/\*[\s\S]*?\*\/\s*)?["']use client["']/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (entry.endsWith('.js')) yield full;
  }
}

/**
 * Static attachment onto a component, in the three shapes the bundler emits.
 * What matters is that the *result* reaches an export — not which identifier
 * gets mutated. The build renames freely (`var Navbar = Object.assign(NavbarRoot,
 * …); export { Navbar }`), so keying on the mutated name misses the common case.
 *
 * The property must be capitalised so `displayName`, `propTypes` and friends
 * are not flagged.
 */
function findStatics(src) {
  const hits = [];
  // var Navbar = Object.assign(NavbarRoot, { … })  →  reaches an export as `Navbar`
  for (const m of src.matchAll(
    /(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*Object\.assign\(\s*([A-Za-z_$][\w$]*)\s*,\s*\{/g
  )) {
    hits.push({ exportedAs: m[1], how: `Object.assign(${m[2]}, { … })` });
  }
  // Object.assign(Exported, { … })  —  mutated in place
  for (const m of src.matchAll(
    /(?<!=\s*)\bObject\.assign\(\s*([A-Za-z_$][\w$]*)\s*,\s*\{/g
  )) {
    hits.push({ exportedAs: m[1], how: `Object.assign(${m[1]}, { … })` });
  }
  // Tabs.Item = TabItem
  for (const m of src.matchAll(/^\s*([A-Za-z_$][\w$]*)\.([A-Z][\w$]*)\s*=\s*[^=]/gm)) {
    hits.push({ exportedAs: m[1], how: `${m[1]}.${m[2]} = …` });
  }
  return hits;
}

/** Only exported targets matter — a purely internal merge crosses no boundary. */
function exportedNames(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const bits = part.trim().split(/\s+as\s+/);
      if (bits[0]) names.add(bits[0].trim());
    }
  }
  for (const m of src.matchAll(/export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }
  return names;
}

const offenders = [];
for (const file of walk(DIST)) {
  const src = readFileSync(file, 'utf8');
  if (!DIRECTIVE.test(src)) continue;
  const exported = exportedNames(src);
  const seen = new Set();
  for (const hit of findStatics(src)) {
    const key = `${hit.exportedAs}|${hit.how}`;
    if (!exported.has(hit.exportedAs) || seen.has(key)) continue;
    seen.add(key);
    offenders.push({ file: relative(DIST, file), ...hit });
  }
}

if (offenders.length) {
  console.error(
    `\n✖ ${offenders.length} compound static(s) attached inside a 'use client' module:\n`
  );
  for (const o of offenders) console.error(`    ${o.file}\n      ${o.how}`);
  console.error(
    '\n  A server component sees these exports as client references, so the\n' +
      '  statics read back as `undefined` and React throws at request time.\n' +
      '  Attach them in a directive-free index instead — see core/Navbar/index.tsx.\n'
  );
  process.exit(1);
}

console.log('✓ no compound statics attached inside client modules');
