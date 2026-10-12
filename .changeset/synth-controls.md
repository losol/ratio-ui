---
"@eventuras/ratio-ui": minor
---

Three controls for a panel of parameters, all beta, under `forms`:

- `Knob`: a rotary control for one continuous value — drag up or down (Shift for fine movement), arrow keys with focus (Page Up/Down for a tenth of the turn, Home/End for the ends), double-click back to `defaultValue`. `scale="log"` spreads the turn evenly over octaves, for frequency and time; `step` snaps a linear knob. A `role="slider"`, with `formatValue` as the spoken value. `knobToNormal` and `knobFromNormal` are exported for anyone mapping the same scale elsewhere.
- `Counter`: a value with − and + round it in a pill, one `step` per press, inactive at `minValue` and `maxValue`. `formatValue` writes it the way it reads ("110 bpm", "+1"); `labels` name the buttons. For a handful of steps that are nudged, where `NumberField` would be typed.
- `ToggleGrid`: a matrix of on/off cells with a header per row and a label per column — notes on beats, people on hours. Selection is a set of `row:column` keys (`toggleGridKey`), controlled or uncontrolled; `activeColumn` frames one column for a playhead; a row `color` carries through to its selected cells; `onRowPress` makes the row headers buttons.

`ToggleButtonGroup` takes `variant="tiles"` (beta): equal-width blocks that stack an option's new `icon` over its label, for a choice among a few things best shown rather than named. The matching `ToggleButton` variant is `tile`.

For the same panel on a phone:

- `Knob` reads its colours from the new `--knob-fill`, `--knob-track`, `--knob-face` and `--knob-pointer` tokens, so a dark instrument panel can reskin its knobs in a scope.
- `Card` takes `collapsible` (beta): the card renders as a native `<details>`, its new `Card.Header` as the `<summary>` and the rest of the children as the body — `defaultOpen`, or `open` with `onToggle`. Cards that share a `name` open one at a time, the browser closing the rest. `Card.Header` takes `summary`: one truncated line at the end of the header, so a closed card still tells what is inside. `Card.Body` is the content between them, optional, grown to fill the card. `Card.Footer` is the bottom row — inputs and outputs, a status and an action — ruled off from the content and sunk to the bottom, so footers line up across a row of cards of different heights.
- `useMediaQuery(query)` under `hooks`: whether a media query matches, `false` on the server and during hydration, for the layout decisions CSS cannot make — which component to render, whether a panel starts collapsed.
