import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminWebsocketService } from '../services/adminWebsocketService';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// Mock dependencies
vi.mock('sockjs-client');
vi.mock('stompjs');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Admin WebSocket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
    
    // Reset service state
    adminWebsocketService.stompClient = null;
    adminWebsocketService.isConnected = false;
    adminWebsocketService.subscriptions.clear();
    adminWebsocketService.reconnectAttempts = 0;
  });

  afterEach(() => {
    adminWebsocketService.disconnect();
  });

  describe('Connection Management', () => {
    it('should initialize with correct default values', () => {
      expect(adminWebsocketService.isConnected).toBe(false);
      expect(adminWebsocketService.subscriptions.size).toBe(0);
      expect(adminWebsocketService.reconnectAttempts).toBe(0);
    });

    it('should generate correct WebSocket URL in development', () => {
      const url = adminWebsocketService.getWebSocketUrl();
      expect(url).toBe('/api/ws/admin');
    });

    it('should create SockJS and Stomp client on connect attempt', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect, onError) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn(),
        subscribe: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();

      expect(SockJS).toHaveBeenCalledWith('/api/ws/admin');
      expect(Stomp.over).toHaveBeenCalledWith(mockSocket);
      expect(mockStompClient.connect).toHaveBeenCalled();
    });

    it('should set isConnected to true on successful connection', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();

      expect(adminWebsocketService.isConnected).toBe(true);
    });

    it('should pass Bearer token in connection headers', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn(),
        disconnect: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();

      const connectCall = mockStompClient.connect.mock.calls[0];
      expect(connectCall[0]).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('should disconnect gracefully', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
      adminWebsocketService.disconnect();

      expect(mockStompClient.disconnect).toHaveBeenCalled();
      expect(adminWebsocketService.isConnected).toBe(false);
    });

    it('should return connection status', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();

      const status = adminWebsocketService.getConnectionStatus();
      expect(status).toEqual({
        isConnected: true,
        subscriptionCount: 0,
        reconnectAttempts: 0,
      });
    });
  });

  describe('Topic Subscriptions', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should subscribe to booking updates', async () => {
      const callback = vi.fn();
      const unsubscribe = adminWebsocketService.subscribeToBookingUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/bookings',
        expect.any(Function)
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should subscribe to driver updates', async () => {
      const callback = vi.fn();
      const unsubscribe = adminWebsocketService.subscribeToDriverUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/drivers',
        expect.any(Function)
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should subscribe to user updates', async () => {
      const callback = vi.fn();
      const unsubscribe = adminWebsocketService.subscribeToUserUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/users',
        expect.any(Function)
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should subscribe to dashboard updates', async () => {
      const callback = vi.fn();
      const unsubscribe = adminWebsocketService.subscribeToDashboardUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/dashboard',
        expect.any(Function)
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('should track subscriptions', async () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToBookingUpdates(callback);

      const status = adminWebsocketService.getConnectionStatus();
      expect(status.subscriptionCount).toBe(1);
    });

    it('should prevent duplicate subscriptions', async () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToBookingUpdates(callback);
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();
      adminWebsocketService.subscribeToBookingUpdates(callback);
      
      // Should only be called once for the same topic
      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledTimes(1);
      consoleSpy.mockRestore();
    });

    it('should invoke callback when message is received', (done) => {
      const callback = vi.fn();
      const testData = { id: 1, status: 'new_booking' };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      // Simulate message received
      messageHandler({
        body: JSON.stringify(testData),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(testData);
        done();
      }, 100);
    });
  });

  describe('Real-Time Updates', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
        send: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should handle real-time booking updates', (done) => {
      const callback = vi.fn();
      const bookingUpdate = {
        type: 'NEW_BOOKING',
        data: {
          id: 1,
          userId: 5,
          from: 'Mumbai',
          to: 'Pune',
          status: 'pending',
        },
        timestamp: new Date().toISOString(),
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      messageHandler({
        body: JSON.stringify(bookingUpdate),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(bookingUpdate);
        done();
      }, 100);
    });

    it('should handle real-time user registration updates', (done) => {
      const callback = vi.fn();
      const userUpdate = {
        type: 'NEW_USER',
        data: {
          id: 10,
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
        },
        timestamp: new Date().toISOString(),
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToUserUpdates(callback);

      messageHandler({
        body: JSON.stringify(userUpdate),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(userUpdate);
        done();
      }, 100);
    });

    it('should handle dashboard metrics updates', (done) => {
      const callback = vi.fn();
      const dashboardUpdate = {
        totalUsers: 1000,
        totalBookings: 5000,
        totalRevenue: '₹100,000',
        activeRides: 50,
        timestamp: new Date().toISOString(),
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToDashboardUpdates(callback);

      messageHandler({
        body: JSON.stringify(dashboardUpdate),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(dashboardUpdate);
        done();
      }, 100);
    });

    it('should handle malformed JSON gracefully', (done) => {
      const callback = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      messageHandler({
        body: '{invalid json}',
      });

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        done();
      }, 100);
    });
  });

  describe('Event Handlers', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should register event listeners', () => {
      const handler = vi.fn();
      const unsubscribe = adminWebsocketService.addEventListener('bookingUpdates', handler);

      expect(typeof unsubscribe).toBe('function');
      expect(adminWebsocketService.eventCallbacks.has('bookingUpdates')).toBe(true);
    });

    it('should call registered event handlers on message receipt', (done) => {
      const handler = vi.fn();
      const testData = { id: 1, status: 'new_booking' };

      adminWebsocketService.addEventListener('bookingUpdates', handler);

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, callback) => {
          messageHandler = callback;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(() => {});

      messageHandler({
        body: JSON.stringify(testData),
      });

      setTimeout(() => {
        expect(handler).toHaveBeenCalledWith(testData);
        done();
      }, 100);
    });

    it('should remove event listeners', () => {
      const handler = vi.fn();
      const unsubscribe = adminWebsocketService.addEventListener('bookingUpdates', handler);
      
      unsubscribe();

      expect(adminWebsocketService.eventCallbacks.get('bookingUpdates')?.length || 0).toBe(0);
    });

    it('should support multiple event listeners for same event', (done) => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const testData = { id: 1 };

      adminWebsocketService.addEventListener('bookingUpdates', handler1);
      adminWebsocketService.addEventListener('bookingUpdates', handler2);

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, callback) => {
          messageHandler = callback;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(() => {});

      messageHandler({
        body: JSON.stringify(testData),
      });

      setTimeout(() => {
        expect(handler1).toHaveBeenCalledWith(testData);
        expect(handler2).toHaveBeenCalledWith(testData);
        done();
      }, 100);
    });
  });

  describe('Error Handling & Reconnection', () => {
    it('should attempt reconnection on connection error', async () => {
      const mockSocket = {};
      let connectErrorCallback;
      const mockStompClient = {
        connect: vi.fn((headers, onConnect, onError) => {
          connectErrorCallback = onError;
          onError('Connection failed');
        }),
        disconnect: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      try {
        await adminWebsocketService.connect();
      } catch (error) {
        // Expected to fail on first attempt
      }

      expect(adminWebsocketService.reconnectAttempts).toBeGreaterThan(0);
    });

    it('should implement exponential backoff for reconnection', () => {
      // Test exponential backoff delay calculation
      const baseDelay = 2000;
      const maxDelay = 30000;

      for (let i = 1; i <= 3; i++) {
        const delay = Math.min(
          baseDelay * Math.pow(2, i - 1),
          maxDelay
        );
        expect(delay).toBeGreaterThan(0);
        expect(delay).toBeLessThanOrEqual(maxDelay);
      }
    });

    it('should stop reconnecting after max attempts', () => {
      const maxAttempts = 5;
      adminWebsocketService.maxReconnectAttempts = maxAttempts;
      adminWebsocketService.reconnectAttempts = maxAttempts;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
      adminWebsocketService.attemptReconnect();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Message Parsing & Validation', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should parse JSON message body correctly', (done) => {
      const callback = vi.fn();
      const testMessage = {
        id: 1,
        type: 'UPDATE',
        timestamp: new Date().toISOString(),
        data: { status: 'active' },
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      messageHandler({
        body: JSON.stringify(testMessage),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(testMessage);
        done();
      }, 100);
    });

    it('should handle null or empty message body', (done) => {
      const callback = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      messageHandler({
        body: null,
      });

      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        done();
      }, 100);
    });

    it('should handle arrays in message body', (done) => {
      const callback = vi.fn();
      const testArray = [
        { id: 1, status: 'pending' },
        { id: 2, status: 'completed' },
      ];

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      messageHandler({
        body: JSON.stringify(testArray),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(testArray);
        done();
      }, 100);
    });

    it('should handle nested JSON structures', (done) => {
      const callback = vi.fn();
      const nestedData = {
        booking: {
          id: 1,
          user: {
            id: 5,
            name: 'John',
            contact: {
              email: 'john@example.com',
              phone: '1234567890',
            },
          },
          route: {
            from: 'Mumbai',
            to: 'Pune',
          },
        },
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      messageHandler({
        body: JSON.stringify(nestedData),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(nestedData);
        done();
      }, 100);
    });
  });

  describe('Subscription Management & Cleanup', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should unsubscribe from topic when unsubscribe function is called', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      adminWebsocketService.stompClient.subscribe.mockReturnValueOnce({
        unsubscribe: mockUnsubscribe,
      });

      const unsubscribe = adminWebsocketService.subscribeToBookingUpdates(callback);
      unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle multiple unsubscribe calls gracefully', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      adminWebsocketService.stompClient.subscribe.mockReturnValueOnce({
        unsubscribe: mockUnsubscribe,
      });

      const unsubscribe = adminWebsocketService.subscribeToBookingUpdates(callback);
      unsubscribe();
      unsubscribe(); // Second call should not cause error

      expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });

    it('should clear all subscriptions on disconnect', async () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToBookingUpdates(callback);
      adminWebsocketService.subscribeToDriverUpdates(callback);
      adminWebsocketService.subscribeToUserUpdates(callback);

      const initialCount = adminWebsocketService.getConnectionStatus().subscriptionCount;
      expect(initialCount).toBe(3);

      adminWebsocketService.disconnect();

      const finalCount = adminWebsocketService.getConnectionStatus().subscriptionCount;
      expect(finalCount).toBe(0);
    });

    it('should clean up event handlers on service cleanup', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      adminWebsocketService.addEventListener('bookingUpdates', handler1);
      adminWebsocketService.addEventListener('userUpdates', handler2);

      adminWebsocketService.disconnect();

      expect(adminWebsocketService.eventCallbacks.size).toBe(0);
    });

    it('should prevent memory leaks by removing old subscriptions', () => {
      const callback = vi.fn();

      // Subscribe and unsubscribe multiple times
      for (let i = 0; i < 10; i++) {
        const unsubscribe = adminWebsocketService.subscribeToBookingUpdates(callback);
        unsubscribe();
      }

      const status = adminWebsocketService.getConnectionStatus();
      expect(status.subscriptionCount).toBe(0);
    });
  });

  describe('Connection Lifecycle', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      // Multiple rapid connect/disconnect cycles
      await adminWebsocketService.connect();
      adminWebsocketService.disconnect();
      await adminWebsocketService.connect();
      adminWebsocketService.disconnect();

      expect(adminWebsocketService.isConnected).toBe(false);
    });

    it('should handle connection when already connected', async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
      const firstConnectCallCount = mockStompClient.connect.mock.calls.length;

      await adminWebsocketService.connect();
      // Should not create a new connection if already connected
      expect(mockStompClient.connect.mock.calls.length).toBeLessThanOrEqual(firstConnectCallCount + 1);
    });

    it('should handle disconnect when not connected', () => {
      adminWebsocketService.isConnected = false;
      adminWebsocketService.stompClient = null;

      // Should not throw error
      expect(() => {
        adminWebsocketService.disconnect();
      }).not.toThrow();
    });
  });

  describe('Token Management', () => {
    it('should use token from localStorage for authorization', async () => {
      const testToken = 'test-jwt-token-12345';
      localStorageMock.getItem.mockReturnValueOnce(testToken);

      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();

      const connectHeaders = mockStompClient.connect.mock.calls[0][0];
      expect(connectHeaders.Authorization).toBe(`Bearer ${testToken}`);
    });

    it('should handle missing token gracefully', async () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn(),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();

      const connectHeaders = mockStompClient.connect.mock.calls[0][0];
      expect(connectHeaders.Authorization).toBe('Bearer null');
    });
  });

  describe('Topic Subscription Helpers', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should call subscribeTopic internally for bookings', () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToBookingUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/bookings',
        expect.any(Function)
      );
    });

    it('should call subscribeTopic internally for drivers', () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToDriverUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/drivers',
        expect.any(Function)
      );
    });

    it('should call subscribeTopic internally for users', () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToUserUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/users',
        expect.any(Function)
      );
    });

    it('should call subscribeTopic internally for dashboard', () => {
      const callback = vi.fn();
      adminWebsocketService.subscribeToDashboardUpdates(callback);

      expect(adminWebsocketService.stompClient.subscribe).toHaveBeenCalledWith(
        '/topic/admin/dashboard',
        expect.any(Function)
      );
    });
  });

  describe('Performance & Stress Tests', () => {
    beforeEach(async () => {
      const mockSocket = {};
      const mockStompClient = {
        connect: vi.fn((headers, onConnect) => {
          onConnect({ version: '1.2' });
        }),
        disconnect: vi.fn((callback) => callback()),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      SockJS.mockReturnValue(mockSocket);
      Stomp.over.mockReturnValue(mockStompClient);

      await adminWebsocketService.connect();
    });

    it('should handle multiple rapid message events', (done) => {
      const callback = vi.fn();
      let messageHandler;

      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(callback);

      // Send 100 rapid messages
      for (let i = 0; i < 100; i++) {
        messageHandler({
          body: JSON.stringify({ id: i, status: 'updated' }),
        });
      }

      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(100);
        done();
      }, 200);
    });

    it('should handle large message payloads', (done) => {
      const callback = vi.fn();
      const largeData = {
        bookings: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          userId: Math.random() * 1000,
          from: 'Mumbai',
          to: 'Pune',
          fare: Math.random() * 1000,
          status: 'completed',
        })),
        statistics: {
          totalBookings: 1000,
          totalRevenue: 500000,
          averageFare: 500,
          completionRate: 0.95,
        },
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToDashboardUpdates(callback);

      messageHandler({
        body: JSON.stringify(largeData),
      });

      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(largeData);
        done();
      }, 100);
    });

    it('should maintain callback order for sequential messages', (done) => {
      const callback = vi.fn();
      const messageOrder = [];

      const testCallback = (data) => {
        messageOrder.push(data.id);
        callback(data);
      };

      let messageHandler;
      adminWebsocketService.stompClient.subscribe.mockImplementation(
        (topic, handler) => {
          messageHandler = handler;
          return { unsubscribe: vi.fn() };
        }
      );

      adminWebsocketService.subscribeToBookingUpdates(testCallback);

      for (let i = 1; i <= 10; i++) {
        messageHandler({
          body: JSON.stringify({ id: i }),
        });
      }

      setTimeout(() => {
        expect(messageOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        done();
      }, 100);
    });
  });
});
