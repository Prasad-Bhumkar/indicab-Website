import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

export const fetchPopularRoutes = createAsyncThunk('popularRoutes/fetchPopularRoutes', async () => {
  try {
    const response = await apiClient.get('/v1/routes');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch popular routes');
  }
});

const popularRoutesSlice = createSlice({
  name: 'popularRoutes',
  initialState: {
    routes: [],
    loading: false,
    error: null,
  },
  reducers: {
    addRoute: (state, action) => {
      state.routes.push(action.payload);
    },
    updateRoute: (state, action) => {
      const index = state.routes.findIndex(route => route.id === action.payload.id);
      if (index !== -1) {
        state.routes[index] = action.payload;
      }
    },
    deleteRoute: (state, action) => {
      state.routes = state.routes.filter(route => route.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularRoutes.fulfilled, (state, action) => {
        state.loading = false;
        // Map backend route data to frontend expected format
        state.routes = action.payload.map((route, index) => ({
          id: route.id || index + 1,
          from: route.fromLocation || route.from || '',
          to: route.toLocation || route.to || '',
          price: route.price || 'N/A',
          image: route.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop',
          description: route.description || `Distance: ${route.distance || 'N/A'} km`
        }));
      })
      .addCase(fetchPopularRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addRoute, updateRoute, deleteRoute } = popularRoutesSlice.actions;

export default popularRoutesSlice.reducer;
