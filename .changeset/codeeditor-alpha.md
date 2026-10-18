---
"@eventuras/ratio-ui-codeeditor": minor
---

`@eventuras/ratio-ui-codeeditor`, alpha: a CodeMirror 6 editor dressed in Ratio UI, the editable sibling of `CodeBlock`. `<CodeEditor value onChange language diagnostics />` is controlled; it edits JSON, XML, JavaScript, TypeScript and Python (four spaces a level); `diagnostics` puts a server's verdict or a run's traceback on its lines as squiggles, gutter marks and a tooltip, mapped through later edits. Tab indents (Escape, then Tab, moves on; `tabIndents={false}` for a plain field's Tab), and `extensions` takes more CodeMirror: a keymap to run the code, a linter. The chrome is the `--code-*` tokens and the syntax colours follow the nearest light or dark scope, a `.surface-dark` band included. Published under the `alpha` dist-tag.
