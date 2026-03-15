import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrivers, createDriver, updateDriver, approveDriver, rejectDriver, deleteDriver, bulkDeleteDrivers, clearSuccessMessage, clearError } from './adminSlice';
import PaginationControls from '../../components/PaginationControls';
import FilterBar from '../../components/FilterBar';
import SortableHeader from '../../components/SortableHeader';
import { HeaderCheckbox, RowCheckbox } from '../../components/CheckboxColumn';
import BulkActionBar from '../../components/BulkActionBar';
import ExportModal from '../../components/ExportModal';
import { driverValidationSchema, validateFormData, hasFieldError, getFieldError } from './validationSchemas';
import {
  toggleItemSelection,
  selectAllItems,
  clearSelection,
  isItemSelected,
  getSelectionStats,
  getBulkActionConfirmMessage,
  formatSelectedIdsForAPI,
} from './bulkActionsUtils';
import './ManagementPages.css';

const DriverManagement = () => {
  const dispatch = useDispatch();
  const { drivers, loading, error, successMessage, pagination } = useSelector((state) => state.admin);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState(new Set());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    licenseNumber: '',
    status: 'pending'
  });

  useEffect(() => {
    const params = {
      page,
      size: pageSize,
      sort: `${sortColumn},${sortDirection}`,
      ...filters,
    };
    dispatch(fetchDrivers(params));
  }, [dispatch, page, pageSize, sortColumn, sortDirection, filters]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    // Real-time validation
    const validation = await validateFormData(driverValidationSchema, updatedFormData);
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.errors[name]
      }));
    } else {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const validation = await validateFormData(driverValidationSchema, formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    dispatch(createDriver(formData));
    setShowAddForm(false);
    resetForm();
  };

  const handleEditClick = (driver) => {
    setEditingId(driver.id);
    setFormData({ ...driver });
    setShowAddForm(false);
  };

  const handleSaveEdit = async (driverId) => {
    setValidationErrors({});

    const validation = await validateFormData(driverValidationSchema, formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    dispatch(updateDriver({ driverId, driverData: formData }));
    setEditingId(null);
    resetForm();
  };

  const handleDeleteDriver = (driverId) => {
    if (window.confirm('Are you sure you want to remove this driver?')) {
      dispatch(deleteDriver(driverId));
    }
  };

  const handleApprove = (driverId) => {
    dispatch(approveDriver(driverId));
  };

  const handleReject = (driverId) => {
    if (window.confirm('Are you sure you want to reject this driver?')) {
      dispatch(rejectDriver(driverId));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      vehicleInfo: '',
      licenseNumber: '',
      status: 'pending'
    });
    setEditingId(null);
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase() || 'pending'}`;
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(0);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  // Bulk selection handlers
  const handleRowCheckboxChange = (driverId) => {
    setSelectedDrivers(toggleItemSelection(selectedDrivers, driverId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedDrivers, drivers);
    if (stats.isAllSelected) {
      setSelectedDrivers(clearSelection());
    } else {
      setSelectedDrivers(selectAllItems(drivers));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedDrivers, drivers);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'driver');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedDrivers);
      dispatch(bulkDeleteDrivers(ids)).then(() => {
        setSelectedDrivers(clearSelection());
        dispatch(fetchDrivers({ page, size: pageSize, sort: `${sortColumn},${sortDirection}`, ...filters }));
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedDrivers(clearSelection());
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h3 className="management-title">Driver Management</h3>
        <div className="header-actions">
          <button
            className="add-btn export-btn"
            onClick={() => setShowExportModal(true)}
            title="Export drivers"
          >
            📥 Export
          </button>
          <button
            className="add-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              if (!showAddForm) resetForm();
            }}
          >
            {showAddForm ? 'Cancel' : '+ Add Driver'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button className="close-alert" onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
          <button className="close-alert" onClick={() => dispatch(clearSuccessMessage())}>×</button>
        </div>
      )}

      <FilterBar
        onFilterChange={handleFilterChange}
        filters={filters}
        filterOptions={{
          showSearch: true,
          showStatus: true,
          showDateRange: true,
          statusOptions: [
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ],
          customFilters: [
            { name: 'rating', label: 'Rating', type: 'select', options: [
              { value: '4', label: '4+ Stars' },
              { value: '3', label: '3+ Stars' },
              { value: '0', label: 'Any Rating' },
            ]},
            { name: 'license', label: 'License Search', type: 'text' },
          ],
        }}
        loading={loading}
      />

      <BulkActionBar
        selectedCount={selectedDrivers.size}
        totalCount={drivers.length}
        isAllSelected={selectedDrivers.size === drivers.length && drivers.length > 0}
        entityType="driver"
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedDrivers(selectAllItems(drivers))}
        loading={loading}
      />

      {(showAddForm || editingId) && (
        <div className="form-card">
          <h4>{editingId ? 'Edit Driver' : 'Add New Driver'}</h4>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleAddDriver}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className={`form-input ${hasFieldError(validationErrors, 'name') ? 'is-invalid' : ''}`} value={formData.name} onChange={handleInputChange} required />
                {hasFieldError(validationErrors, 'name') && (
                  <small className="form-error">{getFieldError(validationErrors, 'name')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className={`form-input ${hasFieldError(validationErrors, 'email') ? 'is-invalid' : ''}`} value={formData.email} onChange={handleInputChange} required />
                {hasFieldError(validationErrors, 'email') && (
                  <small className="form-error">{getFieldError(validationErrors, 'email')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" name="phone" className={`form-input ${hasFieldError(validationErrors, 'phone') ? 'is-invalid' : ''}`} value={formData.phone} onChange={handleInputChange} required />
                {hasFieldError(validationErrors, 'phone') && (
                  <small className="form-error">{getFieldError(validationErrors, 'phone')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Info</label>
                <input type="text" name="vehicleInfo" className="form-input" value={formData.vehicleInfo || ''} onChange={handleInputChange} placeholder="e.g. Swift DZire (WHT-1234)" />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input type="text" name="licenseNumber" className={`form-input ${hasFieldError(validationErrors, 'licenseNumber') ? 'is-invalid' : ''}`} value={formData.licenseNumber || ''} onChange={handleInputChange} />
                {hasFieldError(validationErrors, 'licenseNumber') && (
                  <small className="form-error">{getFieldError(validationErrors, 'licenseNumber')}</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="add-btn" style={{backgroundColor: '#6b7280'}} onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="add-btn">
                {editingId ? 'Update Driver' : 'Create Driver'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !drivers.length ? (
        <div className="loading-spinner">Loading drivers...</div>
      ) : (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <HeaderCheckbox
                  isAllSelected={selectedDrivers.size === drivers.length && drivers.length > 0}
                  isIndeterminate={selectedDrivers.size > 0 && selectedDrivers.size < drivers.length}
                  onChange={handleSelectAllChange}
                  disabled={loading || drivers.length === 0}
                  title="Select all drivers"
                />
                <SortableHeader
                  column="id"
                  label="ID"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={loading}
                />
                <SortableHeader
                  column="name"
                  label="Name"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={loading}
                />
                <SortableHeader
                  column="contact"
                  label="Contact"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={loading}
                />
                <SortableHeader
                  column="rating"
                  label="Rating"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={loading}
                />
                <SortableHeader
                  column="status"
                  label="Status"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  disabled={loading}
                />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <tr key={driver.id}>
                    <RowCheckbox
                      isSelected={isItemSelected(selectedDrivers, driver.id)}
                      onChange={() => handleRowCheckboxChange(driver.id)}
                      disabled={loading}
                      rowId={driver.id}
                    />
                    <td>#{driver.id}</td>
                    <td>{driver.name}</td>
                    <td>
                      <div>{driver.email}</div>
                      <div style={{fontSize: '0.75rem', color: '#666'}}>{driver.phone}</div>
                    </td>
                    <td>{driver.rating ? `⭐ ${driver.rating}` : 'N/A'}</td>
                    <td>
                      <span className={getStatusClass(driver.status)}>
                        {driver.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {driver.status === 'pending' && (
                          <button className="btn-icon btn-approve" onClick={() => handleApprove(driver.id)} title="Approve">
                            ✅
                          </button>
                        )}
                        <button className="btn-icon btn-edit" onClick={() => handleEditClick(driver)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDeleteDriver(driver.id)} title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No drivers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <PaginationControls
        currentPage={pagination?.drivers?.page || page}
        totalPages={pagination?.drivers?.totalPages || 1}
        totalElements={pagination?.drivers?.totalElements || drivers.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading}
      />

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        data={selectedDrivers.size > 0 ? drivers.filter(d => selectedDrivers.has(d.id)) : drivers}
        entityType="driver"
        filename="drivers"
        selectedOnly={selectedDrivers.size > 0}
        selectedCount={selectedDrivers.size}
      />
    </div>
  );
};

export default DriverManagement;
