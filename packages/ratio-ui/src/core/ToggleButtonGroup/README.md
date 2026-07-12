# ToggleButtonGroup

A pill-shaped row of options with a filled active segment (iOS-style). It is a
thin, token-driven skin over React Aria's `ToggleButtonGroup`, so it inherits
keyboard navigation, focus management, and RAC's selection model verbatim —
single or multiple selection, controlled or uncontrolled, with an optional empty
selection.

```tsx
import { ToggleButtonGroup } from '@eventuras/ratio-ui/core/ToggleButtonGroup';

// Single-select view switcher (uncontrolled)
<ToggleButtonGroup
  aria-label="View"
  options={[
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
    { value: 'table', label: 'Table' },
  ]}
  defaultSelectedKeys={['grid']}
  onSelectionChange={(keys) => setView([...keys][0])}
/>

// Multi-select filter with counts
<ToggleButtonGroup
  selectionMode="multiple"
  options={[
    { value: 'open', label: 'Open', count: 12 },
    { value: 'closed', label: 'Closed', count: 4 },
  ]}
/>
```

## Props

- `options` — `{ value, label, count?, title?, isDisabled? }[]`
- `selectionMode` — `'single'` (default) or `'multiple'`
- `selectedKeys` / `defaultSelectedKeys` / `onSelectionChange` — RAC's
  `Set<Key>` selection API (controlled / uncontrolled)
- `disallowEmptySelection` — radio-style "exactly one active"; off by default so
  segments can toggle fully off
- `size` — `'sm'`, `'md'` (default), or `'lg'` (same scale as Button)
- `fullWidth` — stretch to fill; segments then share the width equally
- `isDisabled` — disable the whole control

### Migrating from v1

The old scalar API still works and is deprecated:

- `value` → `selectedKeys` (single mode)
- `onChange(value | null)` → `onSelectionChange(Set<Key>)`

The look is refreshed to a single pill track with a filled active segment (from
the previous connected-border style).
