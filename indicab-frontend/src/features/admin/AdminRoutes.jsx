import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import DriverManagement from './DriverManagement';
import BookingManagement from './BookingManagement';

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/drivers" element={<DriverManagement />} />
    <Route path="/admin/bookings" element={<BookingManagement />} />
  </Routes>
);

export default AdminRoutes;
