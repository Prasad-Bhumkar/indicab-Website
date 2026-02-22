/**
 * Bulk Actions Utilities
 * Helper functions for managing bulk operations on admin tables
 */

/**
 * Toggle selection for a single item
 * @param {Set} selectedIds - Current selected IDs set
 * @param {number|string} id - Item ID to toggle
 * @returns {Set} Updated selectedIds set
 */
export const toggleItemSelection = (selectedIds, id) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  return newSelected;
};

/**
 * Select all items
 * @param {Array} items - Array of items with id property
 * @returns {Set} Set of all item IDs
 */
export const selectAllItems = (items) => {
  return new Set(items.map(item => item.id));
};

/**
 * Clear all selections
 * @returns {Set} Empty set
 */
export const clearSelection = () => {
  return new Set();
};

/**
 * Check if item is selected
 * @param {Set} selectedIds - Selected IDs set
 * @param {number|string} id - Item ID to check
 * @returns {boolean} True if selected
 */
export const isItemSelected = (selectedIds, id) => {
  return selectedIds.has(id);
};

/**
 * Get selection statistics
 * @param {Set} selectedIds - Selected IDs set
 * @param {Array} items - All items array
 * @returns {Object} Statistics including count and percentage
 */
export const getSelectionStats = (selectedIds, items = []) => {
  const totalSelected = selectedIds.size;
  const totalItems = items.length;
  const percentage = totalItems > 0 ? Math.round((totalSelected / totalItems) * 100) : 0;
  const isAllSelected = totalSelected === totalItems && totalItems > 0;

  return {
    totalSelected,
    totalItems,
    percentage,
    isAllSelected,
    hasSelection: totalSelected > 0,
  };
};

/**
 * Get array of selected item objects from items array
 * @param {Set} selectedIds - Selected IDs set
 * @param {Array} items - All items array
 * @returns {Array} Array of selected items
 */
export const getSelectedItems = (selectedIds, items) => {
  return items.filter(item => selectedIds.has(item.id));
};

/**
 * Build bulk action confirmation message
 * @param {string} action - Action name (delete, update, etc.)
 * @param {number} count - Number of items affected
 * @param {string} entityType - Type of entity (user, driver, booking, etc.)
 * @returns {string} Confirmation message
 */
export const getBulkActionConfirmMessage = (action, count, entityType = 'items') => {
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
  return `Are you sure you want to ${action} ${count} ${entityType}${count !== 1 ? 's' : ''}? This action cannot be undone.`;
};

/**
 * Format selected items list for API
 * @param {Set} selectedIds - Selected IDs set
 * @returns {Array} Array of IDs
 */
export const formatSelectedIdsForAPI = (selectedIds) => {
  return Array.from(selectedIds);
};
