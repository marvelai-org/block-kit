import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BaseTableBlock, BaseTableBlockColumn } from './BaseTableBlock';

interface RowData {
  name: string;
  age: number;
  status: string;
}

const columns: BaseTableBlockColumn<RowData>[] = [
  { header: 'Name', accessor: 'name', sortable: true },
  { header: 'Age', accessor: 'age', sortable: true },
  { header: 'Status', accessor: 'status' },
];

const data: RowData[] = [
  { name: 'Alice', age: 30, status: 'Active' },
  { name: 'Bob', age: 25, status: 'Inactive' },
  { name: 'Charlie', age: 35, status: 'Active' },
];

describe('BaseTableBlock', () => {
  it('renders sort icons only for sortable columns', () => {
    render(
      <BaseTableBlock
        columns={columns}
        data={data}
      />
    );
    // Name and Age are sortable, Status is not
    const nameHeader = screen.getByText('Name').closest('th');
    const ageHeader = screen.getByText('Age').closest('th');
    const statusHeader = screen.getByText('Status').closest('th');
    // Icon SVGs: SelectorIcon, ChevronUpIcon, ChevronDownIcon all have role="img"
    expect(nameHeader?.querySelector('svg')).toBeInTheDocument();
    expect(ageHeader?.querySelector('svg')).toBeInTheDocument();
    expect(statusHeader?.querySelector('svg')).not.toBeInTheDocument();
  });
  it('renders all rows and columns', () => {
    render(<BaseTableBlock columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('calls onSelectionChange when a row is selected (single select)', () => {
    const onSelectionChange = vi.fn();
    render(
      <BaseTableBlock
        columns={columns}
        data={data}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /select row 1/i }));
    expect(onSelectionChange).toHaveBeenCalledWith([data[0]]);
  });

  it('only allows one row to be selected at a time in single select mode', () => {
    const onSelectionChange = vi.fn();
    render(
      <BaseTableBlock
        columns={columns}
        data={data}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );
    // Select first row
    fireEvent.click(screen.getByRole('checkbox', { name: /select row 1/i }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([data[0]]);
    // Select second row
    fireEvent.click(screen.getByRole('checkbox', { name: /select row 2/i }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([data[1]]);
    // Ensure only the second row is selected
    // Select third row
    fireEvent.click(screen.getByRole('checkbox', { name: /select row 3/i }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([data[2]]);
  });

  it('supports multiSelect and select-all', () => {
    const onSelectionChange = vi.fn();
    render(
      <BaseTableBlock
        columns={columns}
        data={data}
        selectable
        multiSelect
        onSelectionChange={onSelectionChange}
      />
    );
    // Select all
    fireEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
    expect(onSelectionChange).toHaveBeenCalledWith(data);
    // Deselect all
    fireEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('renders custom cell content', () => {
    render(
      <BaseTableBlock
        columns={[
          ...columns,
          { header: 'Custom', accessor: 'custom', cell: row => <span>Custom: {row.name}</span> },
        ]}
        data={data.map(d => ({ ...d, custom: d.name }))}
      />
    );
    expect(screen.getByText('Custom: Alice')).toBeInTheDocument();
  });

  it('calls onSortChange when a sortable header is clicked', () => {
    const onSortChange = vi.fn();
    render(
      <BaseTableBlock
        columns={columns}
        data={data}
        sortColumn={null}
        sortDirection={null}
        onSortChange={onSortChange}
      />
    );
    fireEvent.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('supports controlled selection', () => {
    const onSelectionChange = vi.fn();
    render(
      <BaseTableBlock
        columns={columns}
        data={data}
        selectable
        selectedRows={[data[1]]}
        onSelectionChange={onSelectionChange}
      />
    );
    // Row 2 should be checked
    const checkbox = screen.getByRole('checkbox', { name: /select row 2/i });
    expect(checkbox).toBeChecked();
  });
});
