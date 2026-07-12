---
"@eventuras/ratio-ui": minor
---

**ToggleButtonGroup — rebuilt on React Aria, with a segmented look and multi-select.**

`ToggleButtonGroup` now wraps React Aria's `ToggleButtonGroup` under the hood,
so it gains real group keyboard navigation, focus management, and RAC's full
selection model:

- **Multiple selection** — `selectionMode="multiple"` lets several segments be
  active at once (compact filters).
- **Empty selection** — clearing the last active segment is allowed by default;
  pass `disallowEmptySelection` for radio-style "exactly one active".
- **RAC selection API** — `selectedKeys` / `defaultSelectedKeys` /
  `onSelectionChange(Set<Key>)`, controlled or uncontrolled.
- **`size`** (`'sm' | 'md' | 'lg'`, same scale as Button) and **`fullWidth`**.
- Per-option `title` (tooltip) and `isDisabled`; `label` widened to `ReactNode`.

The upgrade is **non-breaking** for props — the previous scalar API keeps
working and is marked `@deprecated`:

- `value` → `selectedKeys` (single mode)
- `onChange(value | null)` → `onSelectionChange(Set<Key>)`

**Visual refresh:** the group is now a single pill track with a filled active
segment (iOS-style), replacing the previous connected-border look.

```tsx
// Multi-select filter with counts
<ToggleButtonGroup
  selectionMode="multiple"
  options={[
    { value: 'open', label: 'Open', count: 12 },
    { value: 'closed', label: 'Closed', count: 4 },
  ]}
/>
```

Note: `ToggleButtonGroup` is now a Client Component (`'use client'`), as
required by React Aria.
