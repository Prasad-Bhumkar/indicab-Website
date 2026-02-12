import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPendingApplications,
  fetchApprovedDrivers,
  reviewDriverApplication,
  clearError,
  clearSuccessMessage,
} from './driverSlice';
import './DriverApprovalDashboard.css';

const DriverApprovalDashboard = () => {
  const dispatch = useDispatch();
  const { pendingApplications, approvedDrivers, loading, error, successMessage } = useSelector(
    (state) => state.driver
  );
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (activeTab === 'pending') {
      dispatch(fetchPendingApplications());
    } else if (activeTab === 'approved') {
      dispatch(fetchApprovedDrivers());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        setSelectedDriver(null);
        setRejectionReason('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleApprove = (driverId) => {
    dispatch(
      reviewDriverApplication({
        driverId,
        status: 'APPROVED',
      })
    );
  };

  const handleReject = (driverId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    dispatch(
      reviewDriverApplication({
        driverId,
        status: 'REJECTED',
        rejectionReason,
      })
    );
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(selectedDriver?.id === driver.id ? null : driver);
    setRejectionReason('');
  };

  return (
    <div className="driver-approval-dashboard-container">
      <div className="driver-approval-header">
        <h1 className="driver-approval-title">Driver Management</h1>
        <p className="driver-approval-subtitle">Review and approve driver applications</p>
      </div>

      {successMessage && (
        <div className="alert alert-success driver-approval-alert">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger driver-approval-alert">
          {error}
          <button
            className="alert-close"
            onClick={() => dispatch(clearError())}
            type="button"
          >
            ×
          </button>
        </div>
      )}

      <div className="driver-approval-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Applications ({pendingApplications.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Drivers ({approvedDrivers.length})
        </button>
      </div>

      <div className="driver-approval-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading drivers...</p>
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <div className="drivers-list">
                {pendingApplications.length === 0 ? (
                  <div className="empty-state">
                    <p>No pending applications</p>
                  </div>
                ) : (
                  pendingApplications.map((driver) => (
                    <div
                      key={driver.id}
                      className={`driver-card ${selectedDriver?.id === driver.id ? 'expanded' : ''}`}
                      onClick={() => handleSelectDriver(driver)}
                    >
                      <div className="driver-card-header">
                        <div className="driver-info">
                          <h3 className="driver-name">{driver.name}</h3>
                          <p className="driver-email">{driver.email}</p>
                        </div>
                        <span className="status-badge status-pending">Pending</span>
                      </div>

                      <div className="driver-card-body">
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">License Number</span>
                            <span className="info-value">{driver.licenseNumber}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Vehicle Type</span>
                            <span className="info-value">{driver.vehicleType}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phone</span>
                            <span className="info-value">{driver.phone}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Applied Date</span>
                            <span className="info-value">
                              {new Date(driver.driverAppliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="info-full">
                          <span className="info-label">Address</span>
                          <span className="info-value">{driver.address}</span>
                        </div>
                      </div>

                      {selectedDriver?.id === driver.id && (
                        <div className="driver-actions">
                          <div className="rejection-reason">
                            <label htmlFor={`reason-${driver.id}`} className="label">
                              Rejection Reason (if rejecting)
                            </label>
                            <textarea
                              id={`reason-${driver.id}`}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide a reason for rejection"
                              className="form-control"
                              rows="3"
                            />
                          </div>
                          <div className="action-buttons">
                            <button
                              className="btn btn-success"
                              onClick={() => handleApprove(driver.id)}
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleReject(driver.id)}
                              disabled={loading || !rejectionReason.trim()}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div className="drivers-list">
                {approvedDrivers.length === 0 ? (
                  <div className="empty-state">
                    <p>No approved drivers yet</p>
                  </div>
                ) : (
                  approvedDrivers.map((driver) => (
                    <div key={driver.id} className="driver-card">
                      <div className="driver-card-header">
                        <div className="driver-info">
                          <h3 className="driver-name">{driver.name}</h3>
                          <p className="driver-email">{driver.email}</p>
                        </div>
                        <span className="status-badge status-approved">Approved</span>
                      </div>

                      <div className="driver-card-body">
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">License Number</span>
                            <span className="info-value">{driver.licenseNumber}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Vehicle Type</span>
                            <span className="info-value">{driver.vehicleType}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phone</span>
                            <span className="info-value">{driver.phone}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Approved Date</span>
                            <span className="info-value">
                              {new Date(driver.driverApprovedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="info-full">
                          <span className="info-label">Address</span>
                          <span className="info-value">{driver.address}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverApprovalDashboard;
