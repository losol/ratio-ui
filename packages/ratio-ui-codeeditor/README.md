# @eventuras/ratio-ui-codeeditor

> ⚠️ **Alpha.** Experimental and unstable — the API may change or be removed
> without notice, and it is published under the `alpha` npm dist-tag. Pin an
> exact version if you depend on it.

A [CodeMirror 6](https://codemirror.net) editor dressed in Ratio UI: the editable
sibling of the read-only `CodeBlock`. The chrome comes from Ratio UI's `--code-*`
tokens and the syntax colours follow the nearest light or dark scope, so the
editor sits on a page, a card or a `.surface-dark` band the way the rest of
Ratio UI does.

## Installation

```bash
pnpm add @eventuras/ratio-ui-codeeditor
```

React 19 is a peer dependency. CodeMirror comes along as ordinary dependencies
and stays external in the build, so the app bundles one copy of it. If the app
uses CodeMirror itself, keep it on version 6: two copies of `@codemirror/state`
in one bundle break at runtime.

Nothing is fetched from elsewhere at runtime: the editor and its languages are
in the app's own bundle.

## Usage

```tsx
'use client';

import { CodeEditor } from '@eventuras/ratio-ui-codeeditor';

function Editor() {
  const [code, setCode] = useState('print("Hei")');
  return <CodeEditor aria-label="Program" language="python" value={code} onChange={setCode} />;
}
```

| Prop | | |
|---|---|---|
| `value`, `onChange` | | Controlled. `onChange` gets the whole document after each edit; a new `value` from outside (a reset, a file loaded) replaces it without being reported back. |
| `language` | `'json'` | `json`, `xml`, `js`, `ts` or `python` (four spaces a level). |
| `diagnostics` | | `{ line, message, severity }[]` — squiggles, gutter marks and a tooltip, mapped through later edits. For a server's verdict (a FHIR `OperationOutcome`) or a run's traceback. |
| `readOnly` | `false` | |
| `tabIndents` | `true` | Tab indents; Escape, then Tab, moves the focus on. Off, Tab moves the focus as on any field. |
| `extensions` | | More CodeMirror extensions, read once when the editor is made: a keymap, an autocompletion source, a linter. They come before the editor's own, so a key bound here wins over the default. |
| `aria-label` | | The editor's accessible name. |

Running the code on Ctrl+Enter, for example:

```tsx
import { keymap } from '@codemirror/view';

<CodeEditor
  language="python"
  value={code}
  onChange={setCode}
  extensions={[keymap.of([{ key: 'Mod-Enter', run: () => (run(), true) }])]}
/>;
```

Import `@codemirror/view` from the same version the editor uses (a direct
dependency at `^6`), for the reason above.

## Light and dark

The syntax colours are custom properties (`--code-syntax-key`, `--code-syntax-str`
and so on) on the same scopes as `--code-*`: the root in either mode and the
`.surface-light` / `.surface-dark` bands. The nearest one wins. The editor puts
that stylesheet into the document once. Where a strict `style-src` policy blocks
an injected stylesheet, ship `CODE_EDITOR_TOKEN_CSS` in the app's own stylesheet;
CodeMirror's own styles need the policy's nonce then too (`EditorView.cspNonce`,
through `extensions`).

## License

MPL-2.0 © Losol AS.
