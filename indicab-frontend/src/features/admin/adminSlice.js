import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from './adminApi';

// Mock fallback data - ONLY available in development
const isDevelopment = import.meta.env.DEV;

const mockDashboard = {
  totalUsers: 1000,
  totalDrivers: 200,
  totalBookings: 5000,
  revenue: '₹10,00,000',
  recentActivity: [
    { id: 1, type: 'booking', user: 'John Doe', date: '2025-07-29' },
    { id: 2, type: 'driver', user: 'Priya Singh', date: '2025-07-28' },
  ],
};

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '9876543210', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', status: 'active' },
];

const mockDrivers = [
  { id: 1, name: 'Raj Kumar', email: 'raj@example.com', status: 'approved', rating: 4.8 },
  { id: 2, name: 'Priya Singh', email: 'priya@example.com', status: 'pending', rating: 4.5 },
];

const mockBookings = [
  { id: 1, user: 'John Doe', from: 'Mumbai', to: 'Pune', status: 'completed', date: '2025-07-29' },
  { id: 2, user: 'Jane Smith', from: 'Pune', to: 'Nagpur', status: 'ongoing', date: '2025-07-29' },
];

const mockBlogs = [
  { id: 1, title: 'Top 10 Must-Visit Destinations', category: 'Travel Guide', preview: 'Discover amazing places across India...', date: '2025-07-15', views: 1200, image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop', content: 'Full content here', status: 'published' },
  { id: 2, title: 'Budget Travel Tips for 2025', category: 'Tips & Tricks', preview: 'Save money while traveling smart...', date: '2025-07-10', views: 890, image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop', content: 'Full content here', status: 'published' },
  { id: 3, title: 'Hidden Gems of Mumbai', category: 'Destination Guide', preview: 'Explore the lesser-known attractions...', date: '2025-07-05', views: 650, image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&h=300&fit=crop', content: 'Full content here', status: 'published' },
];

const mockPackages = [
  { id: 1, name: '4 Hours Rental', type: 'hourly', baseFare: 1299, duration: '4 Hours', validity: '1 Day', discountPercentage: 10, description: 'Perfect for quick city trips and meetings', features: ['AC Sedan', 'Professional Chauffeur', '40 km included'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop', isActive: true },
  { id: 2, name: '8 Hours Rental', type: 'hourly', baseFare: 2499, duration: '8 Hours', validity: '1 Day', discountPercentage: 15, description: 'Full day city exploration', features: ['AC SUV', 'Professional Chauffeur', '80 km included'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop', isActive: true },
  { id: 3, name: 'Weekend Getaway', type: 'regional', baseFare: 3999, duration: '2 Days', validity: '7 Days', discountPercentage: 20, description: 'Explore nearby cities', features: ['Premium AC Car', 'Experienced Driver', 'Fuel & Tolls'], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop', isActive: true },
  { id: 4, name: 'National Tour', type: 'national', baseFare: 12999, duration: '7 Days', validity: '30 Days', discountPercentage: 25, description: 'Cross-country adventure', features: ['Luxury SUV', 'Expert Guide', 'All Inclusive'], image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop', isActive: true },
  { id: 5, name: 'Corporate Fleet', type: 'corporate', baseFare: 5000, duration: '1 Day', validity: '30 Days', discountPercentage: 30, description: 'Corporate transport solution', features: ['Executive Cars', 'Professional Drivers', 'Billing Support'], image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop', isActive: true },
];

const mockVehicles = [
  { id: 1, type: 'Sedan', baseFare: 150, ratePerKm: 10, perDayCharge: 100, capacity: 3, description: 'Comfortable & Economical', image: 'https://example.com/sedan.jpg' },
];

// Dashboard thunk
export const fetchAdminDashboard = createAsyncThunk('admin/fetchAdminDashboard', async () => {
  try {
    const response = await adminApi.fetchAdminDashboardApi();
    return response.data || (isDevelopment ? mockDashboard : null);
  } catch (error) {
    console.warn('Failed to fetch dashboard:', error.message);
    return isDevelopment ? mockDashboard : null;
  }
});

// User management thunks
export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params = {}) => {
  try {
    const response = await adminApi.fetchUsersApi(params);
    return response.data || (isDevelopment ? mockUsers : null);
  } catch (error) {
    console.warn('Failed to fetch users:', error.message);
    return isDevelopment ? mockUsers : null;
  }
});

export const createUser = createAsyncThunk('admin/createUser', async (userData) => {
  try {
    const response = await adminApi.createUserApi(userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk('admin/updateUser', async ({ userId, userData }) => {
  try {
    const response = await adminApi.updateUserApi(userId, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId) => {
  try {
    await adminApi.deleteUserApi(userId);
    return userId;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
});

// Driver management thunks
export const fetchDrivers = createAsyncThunk('admin/fetchDrivers', async (params = {}) => {
  try {
    const response = await adminApi.fetchDriversApi(params);
    return response.data || (isDevelopment ? mockDrivers : null);
  } catch (error) {
    console.warn('Failed to fetch drivers:', error.message);
    return isDevelopment ? mockDrivers : null;
  }
});

export const createDriver = createAsyncThunk('admin/createDriver', async (driverData) => {
  try {
    const response = await adminApi.createDriverApi(driverData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create driver');
  }
});

export const updateDriver = createAsyncThunk('admin/updateDriver', async ({ driverId, driverData }) => {
  try {
    const response = await adminApi.updateDriverApi(driverId, driverData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update driver');
  }
});

export const deleteDriver = createAsyncThunk('admin/deleteDriver', async (driverId) => {
  try {
    await adminApi.deleteDriverApi(driverId);
    return driverId;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete driver');
  }
});

export const approveDriver = createAsyncThunk('admin/approveDriver', async (driverId) => {
  try {
    const response = await adminApi.approveDriverApi(driverId);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve driver');
  }
});

export const rejectDriver = createAsyncThunk('admin/rejectDriver', async (driverId) => {
  try {
    const response = await adminApi.rejectDriverApi(driverId);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject driver');
  }
});

// Booking management thunks
export const fetchBookings = createAsyncThunk('admin/fetchBookings', async (params = {}) => {
  try {
    const response = await adminApi.fetchBookingsApi(params);
    return response.data || (isDevelopment ? mockBookings : null);
  } catch (error) {
    console.warn('Failed to fetch bookings:', error.message);
    return isDevelopment ? mockBookings : null;
  }
});

export const updateBookingStatus = createAsyncThunk('admin/updateBookingStatus', async ({ bookingId, status }) => {
  try {
    const response = await adminApi.updateBookingStatusApi(bookingId, status);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update booking status');
  }
});

export const cancelBooking = createAsyncThunk('admin/cancelBooking', async ({ bookingId, reason }) => {
  try {
    const response = await adminApi.cancelBookingApi(bookingId, reason);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  }
});

// Statistics thunks
export const fetchAdminStats = createAsyncThunk('admin/fetchAdminStats', async () => {
  try {
    const response = await adminApi.fetchAdminStatsApi();
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch admin stats:', error.message);
    return null;
  }
});

export const fetchRevenue = createAsyncThunk('admin/fetchRevenue', async (period = 'monthly') => {
  try {
    const response = await adminApi.fetchRevenueApi(period);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch revenue:', error.message);
    return null;
  }
});

// Blog management thunks
export const fetchBlogs = createAsyncThunk('admin/fetchBlogs', async (params = {}) => {
  try {
    const response = await adminApi.fetchBlogsApi(params);
    return response.data || (isDevelopment ? mockBlogs : null);
  } catch (error) {
    console.warn('Failed to fetch blogs:', error.message);
    return isDevelopment ? mockBlogs : null;
  }
});

export const createBlog = createAsyncThunk('admin/createBlog', async (blogData) => {
  try {
    const response = await adminApi.createBlogApi(blogData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create blog');
  }
});

export const updateBlog = createAsyncThunk('admin/updateBlog', async ({ id, ...blogData }) => {
  try {
    const response = await adminApi.updateBlogApi(id, blogData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update blog');
  }
});

export const deleteBlog = createAsyncThunk('admin/deleteBlog', async (id) => {
  try {
    await adminApi.deleteBlogApi(id);
    return id;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete blog');
  }
});

// Package management thunks
export const fetchPackages = createAsyncThunk('admin/fetchPackages', async (params = {}) => {
  try {
    const response = await adminApi.fetchPackagesApi(params);
    return response.data || (isDevelopment ? mockPackages : null);
  } catch (error) {
    console.warn('Failed to fetch packages:', error.message);
    return isDevelopment ? mockPackages : null;
  }
});

export const createPackage = createAsyncThunk('admin/createPackage', async (packageData) => {
  try {
    const response = await adminApi.createPackageApi(packageData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create package');
  }
});

export const updatePackage = createAsyncThunk('admin/updatePackage', async ({ id, ...packageData }) => {
  try {
    const response = await adminApi.updatePackageApi(id, packageData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update package');
  }
});

export const deletePackage = createAsyncThunk('admin/deletePackage', async (id) => {
  try {
    await adminApi.deletePackageApi(id);
    return id;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete package');
  }
});

// Vehicle management thunks
export const fetchVehicles = createAsyncThunk('admin/fetchVehicles', async (params = {}) => {
  try {
    const response = await adminApi.fetchVehiclesApi(params);
    return response.data || (isDevelopment ? mockVehicles : null);
  } catch (error) {
    console.warn('Failed to fetch vehicles:', error.message);
    return isDevelopment ? mockVehicles : null;
  }
});

export const createVehicle = createAsyncThunk('admin/createVehicle', async (vehicleData) => {
  try {
    const response = await adminApi.createVehicleApi(vehicleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create vehicle');
  }
});

export const updateVehicle = createAsyncThunk('admin/updateVehicle', async ({ id, ...vehicleData }) => {
  try {
    const response = await adminApi.updateVehicleApi(id, vehicleData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update vehicle');
  }
});

export const deleteVehicle = createAsyncThunk('admin/deleteVehicle', async (id) => {
  try {
    await adminApi.deleteVehicleApi(id);
    return id;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete vehicle');
  }
});

// Bulk operation thunks
export const bulkDeleteUsers = createAsyncThunk('admin/bulkDeleteUsers', async (ids) => {
  try {
    await adminApi.bulkDeleteUsersApi(ids);
    return ids;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete users');
  }
});

export const bulkDeleteDrivers = createAsyncThunk('admin/bulkDeleteDrivers', async (ids) => {
  try {
    await adminApi.bulkDeleteDriversApi(ids);
    return ids;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete drivers');
  }
});

export const bulkDeleteBookings = createAsyncThunk('admin/bulkDeleteBookings', async (ids) => {
  try {
    await adminApi.bulkDeleteBookingsApi(ids);
    return ids;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete bookings');
  }
});

export const bulkDeleteBlogs = createAsyncThunk('admin/bulkDeleteBlogs', async (ids) => {
  try {
    await adminApi.bulkDeleteBlogsApi(ids);
    return ids;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete blogs');
  }
});

export const bulkDeletePackages = createAsyncThunk('admin/bulkDeletePackages', async (ids) => {
  try {
    await adminApi.bulkDeleteApi('packages', ids);
    return ids;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete packages');
  }
});

export const bulkDeleteVehicles = createAsyncThunk('admin/bulkDeleteVehicles', async (ids) => {
  try {
    await adminApi.bulkDeleteApi('vehicles', ids);
    return ids;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete vehicles');
  }
});

export const bulkUpdateStatus = createAsyncThunk('admin/bulkUpdateStatus', async ({ entityType, ids, status }) => {
  try {
    let response;
    if (entityType === 'bookings') {
      response = await adminApi.bulkUpdateBookingsStatusApi(ids, status);
    } else if (entityType === 'blogs') {
      response = await adminApi.bulkUpdateBlogsStatusApi(ids, status);
    } else {
      response = await adminApi.bulkUpdateStatusApi(entityType, ids, status);
    }
    return { entityType, ids, status, updatedCount: response.data?.updatedCount || ids.length };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
});

export const bulkUpdateUsersRole = createAsyncThunk('admin/bulkUpdateUsersRole', async ({ ids, role }) => {
  try {
    await adminApi.bulkUpdateUsersRoleApi(ids, role);
    return { ids, role };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update users role');
  }
});

// Audit logs thunk
export const fetchAuditLogs = createAsyncThunk('admin/fetchAuditLogs', async (params = {}) => {
  try {
    const response = await adminApi.fetchAuditLogsApi(params);
    return response.data || { content: [], totalElements: 0, totalPages: 0 };
  } catch (error) {
    console.warn('Failed to fetch audit logs:', error.message);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
});

// Bulk export thunk - exports selected items to specified format
export const bulkExport = createAsyncThunk(
  'admin/bulkExport',
  async ({ entityType, items, format = 'csv', filename = 'export' }, { rejectWithValue }) => {
    try {
      // Import export utilities dynamically to avoid circular dependencies
      const { exportToCSV, exportToExcel, exportToPDF, getExportColumns } = await import('../../utils/exportUtils');

      if (!items || items.length === 0) {
        return rejectWithValue('No items selected for export');
      }

      const columns = getExportColumns(entityType);

      if (!columns || columns.length === 0) {
        return rejectWithValue(`Export not supported for entity type: ${entityType}`);
      }

      // Perform export based on format
      switch (format.toLowerCase()) {
        case 'csv':
          exportToCSV(items, filename, columns);
          break;
        case 'excel':
        case 'xlsx':
          exportToExcel(items, filename, columns);
          break;
        case 'pdf':
          exportToPDF(items, filename, columns, { title: `${entityType} Report` });
          break;
        default:
          return rejectWithValue(`Unknown export format: ${format}`);
      }

      return {
        entityType,
        format,
        count: items.length,
        filename,
        success: true,
      };
    } catch (error) {
      console.error('Bulk export error:', error);
      return rejectWithValue(error.message || 'Failed to export items');
    }
  }
);

export const fetchAuditLogStatistics = createAsyncThunk('admin/fetchAuditLogStatistics', async () => {
  try {
    const response = await adminApi.fetchAuditLogStatisticsApi();
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch audit log statistics:', error.message);
    return null;
  }
});

const initialState = {
  dashboard: null,
  users: [],
  drivers: [],
  bookings: [],
  blogs: [],
  packages: [],
  vehicles: [],
  auditLogs: [],
  auditLogStatistics: null,
  stats: null,
  revenue: null,
  loading: false,
  error: null,
  successMessage: null,
  pagination: {
    users: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    drivers: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    bookings: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    blogs: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    packages: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    vehicles: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
    auditLogs: { page: 0, size: 10, totalPages: 0, totalElements: 0 },
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    updateDashboardStats: (state, action) => {
      state.dashboard = { ...state.dashboard, ...action.payload };
    },
    addRealTimeBooking: (state, action) => {
      state.bookings = [action.payload, ...state.bookings];
    },
    updateRealTimeBookingStatus: (state, action) => {
      const { bookingId, status } = action.payload;
      const index = state.bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], status };
      }
    },
    addRealTimeUser: (state, action) => {
      state.users = [action.payload, ...state.users];
    },
    addRealTimeAuditLog: (state, action) => {
      state.auditLogs = [action.payload, ...state.auditLogs];
    }
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.users = action.payload;
        } else if (action.payload && action.payload.content) {
          state.users = action.payload.content;
          state.pagination.users = {
            page: action.payload.currentPage || action.payload.pageable?.pageNumber || 0,
            size: action.payload.size || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.users = action.payload || [];
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.successMessage = 'User created successfully';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.successMessage = 'User updated successfully';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.successMessage = 'User deleted successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.users = state.users.filter(u => !action.payload.includes(u.id));
        state.successMessage = `Successfully deleted ${action.payload.length} users`;
      })
      .addCase(bulkUpdateUsersRole.fulfilled, (state, action) => {
        state.users = state.users.map(u =>
          action.payload.ids.includes(u.id) ? { ...u, role: action.payload.role } : u
        );
        state.successMessage = `Successfully updated role for ${action.payload.ids.length} users`;
      });

    // Drivers
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.drivers = action.payload;
        } else if (action.payload && action.payload.content) {
          state.drivers = action.payload.content;
          state.pagination.drivers = {
            page: action.payload.currentPage || action.payload.pageable?.pageNumber || 0,
            size: action.payload.size || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.drivers = action.payload || [];
        }
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.drivers.push(action.payload);
        state.successMessage = 'Driver created successfully';
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
        state.successMessage = 'Driver updated successfully';
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d.id !== action.payload);
        state.successMessage = 'Driver deleted successfully';
      })
      .addCase(deleteDriver.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(approveDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
        state.successMessage = 'Driver approved successfully';
      })
      .addCase(approveDriver.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(rejectDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.drivers[index] = action.payload;
        }
        state.successMessage = 'Driver rejected successfully';
      })
      .addCase(rejectDriver.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // Bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.bookings = action.payload;
        } else if (action.payload && action.payload.content) {
          state.bookings = action.payload.content;
          state.pagination.bookings = {
            page: action.payload.currentPage || action.payload.pageable?.pageNumber || 0,
            size: action.payload.size || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.bookings = action.payload || [];
        }
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.successMessage = 'Booking status updated successfully';
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.successMessage = 'Booking cancelled successfully';
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(bulkDeleteBookings.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(b => !action.payload.includes(b.id));
        state.successMessage = `Successfully deleted ${action.payload.length} bookings`;
      })
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        const { entityType, ids, status } = action.payload;
        if (entityType === 'bookings') {
          state.bookings = state.bookings.map(b =>
            ids.includes(b.id) ? { ...b, status } : b
          );
        } else if (entityType === 'blogs') {
          state.blogs = state.blogs.map(b =>
            ids.includes(b.id) ? { ...b, status } : b
          );
        } else if (entityType === 'drivers') {
          state.drivers = state.drivers.map(d =>
            ids.includes(d.id) ? { ...d, status } : d
          );
        }
        state.successMessage = `Successfully updated ${ids.length} items to ${status}`;
      });

    // Statistics
    builder
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.revenue = action.payload;
      });

    // Blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.blogs = action.payload;
        } else if (action.payload && action.payload.content) {
          state.blogs = action.payload.content;
          state.pagination.blogs = {
            page: action.payload.currentPage || action.payload.pageable?.pageNumber || 0,
            size: action.payload.size || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.blogs = action.payload || [];
        }
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.push(action.payload);
        state.successMessage = 'Blog created successfully';
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        state.successMessage = 'Blog updated successfully';
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(b => b.id !== action.payload);
        state.successMessage = 'Blog deleted successfully';
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(bulkDeleteBlogs.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(b => !action.payload.includes(b.id));
        state.successMessage = `Successfully deleted ${action.payload.length} blogs`;
      });

    // Packages
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.packages = action.payload;
        } else if (action.payload && action.payload.content) {
          state.packages = action.payload.content;
          state.pagination.packages = {
            page: action.payload.currentPage || action.payload.pageable?.pageNumber || 0,
            size: action.payload.size || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.packages = action.payload || [];
        }
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.packages.push(action.payload);
        state.successMessage = 'Package created successfully';
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const index = state.packages.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
        state.successMessage = 'Package updated successfully';
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.packages = state.packages.filter(p => p.id !== action.payload);
        state.successMessage = 'Package deleted successfully';
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // Vehicles
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.vehicles = action.payload;
        } else if (action.payload && action.payload.content) {
          state.vehicles = action.payload.content;
          state.pagination.vehicles = {
            page: action.payload.currentPage || action.payload.pageable?.pageNumber || 0,
            size: action.payload.size || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.vehicles = action.payload || [];
        }
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.vehicles.push(action.payload);
        state.successMessage = 'Vehicle created successfully';
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
        state.successMessage = 'Vehicle updated successfully';
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
        state.successMessage = 'Vehicle deleted successfully';
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // Audit Logs
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array response and paginated response object
        if (Array.isArray(action.payload)) {
          state.auditLogs = action.payload;
        } else if (action.payload && action.payload.content) {
          state.auditLogs = action.payload.content;
          state.pagination.auditLogs = {
            page: action.payload.pageNumber || 0,
            size: action.payload.pageSize || 10,
            totalPages: action.payload.totalPages || 1,
            totalElements: action.payload.totalElements || action.payload.content.length,
          };
        } else {
          state.auditLogs = action.payload || [];
        }
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAuditLogStatistics.fulfilled, (state, action) => {
        state.auditLogStatistics = action.payload;
      })
      .addCase(fetchAuditLogStatistics.rejected, (state, action) => {
        state.error = action.error.message;
      });

    // Bulk Export
    builder
      .addCase(bulkExport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkExport.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = `Successfully exported ${action.payload.count} ${action.payload.entityType}s as ${action.payload.format.toUpperCase()}`;
      })
      .addCase(bulkExport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to export items';
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  updateDashboardStats,
  addRealTimeBooking,
  updateRealTimeBookingStatus,
  addRealTimeUser,
  addRealTimeAuditLog
} = adminSlice.actions;

export default adminSlice.reducer;
