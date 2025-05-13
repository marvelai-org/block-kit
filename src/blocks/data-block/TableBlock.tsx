import React from 'react';
import { Card, Button, Input } from '@heroui/react';
import { Text } from '../../components/Text';
import { BlockProps } from '../../types';
import { ChevronUpIcon, ChevronDownIcon, SelectorIcon } from '@heroui/shared-icons';
import { Icon } from '@iconify/react';

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
  const [openDropdown, setOpenDropdown] = React.useState<null | "sort" | "columns">(null);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const columnsDropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!openDropdown) return;
    function handle(e: MouseEvent) {
      const sortEl = sortDropdownRef.current;
      const columnsEl = columnsDropdownRef.current;
      if (
        (openDropdown === "sort" && sortEl && !sortEl.contains(e.target as Node)) ||
        (openDropdown === "columns" && columnsEl && !columnsEl.contains(e.target as Node))
      ) {
        setOpenDropdown(null);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [openDropdown]);

  const [tableData, setTableData] = React.useState(data);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);

  // Columns visibility

  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(columns.map(c => c.accessor));
  const [hoveredCol, setHoveredCol] = React.useState<number | null>(null);
  React.useEffect(() => {
    setVisibleColumns(columns.map(c => c.accessor));
  }, [columns]);
  const toggleColumn = (accessor: string) => {
    setVisibleColumns(cols =>
      cols.includes(accessor)
        ? cols.filter(a => a !== accessor)
        : [...cols, accessor]
    );
  };
  const showAllColumns = () => setVisibleColumns(columns.map(c => c.accessor));
  const hideAllColumns = () => setVisibleColumns([]);

  React.useEffect(() => {
    if (!sortColumn || !sortDirection) {
      setTableData(data);
      return;
    }
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    setTableData(sorted);
  }, [sortColumn, sortDirection, data]);
  const [currentPage, setCurrentPage] = React.useState<number>(pageNumber);
  const [selectedRows, setSelectedRows] = React.useState<TableRowData[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize));

  React.useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(row =>
        columns.some(column => {
          const val = row[column.accessor];
          return val != null && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
      setTableData(filtered);
    } else {
      setTableData(data);
    }
    setCurrentPage(1);
  }, [searchTerm, data, columns]);

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
      <div style={{ padding: 'var(--hero-spacing-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 'var(--hero-spacing-2)', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <Input
              placeholder="Search"
              value={searchTerm}
              size="sm"
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" variant="light"><Icon icon="heroicons-outline:funnel" className="w-4 h-4 mr-1" />Filter</Button>
          <div style={{ position: 'relative', display: 'inline-block' }} ref={sortDropdownRef}>
            <Button
              size="sm"
              variant="light"
              aria-haspopup="true"
              aria-expanded={openDropdown === "sort"}
              aria-controls="sort-dropdown"
              onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
            >
              <Icon icon="heroicons-outline:arrows-up-down" className="w-4 h-4 mr-1" />Sort
            </Button>
            {openDropdown === "sort" && (
              <div
                id="sort-dropdown"
                tabIndex={-1}
                ref={sortDropdownRef}
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  zIndex: 10,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                  padding: 12,
                  minWidth: 180
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Sort by</div>
                {columns.map(col => (
                  <label key={col.accessor} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sort-column"
                      checked={sortColumn === col.accessor}
                      onChange={() => { setSortColumn(col.accessor); setSortDirection('asc'); }}
                      style={{ marginRight: 8 }}
                    />
                    {col.header}
                  </label>
                ))}
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    style={{
                      padding: '4px 12px',
                      borderRadius: 4,
                      border: sortDirection === 'asc' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      background: sortDirection === 'asc' ? '#eff6ff' : '#fff',
                      color: sortDirection === 'asc' ? '#2563eb' : '#222',
                      fontWeight: sortDirection === 'asc' ? 600 : 400,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    onClick={() => setSortDirection('asc')}
                  >Asc</button>
                  <button
                    type="button"
                    style={{
                      padding: '4px 12px',
                      borderRadius: 4,
                      border: sortDirection === 'desc' ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      background: sortDirection === 'desc' ? '#eff6ff' : '#fff',
                      color: sortDirection === 'desc' ? '#2563eb' : '#222',
                      fontWeight: sortDirection === 'desc' ? 600 : 400,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    onClick={() => setSortDirection('desc')}
                  >Desc</button>
                </div>
              </div>
            )}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }} ref={columnsDropdownRef}>
            <Button
              size="sm"
              variant="light"
              aria-haspopup="true"
              aria-expanded={openDropdown === "columns"}
              aria-controls="columns-dropdown"
              onClick={() => setOpenDropdown(openDropdown === "columns" ? null : "columns")}
            >
              <Icon icon="heroicons-outline:view-grid" className="w-4 h-4 mr-1" />Columns
            </Button>
            {openDropdown === "columns" && (
              <div
                id="columns-dropdown"
                tabIndex={-1}
                ref={columnsDropdownRef}
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  zIndex: 10,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                  padding: 12,
                  minWidth: 180
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Columns</div>
                {columns.map(col => (
                  <label key={col.accessor} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.accessor)}
                      onChange={() => toggleColumn(col.accessor)}
                      style={{ marginRight: 8 }}
                    />
                    {col.header}
                  </label>
                ))}
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}
                    onClick={showAllColumns}
                  >Show All</button>
                  <button
                    type="button"
                    style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}
                    onClick={hideAllColumns}
                  >Hide All</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--hero-spacing-2)', alignItems: 'center' }}>
          {selectable && <Text size="sm"><strong>{selectedRows.length}</strong> Selected</Text>}
          <Button size="sm" variant="light" disabled={selectedRows.length === 0}>Selected Actions <SelectorIcon /></Button>
        </div>
      </div>
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
                 {columns.filter(col => visibleColumns.includes(col.accessor)).map((column, index) => (
                  <th
                    key={index}
                    style={{
                      textAlign: 'left',
                      padding: compact ? 'var(--hero-spacing-1)' : 'var(--hero-spacing-2)',
                      backgroundColor: hoveredCol === index ? '#f3f4f6' : 'var(--hero-color-muted)',
                      borderBottom: '1px solid var(--hero-color-border)',
                      cursor: column.sortable ? 'pointer' : 'default',
                      ...(bordered ? { border: '1px solid var(--hero-color-border)' } : {}),
                    }}
                    tabIndex={column.sortable ? 0 : -1}
                    onClick={() => column.sortable && handleSort(column)}
                    onKeyDown={e => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) handleSort(column);
                    }}
                    aria-sort={sortColumn === column.accessor
                      ? (sortDirection === 'asc' ? 'ascending' : 'descending')
                      : 'none'}
                    onMouseEnter={() => setHoveredCol(index)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', color: sortColumn === column.accessor ? '#2563eb' : '#888' }}>
                          {column.sortable && (
                            sortColumn === column.accessor && sortDirection
                              ? (sortDirection === 'asc' ? <ChevronDownIcon /> : <ChevronUpIcon />)
                              : <SelectorIcon />
                          )}
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
                {columns.filter(col => visibleColumns.includes(col.accessor)).map((column, colIndex) => (
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