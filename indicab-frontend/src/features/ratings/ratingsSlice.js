import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

const initialState = {
  ratings: [],
  currentRating: null,
  hasRatedBooking: {},
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const submitRating = createAsyncThunk(
  'ratings/submitRating',
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/v1/ratings', ratingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserRatings = createAsyncThunk(
  'ratings/fetchUserRatings',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/v1/ratings?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkIfUserRatedBooking = createAsyncThunk(
  'ratings/checkIfUserRatedBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/v1/ratings/booking/${bookingId}/has-rated`);
      return { bookingId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRatingByBookingId = createAsyncThunk(
  'ratings/getRatingByBookingId',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/v1/ratings/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateRating = createAsyncThunk(
  'ratings/updateRating',
  async ({ id, ratingData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/v1/ratings/${id}`, ratingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteRating = createAsyncThunk(
  'ratings/deleteRating',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/v1/ratings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    clearRatingError: (state) => {
      state.error = null;
    },
    clearCurrentRating: (state) => {
      state.currentRating = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRating = action.payload;
        state.ratings.unshift(action.payload);
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit rating';
      })
      .addCase(fetchUserRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload.content || [];
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch ratings';
      })
      .addCase(checkIfUserRatedBooking.fulfilled, (state, action) => {
        state.hasRatedBooking[action.payload.bookingId] = action.payload.hasRated;
      })
      .addCase(getRatingByBookingId.fulfilled, (state, action) => {
        state.currentRating = action.payload;
      })
      .addCase(updateRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRating = action.payload;
        const index = state.ratings.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.ratings[index] = action.payload;
        }
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update rating';
      })
      .addCase(deleteRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = state.ratings.filter(r => r.id !== action.payload);
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete rating';
      });
  },
});

export const { clearRatingError, clearCurrentRating } = ratingsSlice.actions;
export default ratingsSlice.reducer;
