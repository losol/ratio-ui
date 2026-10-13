---
"@eventuras/ratio-ui": minor
---

`ToggleGrid` gives on cells a length: `spans` is a plain map from cell key to the number of columns it covers — a held note, a booking over several hours — controlled with `onSpansChange` or uncontrolled with `defaultSpans`, and stored as it is, since it is plain JSON. A long cell draws as one bar across its columns, and the playhead frames it while inside. Pressing an on cell picks it up; a later cell in the row sets the length; the same cell again shortens a long one to one step and removes a short one; Shift+arrow adjusts by one from the keyboard, Escape puts it down. A live region speaks each step, with `labels` for the text. New `readOnly` renders the grid as plain markup, so a server component can show a saved melody or a booked week with it.
