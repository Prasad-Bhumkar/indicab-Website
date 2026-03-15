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

// Mock jsPDF-autotable before other mocks
vi.mock('jspdf-autotable');

// Mock dependencies
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn().mockReturnValue('csv content'),
  },
  unparse: vi.fn().mockReturnValue('csv content'),
}));

// Create stable mock objects for assertions
const mockWorksheet = {
  addRow: vi.fn(),
  eachCell: vi.fn(),
  _columns: [],
  get columns() { return this._columns; },
  set columns(cols) {
    this._columns = cols.map(c => ({
      ...c,
      eachCell: vi.fn((opts, cb) => {
        const callback = typeof opts === 'function' ? opts : cb;
        if (callback) callback({ value: 'test' });
      })
    }));
  }
};

const mockWorkbook = {
  addWorksheet: vi.fn().mockReturnValue(mockWorksheet),
  xlsx: {
    writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  },
};

const mockDoc = {
  setFontSize: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  autoTable: vi.fn().mockReturnThis(),
  internal: {
    pages: { length: 2 },
    pageSize: { getHeight: () => 297 }
  },
  setPage: vi.fn().mockReturnThis(),
  save: vi.fn().mockReturnThis(),
};

// Use vi.hoisted for variables used in vi.mock if needed,
// but Vitest allows variables in same file if they are before vi.mock
vi.mock('exceljs', () => ({
  default: {
    Workbook: vi.fn().mockImplementation(() => mockWorkbook)
  }
}));

vi.mock('jspdf', () => {
  const jsPDFMock = vi.fn().mockImplementation(() => mockDoc);
  return {
    default: jsPDFMock,
    jsPDF: jsPDFMock
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
  ];

  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
  ];

  const mockLink = { 
    click: vi.fn(), 
    remove: vi.fn(), 
    setAttribute: vi.fn(),
    style: { display: '' },
    href: '',
    download: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.createElement = vi.fn().mockReturnValue(mockLink);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    mockWorksheet._columns = [];
  });

  describe('exportToCSV', () => {
    it('should export data to CSV', () => {
      exportToCSV(mockData, 'users', mockColumns);
      expect(Papa.unparse).toHaveBeenCalled();
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel', async () => {
      await exportToExcel(mockData, 'users', mockColumns);
      expect(mockWorkbook.addWorksheet).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    });
  });

  describe('exportToPDF', () => {
    it('should create PDF document', () => {
      exportToPDF(mockData, 'users', mockColumns);
      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalled();
    });
  });

  describe('exportSelectedItems', () => {
    it('should call appropriate export function', async () => {
      await exportSelectedItems(mockData, 'excel', 'test', mockColumns);
      expect(mockWorkbook.addWorksheet).toHaveBeenCalled();
      expect(mockWorkbook.xlsx.writeBuffer).toHaveBeenCalled();
    });
  });
});
