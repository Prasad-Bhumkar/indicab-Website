import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import DriverManagement from './DriverManagement';
import BookingManagement from './BookingManagement';
import BlogManagement from './BlogManagement';
import PackageManagement from './PackageManagement';
import VehicleManagement from './VehicleManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminAuditLogs from './AdminAuditLogs';

const AdminRoutes = () => (
  <Routes>
    <Route path="" element={<AdminDashboard />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="audit-logs" element={<AdminAuditLogs />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="drivers" element={<DriverManagement />} />
    <Route path="bookings" element={<BookingManagement />} />
    <Route path="blogs" element={<BlogManagement />} />
    <Route path="packages" element={<PackageManagement />} />
    <Route path="vehicles" element={<VehicleManagement />} />
  </Routes>
);

export default AdminRoutes;
