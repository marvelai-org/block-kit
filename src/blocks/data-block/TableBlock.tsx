import React, { useEffect } from 'react';
import { Card } from '@heroui/react';
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
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange,
  ...props
}) => {
  const [tableData, setTableData] = React.useState(data);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);

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
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span style={{ marginLeft: 'var(--hero-spacing-1)' }}>
                        {sortDirection === 'asc' ? <ChevronDownIcon /> : (sortDirection === 'desc' ? <ChevronUpIcon /> : <SelectorIcon />)}
                      </span>
                    )}
                  </span>
                </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  ...(striped && rowIndex % 2 === 1 ? { backgroundColor: 'var(--hero-color-muted-50)' } : {}),
                  ...(hoverable ? { ':hover': { backgroundColor: 'var(--hero-color-muted-100)' } } : {})
                }}
              >
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
                  colSpan={columns.length}
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
    </Card>
  );
};