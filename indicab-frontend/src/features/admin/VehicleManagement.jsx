import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './adminSlice';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import './ManagementPages.css';

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const { vehicles, loading, error } = useSelector((state) => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>Vehicle Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> {showForm ? 'Cancel' : 'Add New Vehicle'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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
    </div>
  );
};

export default VehicleManagement;
