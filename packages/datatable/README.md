# @eventuras/datatable

Data table for [Ratio UI](https://github.com/losol/ratio-ui), built on
[TanStack Table](https://tanstack.com/table). Sorting, global search, column
filters, client-side pagination and expandable rows — rendered with Ratio UI's
`SearchField` and `Pagination` so it matches the rest of the design system.

## Installation

```bash
pnpm add @eventuras/datatable @eventuras/ratio-ui
```

Install the peer dependencies it expects:

```bash
pnpm add @tanstack/react-table @tanstack/table-core @tanstack/match-sorter-utils lucide-react react react-dom
```

Import Ratio UI's styles once in your app root:

```tsx
import '@eventuras/ratio-ui/ratio-ui.css';
```

## Usage

```tsx
import { DataTable, createColumnHelper } from '@eventuras/datatable';

type Manuscript = { id: string; title: string; author: string };

const column = createColumnHelper<Manuscript>();

const columns = [
  column.accessor('title', { header: 'Work' }),
  column.accessor('author', { header: 'Author' }),
];

<DataTable columns={columns} data={works} enableGlobalSearch clientsidePagination pageSize={20} />;
```

## Props

| Prop | Type | Notes |
|---|---|---|
| `columns` | `ColumnDef[]` | TanStack column definitions — build them with `createColumnHelper`. |
| `data` | `T[]` | The rows to render. |
| `pageSize` | `number` | Rows per page. Applied when `clientsidePagination` is on. |
| `clientsidePagination` | `boolean` | Paginate in the browser and render Ratio UI's `Pagination`. |
| `enableGlobalSearch` | `boolean` | Adds a `SearchField` that fuzzy-matches across every column. |
| `columnFilters` | `ColumnFilter[]` | Per-column filters, controlled from the outside. |
| `state` | `Partial<TableState>` | Escape hatch for any other TanStack table state. |
| `renderToolbar` | `(searchInput, { shown, total }) => ReactNode` | Wrap the search input in your own toolbar; `meta` carries the row counts. |
| `renderSubComponent` | `({ row }) => ReactElement` | Content for an expanded row. |
| `getRowCanExpand` | `(row) => boolean` | Which rows can expand. |
| `getRowId` | `(originalRow, index) => string` | Stable row identity; useful when rows reorder. |
| `expanded` | `ExpandedState` | Controlled expansion — a record of row ids, or `true` for every row. |
| `onExpandedChange` | `OnChangeFn<ExpandedState>` | Fires when a row is toggled, controlled or not. |
| `expansionMode` | `'single' \| 'multiple'` | Uncontrolled policy. `'single'` (default) closes the open row when another opens. |
| `onRowClick` | `(row) => void` | Row click for pointer users; clicks on a control inside the row are that control's. |
| `emptyState` | `ReactNode` | Shown in place of the rows when nothing matches. |
| `rowCountLabel` | `(shown, total) => ReactNode` | Renders a count under the table. |

## Expanding rows

The table renders the open row's content but never invents the control that
opens it — add an expander column, TanStack-style:

```tsx
const expander = column.display({
  id: 'expander',
  header: () => null,
  cell: ({ row }) =>
    row.getCanExpand() ? (
      <button onClick={row.getToggleExpandedHandler()}>…</button>
    ) : null,
});

<DataTable
  columns={[expander, ...columns]}
  data={works}
  getRowCanExpand={() => true}
  renderSubComponent={({ row }) => <Copies work={row.original} />}
/>;
```

Left alone, one row stays open at a time. Pass `expanded` to own it — a
toolbar switch that sets `expanded={showDetail ? true : {}}` unfolds every
row, the density control a long admin list needs. A global search opens every
row while it's active, so a match inside expanded content is visible.

## Accessibility

`onRowClick` is a pointer convenience: it does not make the row focusable.
Keep the real destination in a cell — a link or a button — so keyboard and
screen-reader users have a path. Clicks that land on a control inside the row
don't trigger `onRowClick`.

## History

This package was developed in [`losol/eventuras`](https://github.com/losol/eventuras)
and grafted into this repository with its history intact. Because the graft kept
the original paths, `git log` on the current path only reaches back to the move.
To read the earlier history:

```bash
git log   526d87c^2 -- src/DataTable.tsx
git blame 526d87c^2 -- src/DataTable.tsx
```

where `526d87c` is the subtree-add commit.
