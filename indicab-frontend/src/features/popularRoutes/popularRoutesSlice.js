import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

export const fetchPopularRoutes = createAsyncThunk('popularRoutes/fetchPopularRoutes', async () => {
  try {
    const response = await apiClient.get('/v1/routes');
    return response.data;
  } catch (error) {
    // Fallback to mock data in development when API is unavailable
    const mockRoutes = [
      { id: 1, fromLocation: 'Delhi', toLocation: 'Noida', price: 250, distance: 25, description: 'Distance: 25 km', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop' },
      { id: 2, fromLocation: 'Mumbai', toLocation: 'Pune', price: 800, distance: 150, description: 'Distance: 150 km', image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop' },
      { id: 3, fromLocation: 'Bangalore', toLocation: 'Mysore', price: 500, distance: 140, description: 'Distance: 140 km', image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop' },
      { id: 4, fromLocation: 'Chennai', toLocation: 'Hyderabad', price: 900, distance: 580, description: 'Distance: 580 km', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=300&fit=crop' },
      { id: 5, fromLocation: 'Kolkata', toLocation: 'Darjeeling', price: 600, distance: 350, description: 'Distance: 350 km', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop' }
    ];
    if (import.meta.env.DEV) {
      console.warn('Using fallback mock routes - API unavailable');
      return mockRoutes;
    }
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
