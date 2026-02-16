import React, { useState } from 'react';
import './DataTable.css';

/**
 * Reusable DataTable component for displaying paginated data with actions
 * @param {Object} props
 * @param {Array} props.columns - Column configuration
 * @param {Array} props.data - Table data
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {number} props.totalPages - Total pages count
 * @param {number} props.currentPage - Current page
 * @param {Function} props.onPageChange - Page change handler
 */
export default function DataTable({
  columns,
  data = [],
  onEdit,
  onDelete,
  totalPages = 1,
  currentPage = 0,
  onPageChange,
  loading = false,
  title = 'Data'
}) {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((row, idx) => idx));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (index) => {
    setSelectedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3 className="table-title">{title}</h3>
        <div className="table-stats">
          {selectedRows.length > 0 && (
            <span className="selected-count">
              {selectedRows.length} selected
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <p>No data found</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === data.length && data.length > 0}
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key} className={`col-${col.key}`}>
                    {col.label}
                  </th>
                ))}
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={selectedRows.includes(rowIndex) ? 'selected' : ''}
                >
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => handleSelectRow(rowIndex)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={`col-${col.key}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  <td className="actions-col">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit && onEdit(row)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete && onDelete(row)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
