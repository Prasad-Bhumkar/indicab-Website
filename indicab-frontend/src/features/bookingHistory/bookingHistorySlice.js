import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, apiCall } from '../../config/apiConfig';
import { bookingHistory } from '../../data/bookingHistory';

export const fetchBookings = createAsyncThunk('bookingHistory/fetchBookings', async () => {
  const result = await apiCall(
    () => apiClient.get('/v1/bookings'),
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
    () => apiClient.put(`/v1/bookings/${booking.id}`, booking),
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
        // Ensure bookings is always an array
        let bookingsData = action.payload.data || [];
        if (!Array.isArray(bookingsData)) {
          // If it's an object with a 'data' or 'bookings' property, extract it
          if (bookingsData.data && Array.isArray(bookingsData.data)) {
            bookingsData = bookingsData.data;
          } else if (bookingsData.bookings && Array.isArray(bookingsData.bookings)) {
            bookingsData = bookingsData.bookings;
          } else {
            // If it's a single booking object, wrap in array
            bookingsData = bookingsData ? [bookingsData] : [];
          }
        }
        state.bookings = bookingsData;
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
