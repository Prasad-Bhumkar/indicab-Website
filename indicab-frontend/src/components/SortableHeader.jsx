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
  allowNeutral = true,
}) => {
  const isSorted = sortColumn === column;

  const handleClick = () => {
    if (disabled) return;

    // Toggle sort direction: asc -> desc -> (optional) neutral -> asc
    if (isSorted) {
      if (sortDirection === 'asc') {
        onSort(column, 'desc');
      } else if (sortDirection === 'desc') {
        if (allowNeutral) {
          onSort(null, null);
        } else {
          onSort(column, 'asc');
        }
      }
    } else {
      onSort(column, 'asc');
    }
  };

  return (
    <th
      className={`sortable-header ${isSorted ? 'sorted' : ''} ${isSorted ? sortDirection : ''}`}
      onClick={handleClick}
      aria-sort={
        isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      <div className="header-content">
        <span className="header-label">{label}</span>
        <span className="sort-icons" aria-hidden="true">
          <span className={`sort-icon up ${isSorted && sortDirection === 'asc' ? 'active' : ''}`}>▲</span>
          <span className={`sort-icon down ${isSorted && sortDirection === 'desc' ? 'active' : ''}`}>▼</span>
        </span>
      </div>
    </th>
  );
};

export default SortableHeader;
