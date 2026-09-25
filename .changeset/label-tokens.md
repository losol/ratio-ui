---
"@eventuras/ratio-ui": minor
---

Field labels are now driven by `--label-*` tokens (`tokens/form.css`):
`--label-font-size`, `--label-line-height`, `--label-font-weight`,
`--label-color` and `--label-gap`. Override them per theme or scope to
restyle every form label at once.

`Select`, `NumberField`, `FileUpload`, `RadioGroup` and `Lookup` now render
their label through the shared `Label` styling instead of their own copies,
so label and spacing are identical across fields. The gap between label and
control is now 0.25rem everywhere (TextField and PhoneInput used 0.5rem).
