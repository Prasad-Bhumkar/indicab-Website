import { apiClient } from '../../config/apiConfig';

// Dashboard endpoints
export const fetchAdminDashboardApi = () => apiClient.get('/v1/admin/dashboard');

// User management endpoints
export const fetchUsersApi = () => apiClient.get('/v1/admin/users');
export const createUserApi = (userData) => apiClient.post('/v1/admin/users', userData);
export const updateUserApi = (userId, userData) => apiClient.put(`/v1/admin/users/${userId}`, userData);
export const deleteUserApi = (userId) => apiClient.delete(`/v1/admin/users/${userId}`);
export const getUserByIdApi = (userId) => apiClient.get(`/v1/admin/users/${userId}`);

// Driver management endpoints
export const fetchDriversApi = () => apiClient.get('/v1/admin/drivers');
export const createDriverApi = (driverData) => apiClient.post('/v1/admin/drivers', driverData);
export const updateDriverApi = (driverId, driverData) => apiClient.put(`/v1/admin/drivers/${driverId}`, driverData);
export const deleteDriverApi = (driverId) => apiClient.delete(`/v1/admin/drivers/${driverId}`);
export const getDriverByIdApi = (driverId) => apiClient.get(`/v1/admin/drivers/${driverId}`);
export const approveDriverApi = (driverId) => apiClient.put(`/v1/admin/drivers/${driverId}/approve`);
export const rejectDriverApi = (driverId) => apiClient.put(`/v1/admin/drivers/${driverId}/reject`);

// Booking management endpoints
export const fetchBookingsApi = () => apiClient.get('/v1/admin/bookings');
export const getBookingByIdApi = (bookingId) => apiClient.get(`/v1/admin/bookings/${bookingId}`);
export const updateBookingStatusApi = (bookingId, status) => apiClient.put(`/v1/admin/bookings/${bookingId}/status`, { status });
export const cancelBookingApi = (bookingId, reason) => apiClient.put(`/v1/admin/bookings/${bookingId}/cancel`, { reason });

// Statistics endpoints
export const fetchAdminStatsApi = () => apiClient.get('/v1/admin/stats');
export const fetchRevenueApi = (period = 'monthly') => apiClient.get(`/v1/admin/revenue?period=${period}`);

// Route management endpoints
export const fetchRoutesApi = () => apiClient.get('/v1/routes');
export const createRouteApi = (routeData) => apiClient.post('/v1/routes', routeData);
export const updateRouteApi = (routeId, routeData) => apiClient.put(`/v1/routes/${routeId}`, routeData);
export const deleteRouteApi = (routeId) => apiClient.delete(`/v1/routes/${routeId}`);

// Service city management endpoints
export const fetchServiceCitiesApi = () => apiClient.get('/v1/service-cities');
export const createServiceCityApi = (cityData) => apiClient.post('/v1/service-cities', cityData);
export const updateServiceCityApi = (cityName, cityData) => apiClient.put(`/v1/service-cities/${cityName}`, cityData);
export const deleteServiceCityApi = (cityName) => apiClient.delete(`/v1/service-cities/${cityName}`);

// Blog management endpoints
export const fetchBlogsApi = () => apiClient.get('/v1/admin/blogs');
export const createBlogApi = (blogData) => apiClient.post('/v1/admin/blogs', blogData);
export const updateBlogApi = (blogId, blogData) => apiClient.put(`/v1/admin/blogs/${blogId}`, blogData);
export const deleteBlogApi = (blogId) => apiClient.delete(`/v1/admin/blogs/${blogId}`);
export const publishBlogApi = (blogId) => apiClient.put(`/v1/admin/blogs/${blogId}/publish`);
export const unpublishBlogApi = (blogId) => apiClient.put(`/v1/admin/blogs/${blogId}/unpublish`);

// Package management endpoints
export const fetchPackagesApi = () => apiClient.get('/v1/admin/packages');
export const createPackageApi = (packageData) => apiClient.post('/v1/admin/packages', packageData);
export const updatePackageApi = (packageId, packageData) => apiClient.put(`/v1/admin/packages/${packageId}`, packageData);
export const deletePackageApi = (packageId) => apiClient.delete(`/v1/admin/packages/${packageId}`);

// Vehicle management endpoints
export const fetchVehiclesApi = () => apiClient.get('/v1/admin/vehicles');
export const createVehicleApi = (vehicleData) => apiClient.post('/v1/admin/vehicles', vehicleData);
export const updateVehicleApi = (vehicleId, vehicleData) => apiClient.put(`/v1/admin/vehicles/${vehicleId}`, vehicleData);
export const deleteVehicleApi = (vehicleId) => apiClient.delete(`/v1/admin/vehicles/${vehicleId}`);
