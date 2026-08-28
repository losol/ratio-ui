---
"@eventuras/ratio-ui": minor
---

New `useActiveSection(ids, { offset })` in `hooks/` — scroll-spy that returns
the id of the section being read: the last one whose element has scrolled up
to the `offset` line (sticky chrome), the topmost before any has, and the last
at the bottom of the page so a short final section still gets its turn.
Positions are read on scroll and resize rather than through an
IntersectionObserver, which only reports crossings and goes stale after an
anchor jump or a fast scroll.

`TableOfContents` now uses it — fixing exactly that stale highlight — and takes
an `offset` prop for a navbar above the content. Its current link is marked
`aria-current="location"` (was `true`), the value for in-page anchors.
