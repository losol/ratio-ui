---
'@eventuras/ratio-ui-codeeditor': patch
---

`CodeEditor` no longer drops characters when the parent's `value` arrives after the next keystroke. A late echo of the editor's own edit is older than the document; it used to replace it, so a fast typist could lose a character ("print(" became "pint("). The editor now recognises its own edits coming back and leaves the document alone; a value from outside still replaces it.
