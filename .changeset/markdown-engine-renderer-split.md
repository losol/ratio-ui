---
"@eventuras/markdown": patch
---

Internal engine/renderer split — no API change. `MarkdownContent` is now a
thin binding of a design-system-agnostic engine (`src/core/`) to a Ratio UI
renderer set (`src/ratio/`), along the semantic `MarkdownRenderers` contract
described in `docs/adr/0001-engine-renderer-split.md`. Parsing, sanitization,
URL policy, and fence extraction live in the engine; renderer sets are plain
prop-to-component mappings. A build guard (`check-core-imports`) keeps
`src/core/` free of design-system imports so it stays extractable to a
standalone package.
