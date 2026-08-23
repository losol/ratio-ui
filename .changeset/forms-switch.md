---
"@eventuras/ratio-ui": minor
---

New `Switch` in `forms/` — the on/off control that takes effect immediately:
showing detail in a list, turning a notification on. Built on React Aria
Components, so the selection API is theirs (`isSelected`, `defaultSelected`,
`onChange`, `isDisabled`, `isReadOnly`) and it is a real `role="switch"`,
focusable and operable with Space.

The design system had no such control: `Checkbox` is for values submitted with
a form, and `ToggleButton` is a button that reads as pressed, not a setting
that reads as on. Toolbar switches were being built out of `ToggleButton` or
hand-rolled spans.

- `size` — the same `sm | md | lg` scale as `Button`. Default `md`.
- `labelPosition` — `'end'` (default) puts the label after the track, the
  toolbar form; `'start'` puts it first for a settings row, where
  `className="w-full justify-between"` pushes the track to the edge.
- `description` — a supporting line under the label.
