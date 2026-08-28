---
"@eventuras/ratio-ui": minor
---

`Navbar` as the first of two sticky rows. Any `<nav>` prop now passes through
to the root — `aria-label` above all, so a page with a site navbar *and* a
section nav has two named landmarks. `Navbar.Link` takes an explicit
`aria-current` (`"location"` for in-page anchors, where `isCurrent`'s `"page"`
is wrong) with the same current styling.

`glass` is now frosted *surface*: a new `--surface-glass` token (the page
surface at 88%, declared per theme arm) with the backdrop blur, so a sticky
glass bar is light on a light page and dark inside `dark` / `surface-dark`.
Previously it was a 12% ink tint meant for dark hero overlays; `overlay glass
dark` keeps that look, a bare `glass` on a light page turns from a dark tint
to a light frost.

The utilities the bundled CSS guarantees are now whole scales rather than a
list of holes: spacing families (`p`/`m`/`gap` × `0`–`16`, `20`–`40`),
`z-0`–`z-50`, and `sm`/`md`/`lg` display. Documented in `docs/css-exports.md`
— anything beyond needs the consumer's own Tailwind build.
