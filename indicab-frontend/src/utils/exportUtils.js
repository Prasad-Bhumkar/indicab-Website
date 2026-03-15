/**
 * Export Utilities
 * Functions for exporting table data as CSV, Excel, or PDF
 */

import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to CSV format using papaparse
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 * @param {Array} columns - Column definitions [{ key: 'name', label: 'User Name' }]
 */
export const exportToCSV = (data, filename, columns) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Format data for export
    const formattedData = data.map(item =>
      columns.reduce((acc, col) => {
        acc[col.label] = getNestedValue(item, col.key) || '';
        return acc;
      }, {})
    );

    // Use papaparse to generate CSV
    const csv = Papa.unparse(formattedData);
    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    downloadFile(csvBlob, `${filename}_${getCurrentDate()}.csv`);
  } catch (error) {
    console.error('CSV export error:', error);
  }
};

/**
 * Export data to Excel format using exceljs
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 * @param {Array} columns - Column definitions [{ key: 'name', label: 'User Name' }]
 * @param {Object} options - Additional options (sheetName, etc.)
 */
export const exportToExcel = async (data, filename, columns, options = {}) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const { sheetName = 'Data' } = options;

    // Format data for export
    const formattedData = data.map(item =>
      columns.reduce((acc, col) => {
        acc[col.label] = getNestedValue(item, col.key) || '';
        return acc;
      }, {})
    );

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns: header and keys are the column labels
    worksheet.columns = columns.map(col => ({
      header: col.label,
      key: col.label,
      width: Math.max(col.label.length, 15)
    }));

    // Add rows
    formattedData.forEach(row => {
      worksheet.addRow(row);
    });

    // Adjust column widths based on content
    worksheet.columns.forEach(column => {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxColumnLength + 2, 15), 50);
    });

    // Write workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob and trigger download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    downloadFile(blob, `${filename}_${getCurrentDate()}.xlsx`);
  } catch (error) {
    console.error('Excel export error:', error);
  }
};

/**
 * Export data to PDF format using jsPDF
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename (without extension)
 * @param {Array} columns - Column definitions [{ key: 'name', label: 'User Name' }]
 * @param {Object} options - Additional options (title, pageSize, etc.)
 */
export const exportToPDF = (data, filename, columns, options = {}) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const { title = '', pageSize = 'a4' } = options;
    const documentTitle = title || filename;
    const generatedDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: pageSize,
    });

    // Add title
    doc.setFontSize(16);
    doc.text(documentTitle, 14, 15);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on ${generatedDate}`, 14, 22);

    // Prepare table data
    const tableHeaders = columns.map(col => col.label);
    const tableData = data.map(item =>
      columns.map(col => String(getNestedValue(item, col.key) || '').substring(0, 50))
    );

    // Add table using autoTable
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headerStyles: {
        backgroundColor: [13, 110, 253],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
        padding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        padding: 2,
      },
      alternateRowStyles: {
        backgroundColor: [248, 249, 250],
      },
      margin: { top: 30 },
    });

    // Add footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Total Records: ${data.length} | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
    }

    // Save PDF
    doc.save(`${filename}_${getCurrentDate()}.pdf`);
  } catch (error) {
    console.error('PDF export error:', error);
  }
};

/**
 * Export selected items (respects selection)
 * @param {Array} selectedItems - Array of selected items to export
 * @param {string} format - Export format: 'csv', 'excel', or 'pdf'
 * @param {string} filename - Output filename (without extension)
 * @param {Array} columns - Column definitions
 * @param {Object} options - Additional options
 */
export const exportSelectedItems = async (selectedItems, format, filename, columns, options = {}) => {
  if (!selectedItems || selectedItems.length === 0) {
    console.warn('No items selected for export');
    return;
  }

  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(selectedItems, filename, columns);
      break;
    case 'excel':
    case 'xlsx':
      await exportToExcel(selectedItems, filename, columns, options);
      break;
    case 'pdf':
      exportToPDF(selectedItems, filename, columns, options);
      break;
    default:
      console.error(`Unknown export format: ${format}`);
  }
};

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Path to value (e.g., 'user.name')
 * @returns {any} Value at path or empty string
 */
const getNestedValue = (obj, path) => {
  if (!obj || !path) return '';

  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return '';
  }, obj);
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Download file helper with cleanup
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename
 */
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup: remove link and revoke URL after a short delay
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Format data for export with custom transformations
 * @param {Array} data - Data to format
 * @param {Function} transformer - Function to transform each item
 * @returns {Array} Transformed data
 */
export const formatDataForExport = (data, transformer) => {
  if (!transformer) return data;
  return data.map(item => transformer(item));
};

/**
 * Process large dataset in batches to prevent memory issues
 * @param {Array} data - Data to process
 * @param {number} batchSize - Size of each batch (default: 1000)
 * @param {Function} processor - Function to process each batch
 * @param {Function} onProgress - Optional callback for progress tracking
 * @returns {Promise} Resolves when all batches processed
 */
export const processBatchExport = async (data, batchSize = 1000, processor, onProgress) => {
  if (!data || data.length === 0) {
    console.warn('No data to process');
    return [];
  }

  const results = [];
  const totalBatches = Math.ceil(data.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batch = data.slice(start, end);

    try {
      const batchResult = processor(batch, i, totalBatches);
      results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          currentBatch: i + 1,
          totalBatches,
          progress: ((i + 1) / totalBatches) * 100,
          processedRows: end,
        });
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
};

/**
 * Estimate memory usage for export operation
 * @param {Array} data - Data to export
 * @param {number} bytesPerRow - Estimated bytes per row (default: 500)
 * @returns {number} Estimated size in MB
 */
export const estimateExportSize = (data, bytesPerRow = 500) => {
  if (!data || data.length === 0) return 0;
  const totalBytes = data.length * bytesPerRow;
  return totalBytes / (1024 * 1024); // Convert to MB
};

/**
 * Check if export would be too large and warn user
 * @param {Array} data - Data to export
 * @param {number} maxSizeMB - Maximum allowed size in MB (default: 50)
 * @returns {boolean} True if size is acceptable, false if too large
 */
export const validateExportSize = (data, maxSizeMB = 50) => {
  const estimatedSize = estimateExportSize(data);
  if (estimatedSize > maxSizeMB) {
    console.warn(
      `Export size (${estimatedSize.toFixed(2)}MB) exceeds recommended limit (${maxSizeMB}MB). ` +
      `Consider exporting in smaller date ranges.`
    );
    return false;
  }
  return true;
};

/**
 * Prepare export columns from entity type
 * Returns column definitions with proper labels matching requirements
 * @param {string} entityType - Type of entity (user, driver, booking, etc.)
 * @returns {Array} Column definitions
 */
export const getExportColumns = (entityType) => {
  const columnsByType = {
    user: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status' },
      { key: 'registrationDate', label: 'Registration Date' },
      { key: 'totalBookings', label: 'Total Bookings' },
    ],
    driver: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'rating', label: 'Rating' },
      { key: 'status', label: 'Status' },
      { key: 'approvalDate', label: 'Approval Date' },
      { key: 'totalRides', label: 'Total Rides' },
    ],
    booking: [
      { key: 'id', label: 'ID' },
      { key: 'userId', label: 'User ID' },
      { key: 'from', label: 'From' },
      { key: 'to', label: 'To' },
      { key: 'vehicleType', label: 'Vehicle' },
      { key: 'fare', label: 'Fare' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
      { key: 'driverId', label: 'Driver ID' },
    ],
    blog: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'author', label: 'Author' },
      { key: 'status', label: 'Status' },
      { key: 'publishDate', label: 'Publish Date' },
      { key: 'views', label: 'Views' },
    ],
    vehicle: [
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Type' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'baseFare', label: 'Base Fare' },
      { key: 'ratePerKm', label: 'Rate/KM' },
      { key: 'status', label: 'Status' },
    ],
    package: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'baseFare', label: 'Base Fare' },
      { key: 'duration', label: 'Duration' },
      { key: 'status', label: 'Status' },
    ],
  };

  return columnsByType[entityType] || [];
};
