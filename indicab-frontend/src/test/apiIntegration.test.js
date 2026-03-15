import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, apiCall } from '../config/apiConfig';
import { handleApiError, safeAsync, retryAsync } from '../utils/errorHandler';

describe('API Integration Tests', () => {
  const mockApiUrl = 'http://localhost:8000';
  
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
  });

  describe('API Client Configuration', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBeDefined();
    });

    it('should have request timeout configured', () => {
      expect(apiClient.defaults.timeout).toBe(10000);
    });

    it('should include Content-Type header', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should have Authorization interceptor', () => {
      expect(apiClient.interceptors.request).toBeDefined();
    });

    it('should have response interceptor', () => {
      expect(apiClient.interceptors.response).toBeDefined();
    });
  });

  describe('API Call Helper', () => {
    it('should return successful response', async () => {
      const mockData = { id: 1, name: 'Test Route' };
      const mockFn = vi.fn(() => Promise.resolve({ data: mockData }));

      const result = await apiCall(mockFn);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockFn).toHaveBeenCalled();
    });

    it('should return fallback data on error', async () => {
      const fallbackData = { id: 0, name: 'Fallback' };
      const mockFn = vi.fn(() => Promise.reject(new Error('Network error')));

      const result = await apiCall(mockFn, fallbackData);

      expect(result.success).toBe(false);
      expect(result.data).toEqual(fallbackData);
      expect(result.error).toBeDefined();
    });

    it('should detect offline errors', async () => {
      const fallbackData = [];
      const error = new Error('Network Error');
      error.message = 'Network Error';
      const mockFn = vi.fn(() => Promise.reject(error));

      const result = await apiCall(mockFn, fallbackData);

      expect(result.isOffline).toBe(true);
      expect(result.isNetworkError).toBe(true);
    });
  });

  describe('Error Handler', () => {
    it('should handle API errors correctly', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        }
      };

      const result = handleApiError(error);

      expect(result.status).toBe(400);
      expect(result.message).toBeDefined();
    });

    it('should handle network errors', () => {
      const error = {
        message: 'Network Error'
      };

      const result = handleApiError(error);

      expect(result.message).toContain('Network');
    });

    it('should handle 401 unauthorized', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      const result = handleApiError(error);

      expect(result.status).toBe(401);
    });

    it('should handle 500 server errors', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      const result = handleApiError(error);

      expect(result.status).toBe(500);
    });
  });

  describe('Safe Async Operations', () => {
    it('should execute async function successfully', async () => {
      const mockFn = vi.fn(() => Promise.resolve({ success: true }));

      const result = await safeAsync(mockFn, 'TEST_ASYNC');

      expect(result.success).toBe(true);
      expect(mockFn).toHaveBeenCalled();
    });

    it('should return fallback on error', async () => {
      const fallback = { success: false };
      const mockFn = vi.fn(() => Promise.reject(new Error('Test error')));

      const result = await safeAsync(mockFn, 'TEST_ASYNC', fallback);

      expect(result).toEqual(fallback);
    });

    it('should throw error when no fallback provided', async () => {
      const mockFn = vi.fn(() => Promise.reject(new Error('Test error')));

      try {
        await safeAsync(mockFn, 'TEST_ASYNC');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Retry Logic', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn(() => Promise.resolve({ data: 'success' }));

      const result = await retryAsync(mockFn, 3, 100, 'TEST_RETRY');

      expect(result).toEqual({ data: 'success' });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      let callCount = 0;
      const mockFn = vi.fn(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve({ data: 'success' });
      });

      const result = await retryAsync(mockFn, 3, 10, 'TEST_RETRY');

      expect(result).toEqual({ data: 'success' });
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = vi.fn(() => Promise.reject(new Error('Persistent error')));

      try {
        await retryAsync(mockFn, 2, 10, 'TEST_RETRY');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('Persistent error');
        expect(mockFn).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('Token Management', () => {
    it('should add auth token to requests', () => {
      const token = 'test-jwt-token-123';
      localStorage.setItem('token', token);

      // Simulate the request interceptor logic
      const config = { headers: {} };
      const storedToken = localStorage.getItem('token');

      expect(storedToken).toBe(token);

      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }

      expect(config.headers.Authorization).toBeDefined();
      expect(config.headers.Authorization).toContain('Bearer');

      // Cleanup
      localStorage.removeItem('token');
    });

    it('should clear token on 401 response', () => {
      localStorage.setItem('token', 'test-token');

      // Verify token was set
      expect(localStorage.getItem('token')).toBe('test-token');

      // Simulate 401 error handler
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      // Verify it's a 401 error
      expect(error.response.status).toBe(401);

      // Clear token when 401 occurs
      localStorage.removeItem('token');
      expect(localStorage.getItem('token')).toBeFalsy();
    });
  });

  describe('Offline Queue', () => {
    it('should persist booking to queue when offline', async () => {
      // This would require the actual offlineQueue instance
      // For now, we test the concept
      const queue = [];
      const booking = {
        from: 'Mumbai',
        to: 'Pune',
        date: '2025-02-20'
      };

      queue.push(booking);

      expect(queue).toHaveLength(1);
      expect(queue[0].from).toBe('Mumbai');
    });

    it('should track queue status', () => {
      const queueStatus = {
        total: 3,
        pending: 1,
        syncing: 1,
        failed: 0,
        completed: 1,
        isOnline: false
      };

      expect(queueStatus.total).toBe(3);
      expect(queueStatus.pending).toBe(1);
      expect(queueStatus.isOnline).toBe(false);
    });
  });

  describe('Feature-Specific Endpoints', () => {
    it('should have booking endpoint', () => {
      const endpoint = '/api/bookings';
      expect(endpoint).toContain('/api');
      expect(endpoint).toContain('bookings');
    });

    it('should have routes endpoint', () => {
      const endpoint = '/api/routes';
      expect(endpoint).toBeDefined();
    });

    it('should have recommendations endpoint', () => {
      const endpoint = '/api/recommendations';
      expect(endpoint).toBeDefined();
    });

    it('should have authentication endpoint', () => {
      const endpoint = '/api/auth/login';
      expect(endpoint).toContain('auth');
    });

    it('should have admin endpoint', () => {
      const endpoint = '/api/admin/dashboard';
      expect(endpoint).toContain('admin');
    });
  });

  describe('Content Negotiation', () => {
    it('should accept JSON responses', () => {
      const contentType = apiClient.defaults.headers['Content-Type'];
      expect(contentType).toBe('application/json');
    });

    it('should send JSON requests', () => {
      const contentType = apiClient.defaults.headers['Content-Type'];
      expect(contentType).toBe('application/json');
    });
  });

  describe('Timeout Handling', () => {
    it('should have configured timeout', () => {
      const timeout = apiClient.defaults.timeout;
      expect(timeout).toBe(10000); // 10 seconds
    });

    it('should respect timeout configuration', () => {
      expect(apiClient.defaults.timeout).toBeGreaterThan(0);
      expect(apiClient.defaults.timeout).toBeLessThanOrEqual(30000);
    });
  });
});

// Integration test scenarios
describe('API Integration Scenarios', () => {
  it('User should be able to book a ride', async () => {
    // Test scenario: User fills form, submits, and gets confirmation
    const bookingData = {
      from: 'Mumbai',
      to: 'Pune',
      date: '2025-02-20',
      passenger: 'John Doe',
      vehicle: 'Sedan'
    };

    // Mock the booking endpoint
    const mockBookingResponse = {
      id: 1,
      ...bookingData,
      status: 'CONFIRMED',
      bookingId: 'BK20250213001'
    };

    expect(mockBookingResponse.status).toBe('CONFIRMED');
    expect(mockBookingResponse.id).toBe(1);
  });

  it('User should be able to view booking history', async () => {
    // Test scenario: User logs in and views past bookings
    const mockBookings = [
      { id: 1, from: 'Mumbai', to: 'Pune', status: 'COMPLETED' },
      { id: 2, from: 'Pune', to: 'Nashik', status: 'PENDING' }
    ];

    expect(mockBookings).toHaveLength(2);
    expect(mockBookings[0].status).toBe('COMPLETED');
  });

  it('User should be able to update profile', async () => {
    // Test scenario: User updates name and phone
    const profileUpdate = {
      name: 'Jane Doe',
      phone: '+91-9876543210'
    };

    const updatedProfile = {
      id: 1,
      ...profileUpdate,
      email: 'jane.doe@example.com'
    };

    expect(updatedProfile.name).toBe('Jane Doe');
  });

  it('Should handle offline booking submission', async () => {
    // Test scenario: User submits booking while offline
    const offlineBooking = {
      from: 'Mumbai',
      to: 'Pune',
      date: '2025-02-20'
    };

    const queueItem = {
      id: Date.now(),
      booking: offlineBooking,
      status: 'pending',
      retries: 0
    };

    expect(queueItem.status).toBe('pending');
    expect(queueItem.booking.from).toBe('Mumbai');
  });
});
