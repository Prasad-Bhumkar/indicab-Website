import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import DriverManagement from './DriverManagement';
import BookingManagement from './BookingManagement';
import BlogManagement from './BlogManagement';
import PackageManagement from './PackageManagement';
import VehicleManagement from './VehicleManagement';

const AdminRoutes = () => (
  <Routes>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<UserManagement />} />
    <Route path="/admin/drivers" element={<DriverManagement />} />
    <Route path="/admin/bookings" element={<BookingManagement />} />
    <Route path="/admin/blogs" element={<BlogManagement />} />
    <Route path="/admin/packages" element={<PackageManagement />} />
    <Route path="/admin/vehicles" element={<VehicleManagement />} />
  </Routes>
);

export default AdminRoutes;
