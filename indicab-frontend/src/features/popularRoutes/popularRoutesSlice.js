import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPopularRoutes = createAsyncThunk('popularRoutes/fetchPopularRoutes', async (_, { getState }) => {
  const token = getState().auth.token;
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get('http://localhost:8000/api/routes', config);
  return response.data;
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
          id: index + 1,
          from: route.fromLocation || route.from || '',
          to: route.toLocation || route.to || '',
          price: route.price || 'N/A',
          image: route.image || 'https://placehold.com',
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
