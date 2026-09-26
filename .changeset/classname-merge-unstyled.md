---
"@eventuras/ratio-ui": minor
---

One `className` rule across the form parts and `Menu.Trigger`: extra classes
merge on top of the component's defaults (a later class wins a conflict), and
a new `unstyled` prop drops the defaults to style from scratch. It applies to
`Label`, `InputDescription`, `Input`, `TextField`, `Checkbox` (and
`Checkbox.Label` / `Checkbox.Description`), `Fieldset`, `Form`, `ListBox`,
`ListBoxItem` and `Menu.Trigger`, matching `Select` since 2.25.

**Behaviour change:** these components used to drop their defaults whenever a
`className` was passed. If you pass `className` to restyle one from scratch,
for example an avatar-pill `Menu.Trigger`, add `unstyled`:

```tsx
<Menu.Trigger unstyled className="inline-flex items-center gap-2 rounded-full …">
```
