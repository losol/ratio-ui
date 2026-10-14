---
"@eventuras/ratio-ui": minor
---

`Setting`: a setting's name over its control, for the controls that are not form fields: a `Counter` for the tempo, a `ToggleButtonGroup` for the meter, a `Select`, a row of `Knob`s. The name is set like a field's label, and it names the control for a screen reader: one unnamed child gets `aria-labelledby` (and `aria-describedby` from the description). `inline` puts the name beside the control, for a `Switch`.

`Counter` and `ToggleButtonGroup` take `aria-labelledby` and `aria-describedby`.
