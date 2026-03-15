import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, apiCall } from '../../config/apiConfig';

export const submitRating = createAsyncThunk('rating/submitRating', async (ratingData) => {
  const result = await apiCall(
    () => apiClient.post('/v1/ratings', ratingData),
    { ...ratingData, id: Date.now(), createdAt: new Date().toISOString() }
  );

  return {
    data: result.data,
    isOffline: result.isOffline,
    error: result.error
  };
});

export const fetchUserRatings = createAsyncThunk('rating/fetchUserRatings', async () => {
  const result = await apiCall(
    () => apiClient.get('/v1/ratings'),
    []
  );

  return {
    data: result.data,
    isOffline: result.isOffline,
    error: result.error
  };
});

export const checkHasRated = createAsyncThunk('rating/checkHasRated', async (bookingId) => {
  try {
    const response = await apiClient.get(`/v1/ratings/booking/${bookingId}/has-rated`);
    return { bookingId, hasRated: response.data.hasRated };
  } catch (error) {
    return { bookingId, hasRated: false };
  }
});

const initialState = {
  ratings: [],
  hasRatedMap: {}, // bookingId -> boolean
  loading: false,
  submitting: false,
  error: null,
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitRating.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload.data) {
          state.ratings.unshift(action.payload.data);
          state.hasRatedMap[action.payload.data.bookingId] = true;
        }
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserRatings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload.data?.content || action.payload.data || [];
      })
      .addCase(checkHasRated.fulfilled, (state, action) => {
        state.hasRatedMap[action.payload.bookingId] = action.payload.hasRated;
      });
  },
});

export default ratingSlice.reducer;
