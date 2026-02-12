import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyAsDriver, clearError, clearSuccessMessage } from './driverSlice';
import './DriverRegister.css';

const DriverRegister = () => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.driver);
  const [form, setForm] = useState({
    licenseNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    phoneNumber: '',
    address: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!form.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    } else if (form.licenseNumber.length < 5) {
      errors.licenseNumber = 'License number must be at least 5 characters';
    }

    if (!form.vehicleType.trim()) {
      errors.vehicleType = 'Vehicle type is required';
    }

    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+?91)?[6-9]\d{9}$/.test(form.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be a valid Indian number (10 digits or +91 format)';
    }

    if (!form.address.trim()) {
      errors.address = 'Address is required';
    } else if (form.address.length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    dispatch(applyAsDriver(form));
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="driver-register-container">
      <div className="driver-register-card">
        <h2 className="driver-register-title">Apply as Driver</h2>
        <p className="driver-register-subtitle">Fill in your details to apply for driver approval</p>

        {successMessage && (
          <div className="alert alert-success driver-register-alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger driver-register-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="driver-register-form">
          <div className="form-group">
            <label htmlFor="licenseNumber" className="form-label">License Number *</label>
            <input
              id="licenseNumber"
              type="text"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              className={`form-control ${validationErrors.licenseNumber ? 'is-invalid' : ''}`}
              placeholder="e.g., MH02AB1234"
              disabled={loading}
            />
            {validationErrors.licenseNumber && (
              <div className="invalid-feedback">{validationErrors.licenseNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="vehicleType" className="form-label">Vehicle Type *</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              className={`form-control ${validationErrors.vehicleType ? 'is-invalid' : ''}`}
              disabled={loading}
            >
              <option value="">Select Vehicle Type</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Autorickshaw">Autorickshaw</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
            </select>
            {validationErrors.vehicleType && (
              <div className="invalid-feedback">{validationErrors.vehicleType}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="vehicleNumber" className="form-label">Vehicle Number (Optional)</label>
            <input
              id="vehicleNumber"
              type="text"
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., MH02AB1234"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">Phone Number *</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className={`form-control ${validationErrors.phoneNumber ? 'is-invalid' : ''}`}
              placeholder="e.g., 9876543210"
              disabled={loading}
            />
            {validationErrors.phoneNumber && (
              <div className="invalid-feedback">{validationErrors.phoneNumber}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address *</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              className={`form-control ${validationErrors.address ? 'is-invalid' : ''}`}
              placeholder="Your residential address"
              rows="3"
              disabled={loading}
            />
            {validationErrors.address && (
              <div className="invalid-feedback">{validationErrors.address}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary driver-register-submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <p className="driver-register-note">
          * Required fields. Your application will be reviewed by our admin team within 24-48 hours.
        </p>
      </div>
    </div>
  );
};

export default DriverRegister;
