---
'@eventuras/ratio-ui': minor
---

New `AppShell` (beta): the column a page sits in — `AppShell.Header`, `AppShell.Main` and the footer — at least the height of the window, with the footer at the bottom of a short page. It wires what each page would otherwise have to remember: the landmarks (`<header>`, and `<main id="main">`) and a `SkipLink` first, to `AppShell.Main` (text in `labels.skipLink`, off with `skipLink={false}`). `AppShell.Header sticky` pins the header to the top. `frame` draws a frame in the primary colour round the whole page, from the new `--app-shell-frame-color` and `--app-shell-frame-width` tokens (6–12px, fluid); in dark mode the frame steps back into the surface. Set `--app-shell-frame-width: 0` on the page to let a reader turn it off. Plain markup and CSS, server-safe.
