---
"@eventuras/ratio-ui": minor
---

**Menu — refreshed look, sections with selectable options, richer items.**

**Visual refresh** (no API change needed): rounded, icon-friendly rows on a
padded panel replace the border-divided full-bleed rows; the default trigger is
now an outline pill with a circled chevron "cap" that fills, glows, and rotates
when the menu is open; the header drops its tint and the role chip becomes an
outline accent badge.

**New tokens:** `--menu-font-size` (14px) and `--menu-font-weight` (400) drive
the row typography — absolute px on purpose, so menu chrome doesn't inflate
with the fluid `--font-size-base`. Override per theme or any ancestor scope.

**Richer items:**

- `Menu.Link` / `Menu.Button` accept an **`icon`** (17px leading slot that
  follows hover/current color) and **`variant="danger"`** (error-colored row
  for actions like "Log out").
- `Menu.Link` accepts **`isCurrent`** — accent bar + tint and
  `aria-current="page"` for the active destination.

Two new compound parts complete the user-menu pattern (identity header +
grouped pickers + actions):

- **`Menu.Section`** — groups items under an optional uppercase eyebrow label.
  Pass `selectionMode="single" | "multiple"` to make the section selectable;
  selection is section-scoped (mirroring React Aria), so one menu can host
  several independent pickers — "View as" and "Language" — alongside plain
  action items. Controlled via `selectedKeys` / `onSelectionChange`
  (`Selection`), with `disallowEmptySelection` and `shouldCloseOnSelect`
  passed through.
- **`Menu.Option`** — selectable row for such a section; shows a
  primary-colored check mark when selected.
- **`Menu.Separator`** — a semantic divider between menu regions (announced as
  a separator, not just drawn) — e.g. before a "Log out" action. Wraps React
  Aria's `Separator`.

```tsx
<Menu.Section
  label="Language"
  selectionMode="single"
  disallowEmptySelection
  selectedKeys={language}
  onSelectionChange={setLanguage}
>
  <Menu.Option id="en">English</Menu.Option>
  <Menu.Option id="nb">Norsk bokmål</Menu.Option>
</Menu.Section>
```

`Menu` itself also exposes more of React Aria in the same sweep:

- **`placement`** — where the popover opens (e.g. `'top end'` for a sidebar
  footer menu); previously hardcoded to `'bottom end'`.
- **`isOpen` / `defaultOpen` / `onOpenChange`** — controlled or uncontrolled
  open state.
- **`Menu.Option`** accepts `isDisabled` and `textValue` (typeahead text when
  the label isn't a plain string; inferred from string children).

The `Menu` barrel now also exports its prop types (`MenuProps`,
`MenuSectionProps`, `MenuOptionProps`, …).
