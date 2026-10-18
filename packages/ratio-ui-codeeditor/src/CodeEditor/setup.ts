// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { basicSetup } from 'codemirror';
import {
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { lintKeymap } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';

export type CodeEditorSetup = 'basic' | 'minimal';

/**
 * The quiet editor: line numbers, undo, the current line, matching brackets
 * shown and indentation kept — and nothing that moves on its own while you
 * type. No completion pop-ups, no brackets closed for you, no folding, no
 * search panel, no multiple cursors. For beginners, and for anywhere the
 * editor should only do what was typed.
 */
const minimalSetup: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  indentOnInput(),
  bracketMatching(),
  highlightActiveLine(),
  keymap.of([...defaultKeymap, ...historyKeymap, ...lintKeymap]),
];

export const SETUPS: Record<CodeEditorSetup, Extension> = {
  basic: basicSetup,
  minimal: minimalSetup,
};
