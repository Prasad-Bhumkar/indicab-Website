import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, apiCall } from '../../config/apiConfig';

const fallbackPopularRoutes = [
  {
    id: 1,
    from: 'Ahmednagar',
    to: 'Pune',
    price: 1200.00,
    image: 'https://example.com/images/routes/ahmednagar-pune.jpg',
    description: 'Scenic route through Maharashtra countryside connecting historic Ahmednagar to IT hub Pune. Journey time approximately 2.5 hours via NH-50.'
  },
  {
    id: 2,
    from: 'Amravati',
    to: 'Nagpur',
    price: 2000.00,
    image: 'https://example.com/images/routes/amravati-nagpur.jpg',
    description: 'Major highway connection between Amravati district headquarters and Nagpur metropolis. Well-maintained 4-lane highway with journey time around 4 hours.'
  },
  {
    id: 3,
    from: 'Aurangabad',
    to: 'Nashik',
    price: 1602.00,
    image: 'https://example.com/images/routes/aurangabad-nashik.jpg',
    description: 'Heritage route connecting two historic cities through Marathwada region. Journey passes through agricultural landscapes with travel time of 3 hours.'
  },
  {
    id: 4,
    from: 'Chandrapur',
    to: 'Nagpur',
    price: 1500.00,
    image: 'https://example.com/images/routes/chandrapur-nagpur.jpg',
    description: 'Important eastern Maharashtra corridor linking coal mining region Chandrapur to commercial center Nagpur. Approximate travel time 3.5 hours.'
  },
  {
    id: 5,
    from: 'Dhule',
    to: 'Nashik',
    price: 1700.00,
    image: 'https://example.com/images/routes/dhule-nashik.jpg',
    description: 'North Maharashtra connection through fertile plains and hills. Route serves agricultural communities with journey time around 3.5 hours via SH-14.'
  },
  {
    id: 6,
    from: 'Kolhapur',
    to: 'Pune',
    price: 2508.00,
    image: 'https://example.com/images/routes/kolhapur-pune.jpg',
    description: 'Long-distance route connecting southern Maharashtra sugar belt to Pune metropolitan area. Scenic journey through Western Ghats taking approximately 5 hours.'
  },
  {
    id: 7,
    from: 'Latur',
    to: 'Solapur',
    price: 1800.00,
    image: 'https://example.com/images/routes/latur-solapur.jpg',
    description: 'Marathwada region internal connection linking two important district centers. Route through semi-arid landscape with 3.5 hour journey time.'
  },
  {
    id: 8,
    from: 'Mumbai',
    to: 'Nagpur',
    price: 7503.00,
    image: 'https://example.com/images/routes/mumbai-nagpur.jpg',
    description: 'Major cross-state highway connecting financial capital Mumbai to geographic center Nagpur. Long-distance route taking 12-14 hours via NH-160.'
  },
  {
    id: 9,
    from: 'Mumbai',
    to: 'Nashik',
    price: 1800.00,
    image: 'https://example.com/images/routes/mumbai-nashik.jpg',
    description: 'Popular weekend route from Mumbai to wine country Nashik. Well-traveled highway through Thane and Kasara ghat with 3.5 hour journey time.'
  },
  {
    id: 10,
    from: 'Mumbai',
    to: 'Pune',
    price: 1505.00,
    image: 'https://example.com/images/routes/mumbai-pune.jpg',
    description: 'Most frequented intercity route in Maharashtra connecting two major metros. Express highway with journey time of 3 hours via Mumbai-Pune Expressway.'
  },
  {
    id: 11,
    from: 'Nashik',
    to: 'Nagpur',
    price: 5000.00,
    image: 'https://example.com/images/routes/nashik-nagpur.jpg',
    description: 'Cross-Maharashtra route connecting wine capital to orange city. Long journey through varied terrain taking approximately 8-9 hours.'
  },
  {
    id: 12,
    from: 'Pune',
    to: 'Aurangabad',
    price: 2407.00,
    image: 'https://example.com/images/routes/pune-aurangabad.jpg',
    description: 'Historical route connecting Maratha empire centers through Ahmednagar district. Journey time around 4.5 hours with good highway connectivity.'
  },
  {
    id: 13,
    from: 'Pune',
    to: 'Nashik',
    price: 2300.00,
    image: 'https://example.com/images/routes/pune-nashik.jpg',
    description: 'Important western Maharashtra connection between IT hub and wine region. Route through hills and plains with 4 hour travel time via NH-50.'
  },
  {
    id: 14,
    from: 'Solapur',
    to: 'Pune',
    price: 2305.00,
    image: 'https://example.com/images/routes/solapur-pune.jpg',
    description: 'South-central to western Maharashtra route connecting textile center to metropolitan area. Journey of approximately 4.5 hours through rural landscapes.'
  },
  {
    id: 15,
    from: 'Thane',
    to: 'Mumbai',
    price: 250.00,
    image: 'https://example.com/images/routes/thane-mumbai.jpg',
    description: 'Short metropolitan area connection between satellite city Thane and Mumbai downtown. Urban route with 45 minutes to 1.5 hours depending on traffic.'
  }
];

export const fetchPopularRoutes = createAsyncThunk('popularRoutes/fetchPopularRoutes', async (_, { getState }) => {
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
    const response = await axios.get('http://localhost:8000/api/routes', config);
    return response.data;
  } catch (error) {
    // If backend is not running or any error occurs, return empty array to trigger fallback
    return [];
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
        if (!action.payload || action.payload.length === 0) {
          // Use fallback data if backend data is empty or falsy
          state.routes = fallbackPopularRoutes;
        } else {
          // Map backend route data to frontend expected format
          state.routes = action.payload.map((route, index) => ({
            id: index + 1,
            from: route.fromLocation || route.from || '',
            to: route.toLocation || route.to || '',
            price: route.price || 'N/A',
            image: route.image || 'https://placehold.com',
            description: route.description || `Distance: ${route.distance || 'N/A'} km`
          }));
        }
      })
      .addCase(fetchPopularRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        // Use fallback data on error
        state.routes = fallbackPopularRoutes;
      });
  },
});

export const { addRoute, updateRoute, deleteRoute } = popularRoutesSlice.actions;

export default popularRoutesSlice.reducer;
