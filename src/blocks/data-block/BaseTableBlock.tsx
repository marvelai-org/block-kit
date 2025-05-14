import React, { useMemo, useEffect } from 'react';
import {
  useTable,
  useSortBy,
  useRowSelect,
  Column,
  TableInstance,
} from 'react-table';
import { ChevronUpIcon, ChevronDownIcon, SelectorIcon } from '@heroui/shared-icons';

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
  selectedRows?: T[]; // controlled
  onSelectionChange?: (selected: T[]) => void;
  sortColumn?: string; // controlled
  sortDirection?: 'asc' | 'desc' | null; // controlled
  onSortChange?: (col: string, dir: 'asc' | 'desc' | null) => void;
  className?: string;
  style?: React.CSSProperties;
}

function getRowId<T extends Record<string, any>>(row: T, idx: number): string {
  // Try to use a unique key if possible
  return row.id ? String(row.id) : String(idx);
}

export function BaseTableBlock<T extends Record<string, any>>({
  columns,
  data,
  selectable = false,
  multiSelect = false,
  selectedRows,
  defaultSelectedRows,
  onSelectionChange,
  sortColumn,
  sortDirection,
  onSortChange,
  className,
  style,
}: BaseTableBlockProps<T>) {
  // Map BaseTableBlockColumn to react-table columns
  const tableColumns: Column<T>[] = useMemo(() => {
    const cols: Column<T>[] = [];
    if (selectable) {
      cols.push({
        id: 'selection',
        Header: function SelectionHeader({ getToggleAllRowsSelectedProps }: { getToggleAllRowsSelectedProps: () => any }) {
          return multiSelect ? (
            <input
              type="checkbox"
              aria-label="select all"
              {...getToggleAllRowsSelectedProps()}
            />
          ) : null;
        },
        Cell: (cellProps: { row: any }) => {
          const { row } = cellProps;
          // Access these from the table instance closure
          // They are available in the component scope
          return (
            <input
              type="checkbox"
              aria-label={`select row ${row.index + 1}`}
              checked={row.isSelected}
              onChange={() => {
                if (multiSelect) {
                  row.toggleRowSelected();
                } else {
                  if (!row.isSelected) {
                    toggleAllRowsSelected(false);
                    toggleRowSelected(row.id, true);
                  } else {
                    toggleRowSelected(row.id, false);
                  }
                }
              }}
            />
          );
        },
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
            : ({ value }: { value: any }) => value,
        } as Column<T>;
      })
    );
    return cols;
  }, [columns, selectable, multiSelect]);

  // Controlled/uncontrolled selection state
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

  // Controlled/uncontrolled sorting
  const isControlledSort = sortColumn !== undefined && sortDirection !== undefined;
  const initialState: any = {};
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

  const instance = useTable<T>(
    {
      columns: tableColumns,
      data,
      initialState,
      getRowId: (row, idx) => getRowId(row, idx),
      manualSortBy: isControlledSort,
    },
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
    toggleAllRowsSelected,
    toggleRowSelected,
  } = instance as TableInstance<T> & {
    toggleAllRowsSelected: (value?: boolean) => void;
    toggleRowSelected: (rowId: string, value?: boolean) => void;
    selectedFlatRows: { original: T }[];
  };

  // Selection effect
  useEffect(() => {
    if (onSelectionChange) {
      if (isControlledSelection) {
        onSelectionChange(selectedRows || []);
      } else {
        onSelectionChange(selectedFlatRows.map((r) => r.original));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlatRows, onSelectionChange]);

  // Sorting effect
  useEffect(() => {
    if (
      isControlledSort &&
      onSortChange &&
      tableState.sortBy &&
      tableState.sortBy.length > 0
    ) {
      const sort = tableState.sortBy[0];
      const dir = sort.desc ? 'desc' : 'asc';
      if (
        sort.id !== sortColumn ||
        dir !== sortDirection
      ) {
        onSortChange(sort.id, dir);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableState.sortBy, onSortChange]);

  return (
    <div style={style}>
      <table className={className} style={{ width: '100%' }} {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={i}>
              {headerGroup.headers.map((column, idx) => (
                <th
                  {...column.getHeaderProps(
                    (column as any).getSortByToggleProps?.() || {}
                  )}
                  key={idx}
                  style={{ cursor: (column as any).canSort ? 'pointer' : undefined, textAlign: 'left' }}
                  onClick={() => {
                    if ((column as any).canSort) {
                      (column as any).toggleSortBy();
                    }
                  }}
                >
                  {(column as any).canSort ? (
  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
    <span>{column.render('Header')}</span>
    <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', color: (column as any).isSorted ? '#2563eb' : '#888' }}>
      {(column as any).isSorted
        ? ((column as any).isSortedDesc
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
        {rows.map((row, rowIdx) => {
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
    </div>
  );
}
