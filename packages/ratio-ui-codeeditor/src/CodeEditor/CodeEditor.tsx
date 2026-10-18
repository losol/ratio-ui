// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { Annotation, EditorState, Compartment, type Extension } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import { ensureTokenStyles, highlightExtension, ratioChrome } from './theme';

export type CodeEditorLanguage = 'js' | 'ts' | 'json' | 'xml' | 'python';

/** A diagnostic to render inline — e.g. mapped from a FHIR `OperationOutcome`. */
export interface EditorDiagnostic {
  /** 1-based line number the issue points at. */
  line: number;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface CodeEditorProps {
  /** The document. Change it from outside (a reset, a file loaded) and the editor follows. */
  value: string;
  /** Called with the whole document after each edit made in the editor. */
  onChange?: (value: string) => void;
  /** @default 'json' */
  language?: CodeEditorLanguage;
  /** Externally-provided diagnostics rendered as inline squiggles + gutter marks. */
  diagnostics?: EditorDiagnostic[];
  readOnly?: boolean;
  /**
   * Tab indents instead of moving the focus on, as a code editor's Tab does.
   * The way out stays: Escape, then Tab. Off, Tab moves the focus as on any
   * field. @default true
   */
  tabIndents?: boolean;
  /**
   * More CodeMirror extensions: a keymap (run the code on Ctrl+Enter), an
   * autocompletion source, a linter. They come before the editor's own, so a
   * key bound here wins over the default one (Ctrl+Enter otherwise inserts a
   * blank line). Read once, when the editor is made; give a new `key` to
   * change them.
   */
  extensions?: Extension[];
  className?: string;
  'aria-label'?: string;
}

/** Marks a change that came from the `value` prop, so it is not echoed back through `onChange`. */
const fromProps = Annotation.define<boolean>();

function languageExtension(language: CodeEditorLanguage): Extension {
  switch (language) {
    case 'json':
      return json();
    case 'xml':
      return xml();
    case 'ts':
      return javascript({ typescript: true });
    case 'python':
      // PEP 8: four spaces a level.
      return [python(), indentUnit.of('    ')];
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
 * github light/dark syntax colors that follow the nearest mode (the page, or a
 * `.surface-dark` / `.surface-light` band), JSON/XML/JS/TS/Python, and inline
 * `diagnostics` (squiggles + gutter). Controlled:
 * `onChange` reports each edit, and a new `value` from outside replaces the
 * document. Diagnostics are mapped through later edits, so a squiggle stays
 * on its text until the next set replaces them.
 */
export function CodeEditor({
  value,
  onChange,
  language = 'json',
  diagnostics,
  readOnly = false,
  tabIndents = true,
  extensions,
  className,
  'aria-label': ariaLabel,
}: Readonly<CodeEditorProps>) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const language_ = useRef(new Compartment());
  const readOnly_ = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  // Create the editor once.
  useEffect(() => {
    if (!host.current) return;
    ensureTokenStyles(host.current.ownerDocument);
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          extensions ?? [],
          basicSetup,
          language_.current.of(languageExtension(language)),
          readOnly_.current.of(EditorState.readOnly.of(readOnly)),
          tabIndents ? keymap.of([indentWithTab]) : [],
          lintGutter(),
          ratioChrome,
          highlightExtension,
          EditorView.updateListener.of((u) => {
            if (!u.docChanged || u.transactions.some((tr) => tr.annotation(fromProps))) return;
            onChangeRef.current?.(u.state.doc.toString());
          }),
        ],
      }),
    });
    editor.dom.classList.add('ratio-cm');
    if (ariaLabel) editor.contentDOM.setAttribute('aria-label', ariaLabel);
    view.current = editor;

    return () => {
      editor.destroy();
      view.current = null;
    };
    // Created once with the props it starts from; later changes are synced by
    // the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the document in step with `value`. The editor's own edits come back
  // through `onChange` equal to the document and change nothing; a value from
  // outside replaces it, marked so it is not reported as an edit.
  useEffect(() => {
    const v = view.current;
    if (!v || v.state.doc.toString() === value) return;
    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: value },
      annotations: fromProps.of(true),
    });
  }, [value]);

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
