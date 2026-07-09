// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { defineConfig, type UserConfig } from 'vite';

/**
 * Base Vite configuration with common defaults for all Eventuras packages.
 */
export function defineBaseConfig(config: UserConfig = {}): UserConfig {
  return defineConfig({
    ...config,
    build: {
      ...config.build,
      // Common build optimizations
      minify: false, // Libraries should not be minified
      sourcemap: true, // Always generate sourcemaps for debugging
    },
  });
}
