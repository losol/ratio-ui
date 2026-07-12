---
"@eventuras/ratio-ui": minor
---

**Select — refreshed: RAC-aligned API, sizes, and a fixed selection callback.**

`Select` now mirrors React Aria's selection model and gains a size scale and a
visual polish.

- **Fixed:** the selection callback and controlled value never worked — the old
  code passed `value` / `onChange`, which are not React Aria `Select` props
  (they collapsed onto the wrapper's DOM attributes). Selection is now wired
  correctly, so `onSelectionChange` fires and controlled use works.
- **RAC-aligned props:** `selectedKey` / `defaultSelectedKey` /
  `onSelectionChange`, plus `isDisabled` / `isRequired` / `isInvalid` / `name`.
- **`size`** — `'sm' | 'md' | 'lg'` (default `md`), same scale as Button.
- **Visual polish:** a check mark on the selected option, `focus-visible` ring,
  and token-driven chrome throughout.

Non-breaking: the previous props keep working and are marked `@deprecated`:

- `value` → `selectedKey`
- `defaultValue` → `defaultSelectedKey`
- `disabled` → `isDisabled`
- `required` → `isRequired`

```tsx
<Select
  label="Discipline"
  size="sm"
  options={[
    { value: 'logic', label: 'Logic' },
    { value: 'ethics', label: 'Ethics' },
  ]}
  defaultSelectedKey="logic"
  onSelectionChange={(value) => setField(value)}
/>
```

Note: `Select` is now a Client Component (`'use client'`), as required by React
Aria.
