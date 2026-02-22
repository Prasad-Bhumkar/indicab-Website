import React from 'react';
import './PaginationControls.css';

/**
 * PaginationControls component for admin data tables
 * Displays pagination controls with previous/next buttons and page information
 */
const PaginationControls = ({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  loading = false,
}) => {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
  
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    onPageSizeChange(parseInt(e.target.value));
  };

  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        <span className="results-count">
          Showing {totalElements > 0 ? startItem : 0}-{endItem} of {totalElements} results
        </span>
        
        <select 
          className="page-size-select"
          value={pageSize}
          onChange={handlePageSizeChange}
          disabled={loading}
          aria-label="Items per page"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="pagination-buttons">
        <button
          className="pagination-btn"
          onClick={handlePrevious}
          disabled={currentPage === 0 || loading}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        <span className="page-indicator" aria-live="polite">
          Page {currentPage + 1} of {totalPages || 1}
        </span>

        <button
          className="pagination-btn"
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1 || loading}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
