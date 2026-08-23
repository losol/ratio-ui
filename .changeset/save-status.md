---
"@eventuras/ratio-ui": minor
---

New `SaveStatus` in `core/` — the pill on a surface that saves by itself:
`idle`, `saving`, `saved` (with the time it landed) or `error`. `error` is in
the vocabulary because this replaces a Save button, and silence after a failed
save loses the reader's work.

The state is the caller's — an app knows when its request resolves, a timer in
a component doesn't. `labels` replaces the English copy. `role="status"` by
default. Built on `Chip`, so a scope that re-skins its chips re-skins this too.
