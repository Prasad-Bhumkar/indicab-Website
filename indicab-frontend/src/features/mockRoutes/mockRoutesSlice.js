import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  routes: [
    { from: 'Mumbai', to: 'Pune', distance: 150 },
    { from: 'Mumbai', to: 'Nashik', distance: 170 },
    { from: 'Pune', to: 'Mumbai', distance: 150 },
    { from: 'Pune', to: 'Nashik', distance: 210 },
    { from: 'Delhi', to: 'Agra', distance: 230 },
    { from: 'Delhi', to: 'Jaipur', distance: 280 },
    { from: 'Bangalore', to: 'Mysore', distance: 145 },
    { from: 'Chennai', to: 'Pondicherry', distance: 155 },
  ],
  loading: false,
  error: null,
};

const mockRoutesSlice = createSlice({
  name: 'mockRoutes',
  initialState,
  reducers: {
    addRoute: (state, action) => {
      state.routes.push(action.payload);
    },
    updateRoute: (state, action) => {
      const index = state.routes.findIndex(route => route.from === action.payload.from && route.to === action.payload.to);
      if (index !== -1) {
        state.routes[index] = action.payload;
      }
    },
    deleteRoute: (state, action) => {
      state.routes = state.routes.filter(route => !(route.from === action.payload.from && route.to === action.payload.to));
    },
  },
});

export const { addRoute, updateRoute, deleteRoute } = mockRoutesSlice.actions;

export default mockRoutesSlice.reducer;
