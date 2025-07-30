import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminDashboard } from './adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {dashboard ? (
        <div>
          <p>Total Users: {dashboard.totalUsers}</p>
          <p>Total Drivers: {dashboard.totalDrivers}</p>
          <p>Total Bookings: {dashboard.totalBookings}</p>
        </div>
      ) : (
        <div>No data available.</div>
      )}
    </div>
  );
};

export default AdminDashboard;
