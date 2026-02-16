import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, updateBookingStatus, cancelBooking, clearSuccessMessage, clearError } from './adminSlice';
import './ManagementPages.css';

const BookingManagement = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error, successMessage } = useSelector((state) => state.admin);
  
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleStatusChange = (bookingId, newStatus) => {
    dispatch(updateBookingStatus({ bookingId, status: newStatus }));
  };

  const handleCancel = (bookingId) => {
    const reason = window.prompt('Enter reason for cancellation:');
    if (reason !== null) {
      dispatch(cancelBooking({ bookingId, reason: reason || 'Admin cancelled' }));
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase() || 'pending'}`;
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status?.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="management-container">
      <div className="management-header">
        <h3 className="management-title">Booking Management</h3>
        <div className="filter-group">
          <select 
            className="form-select" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{width: 'auto'}}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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

      {loading && !bookings.length ? (
        <div className="loading-spinner">Loading bookings...</div>
      ) : (
        <div className="table-responsive">
          <table className="management-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Route</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.user}</td>
                    <td>
                      <div style={{fontWeight: '500'}}>{booking.from} → {booking.to}</div>
                    </td>
                    <td>{booking.date}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm ${getStatusClass(booking.status)}`}
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        style={{border: 'none', fontWeight: '600'}}
                      >
                        <option value="pending">Pending</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-delete" onClick={() => handleCancel(booking.id)} title="Cancel Booking">
                          🚫
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
