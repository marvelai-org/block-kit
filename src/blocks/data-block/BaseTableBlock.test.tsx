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

  it('supports controlled sorting: parent updates sortColumn/sortDirection', () => {
    function ControlledWrapper() {
      const [sortColumn, setSortColumn] = React.useState<string | null>(null);
      const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc' | null>(null);
      // Sort data manually for test
      const sorted = [...data];
      if (sortColumn && sortDirection) {
        sorted.sort((a, b) => {
          const av = a[sortColumn as keyof RowData];
          const bv = b[sortColumn as keyof RowData];
          if (av === bv) return 0;
          if (sortDirection === 'asc') return av < bv ? -1 : 1;
          return av > bv ? -1 : 1;
        });
      }
      return (
        <BaseTableBlock
          columns={columns}
          data={sorted}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={(col, dir) => {
            setSortColumn(col);
            setSortDirection(dir);
          }}
        />
      );
    }
    // Initial: unsorted
    render(<ControlledWrapper />);
    // Click Age header (should sort asc)
    fireEvent.click(screen.getByText('Age'));
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob');
    expect(rows[2]).toHaveTextContent('Alice');
    expect(rows[3]).toHaveTextContent('Charlie');
    // Click Age header again (should sort desc)
    fireEvent.click(screen.getByText('Age'));
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Charlie');
    expect(rows[2]).toHaveTextContent('Alice');
    expect(rows[3]).toHaveTextContent('Bob');
    // Click Name header (should sort by Name asc)
    fireEvent.click(screen.getByText('Name'));
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice');
    expect(rows[2]).toHaveTextContent('Bob');
    expect(rows[3]).toHaveTextContent('Charlie');
  });
});

describe('BaseTableBlock Pagination', () => {
  const manyRows: RowData[] = Array.from({ length: 25 }, (_, i) => ({
    name: `Person ${i + 1}`,
    age: 20 + i,
    status: i % 2 === 0 ? 'Active' : 'Inactive'
  }));

  it('renders without pagination by default', () => {
    render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
      />
    );
    
    // All rows should be rendered
    expect(screen.getAllByRole('row').length).toBe(manyRows.length + 1); // +1 for header row
    expect(screen.queryByLabelText('First page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('renders with pagination when showPagination is true', () => {
    render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={10}
        showPagination={true}
      />
    );
    
    // Only first page of rows should be rendered (10 rows + 1 header)
    expect(screen.getAllByRole('row').length).toBe(11);
    
    // Pagination controls should be visible
    expect(screen.getByLabelText('First page')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('changes page when pagination controls are clicked', () => {
    render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={5}
        showPagination={true}
      />
    );
    
    // First page should show first 5 rows
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.getByText('Person 5')).toBeInTheDocument();
    expect(screen.queryByText('Person 6')).not.toBeInTheDocument();
    
    // Click Next button
    fireEvent.click(screen.getByText('Next'));
    
    // Second page should show next 5 rows
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
    expect(screen.getByText('Person 6')).toBeInTheDocument();
    expect(screen.getByText('Person 10')).toBeInTheDocument();
    
    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    
    // Third page should show rows 11-15
    expect(screen.queryByText('Person 6')).not.toBeInTheDocument();
    expect(screen.getByText('Person 11')).toBeInTheDocument();
    expect(screen.getByText('Person 15')).toBeInTheDocument();
    
    // Click First page button
    fireEvent.click(screen.getByLabelText('First page'));
    
    // Should go back to first page
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.queryByText('Person 11')).not.toBeInTheDocument();
  });

  it('disables pagination buttons appropriately', () => {
    render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={10}
        showPagination={true}
      />
    );
    
    // On first page, Previous and First buttons should be disabled
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
    
    // Go to last page
    fireEvent.click(screen.getByText('3')); // Last page with 10 items per page and 25 total items
    
    // On last page, Next button should be disabled
    expect(screen.getByLabelText('First page')).not.toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('calls onPageChange when page changes', () => {
    const onPageChange = vi.fn();
    render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={10}
        showPagination={true}
        onPageChange={onPageChange}
      />
    );
    
    // Click Next button
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    
    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
    
    // Click Previous button
    fireEvent.click(screen.getByText('Previous'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles page size correctly', () => {
    const { rerender } = render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={5}
        showPagination={true}
      />
    );
    
    // With pageSize=5, should have 5 rows + header
    expect(screen.getAllByRole('row').length).toBe(6);
    
    // Should have 5 pages (25 items / 5 per page = 5 pages)
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Rerender with different page size
    rerender(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={10}
        showPagination={true}
      />
    );
    
    // With pageSize=10, should have 10 rows + header
    expect(screen.getAllByRole('row').length).toBe(11);
    
    // Should have 3 pages (25 items / 10 per page = 3 pages)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('handles controlled pagination with pageNumber prop', () => {
    const { rerender } = render(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={5}
        pageNumber={1}
        showPagination={true}
      />
    );
    
    // First page should show first 5 rows
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.queryByText('Person 6')).not.toBeInTheDocument();
    
    // Update pageNumber prop
    rerender(
      <BaseTableBlock
        columns={columns}
        data={manyRows}
        pageSize={5}
        pageNumber={2}
        showPagination={true}
      />
    );
    
    // Second page should show next 5 rows
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
    expect(screen.getByText('Person 6')).toBeInTheDocument();
  });
});
