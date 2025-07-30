import axios from 'axios';

export const fetchAdminDashboardApi = () => axios.get('/api/admin/dashboard');
export const fetchUsersApi = () => axios.get('/api/admin/users');
export const fetchDriversApi = () => axios.get('/api/admin/drivers');
export const fetchBookingsApi = () => axios.get('/api/admin/bookings');
