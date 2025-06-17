// TableBlock.test.tsx
// Basic tests scaffold for TableBlock component

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TableBlock } from '../TableBlock';

describe('TableBlock', () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Age', accessor: 'age' },
  ];
  const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ];

  it('renders table headers', () => {
    render(<TableBlock id="test-table" columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders table rows', () => {
    render(<TableBlock id="test-table" columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  // Add more tests for sorting, filtering, selection, etc.
});
