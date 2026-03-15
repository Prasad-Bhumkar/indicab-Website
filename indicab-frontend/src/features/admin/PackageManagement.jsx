import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  bulkDeletePackages,
  clearSuccessMessage,
  clearError,
} from './adminSlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import PaginationControls from '../../components/PaginationControls';
import FilterBar from '../../components/FilterBar';
import SortableHeader from '../../components/SortableHeader';
import { HeaderCheckbox, RowCheckbox } from '../../components/CheckboxColumn';
import BulkActionBar from '../../components/BulkActionBar';
import ExportModal from '../../components/ExportModal';
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

const PackageManagement = () => {
  const dispatch = useDispatch();
  const { packages, loading, error, successMessage, pagination } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    type: 'hourly',
    baseFare: '',
    duration: '',
    validity: '',
    description: '',
    discountPercentage: 0,
    features: '',
  });

  useEffect(() => {
    const params = {
      page,
      size: pageSize,
      sort: `${sortColumn},${sortDirection}`,
      ...filters,
    };
    dispatch(fetchPackages(params));
  }, [dispatch, page, pageSize, sortColumn, sortDirection, filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const packageData = {
      ...formData,
      baseFare: parseFloat(formData.baseFare),
      discountPercentage: parseFloat(formData.discountPercentage),
      features: formData.features.split(',').map(f => f.trim()),
    };
    
    if (editingId) {
      dispatch(updatePackage({ id: editingId, ...packageData }));
    } else {
      dispatch(createPackage(packageData));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'hourly',
      baseFare: '',
      duration: '',
      validity: '',
      description: '',
      discountPercentage: 0,
      features: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (pkg) => {
    setFormData({
      ...pkg,
      features: pkg.features?.join(', ') || '',
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      dispatch(deletePackage(id));
    }
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

  const handleRowCheckboxChange = (packageId) => {
    setSelectedPackages(toggleItemSelection(selectedPackages, packageId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedPackages, packages);
    if (stats.isAllSelected) {
      setSelectedPackages(clearSelection());
    } else {
      setSelectedPackages(selectAllItems(packages));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedPackages, packages);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'package');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedPackages);
      dispatch(bulkDeletePackages(ids)).then(() => {
        setSelectedPackages(clearSelection());
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedPackages(clearSelection());
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Package Management</h2>
        <div className="header-actions">
          <button
            className="add-btn export-btn"
            onClick={() => setShowExportModal(true)}
            title="Export packages"
          >
            📥 Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Add New Package'}
          </button>
        </div>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        filters={filters}
        filterOptions={{
          showSearch: true,
        }}
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <BulkActionBar
        selectedCount={selectedPackages.size}
        totalCount={packages.length}
        isAllSelected={selectedPackages.size === packages.length && packages.length > 0}
        entityType="package"
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedPackages(selectAllItems(packages))}
        loading={loading}
      />

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Package' : 'Create New Package'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Package Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group col-md-6">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="hourly">Hourly</option>
                  <option value="regional">Regional</option>
                  <option value="national">National</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Base Fare (₹)</label>
                <input
                  type="number"
                  name="baseFare"
                  value={formData.baseFare}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="form-control"
                />
              </div>

              <div className="form-group col-md-6">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 4 Hours, 2 Days"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Validity</label>
                <input
                  type="text"
                  name="validity"
                  value={formData.validity}
                  onChange={handleInputChange}
                  placeholder="e.g., 7 Days, 1 Month"
                  className="form-control"
                />
              </div>

              <div className="form-group col-md-6">
                <label>Discount (%)</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Features (comma-separated)</label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="e.g., AC Sedan, Professional Chauffeur, Free Cancellation"
              ></textarea>
            </div>

            <button type="submit" className="btn btn-success">
              {editingId ? 'Update Package' : 'Create Package'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading && !packages.length ? (
          <p>Loading packages...</p>
        ) : packages && packages.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="management-table">
                <thead>
                  <tr>
                    <HeaderCheckbox
                      isAllSelected={selectedPackages.size === packages.length && packages.length > 0}
                      isIndeterminate={selectedPackages.size > 0 && selectedPackages.size < packages.length}
                      onChange={handleSelectAllChange}
                      disabled={loading || packages.length === 0}
                      title="Select all packages"
                    />
                    <SortableHeader
                      column="name"
                      label="Name"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <th>Type</th>
                    <th>Duration</th>
                    <SortableHeader
                      column="baseFare"
                      label="Base Fare"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      column="discountPercentage"
                      label="Discount"
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id}>
                      <RowCheckbox
                        isSelected={isItemSelected(selectedPackages, pkg.id)}
                        onChange={() => handleRowCheckboxChange(pkg.id)}
                        disabled={loading}
                        rowId={pkg.id}
                      />
                      <td>{pkg.name}</td>
                      <td>{pkg.type}</td>
                      <td>{pkg.duration}</td>
                      <td>₹{pkg.baseFare}</td>
                      <td>{pkg.discountPercentage}%</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(pkg)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(pkg.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {packages.length > 0 && (
              <PaginationControls
                currentPage={page}
                totalPages={pagination?.totalPages || 1}
                totalElements={pagination?.totalElements || packages.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        ) : (
          <p>No packages found. Create your first package!</p>
        )}
      </div>

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        data={packages}
        entityType="package"
        filename="packages"
      />
    </div>
  );
};

export default PackageManagement;
