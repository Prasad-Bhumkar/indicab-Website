import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, apiCall } from '../../config/apiConfig';

const fallbackRecommendations = [
  {
    id: 1,
    image: 'https://whc.unesco.org/uploads/thumbs/site_0243_0001-750-750-20151104152442.jpg',
    location: 'Aurangabad to Ajanta',
    price: 2499,
    rating: 4.9,
    reviews: '3.1k',
    title: 'Marvel at the Ajanta Caves'
  },
  {
    id: 2,
    image: 'https://blog-content.ixigo.com/wp-content/uploads/2013/08/800px-AJANTA_CAVES_-_C.SHELARE_4.jpg',
    location: 'Aurangabad to Ellora',
    price: 2299,
    rating: 4.8,
    reviews: '2.7k',
    title: 'Explore the Ellora Caves'
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Table_Land_2.jpg/250px-Table_Land_2.jpg',
    location: 'Pune to Mahabaleshwar',
    price: 1899,
    rating: 4.7,
    reviews: '2.4k',
    title: 'Hill retreat in Mahabaleshwar'
  },
  {
    id: 4,
    image: 'https://www.pawnalakecamping.net/wp-content/uploads/2023/04/rajmachi.jpg',
    location: 'Mumbai to Lonavala',
    price: 1499,
    rating: 4.6,
    reviews: '2.1k',
    title: 'Scenic drive to Lonavala'
  },
  {
    id: 5,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNhyO7uZ5Jk2L-Eu7hqtTa71vzEQU4yx9xBw&s',
    location: 'Ratnagiri to Ganpatipule',
    price: 1799,
    rating: 4.8,
    reviews: '1.9k',
    title: 'Relax at Ganpatipule Beach'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1598434192043-71111c1b3f41?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2F0ZXdheSUyMG9mJTIwaW5kaWF8ZW58MHx8MHx8fDA%3D',
    location: 'Mumbai to Gateway of India',
    price: 999,
    rating: 4.5,
    reviews: '8.2k',
    title: 'Heritage walk at Gateway of India'
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1618805714320-f8825019c1be?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2hhbmRhbGF8ZW58MHx8MHx8fDA%3D',
    location: 'Mumbai to Khandala',
    price: 1599,
    rating: 4.6,
    reviews: '1.7k',
    title: 'Adventure in Khandala'
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1632091239504-f2473a06d7ce?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    location: 'Mumbai to Matheran',
    price: 1399,
    rating: 4.7,
    reviews: '1.5k',
    title: 'Nature escape to Matheran'
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1629640890590-7836d69c5237?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    location: 'Pune to Shirdi',
    price: 1899,
    rating: 4.8,
    reviews: '2.3k',
    title: 'Spiritual visit to Shirdi'
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?w=400&h=200&fit=crop',
    location: 'Nagpur to Tadoba National Park',
    price: 2799,
    rating: 4.9,
    reviews: '1.2k',
    title: 'Wildlife adventure at Tadoba'
  }
];

export const fetchRecommendations = createAsyncThunk('recommendations/fetchRecommendations', async (_, { getState }) => {
  const token = getState().auth && getState().auth.token;
  if (!token) {
    return [];
  }
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get('http://localhost:8000/api/recommendations', config);
    return response.data;
  } catch (error) {
    return [];
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
        if (!action.payload || action.payload.length === 0) {
          state.recommendations = fallbackRecommendations;
        } else {
          state.recommendations = action.payload;
        }
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.recommendations = fallbackRecommendations;
      });
  },
});

export const { toggleFavorite } = recommendationsSlice.actions;

export default recommendationsSlice.reducer;
