---
'@eventuras/ratio-ui': minor
---

New `AppShell` (beta): the column a page sits in — navbar, `AppShell.Main` and footer — at least the height of the window, with the footer at the bottom of a short page. `AppShell.Main` is a `<main id="main">` by default, what `SkipLink` jumps to. `frame` draws a frame in the primary colour round the whole page, from the new `--app-shell-frame-color` and `--app-shell-frame-width` tokens (6–12px, fluid); in dark mode the frame steps back into the surface. Set `--app-shell-frame-width: 0` on the page to let a reader turn it off.
