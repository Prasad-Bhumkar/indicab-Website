import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock fallback data
const mockDriver = {
  id: 1,
  name: 'Amit Kumar',
  phone: '+91-9123456789',
  license: 'MH12AB1234',
  rating: 4.8,
};
const mockDrivers = [
  mockDriver,
  { id: 2, name: 'Priya Singh', phone: '+91-9988776655', license: 'MH14CD5678', rating: 4.7 },
];
const mockRides = [
  { id: 1, route: 'Mumbai → Pune', date: '2025-07-01', fare: 1500 },
  { id: 2, route: 'Pune → Nashik', date: '2025-07-02', fare: 2100 },
];

export const registerDriver = createAsyncThunk('driver/registerDriver', async (driverData) => {
  try {
    const response = await axios.post('http://localhost:8000/api/driver/register', driverData);
    if (!response.data) {
      return mockDriver;
    }
    return response.data;
  } catch (error) {
    return mockDriver;
  }
});

export const fetchAllDrivers = createAsyncThunk('driver/fetchAllDrivers', async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/driver/all');
    if (!response.data) {
      return mockDrivers;
    }
    return response.data;
  } catch (error) {
    return mockDrivers;
  }
});

export const fetchDriverRides = createAsyncThunk('driver/fetchDriverRides', async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/driver/rides');
    if (!response.data) {
      return mockRides;
    }
    return response.data;
  } catch (error) {
    return mockRides;
  }
});

const initialState = {
  drivers: [],
  driver: null,
  rides: [],
  loading: false,
  error: null,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.driver = action.payload;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
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
        state.error = action.error.message;
      })
      .addCase(fetchDriverRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverRides.fulfilled, (state, action) => {
        state.loading = false;
        state.rides = action.payload;
      })
      .addCase(fetchDriverRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default driverSlice.reducer;
