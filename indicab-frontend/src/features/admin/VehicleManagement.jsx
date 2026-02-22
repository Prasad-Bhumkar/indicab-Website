import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  bulkDeleteVehicles,
  clearSuccessMessage,
  clearError,
} from './adminSlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
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

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error, successMessage } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [formData, setFormData] = useState({
    type: '',
    baseFare: '',
    ratePerKm: '',
    perDayCharge: '',
    capacity: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const vehicleData = {
      ...formData,
      baseFare: parseFloat(formData.baseFare),
      ratePerKm: parseFloat(formData.ratePerKm),
      perDayCharge: parseFloat(formData.perDayCharge),
      capacity: parseInt(formData.capacity),
    };
    
    if (editingId) {
      dispatch(updateVehicle({ id: editingId, ...vehicleData }));
    } else {
      dispatch(createVehicle(vehicleData));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: '',
      baseFare: '',
      ratePerKm: '',
      perDayCharge: '',
      capacity: '',
      description: '',
      image: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      dispatch(deleteVehicle(id));
    }
  };

  // Bulk selection handlers
  const handleRowCheckboxChange = (vehicleId) => {
    setSelectedVehicles(toggleItemSelection(selectedVehicles, vehicleId));
  };

  const handleSelectAllChange = () => {
    const stats = getSelectionStats(selectedVehicles, vehicles);
    if (stats.isAllSelected) {
      setSelectedVehicles(clearSelection());
    } else {
      setSelectedVehicles(selectAllItems(vehicles));
    }
  };

  const handleBulkDelete = () => {
    const stats = getSelectionStats(selectedVehicles, vehicles);
    const confirmMsg = getBulkActionConfirmMessage('delete', stats.totalSelected, 'vehicle');

    if (window.confirm(confirmMsg)) {
      const ids = formatSelectedIdsForAPI(selectedVehicles);
      dispatch(bulkDeleteVehicles(ids)).then(() => {
        setSelectedVehicles(clearSelection());
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedVehicles(clearSelection());
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Vehicle Management</h2>
        <div className="header-actions">
          <button
            className="add-btn export-btn"
            onClick={() => setShowExportModal(true)}
            title="Export vehicles"
          >
            📥 Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Add New Vehicle'}
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

      <BulkActionBar
        selectedCount={selectedVehicles.size}
        totalCount={vehicles?.length || 0}
        isAllSelected={selectedVehicles.size === vehicles?.length && vehicles?.length > 0}
        entityType="vehicle"
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
        onSelectAll={() => setSelectedVehicles(selectAllItems(vehicles))}
        loading={loading}
      />

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Edit Vehicle' : 'Create New Vehicle'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Vehicle Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g., Sedan, SUV, Luxury"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group col-md-6">
                <label>Capacity (Passengers)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-4">
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

              <div className="form-group col-md-4">
                <label>Rate Per KM (₹)</label>
                <input
                  type="number"
                  name="ratePerKm"
                  value={formData.ratePerKm}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="form-control"
                />
              </div>

              <div className="form-group col-md-4">
                <label>Per Day Charge (₹)</label>
                <input
                  type="number"
                  name="perDayCharge"
                  value={formData.perDayCharge}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Comfortable & Economical"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="form-control"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <button type="submit" className="btn btn-success">
              {editingId ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <p>Loading vehicles...</p>
        ) : vehicles && vehicles.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <HeaderCheckbox
                  isAllSelected={selectedVehicles.size === vehicles.length && vehicles.length > 0}
                  isIndeterminate={selectedVehicles.size > 0 && selectedVehicles.size < vehicles.length}
                  onChange={handleSelectAllChange}
                  disabled={loading || vehicles.length === 0}
                  title="Select all vehicles"
                />
                <th>Type</th>
                <th>Capacity</th>
                <th>Base Fare</th>
                <th>Rate/KM</th>
                <th>Per Day</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <RowCheckbox
                    isSelected={isItemSelected(selectedVehicles, vehicle.id)}
                    onChange={() => handleRowCheckboxChange(vehicle.id)}
                    disabled={loading}
                    rowId={vehicle.id}
                  />
                  <td>{vehicle.type}</td>
                  <td>{vehicle.capacity}</td>
                  <td>₹{vehicle.baseFare}</td>
                  <td>₹{vehicle.ratePerKm}</td>
                  <td>₹{vehicle.perDayCharge}</td>
                  <td>{vehicle.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vehicles found. Create your first vehicle!</p>
        )}
      </div>

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        data={vehicles}
        entityType="vehicle"
        filename="vehicles"
      />
    </div>
  );
};

export default VehicleManagement;
