---
"@eventuras/ratio-ui": minor
---

Two weeks of delivery, rolled into one minor release.

**New — `Tree` (beta):** an accessible, sortable hierarchy at `@eventuras/ratio-ui/tree` (new `./tree` entrypoint). Built on React Aria's `Tree`: expand/collapse and keyboard navigation, single/multiple selection with optional checkboxes, and opt-in drag-to-reorder / drop-to-reparent (pointer *and* keyboard). Expansion and selection are controllable (`expandedKeys`/`onExpandedChange`, `selectedKeys`/`onSelectionChange`), rows render via `renderNode(node, state)`, and a headless `useSortableTree` hook exposes the state + drag-and-drop wiring for custom shells. It's the interactive sibling to `TreeView` (navigation) and `DataTree` (read-only data). Also adds the `GripVertical`, `Folder`, `FolderOpen`, and `Tag` icons.

**New — copy-to-clipboard family:**

- `CopyButton`, `CopyLabel`, and `CopyStateIcon` at `@eventuras/ratio-ui/core` — a copy button, an inline copyable label, and the shared idle/copied state icon.
- `useCopyToClipboard` hook, exported via `@eventuras/ratio-ui/hooks`.
- `showCopyToClipboard` option on `TextField` (forms).
- `animate-pop` motion token for the copy-success feedback.
- `CodeBlock`'s copy action now uses the shared hook.

**Licensing:** the package is now licensed under **MPL-2.0**, with SPDX headers added across source files.
