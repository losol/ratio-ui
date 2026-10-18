// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { Annotation, EditorState, Compartment, Prec, type Extension } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import { SETUPS, type CodeEditorSetup } from './setup';
import { ensureTokenStyles, highlightExtension, ratioChrome } from './theme';

export type CodeEditorLanguage = 'js' | 'ts' | 'json' | 'xml' | 'python';
export type { CodeEditorSetup };

/** What a ref to `CodeEditor` holds. */
export interface CodeEditorHandle {
  /**
   * Type `text` where the cursor is, over the selection if there is one, and
   * put the focus back in the editor: for a row of buttons with the
   * characters a keyboard makes hard to reach (`:`, `(`, `[`, `"`). An edit
   * like any other, so it reaches `onChange` and can be undone. Does nothing
   * when the editor is read-only.
   */
  insert: (text: string) => void;
  /** Move the focus into the editor. */
  focus: () => void;
  /** The CodeMirror view, for anything else; `null` before mount and after unmount. */
  readonly view: EditorView | null;
}

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
  /**
   * The language: a name, loaded when it is first asked for, so a page bundles
   * only the parsers it uses; or a CodeMirror language extension made by the
   * app (`python()` from `@codemirror/lang-python`), used as it is. An
   * extension is read once, when the editor is made, like `extensions`; a
   * name can change at any time. `python` by name indents four spaces a
   * level; with `python()`, add `indentUnit.of('    ')` to `extensions` for
   * the same. @default 'json'
   */
  language?: CodeEditorLanguage | Extension;
  /**
   * `basic` is CodeMirror's full editor: completion pop-ups, brackets closed
   * as you type, folding, search. `minimal` keeps line numbers, undo,
   * bracket matching and indentation, and nothing that moves on its own —
   * for beginners. @default 'basic'
   */
  setup?: CodeEditorSetup;
  /**
   * Called with the document on Ctrl+Enter (Cmd+Enter on a Mac): run the
   * code, submit the answer. Without it the key does what it does in the
   * setup.
   */
  onRun?: (value: string) => void;
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
  /** A handle with `insert`, `focus` and the `view`. */
  ref?: React.Ref<CodeEditorHandle>;
}

/** Marks a change that came from the `value` prop, so it is not echoed back through `onChange`. */
const fromProps = Annotation.define<boolean>();

/**
 * The named languages, each a dynamic import: the app's bundler splits every
 * parser into a chunk of its own, and only the ones asked for are loaded.
 */
const LANGUAGES: Record<CodeEditorLanguage, () => Promise<Extension>> = {
  json: () => import('@codemirror/lang-json').then((m) => m.json()),
  xml: () => import('@codemirror/lang-xml').then((m) => m.xml()),
  js: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
  ts: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true })),
  // PEP 8: four spaces a level.
  python: () => import('@codemirror/lang-python').then((m) => [m.python(), indentUnit.of('    ')]),
};

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
  setup = 'basic',
  onRun,
  diagnostics,
  readOnly = false,
  tabIndents = true,
  extensions,
  className,
  'aria-label': ariaLabel,
  ref,
}: Readonly<CodeEditorProps>) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const language_ = useRef(new Compartment());
  const readOnly_ = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  // A language given as an extension is taken as it was at mount; a name is
  // followed. So `language={python()}` written inline does not reparse the
  // document on every render.
  const ownLanguage = useRef(typeof language === 'string' ? null : language);
  const languageName = typeof language === 'string' ? language : null;

  useImperativeHandle(
    ref,
    () => ({
      insert(text: string) {
        const v = view.current;
        if (!v || v.state.readOnly) return;
        v.dispatch(v.state.replaceSelection(text), { scrollIntoView: true, userEvent: 'input' });
        v.focus();
      },
      focus() {
        view.current?.focus();
      },
      get view() {
        return view.current;
      },
    }),
    [],
  );

  // Create the editor once.
  useEffect(() => {
    if (!host.current) return;
    ensureTokenStyles(host.current.ownerDocument);
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          // Ctrl+Enter runs, ahead of everything; with no onRun it falls through.
          Prec.highest(
            keymap.of([
              {
                key: 'Mod-Enter',
                run: (v) => {
                  if (!onRunRef.current) return false;
                  onRunRef.current(v.state.doc.toString());
                  return true;
                },
              },
            ]),
          ),
          extensions ?? [],
          SETUPS[setup],
          language_.current.of(ownLanguage.current ?? []),
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

  // The language. A name is loaded, then put in unless the name has moved on
  // or the editor is gone by then. An extension is the first one given.
  useEffect(() => {
    const v = view.current;
    if (!v) return;
    if (!languageName) {
      ownLanguage.current ??= language as Extension;
      if (language_.current.get(v.state) !== ownLanguage.current) {
        v.dispatch({ effects: language_.current.reconfigure(ownLanguage.current) });
      }
      return;
    }
    let current = true;
    LANGUAGES[languageName]().then((ext) => {
      if (current) view.current?.dispatch({ effects: language_.current.reconfigure(ext) });
    });
    return () => {
      current = false;
    };
    // Follows the name only; an extension is read once (see `ownLanguage`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageName]);
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
