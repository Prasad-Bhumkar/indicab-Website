import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminDashboard,
  fetchUsers,
  fetchDrivers,
  fetchBookings,
  addRealTimeBooking,
  updateRealTimeBookingStatus,
  addRealTimeUser,
  updateDashboardStats
} from './adminSlice';
import { adminWebsocketService } from '../../services/adminWebsocketService';
import Skeleton, { SkeletonTable } from '../../components/Skeleton';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, users, drivers, bookings, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchUsers());
    dispatch(fetchDrivers());
    dispatch(fetchBookings());

    // Connect and subscribe to WebSocket updates
    adminWebsocketService.connect().then(() => {
      // Dashboard updates
      const unsubDashboard = adminWebsocketService.subscribeToDashboardUpdates((data) => {
        dispatch(updateDashboardStats(data));
      });

      // Booking updates
      const unsubBookings = adminWebsocketService.subscribeToBookingUpdates((payload) => {
        if (payload.type === 'NEW_BOOKING') {
          dispatch(addRealTimeBooking(payload.data));
        } else if (payload.type === 'BOOKING_STATUS_UPDATE') {
          dispatch(updateRealTimeBookingStatus(payload));
        }
      });

      // User updates
      const unsubUsers = adminWebsocketService.subscribeToUserUpdates((payload) => {
        if (payload.type === 'NEW_USER') {
          dispatch(addRealTimeUser(payload.data));
        }
      });

      return () => {
        unsubDashboard();
        unsubBookings();
        unsubUsers();
      };
    });

    return () => {
      adminWebsocketService.disconnect();
    };
  }, [dispatch]);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'active':
        return 'badge-success';
      case 'ongoing':
      case 'pending':
      case 'on-trip':
        return 'badge-warning';
      case 'cancelled':
      case 'rejected':
      case 'suspended':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const MetricCard = ({ icon, label, value, trend }) => (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <p className="metric-label">{label}</p>
        <h3 className="metric-value">{value}</h3>
        {trend && (
          <p className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
    </div>
  );

  if (loading && !dashboard) {
    return (
      <div className="admin-dashboard">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <div className="metrics-grid">
          <Skeleton height="120px" borderRadius="8px" />
          <Skeleton height="120px" borderRadius="8px" />
          <Skeleton height="120px" borderRadius="8px" />
          <Skeleton height="120px" borderRadius="8px" />
        </div>
        <div className="dashboard-content-grid" style={{ marginTop: '2rem' }}>
          <SkeletonTable rows={5} />
          <div className="drivers-grid">
            <Skeleton height="150px" borderRadius="8px" />
            <Skeleton height="150px" borderRadius="8px" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="admin-dashboard">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <div className="alert alert-danger">Error: {error}</div>
      </div>
    );
  }

  // Use real data from Redux or fall back to dashboard object
  const stats = {
    totalBookings: dashboard?.totalBookings || bookings.length,
    totalRevenue: dashboard?.revenue || '₹0',
    activeDrivers: drivers.filter(d => d.status === 'approved' || d.status === 'active').length,
    totalUsers: users.length,
    pendingApprovals: drivers.filter(d => d.status === 'pending').length,
    avgRating: '4.7', // Mock for now
  };

  const recentBookings = bookings.slice(0, 5);
  const recentDrivers = drivers.slice(0, 4);

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard icon="📊" label="Total Bookings" value={stats.totalBookings} trend={8} />
        <MetricCard icon="💰" label="Total Revenue" value={stats.totalRevenue} trend={12} />
        <MetricCard icon="🚗" label="Active Drivers" value={stats.activeDrivers} trend={-2} />
        <MetricCard icon="👥" label="Total Users" value={stats.totalUsers} trend={5} />
      </div>

      {/* Secondary Metrics */}
      <div className="metrics-grid">
        <MetricCard icon="⏳" label="Pending Approvals" value={stats.pendingApprovals} />
        <MetricCard icon="⭐" label="Avg. Rating" value={stats.avgRating} trend={0.5} />
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-btn action-btn-primary" onClick={() => window.location.href='/admin/drivers'}>
            <span className="action-icon">➕</span>
            <span>Manage Drivers</span>
          </button>
          <button className="action-btn action-btn-secondary" onClick={() => window.location.href='/admin/bookings'}>
            <span className="action-icon">📋</span>
            <span>All Bookings</span>
          </button>
          <button className="action-btn action-btn-secondary" onClick={() => window.location.href='/admin/users'}>
            <span className="action-icon">👥</span>
            <span>User Management</span>
          </button>
          <button className="action-btn action-btn-secondary">
            <span className="action-icon">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Bookings Section */}
        <div className="section-box">
          <div className="section-header">
            <h3 className="section-title">Recent Bookings</h3>
            <a href="/admin/bookings" className="view-all-link">View All</a>
          </div>
          <div className="bookings-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="booking-id">#{booking.id}</td>
                      <td>{booking.user}</td>
                      <td>{booking.from}</td>
                      <td>{booking.to}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-link">Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6">No recent bookings.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Drivers Section */}
        <div className="section-box">
          <div className="section-header">
            <h3 className="section-title">Drivers Status</h3>
            <a href="/admin/drivers" className="view-all-link">Manage Drivers</a>
          </div>
          <div className="drivers-grid">
            {recentDrivers.length > 0 ? (
              recentDrivers.map((driver) => (
                <div key={driver.id} className="driver-card">
                  <div className="driver-header">
                    <h4 className="driver-name">{driver.name}</h4>
                    <span className={`badge ${getStatusBadgeClass(driver.status)}`}>
                      {driver.status}
                    </span>
                  </div>
                  <div className="driver-details">
                    <p className="driver-rating">
                      <span className="detail-icon">⭐</span>
                      {driver.rating || 'N/A'}
                    </p>
                  </div>
                  <button className="driver-action-btn" onClick={() => window.location.href='/admin/drivers'}>View Profile</button>
                </div>
              ))
            ) : (
              <p>No drivers found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
