# Charts

Bars and lines over categories, composed from parts. The arithmetic —
scales, nice ticks, stacking, number format — is
`@eventuras/ratio-ui-core/charts`, shared with every renderer and re-exported
here, so an app needs one import.

```tsx
import { Chart } from '@eventuras/ratio-ui/charts';

<Chart
  data={hours}
  x="hour"
  unit="kW"
  label="Production and consumption, hour by hour"
  series={[
    { key: 'wind', label: 'Wind', stack: 'production' },
    { key: 'water', label: 'Water', stack: 'production' },
    { key: 'use', label: 'Consumption', kind: 'line' },
  ]}
>
  <Chart.Legend />
  <Chart.Plot>
    <Chart.Grid />
    <Chart.Bars />
    <Chart.Line />
    <Chart.YAxis />
    <Chart.XAxis every={6} />
  </Chart.Plot>
  <Chart.Table />
</Chart>
```

## The parts

| Part | What it draws |
| --- | --- |
| `Chart` | The root: data, `x`, `series`, `label`. Computes the scales once and renders a `<figure>`. |
| `Chart.Legend` | Each series by name and colour. |
| `Chart.Plot` | The drawing, an image named by `label`. Holds the layers and axes; `height` sets its size. |
| `Chart.Grid` | A line at every tick; the zero line a shade stronger. |
| `Chart.Bars` | The bar series: stacked by `stack`, side by side between stacks, down from zero for negative values. |
| `Chart.Line` | The line series, through each category's centre. A missing value breaks the line. |
| `Chart.YAxis` | The value axis; the unit after the top tick. |
| `Chart.XAxis` | Each row's `x`; `every` thins the labels. |
| `Chart.Table` | The numbers, behind a disclosure: what a screen reader reads. |

Anything else in the figure — a heading, a note — is yours to place among
the parts.

## How it draws

Every mark is placed in percent of the plot, from the same scale, so the
bars, the line, the grid and the axes agree on where zero is, and the chart
follows its container's width with no measuring and no layout shift. Text
is HTML text. The line is drawn in a stretched SVG box with a stroke that
does not stretch.

It renders on the server. There is no context, no hook and no
`'use client'`: the root computes the model and hands it to each part as a
prop, walking its own JSX through fragments and any element that holds the
parts (a `Card`, a `<div>`). A part rendered inside a component of your own
is out of the root's reach, so write the parts in the chart's JSX. A server
component renders a `Chart` with no client JavaScript; the tooltips are
`title`s and the table is a `<details>`, so nothing needs hydrating.

## Tokens

`tokens/chart.css`: the series palette `--chart-1` … `--chart-6` (the
brand, green, the accent, the ink, red, orange, from the theme's own
colours), `--chart-grid`, `--chart-zero`, `--chart-axis`, `--chart-gap`
(the hairline between stacked segments), `--chart-height`,
`--chart-bar-radius` and `--chart-line-width`. Tabula squares the bars.
