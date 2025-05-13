import React from 'react';

export interface BaseTableBlockColumn<T> {
  header: React.ReactNode;
  accessor: keyof T | string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
}

export interface BaseTableBlockProps<T> {
  columns: BaseTableBlockColumn<T>[];
  data: T[];
  className?: string;
  style?: React.CSSProperties;
}

export function BaseTableBlock<T extends Record<string, any>>({
  columns,
  data,
  className,
  style
}: BaseTableBlockProps<T>) {
  return (
    <table className={className} style={style}>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => (
              <td key={colIdx}>
                {col.cell ? col.cell(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
