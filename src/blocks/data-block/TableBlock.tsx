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

  // Use pageNumber from props for initial state, but let BaseTableBlock handle the pagination
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
    // Page will reset automatically in BaseTableBlock when data changes
  }, [sortedData]);

  // Pagination is now handled by BaseTableBlock

  const baseColumns: BaseTableBlockColumn<TableRowData>[] = columns
    .filter(c => visibleColumns.includes(c.accessor))
    .map(c => ({
      header: c.header,
      accessor: c.accessor,
      sortable: c.sortable,
      cell: c.cell,
    }));

  const handleMenuSortItemClick = (accessor: string) => {
    let newDirection: 'asc' | 'desc' | null = 'asc';
    if (sortColumn === accessor) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null; // Clear sorting
      } else {
        // If sortDirection is null but sortColumn is accessor, it means it was just cleared.
        // A new click should sort asc, which is the default for newDirection.
        newDirection = 'asc'; 
      }
    } else {
      // New column selected for sorting, default to 'asc'
      newDirection = 'asc';
    }

    handleSortChange(accessor, newDirection);
    setOpenDropdown(null); // Close dropdown
  };

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
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                  zIndex: 10,
                  padding: 'var(--hero-spacing-1)',
                  minWidth: 180
                }}
              >
                {columns.filter(c => c.sortable).map(col => (
                  <div
                    key={col.accessor}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleMenuSortItemClick(col.accessor)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleMenuSortItemClick(col.accessor);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 4,
                      backgroundColor: sortColumn === col.accessor ? '#eff6ff' : 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = sortColumn === col.accessor ? '#e0e7ff' : '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sortColumn === col.accessor ? '#eff6ff' : 'transparent')}
                  >
                    {col.header}
                    {sortColumn === col.accessor && sortDirection === 'asc' && 
                      <Icon icon="heroicons-outline:arrow-up" className="w-4 h-4 text-blue-600" />}
                    {sortColumn === col.accessor && sortDirection === 'desc' && 
                      <Icon icon="heroicons-outline:arrow-down" className="w-4 h-4 text-blue-600" />}
                  </div>
                ))}
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
          data={tableData}
          selectable={selectable}
          multiSelect={multiSelect}
          selectedRows={selectedRows}
          onSelectionChange={handleSelectionChange}
          sortColumn={sortColumn || undefined}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          className={compact ? 'text-sm' : undefined}
          pageSize={pageSize}
          pageNumber={pageNumber}
          showPagination={true}
        />
      </div>
      {/* Pagination is now handled by BaseTableBlock */}
    </Card>
  );
};