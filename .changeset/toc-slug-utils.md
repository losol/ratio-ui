---
'@eventuras/ratio-ui': minor
---

Add `slugify` and `getTextContent` utilities (`@eventuras/ratio-ui/utils`).

- `slugify` is the single source of truth for heading anchor ids — the same
  GitHub-flavoured slug used both to id a heading and to build the table of
  contents that links to it, so the two never drift.
- `getTextContent` flattens a React node tree to plain text, e.g. for slugging
  a heading whose children mix strings and inline elements.

Together with the existing `TableOfContents` component and `TocHeading` type,
these let a consumer render an anchored, scroll-spied TOC without re-inventing
the slug convention.
