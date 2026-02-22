import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { dashboard } = useSelector(state => state.admin || {});
  const [stats, setStats] = useState({
    totalBookings: 1247,
    totalRevenue: 125400,
    activeDrivers: 89,
    totalUsers: 3421,
    completedTrips: 1089,
    pendingApprovals: 12,
    weeklyRevenue: 28500,
    averageRating: 4.7,
  });
  const [recentBookings, setRecentBookings] = useState([
    { id: 1, customer: 'John Doe', destination: 'Airport', amount: 450, status: 'completed', time: '2 hours ago' },
    { id: 2, customer: 'Jane Smith', destination: 'Mall', amount: 320, status: 'in-progress', time: '30 mins ago' },
    { id: 3, customer: 'Bob Johnson', destination: 'Station', amount: 280, status: 'pending', time: '5 mins ago' },
    { id: 4, customer: 'Alice Williams', destination: 'Hotel', amount: 500, status: 'completed', time: '1 hour ago' },
  ]);

  const [activeDrivers, setActiveDrivers] = useState([
    { id: 1, name: 'Raj Kumar', vehicle: 'Swift DZire', status: 'available', rating: 4.8, trips: 156 },
    { id: 2, name: 'Priya Singh', vehicle: 'Creta', status: 'on-trip', rating: 4.9, trips: 203 },
    { id: 3, name: 'Amit Patel', vehicle: 'Fortuner', status: 'available', rating: 4.6, trips: 89 },
    { id: 4, name: 'Sophia Lee', vehicle: 'Baleno', status: 'available', rating: 4.7, trips: 142 },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch admin dashboard data from API
    // For now, using mock data - replace with actual API call
    setLoading(false);
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in-progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-info';
      case 'available':
        return 'badge-success';
      case 'on-trip':
        return 'badge-warning';
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
        {trend && <p className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
        </p>}
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard icon="📊" label="Total Bookings" value={stats.totalBookings} trend={8} />
        <MetricCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} trend={12} />
        <MetricCard icon="🚗" label="Active Drivers" value={stats.activeDrivers} trend={-2} />
        <MetricCard icon="👥" label="Total Users" value={stats.totalUsers} trend={5} />
      </div>

      {/* Secondary Metrics Row */}
      <div className="metrics-grid">
        <MetricCard icon="✓" label="Completed Trips" value={stats.completedTrips} trend={3} />
        <MetricCard icon="⏳" label="Pending Approvals" value={stats.pendingApprovals} trend={0} />
        <MetricCard icon="📈" label="Weekly Revenue" value={`₹${stats.weeklyRevenue.toLocaleString()}`} trend={15} />
        <MetricCard icon="⭐" label="Avg. Rating" value={stats.averageRating} trend={0.5} />
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-btn action-btn-primary">
            <span className="action-icon">➕</span>
            <span>Add Driver</span>
          </button>
          <button className="action-btn action-btn-secondary">
            <span className="action-icon">🏙️</span>
            <span>Add City</span>
          </button>
          <button className="action-btn action-btn-secondary">
            <span className="action-icon">📊</span>
            <span>View Reports</span>
          </button>
          <button className="action-btn action-btn-secondary">
            <span className="action-icon">⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

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
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="booking-id">#{booking.id}</td>
                  <td>{booking.customer}</td>
                  <td>{booking.destination}</td>
                  <td className="amount">₹{booking.amount}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="time-cell">{booking.time}</td>
                  <td>
                    <button className="action-link">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Drivers Section */}
      <div className="section-box">
        <div className="section-header">
          <h3 className="section-title">Active Drivers</h3>
          <a href="/admin/drivers" className="view-all-link">Manage Drivers</a>
        </div>
        <div className="drivers-grid">
          {activeDrivers.map((driver) => (
            <div key={driver.id} className="driver-card">
              <div className="driver-header">
                <h4 className="driver-name">{driver.name}</h4>
                <span className={`badge ${getStatusBadgeClass(driver.status)}`}>
                  {driver.status.replace('-', ' ')}
                </span>
              </div>
              <div className="driver-details">
                <p className="driver-vehicle">
                  <span className="detail-icon">🚗</span>
                  {driver.vehicle}
                </p>
                <p className="driver-rating">
                  <span className="detail-icon">⭐</span>
                  {driver.rating} ({driver.trips} trips)
                </p>
              </div>
              <button className="driver-action-btn">Profile</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
