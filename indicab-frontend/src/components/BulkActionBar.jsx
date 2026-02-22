import React from 'react';
import './BulkActionBar.css';

/**
 * BulkActionBar component
 * Displays action buttons when items are selected in a table
 * Shows selected count and provides bulk operation controls
 */
const BulkActionBar = ({
  selectedCount = 0,
  totalCount = 0,
  onDelete = () => {},
  onChangeStatus = () => {},
  onExportCSV = () => {},
  onExportPDF = () => {},
  onSelectAll = () => {},
  onClearSelection = () => {},
  isAllSelected = false,
  entityType = 'items',
  statusOptions = [],
  loading = false,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const percentage = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

  return (
    <div className="bulk-action-bar">
      <div className="bulk-action-info">
        <span className="bulk-action-count">
          {selectedCount} {entityType}{selectedCount !== 1 ? 's' : ''} selected
          <span className="bulk-action-percentage">({percentage}%)</span>
        </span>
        
        <div className="bulk-action-select-controls">
          {!isAllSelected && (
            <button
              className="btn-link"
              onClick={onSelectAll}
              disabled={loading}
              title="Select all items on all pages"
            >
              Select all {totalCount}
            </button>
          )}
          {isAllSelected && (
            <span className="select-all-indicator">All {totalCount} selected</span>
          )}
        </div>
      </div>

      <div className="bulk-action-buttons">
        {statusOptions && statusOptions.length > 0 && (
          <div className="bulk-action-status-select">
            <select
              className="status-select"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onChangeStatus(e.target.value);
                  e.target.value = ''; // Reset select
                }
              }}
              disabled={loading}
              aria-label="Change status for selected items"
            >
              <option value="">Change Status...</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bulk-action-export-buttons">
          {onExportCSV && (
            <button
              className="bulk-action-btn bulk-action-export-btn"
              onClick={onExportCSV}
              disabled={loading}
              title="Export selected items as CSV"
              aria-label="Export as CSV"
            >
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              CSV
            </button>
          )}
          {onExportPDF && (
            <button
              className="bulk-action-btn bulk-action-export-btn"
              onClick={onExportPDF}
              disabled={loading}
              title="Export selected items as PDF"
              aria-label="Export as PDF"
            >
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              PDF
            </button>
          )}
        </div>

        <button
          className="bulk-action-btn bulk-action-delete-btn"
          onClick={onDelete}
          disabled={loading}
          title="Delete selected items"
          aria-label="Delete selected items"
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete
        </button>

        <button
          className="bulk-action-btn bulk-action-clear-btn"
          onClick={onClearSelection}
          disabled={loading}
          title="Clear selection"
          aria-label="Clear all selections"
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
