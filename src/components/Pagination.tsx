import React from 'react';

export interface PaginationBaseProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * A component that renders page numbers with ellipsis for large page counts
 */
export const PageNumbers: React.FC<PaginationBaseProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  // Function to generate page numbers with ellipsis for large page counts
  function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    
    if (currentPage <= 2) { 
      startPage = 1; 
      endPage = Math.min(3, totalPages); 
    }
    
    if (currentPage >= totalPages - 1) { 
      endPage = totalPages; 
      startPage = Math.max(1, totalPages - 2); 
    }
    
    const pageNumbers: (number | 'ellipsis')[] = [];
    pageNumbers.push(1);
    
    if (startPage > 2) pageNumbers.push('ellipsis');
    
    for (let p = startPage; p <= endPage; p++) {
      if (p !== 1 && p !== totalPages) pageNumbers.push(p);
    }
    
    if (endPage < totalPages - 1) pageNumbers.push('ellipsis');
    if (totalPages > 1) pageNumbers.push(totalPages);
    
    return pageNumbers;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center bg-gray-100 rounded-full px-1 py-0.5 w-fit shadow-sm ${className || ''}`}>
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="mx-0.5 w-7 h-7 flex items-center justify-center rounded-full border border-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none hover:bg-gray-200 text-base"
        aria-label="First page"
      >
        &laquo;
      </button>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="mx-0.5 w-7 h-7 flex items-center justify-center rounded-full border border-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none hover:bg-gray-200 text-base"
        aria-label="Previous page"
      >
        &lsaquo;
      </button>
      {pageNumbers.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={idx} className="mx-0.5 w-7 h-7 flex items-center justify-center select-none text-base">...</span>
        ) : (
          <button
            key={idx}
            onClick={() => onPageChange(item as number)}
            disabled={item === currentPage}
            className={[
              "mx-0.5 w-7 h-7 flex items-center justify-center rounded-full border border-transparent transition-all duration-150",
              item === currentPage
                ? "font-bold bg-blue-500 text-white shadow-[0_2px_8px_rgba(0,119,255,0.15)] outline-none"
                : "hover:bg-gray-200 hover:border-gray-300 text-black",
              "disabled:bg-blue-500 disabled:text-white disabled:font-bold disabled:cursor-default"
            ].join(" ")}
            aria-current={item === currentPage ? 'page' : undefined}
            style={item === currentPage ? { boxShadow: '0 2px 8px 0 rgba(0,119,255,0.15)' } : {}}
          >
            {item}
          </button>
        )
      )}
    </div>
  );
};

/**
 * A component that renders previous and next buttons for pagination
 */
export const PaginationControls: React.FC<PaginationBaseProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-20 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-20 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 bg-white text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

/**
 * A wrapper component that combines PageNumbers and PaginationControls
 * @deprecated Use PageNumbers and PaginationControls separately for more flexibility
 */
export const Pagination: React.FC<PaginationBaseProps> = (props) => {
  if (props.totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center mt-2 w-full ${props.className || ''}`}>
      <PageNumbers {...props} />
      <div className="flex ml-auto">
        <PaginationControls {...props} />
      </div>
    </div>
  );
};
