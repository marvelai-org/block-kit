import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className: string }) => (
    <svg data-icon={icon} className={className} />
  ),
}));
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

  describe('Sort Menu Functionality', () => {
    beforeEach(() => {
      render(<TableBlock id="test-table" columns={columns} data={data} />);
      const sortButton = screen.getByRole('button', { name: /Sort/i });
      fireEvent.click(sortButton); // Open the sort menu
    });

    it('opens and displays only sortable columns', () => {
      // Menu is opened in beforeEach
      expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Age' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Status' })).not.toBeInTheDocument();
    });

    it('sorts by a column (Name) in ascending, then descending, then clears sort', async () => {
      // Menu is open from beforeEach
      let nameSortItem = screen.getByRole('button', { name: 'Name' });

      // 1. Sort Ascending by Name
      fireEvent.click(nameSortItem); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Alice');
        expect(rows[2]).toHaveTextContent('Bob');
        expect(rows[3]).toHaveTextContent('Charlie');
      });
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); // Re-open menu
      nameSortItem = screen.getByRole('button', { name: 'Name' }); // Re-fetch item
      expect(nameSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-up"]')).toBeInTheDocument();

      // 2. Sort Descending by Name (Menu is currently open, nameSortItem is fresh)
      fireEvent.click(nameSortItem); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Charlie');
        expect(rows[2]).toHaveTextContent('Bob');
        expect(rows[3]).toHaveTextContent('Alice');
      });
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); // Re-open menu
      nameSortItem = screen.getByRole('button', { name: 'Name' }); // Re-fetch item
      expect(nameSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-down"]')).toBeInTheDocument();
      
      // 3. Clear Sort for Name (Menu is currently open, nameSortItem is fresh)
      fireEvent.click(nameSortItem); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Alice');
        expect(rows[2]).toHaveTextContent('Bob');
        expect(rows[3]).toHaveTextContent('Charlie');
      });
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); // Re-open menu
      nameSortItem = screen.getByRole('button', { name: 'Name' }); // Re-fetch item
      expect(nameSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-up"]')).not.toBeInTheDocument();
      expect(nameSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-down"]')).not.toBeInTheDocument();
    });

    it('switches sort to a different column (Age) correctly', async () => {
      // Menu is open from beforeEach
      const nameSortItem = screen.getByRole('button', { name: 'Name' });
      
      // First, sort by Name ASC to establish an initial sort state
      fireEvent.click(nameSortItem); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        expect(screen.getAllByRole('row')[1]).toHaveTextContent('Alice');
      });
      // Re-open menu to check/continue
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); 
      // nameSortItem needs to be re-fetched if we were to check its icon, but we are switching columns.

      // Now sort by Age ASC (Menu is currently open)
      const ageSortItem = screen.getByRole('button', { name: 'Age' });
      fireEvent.click(ageSortItem); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Bob');
        expect(rows[2]).toHaveTextContent('Alice');
        expect(rows[3]).toHaveTextContent('Charlie');
      });
      // Re-open menu, re-fetch items, check icons
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); 
      const freshAgeSortItem = screen.getByRole('button', { name: 'Age' });
      const freshNameSortItem = screen.getByRole('button', { name: 'Name' });
      expect(freshAgeSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-up"]')).toBeInTheDocument();
      expect(freshNameSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-up"]')).not.toBeInTheDocument();
      expect(freshNameSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-down"]')).not.toBeInTheDocument();
    });

    it('sorts by Age using Enter key, then Space key for descending', async () => {
      // Menu is open from beforeEach
      let ageSortItem = screen.getByRole('button', { name: 'Age' });

      // 1. Sort Ascending by Age with Enter key
      fireEvent.keyDown(ageSortItem, { key: 'Enter', code: 'Enter' }); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Bob');
      });
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); // Re-open menu
      ageSortItem = screen.getByRole('button', { name: 'Age' }); // Re-fetch item
      expect(ageSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-up"]')).toBeInTheDocument();

      // 2. Sort Descending by Age with Space key (Menu is currently open, ageSortItem is fresh)
      fireEvent.keyDown(ageSortItem, { key: ' ', code: 'Space' }); // Closes menu
      await waitFor(() => { // Wait for table rows to update
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Charlie');
      });
      fireEvent.click(screen.getByRole('button', { name: /Sort/i })); // Re-open menu
      ageSortItem = screen.getByRole('button', { name: 'Age' }); // Re-fetch item
      expect(ageSortItem.querySelector('svg[data-icon="heroicons-outline:arrow-down"]')).toBeInTheDocument();
    });
  });

  describe('Columns Menu Functionality', () => {
    beforeEach(() => {
      render(<TableBlock id="test-table" columns={columns} data={data} />);
      const columnsButton = screen.getByRole('button', { name: /Columns/i });
      fireEvent.click(columnsButton); // Open the columns menu
    });

    it('opens and displays all columns with checkmarks initially', () => {
      // Menu is opened in beforeEach
      const nameItem = screen.getByRole('menuitemcheckbox', { name: 'Name' });
      const ageItem = screen.getByRole('menuitemcheckbox', { name: 'Age' });
      const statusItem = screen.getByRole('menuitemcheckbox', { name: 'Status' });

      expect(nameItem).toBeInTheDocument();
      expect(ageItem).toBeInTheDocument();
      expect(statusItem).toBeInTheDocument();

      expect(nameItem).toHaveAttribute('aria-checked', 'true');
      expect(nameItem.querySelector('svg[data-icon="heroicons-outline:check"]')).toBeInTheDocument();
      expect(ageItem).toHaveAttribute('aria-checked', 'true');
      expect(ageItem.querySelector('svg[data-icon="heroicons-outline:check"]')).toBeInTheDocument();
      expect(statusItem).toHaveAttribute('aria-checked', 'true');
      expect(statusItem.querySelector('svg[data-icon="heroicons-outline:check"]')).toBeInTheDocument();

      // Check table headers
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    });

    it('toggles column visibility (Status) and menu stays open', async () => {
      const statusItem = screen.getByRole('menuitemcheckbox', { name: 'Status' });

      // 1. Hide 'Status'
      fireEvent.click(statusItem);
      expect(screen.getByRole('button', { name: /Columns/i })).toBeInTheDocument(); // Menu button still there, implies menu might be open
      expect(statusItem).toHaveAttribute('aria-checked', 'false');
      expect(statusItem.querySelector('svg[data-icon="heroicons-outline:check"]')).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByRole('columnheader', { name: 'Status' })).not.toBeInTheDocument();
      });
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument(); // Other columns still visible

      // 2. Show 'Status' again
      fireEvent.click(statusItem);
      expect(statusItem).toHaveAttribute('aria-checked', 'true');
      expect(statusItem.querySelector('svg[data-icon="heroicons-outline:check"]')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      });
    });

    it('toggles multiple columns and menu stays open', async () => {
      const ageItem = screen.getByRole('menuitemcheckbox', { name: 'Age' });
      const statusItem = screen.getByRole('menuitemcheckbox', { name: 'Status' });

      // Hide Age
      fireEvent.click(ageItem);
      expect(ageItem).toHaveAttribute('aria-checked', 'false');
      await waitFor(() => expect(screen.queryByRole('columnheader', { name: 'Age' })).not.toBeInTheDocument());

      // Menu should still be open, hide Status
      expect(screen.getByRole('menuitemcheckbox', { name: 'Status' })).toBeInTheDocument(); // Check if statusItem is still in DOM (menu open)
      fireEvent.click(statusItem);
      expect(statusItem).toHaveAttribute('aria-checked', 'false');
      await waitFor(() => expect(screen.queryByRole('columnheader', { name: 'Status' })).not.toBeInTheDocument());

      // Name should still be visible
      const nameItem = screen.getByRole('menuitemcheckbox', { name: 'Name' });
      expect(nameItem).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    });

    it('toggles column visibility with keyboard (Enter and Space)', async () => {
      const ageItem = screen.getByRole('menuitemcheckbox', { name: 'Age' });

      // Hide 'Age' with Enter
      fireEvent.keyDown(ageItem, { key: 'Enter', code: 'Enter' });
      expect(ageItem).toHaveAttribute('aria-checked', 'false');
      await waitFor(() => expect(screen.queryByRole('columnheader', { name: 'Age' })).not.toBeInTheDocument());
      // Menu should still be open
      expect(screen.getByRole('menuitemcheckbox', { name: 'Name' })).toBeInTheDocument();

      // Show 'Age' again with Space
      fireEvent.keyDown(ageItem, { key: ' ', code: 'Space' });
      expect(ageItem).toHaveAttribute('aria-checked', 'true');
      await waitFor(() => expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument());
    });
  });
});
