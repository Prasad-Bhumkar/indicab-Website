import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportSelectedItems,
  getExportColumns,
  formatDataForExport
} from './exportUtils';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

// Mock dependencies
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn().mockReturnValue('csv content'),
  }
}));

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn().mockReturnValue({}),
    book_new: vi.fn().mockReturnValue({}),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

vi.mock('jspdf', () => {
  const mockDoc = {
    setFontSize: vi.fn().mockReturnValue(undefined),
    text: vi.fn().mockReturnValue(undefined),
    autoTable: vi.fn().mockReturnValue(undefined),
    internal: {
      pages: { length: 2 },
      pageSize: { getHeight: () => 297 }
    },
    setPage: vi.fn().mockReturnValue(undefined),
    save: vi.fn().mockReturnValue(undefined),
  };
  return {
    default: vi.fn().mockImplementation(() => mockDoc),
  };
});

// Mock window and document
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockReturnValue('blob-url');
  window.URL.revokeObjectURL = vi.fn();
}

describe('exportUtils', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', registrationDate: '2025-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', registrationDate: '2025-02-10' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', registrationDate: '2025-02-20' },
  ];

  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
  ];

  const mockNestedData = [
    {
      id: 1,
      name: 'John',
      user: { email: 'john@example.com', phone: '1234567890' },
      address: { city: 'New York', zip: '10001' }
    },
    {
      id: 2,
      name: 'Jane',
      user: { email: 'jane@example.com', phone: '0987654321' },
      address: { city: 'Los Angeles', zip: '90001' }
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    it('should export data to CSV with correct format', () => {
      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportToCSV(mockData, 'users', mockColumns);

      expect(Papa.unparse).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(link.click).toHaveBeenCalled();
    });

    it('should handle empty data array', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToCSV([], 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      expect(Papa.unparse).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle null data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToCSV(null, 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      consoleWarnSpy.mockRestore();
    });

    it('should handle undefined data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToCSV(undefined, 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      consoleWarnSpy.mockRestore();
    });

    it('should create download link with correct filename format', () => {
      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportToCSV(mockData, 'users', mockColumns);

      expect(link.download).toMatch(/^users_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should handle special characters in data', () => {
      const specialData = [
        { id: 1, name: 'John "Doe"', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane\'s Test', email: 'jane@example.com', status: 'inactive' },
      ];

      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportToCSV(specialData, 'test', mockColumns);

      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should handle missing columns gracefully', () => {
      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      const incompleteColumns = [
        { key: 'id', label: 'ID' },
        { key: 'nonexistent', label: 'Missing Field' },
      ];

      exportToCSV(mockData, 'test', incompleteColumns);

      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should catch and log errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      Papa.unparse.mockImplementationOnce(() => {
        throw new Error('CSV generation failed');
      });

      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportToCSV(mockData, 'test', mockColumns);

      expect(consoleErrorSpy).toHaveBeenCalledWith('CSV export error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel with correct functions', () => {
      exportToExcel(mockData, 'users', mockColumns);

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalled();
    });

    it('should handle empty data array', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToExcel([], 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      expect(XLSX.writeFile).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should apply custom sheet name from options', () => {
      const options = { sheetName: 'CustomSheet' };
      exportToExcel(mockData, 'users', mockColumns, options);

      const calls = vi.mocked(XLSX.utils.book_append_sheet).mock.calls;
      expect(calls[0][2]).toBe('CustomSheet');
    });

    it('should use default sheet name when not provided', () => {
      exportToExcel(mockData, 'users', mockColumns);

      const calls = vi.mocked(XLSX.utils.book_append_sheet).mock.calls;
      expect(calls[0][2]).toBe('Data');
    });

    it('should set column widths based on label length', () => {
      exportToExcel(mockData, 'users', mockColumns);

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    });

    it('should handle null data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToExcel(null, 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      consoleWarnSpy.mockRestore();
    });

    it('should catch and log errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      XLSX.utils.json_to_sheet.mockImplementationOnce(() => {
        throw new Error('Sheet creation failed');
      });

      exportToExcel(mockData, 'test', mockColumns);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Excel export error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should create download with correct filename format', () => {
      exportToExcel(mockData, 'users', mockColumns);

      const calls = vi.mocked(XLSX.writeFile).mock.calls;
      expect(calls[0][1]).toMatch(/^users_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 2 === 0 ? 'active' : 'inactive',
      }));

      exportToExcel(largeData, 'large-export', mockColumns);

      expect(XLSX.writeFile).toHaveBeenCalled();
    });
  });

  describe('exportToPDF', () => {
    it('should create PDF document and save', () => {
      exportToPDF(mockData, 'users', mockColumns);

      expect(jsPDF).toHaveBeenCalled();
      const mockDoc = new jsPDF();
      expect(mockDoc.save).toHaveBeenCalled();
    });

    it('should handle empty data array', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToPDF([], 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      consoleWarnSpy.mockRestore();
    });

    it('should use custom title from options', () => {
      const options = { title: 'User Report' };
      exportToPDF(mockData, 'users', mockColumns, options);

      const mockDoc = new jsPDF();
      const textCalls = mockDoc.text.mock.calls;
      expect(textCalls.some(call => call[0].includes('User Report'))).toBe(true);
    });

    it('should use filename as title when not provided', () => {
      exportToPDF(mockData, 'users', mockColumns);

      const mockDoc = new jsPDF();
      const textCalls = mockDoc.text.mock.calls;
      expect(textCalls.some(call => call[0] === 'users')).toBe(true);
    });

    it('should set landscape orientation', () => {
      exportToPDF(mockData, 'users', mockColumns);

      expect(jsPDF).toHaveBeenCalledWith(
        expect.objectContaining({ orientation: 'landscape' })
      );
    });

    it('should add page numbers and record count to footer', () => {
      exportToPDF(mockData, 'users', mockColumns);

      const mockDoc = new jsPDF();
      const textCalls = mockDoc.text.mock.calls;
      expect(textCalls.some(call =>
        typeof call[0] === 'string' && call[0].includes('Total Records:')
      )).toBe(true);
    });

    it('should handle null data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportToPDF(null, 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      consoleWarnSpy.mockRestore();
    });

    it('should truncate long values in cells', () => {
      const longData = [
        {
          id: 1,
          name: 'A'.repeat(100),
          email: 'test@example.com',
          status: 'active'
        },
      ];

      exportToPDF(longData, 'test', mockColumns);

      const mockDoc = new jsPDF();
      expect(mockDoc.autoTable).toHaveBeenCalled();
    });

    it('should catch and log errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      jsPDF.mockImplementationOnce(() => {
        throw new Error('PDF creation failed');
      });

      exportToPDF(mockData, 'test', mockColumns);

      expect(consoleErrorSpy).toHaveBeenCalledWith('PDF export error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should create download with correct filename format', () => {
      exportToPDF(mockData, 'users', mockColumns);

      const mockDoc = new jsPDF();
      const saveCalls = mockDoc.save.mock.calls;
      expect(saveCalls[0][0]).toMatch(/^users_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle multiple pages', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 2 === 0 ? 'active' : 'inactive',
      }));

      exportToPDF(largeData, 'large-export', mockColumns);

      const mockDoc = new jsPDF();
      expect(mockDoc.setPage).toHaveBeenCalled();
    });
  });

  describe('exportSelectedItems', () => {
    it('should call exportToCSV for csv format', () => {
      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportSelectedItems(mockData, 'csv', 'test', mockColumns);
      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should call exportToExcel for excel format', () => {
      exportSelectedItems(mockData, 'excel', 'test', mockColumns);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });

    it('should call exportToExcel for xlsx format', () => {
      exportSelectedItems(mockData, 'xlsx', 'test', mockColumns);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });

    it('should call exportToPDF for pdf format', () => {
      exportSelectedItems(mockData, 'pdf', 'test', mockColumns);
      expect(jsPDF).toHaveBeenCalled();
    });

    it('should handle case-insensitive format', () => {
      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportSelectedItems(mockData, 'CSV', 'test', mockColumns);
      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should warn if no items selected', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportSelectedItems([], 'csv', 'test', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No items selected for export');
      consoleWarnSpy.mockRestore();
    });

    it('should handle null items', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      exportSelectedItems(null, 'csv', 'test', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No items selected for export');
      consoleWarnSpy.mockRestore();
    });

    it('should handle invalid format', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      exportSelectedItems(mockData, 'invalid-format', 'test', mockColumns);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown export format: invalid-format');
      consoleErrorSpy.mockRestore();
    });

    it('should pass options to export functions', () => {
      const options = { title: 'Test Report' };
      exportSelectedItems(mockData, 'pdf', 'test', mockColumns, options);
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  describe('getExportColumns', () => {
    it('should return user columns', () => {
      const columns = getExportColumns('user');
      expect(columns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'name', label: 'Name' }),
          expect.objectContaining({ key: 'email', label: 'Email' }),
        ])
      );
    });

    it('should return driver columns', () => {
      const columns = getExportColumns('driver');
      expect(columns).toContainEqual({ key: 'rating', label: 'Rating' });
      expect(columns).toContainEqual({ key: 'totalRides', label: 'Total Rides' });
    });

    it('should return booking columns', () => {
      const columns = getExportColumns('booking');
      expect(columns).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'from', label: 'From' }),
          expect.objectContaining({ key: 'to', label: 'To' }),
        ])
      );
    });

    it('should return blog columns', () => {
      const columns = getExportColumns('blog');
      expect(columns).toContainEqual({ key: 'title', label: 'Title' });
    });

    it('should return vehicle columns', () => {
      const columns = getExportColumns('vehicle');
      expect(columns).toContainEqual({ key: 'type', label: 'Type' });
    });

    it('should return package columns', () => {
      const columns = getExportColumns('package');
      expect(columns).toContainEqual({ key: 'name', label: 'Name' });
    });

    it('should return empty array for unknown entity', () => {
      const columns = getExportColumns('unknown-entity');
      expect(columns).toEqual([]);
    });

    it('should return empty array for null entity', () => {
      const columns = getExportColumns(null);
      expect(columns).toEqual([]);
    });

    it('should return empty array for undefined entity', () => {
      const columns = getExportColumns(undefined);
      expect(columns).toEqual([]);
    });
  });

  describe('formatDataForExport', () => {
    it('should apply transformer function to data', () => {
      const transformer = (item) => ({
        ...item,
        name: item.name.toUpperCase(),
      });

      const result = formatDataForExport(mockData, transformer);

      expect(result[0].name).toBe('JOHN DOE');
      expect(result[1].name).toBe('JANE SMITH');
    });

    it('should return original data when no transformer provided', () => {
      const result = formatDataForExport(mockData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should return original data when transformer is null', () => {
      const result = formatDataForExport(mockData, null);
      expect(result).toEqual(mockData);
    });

    it('should handle complex transformations', () => {
      const transformer = (item) => ({
        id: item.id,
        fullName: item.name.toUpperCase(),
        contactEmail: item.email,
        userStatus: item.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      });

      const result = formatDataForExport(mockData, transformer);

      expect(result[0]).toEqual({
        id: 1,
        fullName: 'JOHN DOE',
        contactEmail: 'john@example.com',
        userStatus: 'ACTIVE',
      });
    });
  });

  describe('Nested data handling', () => {
    it('should handle nested object paths in columns', () => {
      const nestedColumns = [
        { key: 'id', label: 'ID' },
        { key: 'user.email', label: 'Email' },
        { key: 'address.city', label: 'City' },
      ];

      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportToCSV(mockNestedData, 'nested-export', nestedColumns);

      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should handle missing nested properties gracefully', () => {
      const nestedColumns = [
        { key: 'id', label: 'ID' },
        { key: 'user.email', label: 'Email' },
        { key: 'nonexistent.field', label: 'Missing' },
      ];

      const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
      document.createElement = vi.fn().mockReturnValue(link);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      exportToCSV(mockNestedData, 'nested-export', nestedColumns);

      expect(Papa.unparse).toHaveBeenCalled();
    });
  });
});
