// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

/**
 * Editor chrome + tooltips — surface, gutter, cursor, lint popup. Uses ratio-ui's
 * own `--code-*` tokens, which already flip with the app's mode and with a
 * `.surface-dark` / `.surface-light` band, so the chrome follows by CSS alone.
 * Scoped under the editor theme so it beats CodeMirror's own base themes
 * (incl. the lint tooltip).
 */
export const ratioChrome: Extension = EditorView.theme({
  '&': {
    backgroundColor: 'var(--code-surface)',
    color: 'var(--code-text)',
    fontSize: '13px',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--code-border, rgba(127,127,127,0.2))',
    overflow: 'hidden',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)',
    lineHeight: '1.6',
  },
  '.cm-content': { padding: '10px 0', caretColor: 'var(--code-text)' },
  '&.cm-focused': { outline: 'none', boxShadow: '0 0 0 3px var(--focus-ring, rgba(127,178,214,0.4))' },
  '.cm-gutters': {
    backgroundColor: 'var(--code-surface)',
    color: 'var(--code-gutter)',
    border: 'none',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 14px' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--code-text)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--code-text) 4%, transparent)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--code-text)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--code-accent, #7fb2d6) 28%, transparent)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--code-accent, #7fb2d6) 22%, transparent)',
    outline: 'none',
  },
  // Tooltips (lint messages, autocomplete) — readable in dark mode.
  '.cm-tooltip': {
    backgroundColor: 'var(--code-header-bg, var(--code-surface))',
    color: 'var(--code-text)',
    border: '1px solid var(--code-border, rgba(127,127,127,0.25))',
    borderRadius: 'var(--radius-md, 8px)',
    boxShadow: '0 6px 22px rgba(0,0,0,0.28)',
  },
  '.cm-tooltip.cm-tooltip-lint': { padding: '0', overflow: 'hidden' },
  '.cm-tooltip-lint .cm-diagnostic': {
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    fontSize: '12.5px',
    lineHeight: '1.45',
    padding: '7px 11px',
    color: 'var(--code-text)',
    borderLeft: '3px solid transparent',
    whiteSpace: 'normal',
  },
  '.cm-diagnostic-error': { borderLeftColor: 'var(--code-syntax-error)' },
  '.cm-diagnostic-warning': { borderLeftColor: 'var(--code-syntax-warning)' },
  '.cm-diagnostic-info': { borderLeftColor: 'var(--code-syntax-info)' },
});

// GitHub palettes. Hues are assigned by *role* so a JSON key never reads
// like its value:
//   blue = keys / XML tags · green = strings · orange = numbers
//   red = booleans, null, keywords · purple = attributes, functions
const LIGHT = {
  key: '#0550ae', str: '#0a7c42', num: '#953800', atom: '#cf222e', kw: '#cf222e',
  com: '#6e7781', tag: '#0550ae', attr: '#8250df', fn: '#8250df', type: '#953800',
  error: '#cf222e', warning: '#9a6700', info: '#0969da',
};
const DARK = {
  key: '#79c0ff', str: '#7ee787', num: '#ffa657', atom: '#ff7b72', kw: '#ff7b72',
  com: '#8b949e', tag: '#79c0ff', attr: '#d2a8ff', fn: '#d2a8ff', type: '#ffa657',
  error: '#e5534b', warning: '#d4a72c', info: '#539bf5',
};

const vars = (palette: Record<string, string>) =>
  Object.entries(palette)
    .map(([k, v]) => `--code-syntax-${k}:${v};`)
    .join('');

/**
 * The syntax colours as custom properties, on the same scopes ratio-ui's
 * `code.css` puts the `--code-*` tokens on: the root in either mode, and the
 * `.surface-light` / `.surface-dark` bands. A custom property is inherited
 * from the nearest scope that sets it, so an editor in a dark band on a light
 * page takes the dark palette, nested bands included — no observer, no
 * re-highlighting when the mode flips.
 *
 * Injected once by `CodeEditor`; exported for an app that would rather ship
 * it in its own stylesheet (a strict `style-src` policy, for one).
 */
export const CODE_EDITOR_TOKEN_CSS =
  `:root,.surface-light{${vars(LIGHT)}}` +
  `:root[data-theme="dark"],:root[data-color-scheme="dark"],.surface-dark{${vars(DARK)}}`;

const STYLE_ID = 'ratio-code-editor-tokens';

/** Put the token stylesheet into the document once. */
export function ensureTokenStyles(doc: Document = document): void {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CODE_EDITOR_TOKEN_CSS;
  doc.head.appendChild(style);
}

const c = (k: keyof typeof LIGHT) => `var(--code-syntax-${k})`;

/**
 * Syntax highlighting from the token custom properties above. `basicSetup`
 * brings CodeMirror's default style too, but only as a fallback: wherever
 * this style has a rule, this one wins.
 */
export const highlightExtension: Extension = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.propertyName, t.definition(t.propertyName)], color: c('key') },
    { tag: [t.string, t.special(t.string), t.attributeValue], color: c('str') },
    { tag: [t.number], color: c('num') },
    { tag: [t.bool, t.null, t.atom], color: c('atom') },
    { tag: [t.keyword, t.operator, t.modifier, t.controlKeyword, t.definitionKeyword], color: c('kw') },
    { tag: [t.comment, t.lineComment, t.blockComment], color: c('com'), fontStyle: 'italic' },
    { tag: [t.tagName, t.angleBracket], color: c('tag') },
    { tag: [t.attributeName], color: c('attr') },
    {
      tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))],
      color: c('fn'),
    },
    { tag: [t.typeName, t.className, t.definition(t.className)], color: c('type') },
    {
      tag: [t.variableName, t.name, t.content, t.punctuation, t.separator, t.bracket, t.brace, t.squareBracket, t.paren],
      color: 'var(--code-text)',
    },
  ]),
);
