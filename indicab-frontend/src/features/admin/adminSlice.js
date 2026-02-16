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
  { id: 1, title: 'Top 10 Must-Visit Destinations', category: 'Travel Guide', preview: 'Discover amazing places...', date: '2025-07-15', views: 1200, image: 'https://example.com/blog1.jpg', content: 'Full content here' },
];

const mockPackages = [
  { id: 1, name: '4 Hours Rental', type: 'hourly', baseFare: 1299, duration: '4 Hours', validity: '1 Day', discountPercentage: 10, description: 'Quick city trips', features: ['AC Sedan', 'Professional Chauffeur'] },
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
export const fetchUsers = createAsyncThunk('admin/fetchUsers', async () => {
  try {
    const response = await adminApi.fetchUsersApi();
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
export const fetchDrivers = createAsyncThunk('admin/fetchDrivers', async () => {
  try {
    const response = await adminApi.fetchDriversApi();
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
export const fetchBookings = createAsyncThunk('admin/fetchBookings', async () => {
  try {
    const response = await adminApi.fetchBookingsApi();
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
export const fetchBlogs = createAsyncThunk('admin/fetchBlogs', async () => {
  try {
    const response = await adminApi.fetchBlogsApi();
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
export const fetchPackages = createAsyncThunk('admin/fetchPackages', async () => {
  try {
    const response = await adminApi.fetchPackagesApi();
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
export const fetchVehicles = createAsyncThunk('admin/fetchVehicles', async () => {
  try {
    const response = await adminApi.fetchVehiclesApi();
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

const initialState = {
  dashboard: null,
  users: [],
  drivers: [],
  bookings: [],
  blogs: [],
  packages: [],
  vehicles: [],
  stats: null,
  revenue: null,
  loading: false,
  error: null,
  successMessage: null,
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
        state.users = action.payload;
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
      });

    // Drivers
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
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
        state.bookings = action.payload;
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
        state.blogs = action.payload;
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
      });

    // Packages
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
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
        state.vehicles = action.payload;
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
  },
});

export const { clearError, clearSuccessMessage } = adminSlice.actions;

export default adminSlice.reducer;
