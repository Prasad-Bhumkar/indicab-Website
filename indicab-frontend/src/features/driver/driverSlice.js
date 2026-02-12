import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

export const applyAsDriver = createAsyncThunk(
  'driver/applyAsDriver',
  async (registrationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/driver/apply', registrationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply as driver');
    }
  }
);

export const fetchPendingApplications = createAsyncThunk(
  'driver/fetchPendingApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/driver/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending applications');
    }
  }
);

export const fetchApprovedDrivers = createAsyncThunk(
  'driver/fetchApprovedDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/driver/approved');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch approved drivers');
    }
  }
);

export const fetchAllDrivers = createAsyncThunk(
  'driver/fetchAllDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/driver/all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drivers');
    }
  }
);

export const fetchDriverById = createAsyncThunk(
  'driver/fetchDriverById',
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/driver/${driverId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver');
    }
  }
);

export const reviewDriverApplication = createAsyncThunk(
  'driver/reviewDriverApplication',
  async (approvalData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/driver/review-application', approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review application');
    }
  }
);

const initialState = {
  drivers: [],
  pendingApplications: [],
  approvedDrivers: [],
  currentDriver: null,
  loading: false,
  error: null,
  successMessage: null,
};

const driverSlice = createSlice({
  name: 'driver',
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
    // Apply as Driver
    builder
      .addCase(applyAsDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyAsDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        state.successMessage = 'Application submitted successfully. Pending admin review.';
      })
      .addCase(applyAsDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Pending Applications
    builder
      .addCase(fetchPendingApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApplications = action.payload;
      })
      .addCase(fetchPendingApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Approved Drivers
    builder
      .addCase(fetchApprovedDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedDrivers = action.payload;
      })
      .addCase(fetchApprovedDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch All Drivers
    builder
      .addCase(fetchAllDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Driver by ID
    builder
      .addCase(fetchDriverById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
      })
      .addCase(fetchDriverById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Review Driver Application
    builder
      .addCase(reviewDriverApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(reviewDriverApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = `Driver application ${action.payload.driverStatus.toLowerCase()}`;
        // Update the driver in pendingApplications if present
        const index = state.pendingApplications.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.pendingApplications.splice(index, 1);
        }
      })
      .addCase(reviewDriverApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage } = driverSlice.actions;
export default driverSlice.reducer;
