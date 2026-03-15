import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../config/apiConfig';
import './GuestBookingStatus.css';

const GuestBookingStatus = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(!!bookingId);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState(bookingId || '');

  const statusColors = {
    PENDING: '#fbbf24',
    CONFIRMED: '#10b981',
    ONGOING: '#3b82f6',
    COMPLETED: '#8b5cf6',
    CANCELLED: '#ef4444',
  };

  const statusLabels = {
    PENDING: 'Pending Confirmation',
    CONFIRMED: 'Confirmed',
    ONGOING: 'Ride in Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  const fetchBooking = async (id) => {
    if (!id || id.trim() === '') {
      setError('Please enter a booking ID');
      setBooking(null);
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const response = await apiClient.get(`/v1/bookings/${id}/public`);
      setBooking(response.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'Booking not found. Please check the booking ID.'
          : 'Unable to fetch booking details. Please try again.'
      );
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooking(searchId);
  };

  React.useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  return (
    <div className="guest-booking-container">
      <div className="guest-booking-card">
        <h2 className="guest-booking-title">Check Your Booking Status</h2>
        <p className="guest-booking-subtitle">
          Enter your booking ID to view your trip details without logging in
        </p>

        <form onSubmit={handleSearch} className="booking-search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Enter your booking ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="booking-search-input"
              disabled={loading}
            />
            <button type="submit" className="booking-search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="booking-error-alert">
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {loading && !booking && (
          <div className="booking-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {booking && (
          <div className="booking-details">
            <div className="status-card">
              <div
                className="status-indicator"
                style={{ backgroundColor: statusColors[booking.status] }}
              >
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="status-text">
                <p className="status-label">{statusLabels[booking.status]}</p>
                <p className="booking-id">ID: {booking.id}</p>
              </div>
            </div>

            <div className="booking-info-grid">
              <div className="info-item">
                <label>Route</label>
                <p>
                  {booking.from} <i className="bi bi-arrow-right"></i> {booking.to}
                </p>
              </div>

              <div className="info-item">
                <label>Departure Date</label>
                <p>{new Date(booking.date).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="info-item">
                <label>Vehicle Type</label>
                <p>{booking.vehicle}</p>
              </div>

              <div className="info-item">
                <label>Estimated Fare</label>
                <p className="fare-amount">₹{booking.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="booking-cta-section">
              <p className="cta-text">Want to manage your bookings or view full history?</p>
              <a href="/login" className="btn-login">
                <i className="bi bi-box-arrow-in-right"></i> Login to Your Account
              </a>
              <p className="register-prompt">
                Don't have an account?{' '}
                <a href="/register" className="link-register">
                  Create one here
                </a>
              </p>
            </div>
          </div>
        )}

        {!booking && !loading && !error && (
          <div className="booking-empty-state">
            <i className="bi bi-search"></i>
            <p>Enter your booking ID above to check your booking status</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookingStatus;
