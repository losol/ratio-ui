// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { SandboxRuntime } from './Sandbox/buildSandboxDocument';

/**
 * Shape of `runtime/manifest.json`: what the built runtime offers, with paths
 * relative to the folder the manifest lies in.
 */
export interface SandboxRuntimeManifest {
  /** Package versions the runtime was built from, e.g. `react`. */
  versions: Record<string, string>;
  /** Bare specifier → path of the ES module that provides it. */
  imports: Record<string, string>;
  /** Paths of the stylesheets the runtime needs. */
  stylesheets: string[];
}

export interface ResolveRuntimeOptions {
  /**
   * Bare specifiers the code imports. When given, the import map holds only
   * these and what React itself needs, which keeps the frame document small.
   * Leave out to offer everything in the manifest.
   */
  specifiers?: readonly string[];
}

/** Always in the import map: the frame cannot start without them. */
export const REQUIRED_SPECIFIERS = ['react', 'react-dom/client', 'react/jsx-runtime'] as const;

/**
 * Turns a runtime manifest into the `runtime` prop of `Sandbox`, with every
 * path resolved against the URL the runtime files are served from.
 *
 * Throws when `specifiers` names something the runtime does not have, so a
 * missing import is caught where the content is saved rather than as a blank
 * frame in front of a reader.
 *
 * @example
 * ```ts
 * import manifest from '@eventuras/ratio-ui-sandbox/runtime/manifest.json';
 *
 * const runtime = resolveRuntime(manifest, 'https://example.org/sandbox-runtime/0.1.0/', {
 *   specifiers: ['react', '@eventuras/ratio-ui/core/Button'],
 * });
 * ```
 */
export function resolveRuntime(
  manifest: SandboxRuntimeManifest,
  baseUrl: string,
  options: ResolveRuntimeOptions = {},
): SandboxRuntime {
  let base: URL;
  try {
    base = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  } catch {
    throw new Error(`The sandbox runtime base URL must be absolute. Got "${baseUrl}".`);
  }

  const wanted = options.specifiers
    ? [...new Set([...REQUIRED_SPECIFIERS, ...options.specifiers])]
    : Object.keys(manifest.imports);

  const imports: Record<string, string> = {};
  for (const specifier of wanted) {
    const path = manifest.imports[specifier];
    if (path === undefined) {
      throw new Error(`"${specifier}" is not available in the sandbox runtime.`);
    }
    imports[specifier] = new URL(path, base).href;
  }

  return {
    imports,
    stylesheets: manifest.stylesheets.map((path) => new URL(path, base).href),
  };
}
