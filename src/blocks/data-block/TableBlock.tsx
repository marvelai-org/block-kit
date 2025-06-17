import React from 'react';
import { Card, Button, Input } from '@heroui/react';
import { Text } from '../../components/Text';
import { BlockProps } from '../../types';
import { Icon } from '@iconify/react';
import { BaseTableBlock, BaseTableBlockColumn } from './BaseTableBlock';

export type TableRowData = Record<string, string | number | boolean | null | undefined>;

export const ALL_FILTER_VALUE = "__all__";

export interface FilterOption<T extends TableRowData = TableRowData> {
  label: string;
  value: string;
  filterFn?: (row: T) => boolean;
}

export interface FilterGroup<T extends TableRowData = TableRowData> {
  id: string; // Unique ID for the filter group (e.g., "workerType")
  name: string; // Display name for the group (e.g., "Worker Type")
  options: FilterOption<T>[]; // Developer-provided filter options for this group
}

export interface TableColumn {
  header: string;
  accessor: string;
  cell?: (info: TableRowData) => React.ReactNode;
  sortable?: boolean;
  Filter?: (info: TableRowData) => boolean;
}

export interface TableAction<T extends TableRowData = TableRowData> {
  label: string;
  handler: (selected: T[]) => void;
  hidden?: (selected: T[]) => boolean;
  disabled?: (selected: T[]) => boolean;
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
  filterGroups?: FilterGroup<TableRowData>[];
  actions?: TableAction<TableRowData>[];
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
  filterGroups: filterGroupsProp, // Renamed prop from destructuring
  actions = [],
  ...props
}) => {
  // Create a stable reference for filterGroups, especially for the default empty array case
  const filterGroups = React.useMemo(() => filterGroupsProp || [], [filterGroupsProp]);

  const [openDropdown, setOpenDropdown] = React.useState<null | "sort" | "columns" | "filter" | "actions">(null);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const columnsDropdownRef = React.useRef<HTMLDivElement>(null);
  const filterDropdownRef = React.useRef<HTMLDivElement>(null);
  const actionsDropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!openDropdown) return;
    function handle(e: MouseEvent) {
      const sortEl = sortDropdownRef.current;
      const columnsEl = columnsDropdownRef.current;
      const filterEl = filterDropdownRef.current;
      const actionsEl = actionsDropdownRef.current;
      if (
        (openDropdown === "sort" && sortEl && !sortEl.contains(e.target as Node)) ||
        (openDropdown === "columns" && columnsEl && !columnsEl.contains(e.target as Node)) ||
        (openDropdown === "filter" && filterEl && !filterEl.contains(e.target as Node)) ||
        (openDropdown === "actions" && actionsEl && !actionsEl.contains(e.target as Node))
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
    setVisibleColumns(prevVisibleColumns =>
      prevVisibleColumns.includes(accessor)
        ? prevVisibleColumns.filter(a => a !== accessor)
        : [...prevVisibleColumns, accessor]
    );
  };

  // Use pageNumber from props for initial state, but let BaseTableBlock handle the pagination
  const [selectedRows, setSelectedRows] = React.useState<TableRowData[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const initialFilters: Record<string, string> = {};
    if (filterGroups && filterGroups.length > 0) {
      filterGroups.forEach(group => {
        initialFilters[group.id] = ALL_FILTER_VALUE;
      });
    }
    setActiveFilters(initialFilters);
  }, [filterGroups]);

  // Compose filtering and sorting
  const dataAfterGlobalFilters = React.useMemo(() => {
    if (!filterGroups || filterGroups.length === 0 || Object.keys(activeFilters).length === 0) {
      return data;
    }

    return data.filter(row => {
      return filterGroups.every(group => {
        const selectedOptionValue = activeFilters[group.id];
        if (!selectedOptionValue || selectedOptionValue === ALL_FILTER_VALUE) {
          return true; // No filter applied for this group or 'All' is selected
        }

        const selectedOption = group.options.find(opt => opt.value === selectedOptionValue);
        if (selectedOption && selectedOption.filterFn) {
          return selectedOption.filterFn(row);
        }
        return true; // Should not happen if data is consistent, but default to true
      });
    });
  }, [data, filterGroups, activeFilters]);

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return dataAfterGlobalFilters;
    return dataAfterGlobalFilters.filter(row =>
      columns.some(column => {
        const val = row[column.accessor];
        return val != null && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, dataAfterGlobalFilters, columns]);

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
          {/* Filter Dropdown Button */}
          {filterGroups.length > 0 && (
            <div style={{ position: 'relative', display: 'inline-block' }} ref={filterDropdownRef}>
              <Button
                size="sm"
                variant="light"
                aria-haspopup="true"
                aria-expanded={openDropdown === "filter"}
                aria-controls="filter-dropdown"
                onClick={() => setOpenDropdown(openDropdown === "filter" ? null : "filter")}
              >
                <Icon icon="heroicons-outline:funnel" className="w-4 h-4 mr-1" />Filter
              </Button>
              {openDropdown === "filter" && (
                <div
                  id="filter-dropdown"
                  data-testid="filter-dropdown"
                  tabIndex={-1} // Allows focus for ESC key, but not direct tab
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
                    padding: 'var(--hero-spacing-2)', // Slightly more padding for groups
                    minWidth: 220, // Wider for filter options
                    maxHeight: '400px', // Prevent overly long dropdowns
                    overflowY: 'auto', // Scroll if content exceeds maxHeight
                  }}
                >
                  {filterGroups.map(group => (
                    <div key={group.id} style={{ marginBottom: 'var(--hero-spacing-3)' }}>
                      <Text size="sm" weight="medium" style={{ marginBottom: 'var(--hero-spacing-1)' }}>{group.name}</Text>
                      {[ // Prepend 'All' option
                        { label: 'All', value: ALL_FILTER_VALUE, filterFn: undefined }, 
                        ...group.options
                      ].map(option => (
                        <label key={option.value} style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--hero-spacing-0-5)', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={group.id} // Ensures only one radio in the group is selected
                            value={option.value}
                            checked={activeFilters[group.id] === option.value}
                            onChange={() => setActiveFilters(prev => ({ ...prev, [group.id]: option.value }))}
                            style={{ marginRight: 'var(--hero-spacing-1)' }}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {columns.some(col => col.sortable) && (
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
          )}
          <div style={{ position: 'relative', display: 'inline-block' }} ref={columnsDropdownRef}>
            <Button
              size="sm"
              variant="light"
              aria-haspopup="true"
              aria-expanded={openDropdown === "columns"}
              aria-controls="columns-dropdown"
              onClick={() => setOpenDropdown(openDropdown === "columns" ? null : "columns")}
            >
              <Icon icon="heroicons-outline:arrows-right-left" className="w-4 h-4 mr-1" />Columns
            </Button>
            {openDropdown === "columns" && (
              <div
                id="columns-dropdown"
                tabIndex={-1}
                ref={columnsDropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%', // Adjusted top to align with sort menu
                  left: 0,
                  marginTop: 4, // Added margin to align with sort menu
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6, // Matched sort menu
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // Matched sort menu
                  zIndex: 10,
                  padding: 'var(--hero-spacing-1)', // Matched sort menu
                  minWidth: 180
                }}
              >
                {columns.map(col => (
                  <div
                    key={col.accessor}
                    role="menuitemcheckbox"
                    aria-checked={visibleColumns.includes(col.accessor)}
                    tabIndex={0}
                    onClick={() => toggleColumn(col.accessor)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleColumn(col.accessor);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 4,
                      backgroundColor: 'transparent', // Base background
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {col.header}
                    {visibleColumns.includes(col.accessor) && 
                      <Icon icon="heroicons-outline:check" className="w-4 h-4 text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--hero-spacing-2)', alignItems: 'center' }}>
          {selectable && (
            <Text size="sm" className="text-gray-600">
              {selectedRows.length} item{selectedRows.length === 1 ? '' : 's'} selected
            </Text>
          )}
          {selectable && actions.length > 0 && selectedRows.length > 0 && (
            <div style={{ position: 'relative' }} ref={actionsDropdownRef}>
              <Button
                size="sm"
                variant="light"
                onClick={() => setOpenDropdown(openDropdown === 'actions' ? null : 'actions')}
                aria-haspopup="menu"
                aria-expanded={openDropdown === 'actions'}
              >
                Selected Actions <Icon icon="heroicons-outline:chevron-down" className="w-4 h-4" />
              </Button>
              {openDropdown === 'actions' && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '4px',
                    background: '#fff',
                    border: '1px solid var(--hero-color-border)',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 20,
                    minWidth: '160px',
                  }}
                >
                  {actions.map((action, idx) => {
                    const isHidden = action.hidden?.(selectedRows) ?? false;
                    if (isHidden) return null;
                    const isDisabled = action.disabled?.(selectedRows) ?? false;
                    return (
                      <button
                        key={idx}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          if (isDisabled) return;
                          action.handler(selectedRows);
                          setOpenDropdown(null);
                        }}
                        disabled={isDisabled}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 12px',
                          background: 'transparent',
                          border: 'none',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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