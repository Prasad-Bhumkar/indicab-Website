import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

export const fetchServiceCities = createAsyncThunk('serviceCities/fetchServiceCities', async () => {
  try {
    const response = await apiClient.get('v1/service-cities');

    // Return API response directly
    return {
      cities: Array.isArray(response.data) ? response.data : response.data.cities || [],
      stats: response.data.stats || {},
    };
  } catch (error) {
    // Fallback to mock data in development when API is unavailable
    const mockData = {
      cities: ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
      stats: {
        citiesCovered: 8,
        happyCustomers: '50K+',
        trustedDrivers: '5K+',
        support: '24/7'
      }
    };
    if (import.meta.env.DEV) {
      console.warn('Using fallback mock service cities - API unavailable');
      return mockData;
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch service cities');
  }
});

const serviceCitiesSlice = createSlice({
  name: 'serviceCities',
  initialState: {
    cities: [],
    stats: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload.cities || [];
        state.stats = action.payload.stats || {};
      })
      .addCase(fetchServiceCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default serviceCitiesSlice.reducer;
