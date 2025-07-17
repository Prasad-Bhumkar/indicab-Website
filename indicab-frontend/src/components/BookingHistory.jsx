import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings, updateBooking } from '../features/bookingHistory/bookingHistorySlice';
import RideTracker from './RideTracker';

const BookingHistory = () => {
  const [activeTab, setActiveTab] = useState('All');
  const bookings = useSelector((state) => state.bookingHistory.bookings);
  const loading = useSelector((state) => state.bookingHistory.loading);
  const error = useSelector((state) => state.bookingHistory.error);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCancelBooking = (bookingId) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    if (bookingToUpdate) {
      dispatch(updateBooking({ ...bookingToUpdate, status: 'Cancelled' }));
    }
  };

  const handleRateBooking = (bookingId, rating) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    if (bookingToUpdate) {
      dispatch(updateBooking({ ...bookingToUpdate, rating }));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'All') {
      return true;
    }
    return booking.status === activeTab;
  });

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  if (error) {
    return <div>Error loading bookings: {error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Booking History</h2>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'All' ? 'active' : ''}`} onClick={() => handleTabChange('All')}>All</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'Upcoming' ? 'active' : ''}`} onClick={() => handleTabChange('Upcoming')}>Upcoming</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => handleTabChange('Completed')}>Completed</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'Cancelled' ? 'active' : ''}`} onClick={() => handleTabChange('Cancelled')}>Cancelled</button>
        </li>
      </ul>

      <div className="tab-content">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{booking.from} to {booking.to}</h5>
              <p className="card-text">Date: {booking.date}</p>
              <p className="card-text">Vehicle: {booking.vehicle}</p>
              <p className="card-text">Fare: ₹{booking.amount}</p>
              <p className="card-text">Status: {booking.status}</p>
              {booking.status === 'Upcoming' && (
                <>
                  <button className="btn btn-danger" onClick={() => handleCancelBooking(booking.id)}>Cancel Booking</button>
                  <RideTracker />
                </>
              )}
              {booking.status === 'Completed' && (
                <div>
                  <h6>Rate your ride:</h6>
                  <div>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} className={`btn btn-link ${booking.rating && booking.rating >= star ? 'text-warning' : 'text-muted'}`} onClick={() => handleRateBooking(booking.id, star)}>
                        <i className="bi bi-star-fill"></i>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingHistory;
