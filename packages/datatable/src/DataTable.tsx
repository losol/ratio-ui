'use client';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import { Pagination } from '@eventuras/ratio-ui/core/Pagination';
import { Table } from '@eventuras/ratio-ui/core/Table';
import {
  ColumnFilter,
  ColumnFiltersState,
  ExpandedState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  OnChangeFn,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useEffect } from 'react';
import { SearchField } from '@eventuras/ratio-ui/forms';

/** How many rows may be open at once while the table owns expansion. */
export type DataTableExpansionMode = 'single' | 'multiple';

export type DataTableProps<TData = any> = {
  /** TanStack column definitions — build them with `createColumnHelper`. */
  columns: any[];
  data: TData[];
  pageSize?: number;
  clientsidePagination?: boolean;
  state?: Partial<TableState>;
  enableGlobalSearch?: boolean;
  columnFilters?: ColumnFilter[];
  /**
   * Wrap the search input in your own toolbar. `meta` carries the row counts,
   * so a filter summary can sit next to the field.
   */
  renderToolbar?: (
    searchInput: React.ReactNode,
    meta: { shown: number; total: number },
  ) => React.ReactNode;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  /** Which rows can expand. Required for `renderSubComponent` to reach them. */
  getRowCanExpand?: (row: Row<TData>) => boolean;
  getRowId?: (originalRow: TData, index: number) => string;
  /**
   * Controlled expansion. Mirrors TanStack: a record of row ids, or `true`
   * for every row — the "expand all" toolbar switch. While set, the table
   * applies no policy of its own (`expansionMode` and the search auto-expand
   * step aside) and reports changes through `onExpandedChange`.
   */
  expanded?: ExpandedState;
  /** Fires when a row is toggled, controlled or not. */
  onExpandedChange?: OnChangeFn<ExpandedState>;
  /**
   * Uncontrolled policy: `'single'` (default) closes the open row when
   * another opens; `'multiple'` leaves them open. A global search expands
   * everything either way, so matches inside a row are visible.
   */
  expansionMode?: DataTableExpansionMode;
  /**
   * Called when a row is clicked, unless the click landed on a control inside
   * it (a link, the expander, a checkbox) — that click belongs to the control.
   * A convenience for pointer users: it does not make the row focusable, so
   * keep the real destination in a cell for keyboard and screen-reader users.
   */
  onRowClick?: (row: Row<TData>) => void;
  /** Shown in place of the rows when nothing matches. */
  emptyState?: React.ReactNode;
  /** Renders a count under the table, e.g. `(shown, total) => \`${shown} of ${total} rows\``. */
  rowCountLabel?: (shown: number, total: number) => React.ReactNode;
};
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);
  // Store the itemRank info
  addMeta({
    itemRank,
  });
  // Return if the item should be filtered in/out
  return itemRank.passed;
};

/** Controls whose click is theirs, not the row's (see `onRowClick`). */
const INTERACTIVE = 'a,button,input,select,textarea,label,[role="button"],[role="link"]';

/** Only one row stays open — the id that just turned on wins. */
function keepOne(previous: ExpandedState, next: ExpandedState): ExpandedState {
  if (typeof next === 'boolean') return next;
  const wasOpen = typeof previous === 'boolean' ? [] : Object.keys(previous).filter(id => previous[id]);
  const isOpen = Object.keys(next).filter(id => next[id]);
  if (isOpen.length <= wasOpen.length) return next; // a row closed
  const opened = isOpen.find(id => !wasOpen.includes(id));
  return opened ? { [opened]: true } : next;
}

const DataTable = <TData,>(props: DataTableProps<TData>) => {
  const {
    columns,
    data,
    clientsidePagination,
    pageSize = 25,
    state,
    expansionMode = 'single',
    onRowClick,
    emptyState,
    rowCountLabel,
  } = props;
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [internalExpanded, setInternalExpanded] = React.useState<ExpandedState>({});

  // Controlled expansion hands the whole policy to the caller.
  const isControlled = props.expanded !== undefined;
  const expanded = isControlled ? props.expanded! : internalExpanded;
  const { onExpandedChange } = props;

  const handleClientPageChange = (newPage: number) => {
    table.setPageIndex(newPage);
  };

  useEffect(() => {
    if (props.columnFilters) {
      setColumnFilters(props.columnFilters);
    }
  }, [props.columnFilters]);

  // A search matches text inside expanded content too, so open every row
  // while filtering and collapse again when the field is cleared.
  useEffect(() => {
    if (isControlled) return;
    setInternalExpanded(globalFilter ? true : {});
  }, [globalFilter, isControlled]);

  const handleExpandedChange = React.useCallback<OnChangeFn<ExpandedState>>(
    updater => {
      if (isControlled) {
        onExpandedChange?.(updater);
        return;
      }
      setInternalExpanded(old => {
        const next = typeof updater === 'function' ? updater(old) : updater;
        // While searching every row is open, so the single-row policy would
        // collapse the very matches the search opened.
        const settled = expansionMode === 'single' && !globalFilter ? keepOne(old, next) : next;
        onExpandedChange?.(settled);
        return settled;
      });
    },
    [isControlled, onExpandedChange, expansionMode, globalFilter],
  );

  const table = useReactTable({
    columns,
    data: data,
    getRowId: props.getRowId,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: handleExpandedChange,
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: props.getRowCanExpand,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      ...state,
      globalFilter,
      columnFilters,
      expanded,
    },
  });
  useEffect(() => {
    if (clientsidePagination) table.setPageSize(pageSize);
  }, [clientsidePagination, pageSize]);

  const searchInput = props.enableGlobalSearch ? (
    <SearchField
      value={globalFilter ?? ''}
      onChange={value => setGlobalFilter(value)}
      placeholder="Search all columns..."
      aria-label="Search table"
    />
  ) : null;

  const rows = table.getRowModel().rows;
  const shown = table.getFilteredRowModel().rows.length;
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <>
      {props.renderToolbar
        ? props.renderToolbar(searchInput, { shown, total: data.length })
        : searchInput}
      <Table>
        <Table.Header>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Table.HeadCell key={header.id} scope="col">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </Table.HeadCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {rows.map(row => (
            <React.Fragment key={row.id}>
              <Table.Row
                className={onRowClick ? 'cursor-pointer hover:bg-card-hover' : ''}
                onClick={
                  onRowClick
                    ? event => {
                        // Let a control inside the row keep its own click.
                        const target = event.target;
                        if (target instanceof Element && target.closest(INTERACTIVE)) return;
                        onRowClick(row);
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map(cell => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
              {row.getIsExpanded() && props.renderSubComponent && (
                <Table.Row className="bg-card">
                  <Table.Cell colSpan={columnCount}>
                    {props.renderSubComponent({ row })}
                  </Table.Cell>
                </Table.Row>
              )}
            </React.Fragment>
          ))}
          {/* Keyed to the filtered count, not the page: an out-of-range page
              is empty while matches still exist on another one. */}
          {shown === 0 && emptyState && (
            <Table.Row>
              <Table.Cell colSpan={columnCount} className="py-8 text-center text-(--text-subtle)">
                {emptyState}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {rowCountLabel && (
        <div className="pt-3 text-sm text-(--text-subtle)">{rowCountLabel(shown, data.length)}</div>
      )}
      {clientsidePagination && table.getPageCount() > 1 ? (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPreviousPageClick={() =>
            handleClientPageChange(table.getState().pagination.pageIndex - 1)
          }
          onNextPageClick={() => handleClientPageChange(table.getState().pagination.pageIndex + 1)}
        />
      ) : null}
    </>
  );
};
export default DataTable;
export type { ColumnFilter, ColumnSort, TableState } from '@tanstack/react-table';
export { createColumnHelper } from '@tanstack/react-table';
