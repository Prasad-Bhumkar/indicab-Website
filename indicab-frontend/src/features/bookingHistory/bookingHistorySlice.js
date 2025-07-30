import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, apiCall } from '../../config/apiConfig';
import { bookingHistory } from '../../data/bookingHistory';

export const fetchBookings = createAsyncThunk('bookingHistory/fetchBookings', async () => {
  const result = await apiCall(
    () => apiClient.get('/api/bookings'),
    bookingHistory.map(booking => ({ ...booking, amount: booking.fare })) // Map fare to amount for consistency
  );

  return {
    data: result.data,
    isOffline: result.isOffline,
    error: result.error
  };
});

export const updateBookingAsync = createAsyncThunk('bookingHistory/updateBookingAsync', async (booking) => {
  const result = await apiCall(
    () => apiClient.put(`/api/bookings/${booking.id}`, booking),
    booking // Return the booking as-is for offline mode
  );

  return {
    data: result.data,
    isOffline: result.isOffline,
    error: result.error
  };
});

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  isOffline: false,
};

const bookingHistorySlice = createSlice({
  name: 'bookingHistory',
  initialState,
  reducers: {
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    },
    deleteBooking: (state, action) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || [];
        state.isOffline = action.payload.isOffline || false;
        if (action.payload.error && action.payload.isOffline) {
          state.error = action.payload.error;
        } else {
          state.error = null;
        }
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.isOffline = false;
      })
      .addCase(updateBookingAsync.fulfilled, (state, action) => {
        const updatedBooking = action.payload.data;
        const index = state.bookings.findIndex(booking => booking.id === updatedBooking.id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
      });
  },
});

export const { addBooking, updateBooking, deleteBooking } = bookingHistorySlice.actions;

export default bookingHistorySlice.reducer;
