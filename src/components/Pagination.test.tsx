// React is imported for JSX support
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination, PageNumbers, PaginationControls } from './Pagination';

describe('PageNumbers', () => {
  it('renders page number controls correctly', () => {
    render(
      <PageNumbers
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText('First page')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    
    // Page numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument(); // Ellipsis between 3 and 5
  });

  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(
      <PageNumbers
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('disables first and previous buttons on first page', () => {
    render(
      <PageNumbers
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('calls onPageChange with correct page number when buttons are clicked', () => {
    const onPageChange = vi.fn();
    render(
      <PageNumbers
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    
    // Click on first page button
    fireEvent.click(screen.getByLabelText('First page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    // Click on previous page button
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    
    // Click on a specific page number
    fireEvent.click(screen.getByText('5'));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <PageNumbers
        currentPage={5}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(2); // Ellipses before page 4 and after page 6
    
    // Should show pages 1, ..., 4, 5, 6, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Current page
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });
});

describe('PaginationControls', () => {
  it('renders previous and next buttons', () => {
    render(
      <PaginationControls
        currentPage={2}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(
      <PaginationControls
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('disables previous button on first page', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <PaginationControls
        currentPage={5}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByText('Previous')).not.toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('calls onPageChange with correct page number when buttons are clicked', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    
    // Click on previous button
    fireEvent.click(screen.getByText('Previous'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    
    // Click on next button
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});

describe('Pagination', () => {
  it('combines PageNumbers and PaginationControls', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    // Should contain both page numbers and controls
    expect(screen.getByLabelText('First page')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('disables first and previous buttons on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText('First page')).toBeDisabled();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText('First page')).not.toBeDisabled();
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByText('Next')).toBeDisabled();
  });

  it('calls onPageChange with correct page number when buttons are clicked', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );
    
    // Click on first page button
    fireEvent.click(screen.getByLabelText('First page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    // Click on previous page button
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    
    // Click on next page button
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(4);
    
    // Click on a specific page number
    fireEvent.click(screen.getByText('5'));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(2); // Ellipses before page 4 and after page 6
    
    // Should show pages 1, ..., 4, 5, 6, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Current page
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('handles edge case with current page near start', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    
    // Should show pages 1, 2, 3, ..., 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(1); // Only one ellipsis after page 3
  });

  it('handles edge case with current page near end', () => {
    render(
      <Pagination
        currentPage={9}
        totalPages={10}
        onPageChange={() => {}}
      />
    );
    
    // Should show pages 1, ..., 8, 9, 10
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBe(1); // Only one ellipsis before page 8
  });
});
