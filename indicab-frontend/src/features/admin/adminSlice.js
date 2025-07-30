import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock fallback dashboard data
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

export const fetchAdminDashboard = createAsyncThunk('admin/fetchAdminDashboard', async () => {
  try {
    const response = await axios.get('/api/admin/dashboard');
    if (!response.data) {
      return mockDashboard;
    }
    return response.data;
  } catch (error) {
    return mockDashboard;
  }
});

const initialState = {
  dashboard: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
  },
});

export default adminSlice.reducer;
