import React from 'react';
import { Card, Button, Input } from '@heroui/react';
import { Text } from '../../components/Text';
import { BlockProps } from '../../types';
import { Icon } from '@iconify/react';
import { BaseTableBlock, BaseTableBlockColumn } from './BaseTableBlock';

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
  compact?: boolean;
  title?: string;
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
  compact = false,
  title,
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

  const [currentPage, setCurrentPage] = React.useState<number>(pageNumber);
  const [selectedRows, setSelectedRows] = React.useState<TableRowData[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Compose filtering and sorting
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row =>
      columns.some(column => {
        const val = row[column.accessor];
        return val != null && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, data, columns]);

  // Sorted data based on sortColumn/sortDirection
  const sortedData = React.useMemo(() => {
    if (sortColumn && sortDirection) {
      const result = [...filteredData].sort((a, b) => {
        const av = a[sortColumn];
        const bv = b[sortColumn];
        // Handle null/undefined
        if (av == null && bv == null) return 0;
        if (av == null) return sortDirection === 'asc' ? 1 : -1;
        if (bv == null) return sortDirection === 'asc' ? -1 : 1;
        // Handle string and number
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDirection === 'asc' ? av - bv : bv - av;
        }
        const avStr = av.toString();
        const bvStr = bv.toString();
        if (avStr === bvStr) return 0;
        if (sortDirection === 'asc') return avStr < bvStr ? -1 : 1;
        return avStr > bvStr ? -1 : 1;
      });
      return result;
    }
    return filteredData;
  }, [filteredData, sortColumn, sortDirection]);

  React.useEffect(() => {
    setTableData(sortedData);
    setCurrentPage(1);
  }, [sortedData]);

  const totalPages = React.useMemo(() => Math.max(1, Math.ceil(tableData.length / pageSize)), [tableData, pageSize]);

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

  const baseColumns: BaseTableBlockColumn<TableRowData>[] = columns
    .filter(c => visibleColumns.includes(c.accessor))
    .map(c => ({
      header: c.header,
      accessor: c.accessor,
      sortable: c.sortable,
      cell: c.cell,
    }));

  const handleSelectionChange = (rows: TableRowData[]) => {
    setSelectedRows(rows);
    if (onSelectionChange) onSelectionChange(rows);
  };

  const handleSortChange = (col: string, dir: 'asc' | 'desc' | null) => {
    setSortColumn(dir ? col : null);
    setSortDirection(dir);
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
                {columns.filter(c => c.sortable).map(col => (
                  <label key={col.accessor} style={{ display: 'block', marginBottom: 6, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sort-column"
                      checked={sortColumn === col.accessor}
                      aria-label={col.header}
                      onChange={() => {
                        setSortColumn(col.accessor);
                        setSortDirection(dir => dir ?? 'asc');
                      }}
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
                    disabled={!sortColumn}
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
                    disabled={!sortColumn}
                  >Desc</button>
                </div>
                <button
                  type="button"
                  style={{
                    padding: '4px 12px',
                    borderRadius: 4,
                    border: '1px solid #e5e7eb',
                    background: '#f3f4f6',
                    color: '#2563eb',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                    marginTop: 10
                  }}
                  onClick={() => { setSortColumn(null); setSortDirection(null); }}
                >
                  Clear sorting
                </button>
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
          <Button size="sm" variant="light" disabled={selectedRows.length === 0}>Selected Actions</Button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {caption && (
          <Text size="sm" color="foreground-muted" style={{ padding: compact ? 'var(--hero-spacing-1)' : 'var(--hero-spacing-2)' }}>
            {caption}
          </Text>
        )}
        <BaseTableBlock
          key={`table-${sortColumn || 'none'}-${sortDirection || 'none'}`}
          columns={baseColumns}
          data={pagedData}
          selectable={selectable}
          multiSelect={multiSelect}
          selectedRows={selectedRows}
          onSelectionChange={handleSelectionChange}
          sortColumn={sortColumn || undefined}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          className={compact ? 'text-sm' : undefined}
        />
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