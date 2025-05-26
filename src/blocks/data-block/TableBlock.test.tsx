import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TableBlock, TableColumn, TableRowData } from './TableBlock';

const columns: TableColumn[] = [
  { header: 'Name', accessor: 'name', sortable: true },
  { header: 'Age', accessor: 'age', sortable: true },
  { header: 'Status', accessor: 'status' },
];

const data: TableRowData[] = [
  { name: 'Alice', age: 30, status: 'Active' },
  { name: 'Bob', age: 25, status: 'Inactive' },
  { name: 'Charlie', age: 35, status: 'Active' },
];

describe('TableBlock', () => {
  it('renders table headers and rows', () => {
    render(<TableBlock id="test-table" columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders sort icons for sortable columns', () => {
    render(<TableBlock id="test-table" columns={columns} data={data} />);
    const nameHeader = screen.getByText('Name').closest('th');
    const ageHeader = screen.getByText('Age').closest('th');
    const statusHeader = screen.getByText('Status').closest('th');
    // Should have icon for sortable columns only
    expect(nameHeader?.querySelector('svg')).toBeInTheDocument();
    expect(ageHeader?.querySelector('svg')).toBeInTheDocument();
    expect(statusHeader?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('calls onSelectionChange when a row is selected (single select)', () => {
    const onSelectionChange = vi.fn();
    render(
      <TableBlock
        id="test-table"
        columns={columns}
        data={data}
        selectable
        multiSelect={false}
        onSelectionChange={onSelectionChange}
      />
    );
    // Find the first row's checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // first row (0 is select-all)
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('renders action buttons if actions column is provided', () => {
    const columnsWithAction: TableColumn[] = [
      ...columns,
      {
        header: 'Actions',
        accessor: 'actions',
        cell: () => <button aria-label="edit">Edit</button>,
      },
    ];
    render(<TableBlock id="test-table" columns={columnsWithAction} data={data} />);
    expect(screen.getAllByRole('button', { name: 'edit' })[0]).toBeInTheDocument();
  });

  it('sorts data via sort menu', async () => {
    render(<TableBlock id="test-table" columns={columns} data={data} />);
    fireEvent.click(screen.getByRole('button', { name: /Sort/i }));
    fireEvent.click(screen.getByLabelText('Age'));
    await waitFor(() => {
      const ascRows = screen.getAllByRole('row');
      expect(ascRows[1]).toHaveTextContent('Bob');
      expect(ascRows[2]).toHaveTextContent('Alice');
      expect(ascRows[3]).toHaveTextContent('Charlie');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Desc' }));
    await waitFor(() => {
      const descRows = screen.getAllByRole('row');
      expect(descRows[1]).toHaveTextContent('Charlie');
      expect(descRows[2]).toHaveTextContent('Alice');
      expect(descRows[3]).toHaveTextContent('Bob');
    });
    fireEvent.click(screen.getByLabelText('Name'));
    fireEvent.click(screen.getByRole('button', { name: 'Asc' }));
    await waitFor(() => {
      const nameRows = screen.getAllByRole('row');
      expect(nameRows[1]).toHaveTextContent('Alice');
      expect(nameRows[2]).toHaveTextContent('Bob');
      expect(nameRows[3]).toHaveTextContent('Charlie');
    });
  });
});
