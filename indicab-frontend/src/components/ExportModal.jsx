import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  getExportColumns,
} from '../utils/exportUtils';
import './ExportModal.css';

const ExportModal = ({
  show,
  onHide,
  data,
  entityType,
  filename,
  selectedOnly = false,
  selectedCount = 0,
}) => {
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const columns = getExportColumns(entityType);
      
      if (!columns || columns.length === 0) {
        // No columns defined for this entity type
        return;
      }

      if (!data || data.length === 0) {
        // No data to export
        return;
      }

      switch (format) {
        case 'csv':
          exportToCSV(data, filename, columns);
          break;
        case 'excel':
          exportToExcel(data, filename, columns, { sheetName: entityType });
          break;
        case 'pdf':
          exportToPDF(data, filename, columns, { title: `${entityType} Report` });
          break;
        default:
          // Unknown format
      }

      onHide();
    } catch (error) {
      // Export error - user will see loading state persist
    } finally {
      setIsExporting(false);
    }
  };

  const exportLabel = selectedOnly
    ? `Export ${selectedCount} Selected`
    : `Export ${data?.length || 0} Records`;

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Export {entityType}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="export-format-group">
          <Form.Label className="export-format-label">Select Format:</Form.Label>
          <div className="export-options">
            <Form.Check
              type="radio"
              label="CSV (.csv)"
              name="format"
              id="format-csv"
              value="csv"
              checked={format === 'csv'}
              onChange={(e) => setFormat(e.target.value)}
              className="export-option"
            />
            <Form.Check
              type="radio"
              label="Excel (.xlsx)"
              name="format"
              id="format-excel"
              value="excel"
              checked={format === 'excel'}
              onChange={(e) => setFormat(e.target.value)}
              className="export-option"
            />
            <Form.Check
              type="radio"
              label="PDF (.pdf)"
              name="format"
              id="format-pdf"
              value="pdf"
              checked={format === 'pdf'}
              onChange={(e) => setFormat(e.target.value)}
              className="export-option"
            />
          </div>
        </Form.Group>

        <div className="export-info">
          <small className="text-muted">
            {exportLabel}
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isExporting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Exporting...
            </>
          ) : (
            'Export'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportModal;
