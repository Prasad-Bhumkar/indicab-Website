import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrivers, createDriver, updateDriver, approveDriver, rejectDriver, deleteDriver, clearSuccessMessage, clearError } from './adminSlice';
import './ManagementPages.css';

const DriverManagement = () => {
  const dispatch = useDispatch();
  const { drivers, loading, error, successMessage } = useSelector((state) => state.admin);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    licenseNumber: '',
    status: 'pending'
  });

  useEffect(() => {
    dispatch(fetchDrivers());
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

  const handleAddDriver = (e) => {
    e.preventDefault();
    dispatch(createDriver(formData));
    setShowAddForm(false);
    resetForm();
  };

  const handleEditClick = (driver) => {
    setEditingId(driver.id);
    setFormData({ ...driver });
    setShowAddForm(false);
  };

  const handleSaveEdit = (driverId) => {
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

  return (
    <div className="management-container">
      <div className="management-header">
        <h3 className="management-title">Driver Management</h3>
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

      {(showAddForm || editingId) && (
        <div className="form-card">
          <h4>{editingId ? 'Edit Driver' : 'Add New Driver'}</h4>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); handleSaveEdit(editingId); } : handleAddDriver}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Info</label>
                <input type="text" name="vehicleInfo" className="form-input" value={formData.vehicleInfo || ''} onChange={handleInputChange} placeholder="e.g. Swift DZire (WHT-1234)" />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input type="text" name="licenseNumber" className="form-input" value={formData.licenseNumber || ''} onChange={handleInputChange} />
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
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <tr key={driver.id}>
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
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No drivers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
