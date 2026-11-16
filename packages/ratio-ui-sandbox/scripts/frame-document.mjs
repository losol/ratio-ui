// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { createHash } from 'node:crypto';

/**
 * Builds `frame.html`: the one document every sandbox frame loads.
 *
 * It is static, so it caches like any other file. The import map is inline —
 * a browser accepts nothing else — and the Content-Security-Policy allows
 * exactly that script by its hash. Everything else must come from the frame's
 * own origin: the code cannot `fetch`, open sockets, post forms or load
 * scripts from anywhere else.
 *
 * @param {{ imports: Record<string, string>, stylesheets: string[] }} manifest
 *   Paths relative to the folder the frame is served from.
 * @returns {string}
 */
export function buildFrameDocument(manifest) {
  // No `<` may survive in the JSON: it could close the script element.
  const importMap = JSON.stringify({
    imports: Object.fromEntries(
      Object.entries(manifest.imports).map(([specifier, path]) => [specifier, `./${path}`]),
    ),
  }).replaceAll('<', '\\u003c');
  const hash = createHash('sha256').update(importMap).digest('base64');

  const csp = [
    "default-src 'none'",
    `script-src 'self' blob: 'sha256-${hash}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join('; ');

  const stylesheets = manifest.stylesheets
    .map((path) => `<link rel="stylesheet" href="./${path}">`)
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sandbox</title>
<script type="importmap">${importMap}</script>
${stylesheets}
<style>html,body{margin:0}body{overflow:hidden}</style>
</head>
<body>
<div id="root"></div>
<script type="module" src="./frame.js"></script>
</body>
</html>
`;
}
