import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/v1/auth/login', credentials);
    // Backend now returns { accessToken, refreshToken, tokenType, user: { id, name, email, phone, address, role } }
    return {
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user || {
        email: credentials.email,
        authenticated: true
      },
    };
  } catch (error) {
    // Fallback to mock login in development when API is unavailable
    if (import.meta.env.DEV) {
      console.warn('Using fallback login - API unavailable. Mock login accepted.');
      // Generate a mock JWT token (for development only)
      const mockToken = 'dev-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const mockUser = {
        id: Math.floor(Math.random() * 10000),
        name: 'Development User',
        email: credentials.email,
        role: 'user',
        authenticated: true
      };
      return {
        token: mockToken,
        refreshToken: 'dev-refresh-token-' + Date.now(),
        user: mockUser,
      };
    }
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/v1/auth/register', userData);
    // Backend now returns { accessToken, refreshToken, tokenType, user: { id, name, email, phone, address, role } }
    return {
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user || {
        email: userData.email,
        authenticated: true
      },
    };
  } catch (error) {
    // Fallback to mock registration in development when API is unavailable
    if (import.meta.env.DEV) {
      console.warn('Using fallback registration - API unavailable. Mock user created.');
      // Generate a mock JWT token (for development only)
      const mockToken = 'dev-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const mockUser = {
        id: Math.floor(Math.random() * 10000),
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: 'user',
        authenticated: true
      };
      return {
        token: mockToken,
        refreshToken: 'dev-refresh-token-' + Date.now(),
        user: mockUser,
      };
    }
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const adminLoginUser = createAsyncThunk('auth/adminLoginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/v1/auth/admin-login', credentials);
    // Backend returns { accessToken, refreshToken, tokenType, user: { id, name, email, phone, address, role: 'ADMIN' } }

    // Verify user has ADMIN role
    if (response.data.user && response.data.user.role !== 'ADMIN') {
      return rejectWithValue('User does not have admin privileges');
    }

    return {
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user || {
        email: credentials.email,
        role: 'ADMIN',
        authenticated: true
      },
    };
  } catch (error) {
    // Fallback to mock admin login in development when API is unavailable
    if (import.meta.env.DEV) {
      console.warn('Using fallback admin login - API unavailable. Mock admin login accepted.');
      // Generate a mock JWT token for admin (development only)
      const mockToken = 'dev-admin-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const mockAdmin = {
        id: 99999,
        name: 'Development Admin',
        email: credentials.email,
        role: 'ADMIN',
        authenticated: true
      };
      return {
        token: mockToken,
        refreshToken: 'dev-refresh-token-' + Date.now(),
        user: mockAdmin,
      };
    }
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await apiClient.post('v1/auth/logout');
    return null;
  } catch (error) {
    // Even if logout fails on server, clear client-side tokens
    return null;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    },
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        // Store user role for logout redirect logic
        if (action.payload.user && action.payload.user.role) {
          localStorage.setItem('userRole', action.payload.user.role);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        // Store user role for logout redirect logic
        if (action.payload.user && action.payload.user.role) {
          localStorage.setItem('userRole', action.payload.user.role);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      })
      .addCase(adminLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        // Store admin role for access control and logout redirect logic
        if (action.payload.user && action.payload.user.role) {
          localStorage.setItem('userRole', action.payload.user.role);
        }
      })
      .addCase(adminLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Admin login failed';
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;

export default authSlice.reducer;
