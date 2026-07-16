---
'@eventuras/ratio-ui': patch
---

**NavTree: content items require a stable `id`, and content is detected by key presence.**

- `NavTreeContentItem` now requires `id: string`. With no `href` or string
  `title` to key on, an index-based fallback would remount the (often stateful)
  content — e.g. a `SearchField` filtering its own group loses focus — when
  siblings are filtered or reordered.
- Content vs. link rows are distinguished by `'content' in node` rather than a
  truthiness check, so a content value of `0`/`''`/`null` is no longer misread
  as a link row.
