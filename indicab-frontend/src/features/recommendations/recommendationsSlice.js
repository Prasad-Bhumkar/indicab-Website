import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRecommendations = createAsyncThunk('recommendations/fetchRecommendations', async (_, { getState }) => {
  const token = getState().auth.token;
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get('http://localhost:8000/api/recommendations', config);
  return response.data;
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
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { toggleFavorite } = recommendationsSlice.actions;

export default recommendationsSlice.reducer;
