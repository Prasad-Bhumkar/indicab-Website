import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

export const fetchRecommendations = createAsyncThunk('recommendations/fetchRecommendations', async () => {
  try {
    const response = await apiClient.get('v1/recommendations');
    return response.data;
  } catch (error) {
    // Fallback to mock data in development when API is unavailable
    const mockRecommendations = [
      { id: 1, title: 'Quick City Ride', location: 'Downtown Area', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop', price: 150, rating: 4.8, reviews: 342 },
      { id: 2, title: 'Airport Transfer', location: 'Airport Route', image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop', price: 500, rating: 4.9, reviews: 856 },
      { id: 3, title: 'Weekend Getaway', location: 'Mountain Route', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop', price: 1200, rating: 4.7, reviews: 512 },
      { id: 4, title: 'Evening Commute', location: 'Business District', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500&h=300&fit=crop', price: 200, rating: 4.6, reviews: 678 },
      { id: 5, title: 'Beach Trip', location: 'Coastal Area', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=500&h=300&fit=crop', price: 800, rating: 4.8, reviews: 423 },
      { id: 6, title: 'Night Ride', location: 'City Center', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=500&h=300&fit=crop', price: 180, rating: 4.5, reviews: 267 }
    ];
    if (import.meta.env.DEV) {
      console.warn('Using fallback mock recommendations - API unavailable');
      return mockRecommendations;
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch recommendations');
  }
});

const getInitialFavorites = () => {
  if (typeof window !== 'undefined') {
    const storedFavorites = localStorage.getItem('favoriteRecommendations');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  }
  return [];
};

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState: {
    recommendations: [],
    loading: false,
    error: null,
    favorites: getInitialFavorites(),
  },
  reducers: {
    toggleFavorite: (state, action) => {
      const id = action.payload;
      const favoritesSet = new Set(state.favorites);
      if (favoritesSet.has(id)) {
        favoritesSet.delete(id);
      } else {
        favoritesSet.add(id);
      }
      state.favorites = Array.from(favoritesSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem('favoriteRecommendations', JSON.stringify(state.favorites));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload || [];
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { toggleFavorite } = recommendationsSlice.actions;

export default recommendationsSlice.reducer;
