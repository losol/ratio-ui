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

type Course = { id: string; title: string; seats: number };

const column = createColumnHelper<Course>();

const columns = [
  column.accessor('title', { header: 'Course' }),
  column.accessor('seats', { header: 'Seats' }),
];

<DataTable columns={columns} data={courses} enableGlobalSearch clientsidePagination pageSize={20} />;
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
| `renderToolbar` | `(searchInput) => ReactNode` | Wrap the search input in your own toolbar. |
| `renderSubComponent` | `({ row }) => ReactElement` | Content for an expanded row. |
| `getRowCanExpand` | `(row) => boolean` | Which rows can expand. |
| `getRowId` | `(originalRow, index) => string` | Stable row identity; useful when rows reorder. |

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
