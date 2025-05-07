import React from 'react';
import { Card, Button } from '@heroui/react';
import { Text } from '../../components/Text';
import { BlockProps } from '../../types';
import { ChevronUpIcon, ChevronDownIcon, SelectorIcon } from '@heroui/shared-icons';

export type TableRowData = Record<string, string | number | boolean | null | undefined>;

export interface TableColumn {
  header: string;
  accessor: string;
  cell?: (info: TableRowData) => React.ReactNode;
  sortable?: boolean;
  Filter?: (info: TableRowData) => boolean;
}

export interface TableBlockProps extends BlockProps {
  columns: TableColumn[];
  data: TableRowData[];
  caption?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  title?: string;
  showHeader?: boolean;
  pageSize?: number;
  pageNumber?: number;
  selectable?: boolean;
  multiSelect?: boolean;
  onSelectionChange?: (selectedRows: TableRowData[]) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  id,
  columns,
  data,
  caption,
  striped = true,
  bordered = true,
  hoverable = true,
  compact = false,
  title,
  showHeader = true,
  pageSize = 10,
  pageNumber = 1,
  selectable = false,
  multiSelect = true,
  onSelectionChange,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange,
  ...props
}) => {
  const [tableData, setTableData] = React.useState(data);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(pageNumber);
  const [selectedRows, setSelectedRows] = React.useState<TableRowData[]>([]);
  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize));

  function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) { startPage = 1; endPage = Math.min(5, totalPages); }
    if (currentPage >= totalPages - 2) { endPage = totalPages; startPage = Math.max(1, totalPages - 4); }
    const pageNumbers: (number | 'ellipsis')[] = [];
    pageNumbers.push(1);
    if (startPage > 2) pageNumbers.push('ellipsis');
    for (let p = startPage; p <= endPage; p++) if (p !== 1 && p !== totalPages) pageNumbers.push(p);
    if (endPage < totalPages - 1) pageNumbers.push('ellipsis');
    if (totalPages > 1) pageNumbers.push(totalPages);
    return pageNumbers;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const pagedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (column: TableColumn) => {
    if (!column.sortable) {
      return;
    }

    let newSortDirection: 'asc' | 'desc' | null = null;
    if (sortColumn === column.accessor) {
      if (sortDirection === 'asc') {
        newSortDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newSortDirection = null;
        setTableData(data);
      } else {
        newSortDirection = 'asc';
      }
    } else {
      setSortColumn(column.accessor);
      newSortDirection = 'asc';
    }
    setSortDirection(newSortDirection);

    if (newSortDirection === null) {
      setTableData(data);
      return;
    }

    const sortedData = [...tableData].sort((a, b) => {
      const aValue = a[column.accessor];
      const bValue = b[column.accessor];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? bValue - aValue : aValue - bValue;
      }
      return 0;
    });
    setTableData(sortedData);
  };

  const handleRowSelect = (row: TableRowData) => {
    const isSelected = selectedRows.includes(row);
    let newSelectedRows: TableRowData[];
    if (multiSelect) {
      newSelectedRows = isSelected
        ? selectedRows.filter(r => r !== row)
        : [...selectedRows, row];
    } else {
      newSelectedRows = isSelected ? [] : [row];
    }
    setSelectedRows(newSelectedRows);
    if (onSelectionChange) {
      onSelectionChange(newSelectedRows);
    }
  };

  const handleSelectAll = () => {
    let newSelected: TableRowData[] = [];
    if (selectedRows.length === tableData.length) {
      newSelected = [];
    } else {
      newSelected = [...tableData];
    }
    setSelectedRows(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  return (
    <Card
      className={className}
      data-block-id={id}
      {...props}
    >
      {title && (
        <Text
          as="h3"
          size="lg"
          weight="medium"
          p="3"
          borderBottom="1px solid"
          borderColor="border"
        >
          {title}
        </Text>
      )}
      {selectable && (
        <div style={{ padding: 'var(--hero-spacing-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text size="sm"><strong>{selectedRows.length}</strong> Selected</Text>
          <div>
            <Button size="sm" variant="light" disabled>Action A</Button>
            <Button size="sm" variant="light" disabled className="ml-2">Action B</Button>
          </div>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            ...(compact ? { fontSize: 'var(--hero-font-size-sm)' } : {})
          }}
        >
          {caption && (
            <caption>
              <Text size="sm" color="foreground-muted">
                {caption}
              </Text>
            </caption>
          )}

          {showHeader && (
            <thead>
              <tr>
                {selectable && (
                  <th style={{ padding: compact ? 'var(--hero-spacing-1)' : 'var(--hero-spacing-2)', borderBottom: '1px solid var(--hero-color-border)', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === tableData.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    style={{
                      textAlign: 'left',
                      padding: compact ? 'var(--hero-spacing-1)' : 'var(--hero-spacing-2)',
                      backgroundColor: 'var(--hero-color-muted)',
                      borderBottom: '1px solid var(--hero-color-border)',
                      ...(bordered ? { border: '1px solid var(--hero-color-border)' } : {}),
                    }}
                    onClick={() => { handleSort(column); }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                          {sortDirection === 'asc' ? <ChevronDownIcon /> : (sortDirection === 'desc' ? <ChevronUpIcon /> : <SelectorIcon />)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {pagedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  ...(striped && rowIndex % 2 === 1 ? { backgroundColor: 'var(--hero-color-muted-50)' } : {}),
                  ...(hoverable ? { ':hover': { backgroundColor: 'var(--hero-color-muted-100)' } } : {})
                }}
              >
                {selectable && (
                  <td style={{
                    padding: compact ? 'var(--hero-spacing-1)' : 'var(--hero-spacing-2)',
                    textAlign: 'center',
                    ...(bordered ? { border: '1px solid var(--hero-color-border)' } : { borderBottom: '1px solid var(--hero-color-border)' })
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row)}
                      onChange={() => handleRowSelect(row)}
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      padding: compact ? 'var(--hero-spacing-1)' : 'var(--hero-spacing-2)',
                      ...(bordered ? { border: '1px solid var(--hero-color-border)' } : {
                        borderBottom: '1px solid var(--hero-color-border)'
                      })
                    }}
                  >
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}

            {tableData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--hero-spacing-4)',
                    color: 'var(--hero-color-foreground-muted)'
                  }}
                >
                  No data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center mt-2 w-full">
        <div className="flex items-center bg-gray-100 rounded-full px-1 py-0.5 w-fit shadow-sm">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="mx-0.5 w-7 h-7 flex items-center justify-center rounded-full border border-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none hover:bg-gray-200 text-base"
            aria-label="First page"
          >
            &laquo;
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="mx-0.5 w-7 h-7 flex items-center justify-center rounded-full border border-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none hover:bg-gray-200 text-base"
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
          {pageNumbers.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={idx} className="mx-0.5 w-7 h-7 flex items-center justify-center select-none text-base">...</span>
            ) : (
              <button
                key={idx}
                onClick={() => setCurrentPage(item as number)}
                disabled={item === currentPage}
                className={[
                  "mx-0.5 w-7 h-7 flex items-center justify-center rounded-full border border-transparent transition-all duration-150",
                  item === currentPage
                    ? "font-bold bg-blue-500 text-white shadow-[0_2px_8px_rgba(0,119,255,0.15)] outline-none"
                    : "hover:bg-gray-200 hover:border-gray-300 text-black",
                  "disabled:bg-blue-500 disabled:text-white disabled:font-bold disabled:cursor-default"
                ].join(" ")}
                aria-current={item === currentPage ? 'page' : undefined}
                style={item === currentPage ? { boxShadow: '0 2px 8px 0 rgba(0,119,255,0.15)' } : {}}
              >
                {item}
              </button>
            )
          )}
        </div>
        <div className="flex ml-auto gap-2">
          {selectable && (
            <div className="ml-4">
              <Text size="sm"><strong>{selectedRows.length}</strong> of <strong>{tableData.length}</strong> selected</Text>
            </div>
          )}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-20 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-20 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};