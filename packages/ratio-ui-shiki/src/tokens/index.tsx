// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * The Shiki-free half of the precomputed-highlighting pipeline. Everything in
 * this module is plain data + tiny renderers with **no shiki import**, so a
 * client that renders precomputed tokens (built with `codeToDualTokens` at
 * build time) bundles about a kilobyte from here — no grammars, no engine.
 */

import React, { Fragment } from 'react';

/** Class set on every dual-theme token span; {@link DUAL_THEME_CSS} switches its color. */
export const SHIKI_TOKEN_CLASS = 'ratio-shiki-token';

/**
 * CSS that flips token colors with the app's mode. Shiki writes each token's
 * light/dark colors into the `--shiki-light` / `--shiki-dark` custom properties;
 * this reads the right one per `data-theme` / `data-color-scheme` — the same
 * dark selectors ratio-ui's own tokens use. Rendered for you by
 * {@link DualThemeStyles} and by the `<CodeBlock>` wrapper; include it yourself
 * only if you render dual-theme lines by hand.
 */
export const DUAL_THEME_CSS = `.${SHIKI_TOKEN_CLASS}{color:var(--shiki-light)}
:root[data-theme="dark"] .${SHIKI_TOKEN_CLASS},
:root[data-color-scheme="dark"] .${SHIKI_TOKEN_CLASS}{color:var(--shiki-dark)}`;

/**
 * One Shiki token in serializable form: its text plus the inline style
 * carrying the `--shiki-light` / `--shiki-dark` colors. Plain data — it
 * survives `JSON.stringify`/`parse`, so tokens can be computed once at build
 * time and shipped to the client instead of grammars.
 */
export interface DualToken {
  content: string;
  htmlStyle?: Record<string, string>;
}

/** One line of code as dual-theme tokens. */
export type DualTokenLine = DualToken[];

/**
 * Renders {@link DUAL_THEME_CSS} as a hoisted `<style>` tag. React dedupes it
 * by `href`, so rendering this next to Shiki `<CodeBlock>`s (which inject the
 * same tag) adds nothing. Drop it once anywhere precomputed lines render.
 */
export function DualThemeStyles() {
  return (
    <style href="ratio-ui-shiki-dual" precedence="medium">
      {DUAL_THEME_CSS}
    </style>
  );
}

/**
 * Turn dual-theme tokens back into one React node per line — the shape core
 * CodeBlock's `highlightedLines` takes. This is the runtime half of the
 * precomputed pipeline: `codeToDualTokens` at build time, this at render.
 * Injection-safe (real elements, no HTML string). Pair with
 * {@link DualThemeStyles} so the colors follow the app's mode.
 */
export function tokensToLines(lines: DualTokenLine[]): React.ReactNode[] {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line.map((token, j) => (
        <span
          key={j}
          className={SHIKI_TOKEN_CLASS}
          style={token.htmlStyle as React.CSSProperties}
        >
          {token.content}
        </span>
      ))}
    </Fragment>
  ));
}
