import { apiClient } from '../../config/apiConfig';

// Dashboard endpoints
export const fetchAdminDashboardApi = () => apiClient.get('v1/admin/dashboard');

// User management endpoints
export const fetchUsersApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/users${query}`);
};
export const createUserApi = (userData) => apiClient.post('v1/admin/users', userData);
export const updateUserApi = (userId, userData) => apiClient.put(`v1/admin/users/${userId}`, userData);
export const deleteUserApi = (userId) => apiClient.delete(`v1/admin/users/${userId}`);
export const getUserByIdApi = (userId) => apiClient.get(`v1/admin/users/${userId}`);

// Driver management endpoints
export const fetchDriversApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/drivers${query}`);
};
export const createDriverApi = (driverData) => apiClient.post('v1/admin/drivers', driverData);
export const updateDriverApi = (driverId, driverData) => apiClient.put(`v1/admin/drivers/${driverId}`, driverData);
export const deleteDriverApi = (driverId) => apiClient.delete(`v1/admin/drivers/${driverId}`);
export const getDriverByIdApi = (driverId) => apiClient.get(`v1/admin/drivers/${driverId}`);
export const approveDriverApi = (driverId) => apiClient.put(`v1/admin/drivers/${driverId}/approve`);
export const rejectDriverApi = (driverId) => apiClient.put(`v1/admin/drivers/${driverId}/reject`);

// Booking management endpoints
export const fetchBookingsApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.status) queryParams.append('status', params.status);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/bookings${query}`);
};
export const getBookingByIdApi = (bookingId) => apiClient.get(`v1/admin/bookings/${bookingId}`);
export const updateBookingStatusApi = (bookingId, status) => apiClient.put(`v1/admin/bookings/${bookingId}/status`, { status });
export const cancelBookingApi = (bookingId, reason) => apiClient.put(`v1/admin/bookings/${bookingId}/cancel`, { reason });

// Statistics endpoints
export const fetchAdminStatsApi = () => apiClient.get('v1/admin/stats');
export const fetchRevenueApi = (period = 'monthly') => apiClient.get(`v1/admin/revenue?period=${period}`);

// Route management endpoints
export const fetchRoutesApi = () => apiClient.get('v1/routes');
export const createRouteApi = (routeData) => apiClient.post('v1/routes', routeData);
export const updateRouteApi = (routeId, routeData) => apiClient.put(`v1/routes/${routeId}`, routeData);
export const deleteRouteApi = (routeId) => apiClient.delete(`v1/routes/${routeId}`);

// Service city management endpoints
export const fetchServiceCitiesApi = () => apiClient.get('v1/service-cities');
export const createServiceCityApi = (cityData) => apiClient.post('v1/service-cities', cityData);
export const updateServiceCityApi = (cityName, cityData) => apiClient.put(`v1/service-cities/${cityName}`, cityData);
export const deleteServiceCityApi = (cityName) => apiClient.delete(`v1/service-cities/${cityName}`);

// Blog management endpoints
export const fetchBlogsApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/blogs${query}`);
};
export const createBlogApi = (blogData) => apiClient.post('v1/admin/blogs', blogData);
export const updateBlogApi = (blogId, blogData) => apiClient.put(`v1/admin/blogs/${blogId}`, blogData);
export const deleteBlogApi = (blogId) => apiClient.delete(`v1/admin/blogs/${blogId}`);
export const publishBlogApi = (blogId) => apiClient.put(`v1/admin/blogs/${blogId}/publish`);
export const unpublishBlogApi = (blogId) => apiClient.put(`v1/admin/blogs/${blogId}/unpublish`);

// Package management endpoints
export const fetchPackagesApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.type) queryParams.append('type', params.type);
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/packages${query}`);
};
export const createPackageApi = (packageData) => apiClient.post('v1/admin/packages', packageData);
export const updatePackageApi = (packageId, packageData) => apiClient.put(`v1/admin/packages/${packageId}`, packageData);
export const deletePackageApi = (packageId) => apiClient.delete(`v1/admin/packages/${packageId}`);

// Vehicle management endpoints
export const fetchVehiclesApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.type) queryParams.append('type', params.type);
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/vehicles${query}`);
};
export const createVehicleApi = (vehicleData) => apiClient.post('v1/admin/vehicles', vehicleData);
export const updateVehicleApi = (vehicleId, vehicleData) => apiClient.put(`v1/admin/vehicles/${vehicleId}`, vehicleData);
export const deleteVehicleApi = (vehicleId) => apiClient.delete(`v1/admin/vehicles/${vehicleId}`);

// Bulk operation endpoints
export const bulkDeleteUsersApi = (ids) => {
  return apiClient.delete('v1/admin/users/bulk', { data: ids });
};

export const bulkUpdateUsersRoleApi = (ids, role) => {
  return apiClient.put(`v1/admin/users/bulk/role?role=${role}`, ids);
};

export const bulkDeleteBookingsApi = (ids) => {
  return apiClient.delete('v1/admin/bookings/bulk', { data: ids });
};

export const bulkUpdateBookingsStatusApi = (ids, status) => {
  return apiClient.put(`v1/admin/bookings/bulk/status?status=${status}`, ids);
};

export const bulkDeleteBlogsApi = (ids) => {
  return apiClient.delete('v1/admin/blogs/bulk', { data: ids });
};

export const bulkUpdateBlogsStatusApi = (ids, status) => {
  return apiClient.put(`v1/admin/blogs/bulk/status?status=${status}`, ids);
};

export const bulkDeleteDriversApi = (ids) => {
  return apiClient.delete('v1/admin/drivers/bulk', { data: ids });
};

export const bulkUpdateStatusApi = (entityType, ids, status) => {
  const endpoint = `v1/admin/${entityType}/bulk/status?status=${status}`;
  return apiClient.put(endpoint, ids);
};

export const bulkDeleteApi = (entityType, ids) => {
  const endpoint = `v1/admin/${entityType}/bulk`;
  return apiClient.delete(endpoint, { data: ids });
};

// Audit logs endpoints
export const fetchAuditLogsApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.operation) queryParams.append('operation', params.operation);
  if (params.resourceType) queryParams.append('resourceType', params.resourceType);
  if (params.status) queryParams.append('status', params.status);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/audit-logs${query}`);
};

export const fetchAuditLogsByUserApi = (userId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`v1/admin/audit-logs/user/${userId}${query}`);
};

export const fetchAuditLogStatisticsApi = () => {
  return apiClient.get('v1/admin/audit-logs/statistics');
};
