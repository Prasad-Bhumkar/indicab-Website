import axios from 'axios';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API calls with fallback
export const apiCall = async (apiFunction, fallbackData = null) => {
  try {
    const response = await apiFunction();
    return { data: response.data, success: true, error: null };
  } catch (error) {
    console.warn('API call failed, using fallback data:', error.message);
    
    // Network error or server unavailable
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      return {
        data: fallbackData,
        success: false,
        error: 'Backend service unavailable. Using cached data.',
        isOffline: true
      };
    }
    
    // Other errors
    return {
      data: fallbackData,
      success: false,
      error: error.response?.data?.message || error.message,
      isOffline: false
    };
  }
};

export default apiClient;
