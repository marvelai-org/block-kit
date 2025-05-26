import type { Meta, StoryObj } from '@storybook/react';
import { BaseTableBlock, BaseTableBlockColumn } from '@/blocks/data-block/BaseTableBlock';
import React from 'react';
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
type Story = StoryObj<typeof BaseTableBlock>;

const columns: BaseTableBlockColumn<any>[] = [
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
      { header: 'Name', accessor: 'name', cell: row => <b>{row.name}</b> },
      { header: 'Age', accessor: 'age', cell: row => <span style={{ color: row.age > 30 ? 'red' : 'green' }}>{row.age}</span> },
      { header: 'Status', accessor: 'status' },
    ],
    data,
    onSelectionChange: fn(),
    onSortChange: fn(),
  },
};

export const SingleSelect: Story = {
  args: {
    columns,
    data,
    selectable: true,
    multiSelect: false,
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

export const ControlledSelection: Story = {
  render: (args) => {
    const [selectedRows, setSelectedRows] = React.useState([data[0]]);
    return (
      <BaseTableBlock
        {...args}
        selectable
        multiSelect
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onSortChange={fn()}
      />
    );
  },
  args: {
    columns,
    data,
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
