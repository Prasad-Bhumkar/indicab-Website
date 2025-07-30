import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock fallback profile data
const mockProfile = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91-9876543210',
  address: '123, Main Street, Mumbai',
  avatar: 'https://via.placeholder.com/150',
};

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (_, { getState }) => {
  const token = getState().auth.token;
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get('http://localhost:8000/api/profile', config);
    if (!response.data) {
      // Use mock fallback if response is empty
      return mockProfile;
    }
    return response.data;
  } catch (error) {
    // Use mock fallback on error
    return mockProfile;
  }
});

export const updateProfile = createAsyncThunk('profile/updateProfile', async (profileData, { getState }) => {
  const token = getState().auth.token;
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.put('http://localhost:8000/api/profile', profileData, config);
    if (!response.data) {
      return mockProfile;
    }
    return response.data;
  } catch (error) {
    return mockProfile;
  }
});

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default profileSlice.reducer;
