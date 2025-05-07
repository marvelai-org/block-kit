// TableBlock.types.ts
// Type definitions for TableBlock component

import { ReactNode } from 'react';

export type TableColumn<T> = {
  Header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (value: any, row: T) => ReactNode;
  width?: number | string;
  // Extend as needed for custom features
};

export type TableBlockProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  onRowSelect?: (selectedRows: T[]) => void;
  // Extend as needed for actions, theming, etc.
};
