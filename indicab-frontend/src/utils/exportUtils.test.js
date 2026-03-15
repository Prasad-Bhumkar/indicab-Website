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
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';

// Mock dependencies
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn().mockReturnValue('csv content'),
  }
}));

// Mock exceljs
vi.mock('exceljs', () => {
  const mockWorksheet = {
    addRow: vi.fn(),
    eachCell: vi.fn((options, callback) => {
      // Mock some cell values for width calculation
      callback({ value: 'some value' });
    }),
    columns: [],
  };

  const mockWorkbook = {
    addWorksheet: vi.fn().mockReturnValue(mockWorksheet),
    xlsx: {
      writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    },
  };

  return {
    default: {
      Workbook: vi.fn().mockImplementation(() => mockWorkbook),
    },
    Workbook: vi.fn().mockImplementation(() => mockWorkbook),
  };
});

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
    
    // Reset global mocks that might have state
    const link = { click: vi.fn(), remove: vi.fn(), setAttribute: vi.fn() };
    document.createElement = vi.fn().mockReturnValue(link);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportToCSV', () => {
    it('should export data to CSV with correct format', () => {
      exportToCSV(mockData, 'users', mockColumns);

      expect(Papa.unparse).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
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
      const link = document.createElement('a');
      exportToCSV(mockData, 'users', mockColumns);

      expect(link.download).toMatch(/^users_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should handle special characters in data', () => {
      const specialData = [
        { id: 1, name: 'John "Doe"', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane\'s Test', email: 'jane@example.com', status: 'inactive' },
      ];

      exportToCSV(specialData, 'test', mockColumns);

      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should handle missing columns gracefully', () => {
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

      exportToCSV(mockData, 'test', mockColumns);

      expect(consoleErrorSpy).toHaveBeenCalledWith('CSV export error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel with correct functions', async () => {
      await exportToExcel(mockData, 'users', mockColumns);

      const workbook = new ExcelJS.Workbook();
      expect(ExcelJS.Workbook).toHaveBeenCalled();
      expect(workbook.addWorksheet).toHaveBeenCalled();
      expect(workbook.xlsx.writeBuffer).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle empty data array', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await exportToExcel([], 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      
      const workbook = new ExcelJS.Workbook();
      expect(workbook.xlsx.writeBuffer).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should apply custom sheet name from options', async () => {
      const options = { sheetName: 'CustomSheet' };
      await exportToExcel(mockData, 'users', mockColumns, options);

      const workbook = new ExcelJS.Workbook();
      expect(workbook.addWorksheet).toHaveBeenCalledWith('CustomSheet');
    });

    it('should use default sheet name when not provided', async () => {
      await exportToExcel(mockData, 'users', mockColumns);

      const workbook = new ExcelJS.Workbook();
      expect(workbook.addWorksheet).toHaveBeenCalledWith('Data');
    });

    it('should handle null data', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await exportToExcel(null, 'test-export', mockColumns);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
      consoleWarnSpy.mockRestore();
    });

    it('should catch and log errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by mocking Workbook to throw
      vi.mocked(ExcelJS.Workbook).mockImplementationOnce(() => {
        throw new Error('Workbook creation failed');
      });

      await exportToExcel(mockData, 'test', mockColumns);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Excel export error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should create download with correct filename format', async () => {
      const link = document.createElement('a');
      await exportToExcel(mockData, 'users', mockColumns);

      expect(link.download).toMatch(/^users_\d{4}-\d{2}-\d{2}\.xlsx$/);
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

    it('should use landscape orientation', () => {
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

    it('should catch and log errors', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      jsPDF.mockImplementationOnce(() => {
        throw new Error('PDF creation failed');
      });

      exportToPDF(mockData, 'test', mockColumns);

      expect(consoleErrorSpy).toHaveBeenCalledWith('PDF export error:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('exportSelectedItems', () => {
    it('should call exportToCSV for csv format', () => {
      exportSelectedItems(mockData, 'csv', 'test', mockColumns);
      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('should call exportToExcel for excel format', async () => {
      await exportSelectedItems(mockData, 'excel', 'test', mockColumns);
      const workbook = new ExcelJS.Workbook();
      expect(workbook.xlsx.writeBuffer).toHaveBeenCalled();
    });

    it('should call exportToPDF for pdf format', () => {
      exportSelectedItems(mockData, 'pdf', 'test', mockColumns);
      expect(jsPDF).toHaveBeenCalled();
    });

    it('should handle invalid format', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      exportSelectedItems(mockData, 'invalid-format', 'test', mockColumns);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown export format: invalid-format');
      consoleErrorSpy.mockRestore();
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

    it('should return empty array for unknown entity', () => {
      const columns = getExportColumns('unknown-entity');
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
  });
});
