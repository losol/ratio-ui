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
| `Chart.Legend` | Each series by name and colour; `interactive` makes each entry a toggle that fades its series out and back. |
| `Chart.Plot` | The drawing, an image named by `label`. Holds the layers and axes; `height` sets its size. |
| `Chart.Grid` | A line at every tick; the zero line a shade stronger. |
| `Chart.Bars` | The bar series: stacked by `stack`, side by side between stacks, down from zero for negative values. |
| `Chart.Line` | The line series, through each category's centre. A missing value breaks the line. |
| `Chart.YAxis` | The value axis; the unit after the top tick. |
| `Chart.XAxis` | Each row's `x`; `every` thins the labels. |
| `Chart.Tooltip` | A tooltip per category with every series' value, shown on hover with CSS alone. Write it last in `Chart.Plot`. |
| `Chart.Table` | The numbers, behind a disclosure: what a screen reader reads. |

Anything else in the figure — a heading, a note — is yours to place among
the parts.

## How it draws

Every mark is placed in percent of the plot, from the same scale, so the
bars, the line, the grid and the axes agree on where zero is, and the chart
follows its container's width with no measuring and no layout shift. Text
is HTML text. The line is drawn in a stretched SVG box with a stroke that
does not stretch.

It renders on the server, and the client part is as thin as it gets. The
root computes the model and hands it to each part as a prop, walking its
own JSX through fragments and any element that holds the parts (a `Card`, a
`<div>`); there is no context and no hook in the parts. A part rendered
inside a component of your own is out of the root's reach, so write the
parts in the chart's JSX.

- `Chart.Tooltip` is rendered on the server and shown on hover with CSS.
- The table is a `<details>`.
- `Chart.Legend interactive` is the only client component: toggle buttons
  that mark a series' server-rendered marks as muted. They compute and
  draw nothing. A muted series fades rather than vanishes, so the stacks
  and the scale hold still and nothing needs recomputing in the browser.

## Tokens

`tokens/chart.css`: the series palette `--chart-1` … `--chart-6` (the
brand, green, the accent, the ink, red, orange, from the theme's own
colours, in the order of `CHART_PALETTE` in core), `--chart-grid`,
`--chart-zero`, `--chart-axis`, `--chart-gap` (the hairline between stacked
segments), `--chart-hover`, `--chart-tip-bg`, `--chart-tip-border`,
`--chart-tip-shadow`, `--chart-muted-opacity`, `--chart-height`,
`--chart-bar-radius` and `--chart-line-width`. Tabula squares the bars.

The same chart for an app is `@eventuras/ratio-ui-native/charts`.
