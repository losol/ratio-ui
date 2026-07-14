---
"@eventuras/ratio-ui": patch
---

**SearchField: remove the double clear button.** WebKit renders a native
cancel button on `input[type=search]` next to SearchField's own clear
`ActionButton`; the native one is now suppressed.
