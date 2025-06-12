import React, { useMemo, useEffect, useRef } from 'react';
import {
  useTable,
  useSortBy,
  useRowSelect,
  Column,
  TableInstance,
  HeaderProps,
  CellProps,
  TableOptions, // Added for casting useTable options
  UseSortByOptions, // Added for casting useTable options
  UseSortByState, // Added for typing initialState
  UseRowSelectState, // Added for typing initialState
  ColumnInstance, // Added for casting column in render
  UseSortByColumnProps, // Added for casting column in render
} from 'react-table';
import { ChevronUpIcon, ChevronDownIcon, SelectorIcon } from '@heroui/shared-icons';
import { PageNumbers } from '../../components/Pagination';

export interface BaseTableBlockColumn<T> {
  header: React.ReactNode;
  accessor: keyof T | string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
}

export interface BaseTableBlockProps<T> {
  columns: BaseTableBlockColumn<T>[];
  data: T[];
  selectable?: boolean;
  multiSelect?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSortChange?: (col: string, dir: 'asc' | 'desc' | null) => void;
  className?: string;
  style?: React.CSSProperties;
  // Pagination props
  pageSize?: number;
  pageNumber?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

function getRowId<T extends { id?: string | number; [key: string]: unknown }>(row: T, idx: number): string {
  return row.id ? String(row.id) : String(idx);
}

export function BaseTableBlock<T extends { id?: string | number; [key: string]: unknown }>({
  columns,
  data,
  selectable = false,
  multiSelect = false,
  selectedRows,
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSortChange,
  className,
  style,
  pageSize = 10,
  pageNumber = 1,
  onPageChange,
  showPagination = false,
}: BaseTableBlockProps<T>) {

// ...rest of component

  const tableColumns: Column<T>[] = useMemo(() => {
    // Local interfaces for selection-augmented types
    interface RowSelectTableInstance {
      getToggleAllRowsSelectedProps: () => React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean };
      toggleAllRowsSelected: (selected: boolean) => void;
    }
    interface RowSelectRow {
      getToggleRowSelectedProps: () => React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean };
      toggleRowSelected: (selected: boolean) => void;
      isSelected?: boolean;
      original: T;
      index: number;
      table?: RowSelectTableInstance;
      _getInstance?: () => RowSelectTableInstance;
    }

    function SelectionHeader(headerProps: HeaderProps<T>) {
      const headerWithSelect = headerProps as unknown as RowSelectTableInstance;
      const { indeterminate, ...rest } = headerWithSelect.getToggleAllRowsSelectedProps();
      return (
        <input
          type="checkbox"
          aria-label="select all"
          {...rest}
          tabIndex={0}
          ref={el => { if (el) el.indeterminate = !!indeterminate; }}
        />
      );
    }

    function SelectionCell(cellProps: CellProps<T>) {
      const row = cellProps.row as unknown as RowSelectRow;
      const { indeterminate, onChange, ...rest } = row.getToggleRowSelectedProps ? row.getToggleRowSelectedProps() : {};
      const instance = row.table || row._getInstance?.();
      const isSelected = row.isSelected ?? false;
      const handleChange = multiSelect ? onChange : () => {
        if (instance?.toggleAllRowsSelected) instance.toggleAllRowsSelected(false);
        if (row.toggleRowSelected) row.toggleRowSelected(true);
        onSelectionChange?.([row.original]);
      };
      return (
        <input
          type="checkbox"
          aria-label={`select row ${row.index + 1}`}
          checked={isSelected}
          tabIndex={0}
          {...rest}
          ref={el => { if (el) el.indeterminate = !!indeterminate; }}
          onChange={handleChange}
        />
      );
    }

    const cols: Column<T>[] = [];
    if (selectable) {
      cols.push({
        id: 'selection',
        Header: SelectionHeader,
        Cell: SelectionCell,
        disableSortBy: true,
        width: 40,
      } as Column<T>);
    }
    cols.push(
      ...columns.map((col, idx) => {
        return {
          id: typeof col.accessor === 'string' ? String(col.accessor) : `col_${idx}`,
          Header: () => <>{col.header}</>,
          accessor: col.accessor as string,
          disableSortBy: !col.sortable,
          Cell: col.cell
            ? ({ row }: { row: { original: T } }) => col.cell!(row.original)
            : ({ value, row }: { value: unknown, row: { original: T } }) => {
                const accessor = col.accessor as keyof T;
                return value !== undefined ? value : row.original[accessor];
              },
        } as Column<T>;
      })
    );
    return cols;
  }, [columns, selectable, multiSelect, onSelectionChange]);

  const isControlledSelection = selectedRows !== undefined;
  const selectedRowIds = useMemo(() => {
    if (!isControlledSelection || !selectedRows) return undefined;
    const idSet = new Set(
      selectedRows.map((row) => getRowId(row, data.indexOf(row)))
    );
    return data.reduce((acc, row, idx) => {
      const id = getRowId(row, idx);
      if (idSet.has(id)) acc[id] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }, [selectedRows, data, isControlledSelection]);

  const isControlledSort = sortColumn !== undefined && sortDirection !== undefined;
  const initialState: Partial<UseSortByState<T> & UseRowSelectState<T>> = {};
  if (isControlledSort && sortColumn) {
    initialState.sortBy = [
      {
        id: sortColumn,
        desc: sortDirection === 'desc',
      },
    ];
  }
  if (isControlledSelection && selectedRowIds) {
    initialState.selectedRowIds = selectedRowIds;
  }

  const prevSelectedRowIds = useRef<Record<string, boolean>>({});

  const instance = useTable<T>(
    {
      columns: tableColumns,
      data,
      initialState,
      getRowId: (row, idx) => getRowId(row, idx),
      manualSortBy: isControlledSort,
    } as TableOptions<T> & UseSortByOptions<T>, // Cast to include UseSortByOptions
    useSortBy,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: tableState,
  } = instance as TableInstance<T> & {
    selectedFlatRows: { original: T }[];
  };

  useEffect(() => {
    if (multiSelect && onSelectionChange) {
      const currentSelectedRowIds = tableState.selectedRowIds;

      const currentIds = Object.keys(currentSelectedRowIds).sort().join(',');
      const prevIds = Object.keys(prevSelectedRowIds.current).sort().join(',');

      if (currentIds !== prevIds) {
        onSelectionChange(selectedFlatRows.map((r) => r.original));
        prevSelectedRowIds.current = currentSelectedRowIds;
      }
    }
  }, [multiSelect, onSelectionChange, tableState.selectedRowIds, selectedFlatRows]);


  useEffect(() => {
    const sortingState = tableState as typeof tableState & { sortBy?: Array<{ id: string; desc: boolean }> };
    if (
      isControlledSort &&
      onSortChange &&
      sortingState.sortBy &&
      sortingState.sortBy.length > 0
    ) {
      const sort = sortingState.sortBy[0];
      const dir = sort.desc ? 'desc' : 'asc';
      if (
        sort.id !== sortColumn ||
        dir !== sortDirection
      ) {
        onSortChange(sort.id, dir);
      }
    }
  }, [tableState, isControlledSort, sortColumn, sortDirection, onSortChange]);

  // Pagination logic
  const [currentPage, setCurrentPage] = React.useState<number>(pageNumber);

  // Update current page when pageNumber prop changes
  useEffect(() => {
    setCurrentPage(pageNumber);
  }, [pageNumber]);

  // Calculate total pages and paginated data
  const totalPages = useMemo(() =>
    Math.max(1, Math.ceil(data.length / pageSize)),
    [data.length, pageSize]
  );

  // Get displayed rows based on pagination
  const displayedRows = useMemo(() => {
    if (!showPagination) return rows;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, rows.length);
    return rows.slice(startIndex, endIndex);
  }, [rows, currentPage, pageSize, showPagination]);

  // Pagination logic is now handled by the Pagination component

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div style={style}>
      <table className={className} style={{ width: '100%' }} {...getTableProps()} role="table">
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={i} role="row">
              {headerGroup.headers.map((column: ColumnInstance<T> & UseSortByColumnProps<T>, idx: number) => (
                <th
                  {...column.getHeaderProps(
                    column.getSortByToggleProps?.() || {}
                  )}
                  key={idx}
                  style={{ cursor: column.canSort ? 'pointer' : undefined, textAlign: 'left' }}
                  aria-sort={
                    column.canSort
                      ? column.isSorted
                        ? column.isSortedDesc
                          ? 'descending'
                          : 'ascending'
                        : 'none'
                      : undefined
                  }
                  onClick={() => {
                    if (column.canSort) {
                      column.toggleSortBy();
                    }
                  }}
                  onKeyDown={e => {
                    if (column.canSort && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      column.toggleSortBy();
                    }
                  }}
                >
                  {column.canSort ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{column.render('Header')}</span>
                      <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', color: column.isSorted ? '#2563eb' : '#888' }}>
                        {column.isSorted
                          ? (column.isSortedDesc
                            ? <ChevronDownIcon />
                            : <ChevronUpIcon />)
                          : <SelectorIcon />}
                      </span>
                    </span>
                  ) : (
                    <span>{column.render('Header')}</span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {displayedRows.map((row, rowIdx) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={rowIdx}>
                {row.cells.map((cell, colIdx) => (
                  <td {...cell.getCellProps()} key={colIdx}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center mt-2 w-full">
        {showPagination && totalPages > 1 && (
          <div className="flex">
            <PageNumbers
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        <div className="flex ml-auto items-center gap-2">
          {selectable && (
            <div className="flex items-center">
              <span className="text-sm">
                <strong>{selectedFlatRows.length}</strong> of <strong>{data.length}</strong> selected
              </span>
            </div>
          )}

          {showPagination && totalPages > 1 && (
            <>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-20 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-20 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
