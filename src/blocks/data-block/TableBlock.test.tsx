import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @iconify/react
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, className }: { icon: string; className: string }) => (
    <svg data-icon={icon} className={className} />
  ),
}));
import { TableBlock, TableColumn, TableRowData, FilterGroup, ALL_FILTER_VALUE } from './TableBlock';

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

const dataForFiltering: TableRowData[] = [
  { id: 1, name: 'Alice', age: 30, status: 'Active', type: 'Employee', startDate: '2023-01-15' },
  { id: 2, name: 'Bob', age: 25, status: 'Inactive', type: 'Contractor', startDate: '2023-02-20' },
  { id: 3, name: 'Charlie', age: 35, status: 'Active', type: 'Employee', startDate: '2022-11-10' },
  { id: 4, name: 'David', age: 28, status: 'Active', type: 'Contractor', startDate: '2023-03-01' },
  { id: 5, name: 'Eve', age: 40, status: 'Paused', type: 'Employee', startDate: '2021-07-25' },
];

const sampleFilterGroups: FilterGroup<TableRowData>[] = [
  {
    id: 'workerType',
    name: 'Worker Type',
    options: [
      { label: 'Employee', value: 'employee', filterFn: (row) => row.type === 'Employee' },
      { label: 'Contractor', value: 'contractor', filterFn: (row) => row.type === 'Contractor' },
    ],
  },
  {
    id: 'status',
    name: 'Status',
    options: [
      { label: 'Active', value: 'active', filterFn: (row) => row.status === 'Active' },
      { label: 'Inactive', value: 'inactive', filterFn: (row) => row.status === 'Inactive' },
      { label: 'Paused', value: 'paused', filterFn: (row) => row.status === 'Paused' },
    ],
  },
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

  describe('Filter Menu Functionality', () => {
    it('renders filter button if filterGroups are provided, not otherwise', () => {
      const { rerender } = render(
        <TableBlock id="test-filter" columns={columns} data={dataForFiltering} filterGroups={sampleFilterGroups} />
      );
      expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();

      rerender(<TableBlock id="test-filter-no-groups" columns={columns} data={dataForFiltering} />);
      expect(screen.queryByRole('button', { name: /Filter/i })).not.toBeInTheDocument();
    });

    describe('when filter menu is open', () => {
      beforeEach(() => {
        render(<TableBlock id="test-filter" columns={columns} data={dataForFiltering} filterGroups={sampleFilterGroups} />);
        const filterButton = screen.getByRole('button', { name: /Filter/i });
        fireEvent.click(filterButton);
      });

      it('opens filter menu, displays groups, and "All" is selected by default for each', () => {
        const filterDropdown = screen.getByTestId('filter-dropdown');
        expect(within(filterDropdown).getByText('Worker Type')).toBeInTheDocument();
        expect(within(filterDropdown).getByText('Status')).toBeInTheDocument();

        // Check that "All" is selected by default for Worker Type group
        const workerTypeGroup = within(filterDropdown).getByText('Worker Type').closest('div');
        expect(workerTypeGroup).not.toBeNull();
        const workerTypeAll = workerTypeGroup!.querySelector(`input[type="radio"][value="${ALL_FILTER_VALUE}"]`) as HTMLInputElement;
        expect(workerTypeAll.checked).toBe(true);

        // Check that "All" is selected by default for Status group
        const statusGroup = within(filterDropdown).getByText('Status').closest('div');
        expect(statusGroup).not.toBeNull();
        const statusAll = statusGroup!.querySelector(`input[type="radio"][value="${ALL_FILTER_VALUE}"]`) as HTMLInputElement;
        expect(statusAll.checked).toBe(true);

        // All data rows should be visible initially
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('David')).toBeInTheDocument();
        expect(screen.getByText('Eve')).toBeInTheDocument();
      });

      it('applies a filter (Worker Type: Employee), menu stays open, table updates', async () => {
        const workerTypeGroup = screen.getByText('Worker Type').closest('div');
        const employeeRadio = workerTypeGroup!.querySelector('input[type="radio"][value="employee"]') as HTMLInputElement;
        fireEvent.click(employeeRadio);

        // Menu should still be open
        expect(screen.getByText('Worker Type')).toBeInTheDocument(); 
        expect(employeeRadio.checked).toBe(true);

        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument(); // Employee
          expect(screen.queryByText('Bob')).not.toBeInTheDocument(); // Contractor
          expect(screen.getByText('Charlie')).toBeInTheDocument(); // Employee
          expect(screen.queryByText('David')).not.toBeInTheDocument(); // Contractor
          expect(screen.getByText('Eve')).toBeInTheDocument(); // Employee
        });
      });

      it('changes filter within the same group (Worker Type: Contractor), table updates', async () => {
        const workerTypeGroup = screen.getByText('Worker Type').closest('div');
        const employeeRadio = workerTypeGroup!.querySelector('input[type="radio"][value="employee"]') as HTMLInputElement;
        const contractorRadio = workerTypeGroup!.querySelector('input[type="radio"][value="contractor"]') as HTMLInputElement;

        // First apply Employee filter
        fireEvent.click(employeeRadio);
        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
          expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });

        // Now change to Contractor
        fireEvent.click(contractorRadio);
        expect(screen.getByText('Worker Type')).toBeInTheDocument(); // Menu still open
        expect(contractorRadio.checked).toBe(true);
        expect(employeeRadio.checked).toBe(false);

        await waitFor(() => {
          expect(screen.queryByText('Alice')).not.toBeInTheDocument();
          expect(screen.getByText('Bob')).toBeInTheDocument(); // Contractor
          expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
          expect(screen.getByText('David')).toBeInTheDocument(); // Contractor
          expect(screen.queryByText('Eve')).not.toBeInTheDocument();
        });
      });

      it('clears a filter by selecting "All" for a group, table updates', async () => {
        const workerTypeGroup = screen.getByText('Worker Type').closest('div');
        const employeeRadio = workerTypeGroup!.querySelector('input[type="radio"][value="employee"]') as HTMLInputElement;
        const allWorkerRadio = workerTypeGroup!.querySelector(`input[type="radio"][value="${ALL_FILTER_VALUE}"]`) as HTMLInputElement;

        // Apply Employee filter
        fireEvent.click(employeeRadio);
        await waitFor(() => {
          expect(screen.queryByText('Bob')).not.toBeInTheDocument(); // Contractor hidden
        });

        // Select "All" for Worker Type
        fireEvent.click(allWorkerRadio);
        expect(screen.getByText('Worker Type')).toBeInTheDocument(); // Menu still open
        expect(allWorkerRadio.checked).toBe(true);

        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
          expect(screen.getByText('Bob')).toBeInTheDocument(); // Contractor now visible
          expect(screen.getByText('Charlie')).toBeInTheDocument();
          expect(screen.getByText('David')).toBeInTheDocument();
          expect(screen.getByText('Eve')).toBeInTheDocument();
        });
      });

      it('applies filters from multiple groups (Worker Type: Employee AND Status: Active)', async () => {
        const filterDropdown = screen.getByTestId('filter-dropdown');
        const workerTypeGroup = within(filterDropdown).getByText('Worker Type').closest('div');
        const employeeRadio = workerTypeGroup!.querySelector('input[type="radio"][value="employee"]') as HTMLInputElement;
        
        const statusGroup = within(filterDropdown).getByText('Status').closest('div');
        const activeRadio = statusGroup!.querySelector('input[type="radio"][value="active"]') as HTMLInputElement;

        fireEvent.click(employeeRadio);
        fireEvent.click(activeRadio);

        expect(screen.getByText('Worker Type')).toBeInTheDocument(); // Menu still open
        expect(employeeRadio.checked).toBe(true);
        expect(activeRadio.checked).toBe(true);

        await waitFor(() => {
          // Only Alice (Employee, Active) and Charlie (Employee, Active) should be visible
          expect(screen.getByText('Alice')).toBeInTheDocument();
          expect(screen.queryByText('Bob')).not.toBeInTheDocument(); // Contractor, Inactive
          expect(screen.getByText('Charlie')).toBeInTheDocument();
          expect(screen.queryByText('David')).not.toBeInTheDocument(); // Contractor, Active
          expect(screen.queryByText('Eve')).not.toBeInTheDocument(); // Employee, Paused
        });
      });

      it('interacts correctly with global search (search on filtered data)', async () => {
        const workerTypeGroup = screen.getByText('Worker Type').closest('div');
        const employeeRadio = workerTypeGroup!.querySelector('input[type="radio"][value="employee"]') as HTMLInputElement;
        fireEvent.click(employeeRadio); // Filter by Employee: Alice, Charlie, Eve

        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
          expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });

        // Menu is still open, search input is outside the menu
        // To simplify, let's assume the menu closes or we interact outside
        // For this test, let's close the menu to ensure search input is easily accessible
        const filterButton = screen.getByRole('button', { name: /Filter/i });
        fireEvent.click(filterButton); // Close the filter menu
        expect(screen.queryByText('Worker Type')).not.toBeInTheDocument(); // Menu closed

        const searchInput = screen.getByLabelText('Search');
        fireEvent.change(searchInput, { target: { value: 'Alice' } });

        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
          expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
          expect(screen.queryByText('Eve')).not.toBeInTheDocument();
        });
      });

      it('interacts correctly with sorting (sort on filtered data)', async () => {
        const workerTypeGroup = screen.getByText('Worker Type').closest('div');
        const employeeRadio = workerTypeGroup!.querySelector('input[type="radio"][value="employee"]') as HTMLInputElement;
        fireEvent.click(employeeRadio); // Filter by Employee: Alice (30), Charlie (35), Eve (40)

        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
          expect(screen.getByText('Charlie')).toBeInTheDocument();
          expect(screen.getByText('Eve')).toBeInTheDocument();
          expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        });

        // Close the filter menu
        const filterButton = screen.getByRole('button', { name: /Filter/i });
        fireEvent.click(filterButton);
        expect(screen.queryByText('Worker Type')).not.toBeInTheDocument(); // Menu closed

        // Open Sort menu and sort by Age ascending
        const sortButton = screen.getByRole('button', { name: /Sort/i });
        fireEvent.click(sortButton);
        const ageSortItem = screen.getByRole('button', { name: 'Age' });
        fireEvent.click(ageSortItem); // Sorts by Age ASC, closes sort menu

        await waitFor(() => {
          const rows = screen.getAllByRole('row');
          // Headers + Alice (30), Charlie (35), Eve (40)
          expect(rows[1]).toHaveTextContent('Alice'); // Age 30
          expect(rows[2]).toHaveTextContent('Charlie'); // Age 35
          expect(rows[3]).toHaveTextContent('Eve'); // Age 40
        });
      });
    });
  });

  describe('Selected Actions Menu', () => {
    it('shows button only when rows selected and actions provided', async () => {
      const mockHandler = vi.fn();
      render(
        <TableBlock
          id="action-test"
          columns={columns}
          data={data}
          selectable
          actions={[{ label: 'Custom', handler: mockHandler }]}
        />
      );

      // Initially button should NOT be in the document
      expect(screen.queryByRole('button', { name: /Selected Actions/i })).not.toBeInTheDocument();

      // Select the first row
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // first data row

      // Wait for re-render
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selected Actions/i })).toBeInTheDocument();
      });
    });

    it('executes handler with selected rows when action clicked', async () => {
      const mockHandler = vi.fn();
      render(
        <TableBlock
          id="action-test-2"
          columns={columns}
          data={data}
          selectable
          actions={[{ label: 'Do Something', handler: mockHandler }]}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      // Open actions menu
      fireEvent.click(await screen.findByRole('button', { name: /Selected Actions/i }));

      // Click menu item
      const menuItem = await screen.findByRole('menuitem', { name: 'Do Something' });
      fireEvent.click(menuItem);

      // Handler called with selected row (data[0])
      expect(mockHandler).toHaveBeenCalledWith([data[0]]);
    });
  });
});
