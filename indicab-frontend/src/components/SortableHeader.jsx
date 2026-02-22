import React from 'react';
import './SortableHeader.css';

/**
 * SortableHeader component for table column headers
 * Shows visual indicators for sort direction and handles column sorting
 */
const SortableHeader = ({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
  disabled = false,
}) => {
  const isSorted = sortColumn === column;
  
  const handleClick = () => {
    if (disabled) return;
    
    // Toggle sort direction if same column, otherwise set to ascending
    if (isSorted) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column, newDirection);
    } else {
      onSort(column, 'asc');
    }
  };

  return (
    <th
      className={`sortable-header ${isSorted ? 'sorted' : ''} ${sortDirection}`}
      onClick={handleClick}
      aria-sort={
        isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      <div className="header-content">
        <span className="header-label">{label}</span>
        {isSorted && (
          <span className="sort-indicator" aria-hidden="true">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
};

export default SortableHeader;
