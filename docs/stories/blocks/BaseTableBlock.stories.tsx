import type { Meta, StoryObj } from '@storybook/react';
import { BaseTableBlock, BaseTableBlockColumn } from '@/blocks/data-block/BaseTableBlock';

import { fn } from '@storybook/test';

const meta: Meta<typeof BaseTableBlock> = {
  title: 'Blocks/Data/BaseTableBlock',
  component: BaseTableBlock,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'object' },
    data: { control: 'object' },
    className: { control: 'text' },
    style: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof BaseTableBlock<TableRowData>>;

// Define a type that matches the constraints of BaseTableBlock's generic type
interface TableRowData {
  id?: string | number;
  name: string;
  age: number;
  status: string;
  [key: string]: unknown;
}

const columns: BaseTableBlockColumn<TableRowData>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Age', accessor: 'age' },
  { header: 'Status', accessor: 'status' },
];

const data = [
  { name: 'John Doe', age: 28, status: 'Active' },
  { name: 'Caleb Stone', age: 34, status: 'Inactive' },
  { name: 'Bob Johnson', age: 45, status: 'Active' },
];

export const Basic: Story = {
  args: {
    columns,
    data,
    onSelectionChange: fn(),
    onSortChange: fn(),
  },
};

export const WithCustomCells: Story = {
  args: {
    columns: [
      { header: 'Name', accessor: 'name', cell: (row: TableRowData) => <b>{row.name}</b> },
      { header: 'Age', accessor: 'age', cell: (row: TableRowData) => <span style={{ color: Number(row.age) > 30 ? 'red' : 'green' }}>{row.age}</span> },
      { header: 'Status', accessor: 'status' },
    ],
    data,
    onSelectionChange: fn(),
    onSortChange: fn(),
  },
};



export const MultiSelect: Story = {
  args: {
    columns,
    data,
    selectable: true,
    multiSelect: true,
    onSelectionChange: fn(),
    onSortChange: fn(),
  },
};



export const Sortable: Story = {
  args: {
    columns: columns.map(col => ({ ...col, sortable: true })),
    data,
    onSelectionChange: fn(),
    onSortChange: fn(),
  },
};
