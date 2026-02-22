import React from 'react';
import './CheckboxColumn.css';

/**
 * CheckboxColumn component for table header and cells
 * Provides checkbox UI for bulk selection in admin tables
 */

/**
 * HeaderCheckbox - Select all checkbox for table header
 */
export const HeaderCheckbox = ({
  isAllSelected = false,
  isIndeterminate = false,
  onChange = () => {},
  disabled = false,
  title = "Select all items",
}) => {
  return (
    <th className="checkbox-column-header">
      <input
        type="checkbox"
        className={`checkbox-input ${isIndeterminate ? 'indeterminate' : ''}`}
        checked={isAllSelected}
        onChange={onChange}
        disabled={disabled}
        title={title}
        aria-label="Select all items"
      />
    </th>
  );
};

/**
 * RowCheckbox - Individual row checkbox for bulk selection
 */
export const RowCheckbox = ({
  isSelected = false,
  onChange = () => {},
  disabled = false,
  rowId = null,
  title = "Select this item",
}) => {
  return (
    <td className="checkbox-column-cell">
      <input
        type="checkbox"
        className="checkbox-input"
        checked={isSelected}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        title={title}
        aria-label={`Select item ${rowId}`}
      />
    </td>
  );
};

export default {
  HeaderCheckbox,
  RowCheckbox,
};
