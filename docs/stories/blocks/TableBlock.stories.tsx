import type { Meta, StoryObj } from '@storybook/react';
import { TableBlock, TableRowData } from '@vibing-ai/block-kit';
import { CheckIcon, CloseIcon } from '@heroui/shared-icons';
import React from 'react';

const meta: Meta<typeof TableBlock> = {
  title: 'Blocks/Data/TableBlock',
  component: TableBlock,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'object' },
    data: { control: 'object' },
    striped: { control: 'boolean' },
    bordered: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TableBlock>;

export const Basic: Story = {
  args: {
    id: 'table-block-example',
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Age', accessor: 'age' },
      { header: 'Status', accessor: 'status' },
    ],
    data: [
      { name: 'John Doe', age: 28, status: 'Active' },
      { name: 'Caleb Stone', age: 34, status: 'Inactive' },
      { name: 'Bob Johnson', age: 45, status: 'Active' },
    ],
  },
};

export const WithTitle: Story = {
  args: {
    id: 'table-block-title-example',
    columns: [
      { header: 'Name', accessor: 'name' },
      { header: 'Age', accessor: 'age' },
      { header: 'Status', accessor: 'status' },
    ],
    data: [
      { name: 'John Doe', age: 28, status: 'Active' },
      { name: 'Caleb Stone', age: 34, status: 'Inactive' },
      { name: 'Bob Johnson', age: 45, status: 'Active' },
    ],
    title: 'List of Users',
  },
};

export const Customized: Story = {
  args: {
    id: 'table-block-customized-example',
    columns: [
      { header: 'Name', accessor: 'name', sortable: true },
      { header: 'Age', accessor: 'age' },
      { header: 'Status', accessor: 'status', cell: (info: TableRowData) =>
        info.status === 'Active'
          ? <CheckIcon style={{ color: 'green' }} />
          : <CloseIcon style={{ color: 'red' }} />},
    ],
    data: [
      { name: 'John Doe', age: 28, status: 'Active' },
      { name: 'Bob Johnson', age: 45, status: 'Active' },
      { name: 'Caleb Stone', age: 34, status: 'Inactive' },
    ],
    striped: true,
    bordered: true,
    compact: true,
  },
};