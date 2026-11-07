---
'@eventuras/ratio-ui': minor
---

New `@eventuras/ratio-ui/charts` (beta): `Chart`, bars and lines over categories, composed from parts — `Chart.Legend`, `Chart.Plot` with `Chart.Grid`, `Chart.Bars` (stacked, grouped, negative values), `Chart.Line`, `Chart.YAxis` and `Chart.XAxis`, and `Chart.Table`, the numbers behind a disclosure for screen readers. The root computes the scales once from `@eventuras/ratio-ui-core/charts` and hands them to every part, so the bars, the line, the grid and the axes agree on where zero is. Server-safe: no hooks, no context, no `'use client'`; marks are placed in percent, so a chart follows its container's width with no measuring. `format` takes a locale and `Intl.NumberFormat` options. New `--chart-*` tokens: a six-colour series palette from the theme's own colours, and the grid, axis, height, bar radius and line width; Tabula squares the bars.
