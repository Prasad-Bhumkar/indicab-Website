import axios from 'axios';
import { logger } from '../utils/logger';
import { handleApiError } from '../utils/errorHandler';

// API Configuration
// In development, use relative URL to leverage Vite proxy
// In production, use environment variable or direct URL
export const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request
    logger.logRequest(config.method.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    logger.error('API_REQUEST', 'Request setup error', error);
    return Promise.reject(error);
  }
);

// Logout handler callback
let logoutHandler = null;

// Set the logout handler to be called when session expires
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    logger.logResponse(response.config.method.toUpperCase(), response.config.url, response.status, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized with automatic refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          logger.info('API_RESPONSE', 'Attempting to refresh access token');
          const response = await apiClient.post('/v1/auth/refresh-token', { refreshToken });

          const { accessToken, user } = response.data;

          // Update tokens and user info
          localStorage.setItem('token', accessToken);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            // Store user role for logout redirect logic
            localStorage.setItem('userRole', user.role || 'USER');
          }

          // Update axios header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          logger.info('API_RESPONSE', 'Token refreshed successfully, retrying original request');

          return apiClient(originalRequest);
        } catch (refreshError) {
          logger.error('API_RESPONSE', 'Token refresh failed', refreshError);
          processQueue(refreshError, null);

          // Clear tokens and redirect to appropriate login page
          const userRole = localStorage.getItem('userRole');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');

          if (logoutHandler) {
            logoutHandler();
          } else {
            // Redirect to admin login if user was admin, otherwise user login
            const redirectUrl = userRole === 'ADMIN' ? '/admin-login' : '/login';
            window.location.href = redirectUrl;
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, clear and redirect
        logger.warn('API_RESPONSE', 'No refresh token available, redirecting to login');
        const userRole = localStorage.getItem('userRole');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        if (logoutHandler) {
          logoutHandler();
        } else {
          // Redirect to admin login if user was admin, otherwise user login
          const redirectUrl = userRole === 'ADMIN' ? '/admin-login' : '/login';
          window.location.href = redirectUrl;
        }
        return Promise.reject(error);
      }
    }

    // Silently handle network errors in development - frontend has fallback data
    // In production, only log critical errors (5xx)
    const isDevelopment = import.meta.env.DEV;
    const isNetworkError = !error.response || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK';

    // In development, suppress logging of backend errors since apiCall handles them with fallback
    // In production, log all response errors
    if (!isDevelopment && !isNetworkError) {
      const errorInfo = handleApiError(error, 'API_RESPONSE');
      logger.error('API_RESPONSE', errorInfo.message, error);
    }
    // Note: In development, backend errors are silently handled by apiCall with fallback data

    return Promise.reject(error);
  }
);

// Helper function to handle API calls with fallback
export const apiCall = async (apiFunction, fallbackData = null, componentName = 'API_CALL') => {
  try {
    const response = await apiFunction();
    logger.info(componentName, 'API call succeeded with data');
    return { data: response.data, success: true, error: null, isOffline: false };
  } catch (error) {
    // Determine if it's an offline/network error
    const isNetworkError = error.code === 'ECONNREFUSED' ||
                          error.code === 'ERR_NETWORK' ||
                          error.message === 'Network Error' ||
                          !error.response;

    // Suppress logging in development since errors are handled gracefully with fallback
    const errorInfo = handleApiError(error, componentName, null, true);

    return {
      data: fallbackData,
      success: false,
      error: errorInfo.message,
      originalError: error,
      isNetworkError: isNetworkError,
      isOffline: isNetworkError,
      status: errorInfo.status
    };
  }
};

// Offline Queue Manager for booking submissions
class OfflineQueueManager {
  constructor() {
    this.queueKey = 'bookingQueue';
    this.isOnline = navigator.onLine;
    this.syncListeners = [];

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // Add booking to offline queue
  async addToQueue(booking) {
    try {
      const queue = this.getQueue();
      const id = Date.now(); // Simple ID generation
      const queueItem = {
        id,
        booking,
        timestamp: new Date().toISOString(),
        retries: 0,
        maxRetries: 3,
        status: 'pending'
      };

      queue.push(queueItem);
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
      this.notifyListeners({ type: 'item_added', queue });

      // Try to sync immediately if online
      if (this.isOnline) {
        await this.syncQueue();
      }

      return id;
    } catch (error) {
      throw error;
    }
  }

  // Get all items in queue
  getQueue() {
    try {
      const queue = localStorage.getItem(this.queueKey);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      return [];
    }
  }

  // Get queue status
  getQueueStatus() {
    const queue = this.getQueue();
    return {
      total: queue.length,
      pending: queue.filter(item => item.status === 'pending').length,
      syncing: queue.filter(item => item.status === 'syncing').length,
      failed: queue.filter(item => item.status === 'failed').length,
      completed: queue.filter(item => item.status === 'completed').length,
      isOnline: this.isOnline,
      queue
    };
  }

  // Sync queue with backend
  async syncQueue() {
    const queue = this.getQueue();
    const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'failed');

    if (pendingItems.length === 0) {
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        // Update status to syncing
        this.updateItemStatus(item.id, 'syncing');
        this.notifyListeners({ type: 'sync_started', itemId: item.id });

        // Send to backend
        const response = await apiClient.post('/v1/bookings', item.booking);

        // Mark as completed
        this.removeFromQueue(item.id);
        synced++;

        this.notifyListeners({
          type: 'sync_completed',
          itemId: item.id,
          response: response.data
        });
      } catch (error) {
        failed++;
        item.retries = (item.retries || 0) + 1;

        if (item.retries >= item.maxRetries) {
          this.updateItemStatus(item.id, 'failed');
          this.notifyListeners({
            type: 'sync_failed_permanent',
            itemId: item.id,
            error: error.message
          });
        } else {
          this.updateItemStatus(item.id, 'pending');
          this.notifyListeners({
            type: 'sync_failed_retry',
            itemId: item.id,
            retries: item.retries,
            error: error.message
          });
        }

        console.warn('Failed to sync booking:', item.id, error.message);
      }
    }

    // Update queue in localStorage
    const updatedQueue = this.getQueue();
    localStorage.setItem(this.queueKey, JSON.stringify(updatedQueue));

    this.notifyListeners({
      type: 'sync_complete',
      stats: { synced, failed }
    });

    return { synced, failed };
  }

  // Update item status in queue
  updateItemStatus(itemId, status) {
    const queue = this.getQueue();
    const item = queue.find(q => q.id === itemId);
    if (item) {
      item.status = status;
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    }
  }

  // Remove item from queue
  removeFromQueue(itemId) {
    let queue = this.getQueue();
    queue = queue.filter(item => item.id !== itemId);
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  // Clear entire queue
  clearQueue() {
    localStorage.removeItem(this.queueKey);
    this.notifyListeners({ type: 'queue_cleared' });
  }

  // Handle online event
  handleOnline() {
    this.isOnline = true;
    this.notifyListeners({ type: 'online' });
    this.syncQueue();
  }

  // Handle offline event
  handleOffline() {
    this.isOnline = false;
    this.notifyListeners({ type: 'offline' });
  }

  // Subscribe to queue changes
  subscribe(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners(event) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        // Error in queue listener - silently ignore to prevent cascade failures
      }
    });
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();

export default apiClient;
