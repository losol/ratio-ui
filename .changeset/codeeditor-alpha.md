---
"@eventuras/ratio-ui-codeeditor": minor
---

`@eventuras/ratio-ui-codeeditor`, alpha: a CodeMirror 6 editor dressed in Ratio UI, the editable sibling of `CodeBlock`. `<CodeEditor value onChange language diagnostics />` is controlled; it edits JSON, XML, JavaScript, TypeScript and Python (four spaces a level), each language loaded only when asked for, or takes a language extension the app made (`language={python()}`). `diagnostics` puts a server's verdict or a run's traceback on its lines as squiggles, gutter marks and a tooltip, mapped through later edits.

- `setup="minimal"` keeps line numbers, undo, bracket matching and indentation and drops what moves on its own (completion pop-ups, brackets closed for you, folding, search), for beginners; `basic` is CodeMirror's full editor.
- `onRun` is called with the document on Ctrl+Enter.
- A ref holds `insert(text)` (types where the cursor is and keeps the focus in the editor, for a row of characters a tablet keyboard hides), `focus()` and the CodeMirror `view`.
- Tab indents (Escape, then Tab, moves on; `tabIndents={false}` for a plain field's Tab), and `extensions` takes more CodeMirror, ahead of the editor's own.

The chrome is the `--code-*` tokens and the syntax colours follow the nearest light or dark scope, a `.surface-dark` band included. Published under the `alpha` dist-tag.
