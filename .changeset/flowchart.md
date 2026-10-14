---
"@eventuras/ratio-ui": minor
---

`Flowchart`: boxes on a grid, joined by lines. Each `Flowchart.Node` says which boxes it follows (`from`), takes its place with `span` and `align`, and the chart draws the lines at right angles (or `connector="straight"`). The boxes are framed `Card`s, sized by the `--flowchart-*` tokens; Tabula frames them 4px in the condensed face.

`Patchbay` learns two things for it: `connector` (`cable`, `straight` or `elbow`: a hanging patch cable, one line for a quiz, right angles for a diagram) and `anchor` ports (a point a line ends at, with no socket drawn), for a `readOnly` diagram.
