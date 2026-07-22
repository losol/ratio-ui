---
'@eventuras/markdown': minor
---

Add `extractHeadings(markdown)`, which pulls the h2/h3 headings out of raw
markdown as a `TocHeading[]` for an "on this page" table of contents. Ids are
produced with ratio-ui's `slugify`, so they match the anchors a heading
renderer puts on the page; fenced code blocks are skipped and link/emphasis
syntax is stripped from the visible text. Pairs with
`@eventuras/ratio-ui/core/TableOfContents`.
