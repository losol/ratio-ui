// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState, Compartment, type Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { javascript } from '@codemirror/lang-javascript';
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import { ratioChrome, highlightExtension, isDarkMode } from './theme';

export type CodeEditorLanguage = 'js' | 'ts' | 'json' | 'xml';

/** A diagnostic to render inline — e.g. mapped from a FHIR `OperationOutcome`. */
export interface EditorDiagnostic {
  /** 1-based line number the issue points at. */
  line: number;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  /** @default 'json' */
  language?: CodeEditorLanguage;
  /** Externally-provided diagnostics rendered as inline squiggles + gutter marks. */
  diagnostics?: EditorDiagnostic[];
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

function languageExtension(language: CodeEditorLanguage): Extension {
  switch (language) {
    case 'json':
      return json();
    case 'xml':
      return xml();
    case 'ts':
      return javascript({ typescript: true });
    default:
      return javascript();
  }
}

function toCmDiagnostics(state: EditorState, diagnostics: EditorDiagnostic[]): Diagnostic[] {
  const { doc } = state;
  return diagnostics
    .filter((d) => d.line >= 1 && d.line <= doc.lines)
    .map((d) => {
      const line = doc.line(d.line);
      return { from: line.from, to: line.to, severity: d.severity ?? 'error', message: d.message };
    });
}

/**
 * A CodeMirror 6 editor dressed in ratio-ui: chrome from the `--code-*` tokens,
 * github light/dark syntax colors that follow the app's mode, JSON/XML/JS/TS
 * languages, and inline `diagnostics` (squiggles + gutter). Controlled via
 * `value` / `onChange`.
 */
export function CodeEditor({
  value,
  onChange,
  language = 'json',
  diagnostics,
  readOnly = false,
  className,
  'aria-label': ariaLabel,
}: Readonly<CodeEditorProps>) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const language_ = useRef(new Compartment());
  const readOnly_ = useRef(new Compartment());
  const highlight_ = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Create the editor once.
  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          language_.current.of(languageExtension(language)),
          readOnly_.current.of(EditorState.readOnly.of(readOnly)),
          lintGutter(),
          ratioChrome,
          highlight_.current.of(highlightExtension(isDarkMode())),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current?.(u.state.doc.toString());
          }),
        ],
      }),
    });
    editor.dom.classList.add('ratio-cm');
    if (ariaLabel) editor.contentDOM.setAttribute('aria-label', ariaLabel);
    view.current = editor;

    // Follow the app's light/dark mode: re-highlight when data-theme flips.
    let observer: MutationObserver | undefined;
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        editor.dispatch({ effects: highlight_.current.reconfigure(highlightExtension(isDarkMode())) });
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-color-scheme'],
      });
    }

    return () => {
      observer?.disconnect();
      editor.destroy();
      view.current = null;
    };
    // Created once; prop changes are synced by the effects below.
  }, []);

  // NOTE (spike): `value` is the initial document only — the editor is
  // uncontrolled after mount. This isolates whether the controlled value-sync
  // was what wiped highlighting on edit. A robust external-value sync comes
  // later (or remount via a `key`).

  // Reconfigure language / read-only.
  useEffect(() => {
    view.current?.dispatch({ effects: language_.current.reconfigure(languageExtension(language)) });
  }, [language]);
  useEffect(() => {
    view.current?.dispatch({
      effects: readOnly_.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // Push externally-provided diagnostics.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.dispatch(setDiagnostics(v.state, toCmDiagnostics(v.state, diagnostics ?? [])));
  }, [diagnostics]);

  return <div ref={host} className={className} />;
}

CodeEditor.displayName = 'CodeEditor';
export default CodeEditor;
