// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { Fragment } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type Highlighter } from 'shiki';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/** Languages preloaded when you don't pass your own to {@link createRatioHighlighter}. */
export const DEFAULT_LANGS: BundledLanguage[] = [
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
  'bash',
  'css',
  'html',
  'markdown',
  'yaml',
];

/** A light + dark Shiki theme pair. */
export interface DualThemes {
  light: BundledTheme;
  dark: BundledTheme;
}

/** Default light/dark theme pair — the code surface follows the app's mode. */
export const DEFAULT_THEMES: DualThemes = { light: 'github-light', dark: 'github-dark' };

/** Class set on every dual-theme token span; the CSS below switches its color. */
export const SHIKI_TOKEN_CLASS = 'ratio-shiki-token';

/**
 * CSS that flips token colors with the app's mode. Shiki writes each token's
 * light/dark colors into the `--shiki-light` / `--shiki-dark` custom properties;
 * this reads the right one per `data-theme` / `data-color-scheme` — the same
 * dark selectors ratio-ui's own tokens use. The `<CodeBlock>` wrapper injects
 * this automatically (React style hoisting); include it yourself only if you
 * render dual-theme lines by hand.
 */
export const DUAL_THEME_CSS = `.${SHIKI_TOKEN_CLASS}{color:var(--shiki-light)}
:root[data-theme="dark"] .${SHIKI_TOKEN_CLASS},
:root[data-color-scheme="dark"] .${SHIKI_TOKEN_CLASS}{color:var(--shiki-dark)}`;

export interface RatioHighlighterOptions {
  /** Languages to preload. @default DEFAULT_LANGS */
  langs?: BundledLanguage[];
  /** Themes to preload. @default [DEFAULT_THEMES.light, DEFAULT_THEMES.dark] */
  themes?: BundledTheme[];
}

/**
 * Create a Shiki highlighter preconfigured for ratio-ui: the WASM-free
 * JavaScript regex engine plus a sensible default language/theme set. The call
 * is async and relatively heavy — create one and share it across CodeBlocks
 * (the `<CodeBlock>` wrapper does this for you).
 */
export function createRatioHighlighter(options: RatioHighlighterOptions = {}): Promise<Highlighter> {
  return createHighlighter({
    engine: createJavaScriptRegexEngine(),
    langs: options.langs ?? DEFAULT_LANGS,
    themes: options.themes ?? [DEFAULT_THEMES.light, DEFAULT_THEMES.dark],
  });
}

/**
 * Turn `code` into one React node per line for a **single** theme — each a run
 * of `<span>`s carrying Shiki's token colors. Injection-safe (real elements, no
 * HTML string). `lang`/`theme` must already be loaded in `highlighter`.
 */
export function shikiToLines(
  highlighter: Highlighter,
  code: string,
  lang: BundledLanguage | string,
  theme: BundledTheme | string = DEFAULT_THEMES.dark,
): React.ReactNode[] {
  const { tokens } = highlighter.codeToTokens(code, {
    lang: lang as BundledLanguage,
    theme: theme as BundledTheme,
  });

  return tokens.map((line, i) => (
    <Fragment key={i}>
      {line.map((token, j) => {
        const fontStyle = token.fontStyle ?? 0;
        return (
          <span
            key={j}
            style={{
              color: token.color,
              fontStyle: fontStyle & 1 ? 'italic' : undefined,
              fontWeight: fontStyle & 2 ? 'bold' : undefined,
              textDecoration: fontStyle & 4 ? 'underline' : undefined,
            }}
          >
            {token.content}
          </span>
        );
      })}
    </Fragment>
  ));
}

/**
 * Turn `code` into one React node per line for a **light + dark** theme pair.
 * Each token span carries both colors as `--shiki-light` / `--shiki-dark` custom
 * properties and the {@link SHIKI_TOKEN_CLASS} class; pair it with
 * {@link DUAL_THEME_CSS} so the color follows the app's mode. Injection-safe.
 * `lang` and both themes must already be loaded in `highlighter`.
 */
export function shikiToDualLines(
  highlighter: Highlighter,
  code: string,
  lang: BundledLanguage | string,
  themes: DualThemes = DEFAULT_THEMES,
): React.ReactNode[] {
  const { tokens } = highlighter.codeToTokens(code, {
    lang: lang as BundledLanguage,
    themes: themes as unknown as Record<string, BundledTheme>,
    defaultColor: false,
  });

  return tokens.map((line, i) => (
    <Fragment key={i}>
      {line.map((token, j) => (
        <span key={j} className={SHIKI_TOKEN_CLASS} style={token.htmlStyle as React.CSSProperties}>
          {token.content}
        </span>
      ))}
    </Fragment>
  ));
}
