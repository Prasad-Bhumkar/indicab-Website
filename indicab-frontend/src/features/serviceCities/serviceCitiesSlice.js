import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
import { mockCities, mockStats } from '../../data/mockServiceCities';

export const fetchServiceCities = createAsyncThunk('serviceCities/fetchServiceCities', async () => {
  // const response = await axios.get('http://localhost:8000/api/service-cities');
  // return response.data;
  return {
    cities: mockCities,
    stats: mockStats,
  };
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
        // Assuming the API returns an object with 'cities' array and 'stats' object
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

