import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBookings,
  updateBooking,
} from "../features/bookingHistory/bookingHistorySlice";
import { selectCurrentUser } from "../features/auth/authSelectors";
import RideTracker from "./RideTracker";
import RatingModal from "./RatingModal";
import { checkHasRated } from "../features/rating/ratingSlice";
import { FaStar, FaChevronRight, FaCalendarAlt, FaCar, FaMapMarkerAlt } from "react-icons/fa";

const BookingHistory = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const bookings = useSelector((state) => state.bookingHistory.bookings);
  const hasRatedMap = useSelector((state) => state.rating.hasRatedMap);
  const loading = useSelector((state) => state.bookingHistory.loading);
  const error = useSelector((state) => state.bookingHistory.error);
  const isOffline = useSelector((state) => state.bookingHistory.isOffline);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        if (booking.status === "Completed" && hasRatedMap[booking.id] === undefined) {
          dispatch(checkHasRated(booking.id));
        }
      });
    }
  }, [bookings, dispatch, hasRatedMap]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCancelBooking = (bookingId) => {
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    const bookingToUpdate = bookingsArray.find((b) => b.id === bookingId);
    if (bookingToUpdate) {
      dispatch(updateBooking({ ...bookingToUpdate, status: "Cancelled" }));
    }
  };

  const handleOpenRating = (booking) => {
    setSelectedBookingForRating(booking);
  };

  // Safely ensure bookings is an array
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  // Filter bookings by current user only
  // Backend API (/v1/bookings) returns only authenticated user's bookings
  // Frontend applies additional security filter to ensure no cross-user data leakage
  const userBookings = bookingsArray.filter((booking) => {
    // Ensure user is authenticated and has an ID
    if (!currentUser || !currentUser.id) {
      return false;
    }
    // Filter by current user - only show bookings created by the authenticated user
    return booking.userId === currentUser.id;
  });

  const filteredBookings = userBookings.filter((booking) => {
    if (activeTab === "All") {
      return true;
    }
    return booking.status === activeTab;
  });

  if (loading) {
    return (
      <div className="container mt-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your booking history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center py-5" role="alert">
          <i className="bi bi-info-circle fs-1 mb-3"></i>
          <h4>Please login to view your booking history</h4>
          <p className="mb-4">You need to be authenticated to access this page.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          Your Bookings
          {userBookings.length > 0 && (
            <span className="badge bg-primary ms-2">{userBookings.length}</span>
          )}
        </h2>
        {isOffline && (
          <span className="badge bg-warning text-dark">
            <i className="bi bi-wifi-off me-1"></i>
            Offline Mode
          </span>
        )}
      </div>

      {error && isOffline && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Backend Unavailable:</strong> {error} Showing cached data.
          <button
            className="btn btn-sm btn-outline-warning ms-3"
            onClick={() => dispatch(fetchBookings())}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry Connection
          </button>
        </div>
      )}

      {error && !isOffline && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Error:</strong> {error}
          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => dispatch(fetchBookings())}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>
      )}

      {userBookings.length === 0 && !error ? (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          You don't have any bookings yet.
          <button
            className="btn btn-sm btn-link ms-2"
            onClick={() => window.location.href = '/'}
          >
            Book your first ride now
          </button>
        </div>
      ) : (
        <>
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "All" ? "active" : ""}`}
                onClick={() => handleTabChange("All")}
              >
                All
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "Upcoming" ? "active" : ""}`}
                onClick={() => handleTabChange("Upcoming")}
              >
                Upcoming
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "Completed" ? "active" : ""}`}
                onClick={() => handleTabChange("Completed")}
              >
                Completed
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "Cancelled" ? "active" : ""}`}
                onClick={() => handleTabChange("Cancelled")}
              >
                Cancelled
              </button>
            </li>
          </ul>

          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No {activeTab.toLowerCase()} bookings found.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">ID: {booking.id}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {booking.from} <FaChevronRight className="text-xs text-gray-400" /> {booking.to}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{booking.amount}</p>
                        <p className="text-xs text-gray-500">Incl. all taxes</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <FaCalendarAlt />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date & Time</p>
                          <p className="text-sm font-semibold text-gray-700">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <FaCar />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Vehicle Type</p>
                          <p className="text-sm font-semibold text-gray-700">{booking.vehicle}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pickup Point</p>
                          <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">{booking.pickupAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-50">
                      {booking.status === "Upcoming" && (
                        <>
                          <button
                            className="px-6 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Ride
                          </button>
                          <RideTracker />
                        </>
                      )}
                      {booking.status === "Completed" && (
                        <div className="flex items-center gap-3 w-full justify-between">
                          {hasRatedMap[booking.id] ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-medium">
                              <FaStar />
                              <span>You rated this trip</span>
                            </div>
                          ) : (
                            <button
                              className="px-6 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
                              onClick={() => handleOpenRating(booking)}
                            >
                              <FaStar />
                              Rate Experience
                            </button>
                          )}
                          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                            Download Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {selectedBookingForRating && (
        <RatingModal
          booking={selectedBookingForRating}
          onClose={() => setSelectedBookingForRating(null)}
        />
      )}
    </div>
  );
};

export default BookingHistory;
