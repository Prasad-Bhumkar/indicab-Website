import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { logger } from '../utils/logger';

/**
 * Admin WebSocket Service for Real-time Dashboard Updates
 * Manages admin-specific STOMP/SockJS connection and subscriptions
 */
class AdminWebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.maxReconnectDelay = 30000;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.resolveConnection = null;
    this.eventCallbacks = new Map();
  }

  /**
   * Get the WebSocket URL for admin endpoint
   */
  getWebSocketUrl() {
    if (import.meta.env.DEV) {
      return '/api/ws/admin';
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const wsProtocol = apiBaseUrl.includes('https') ? 'wss' : 'ws';
    const host = new URL(apiBaseUrl).host;
    return `${wsProtocol}://${host}/ws/admin`;
  }

  /**
   * Connect to admin WebSocket server
   */
  connect() {
    // If already connected, resolve immediately
    if (this.isConnected) {
      return Promise.resolve();
    }

    // If connection is in progress, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;

      try {
        const url = this.getWebSocketUrl();
        logger.info('ADMIN_WEBSOCKET', `Attempting to connect to ${url}`);

        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = () => {};

        this.stompClient.connect(
          { Authorization: `Bearer ${localStorage.getItem('token')}` },
          (frame) => this.onConnected(frame, resolve),
          (error) => this.onConnectError(error, reject)
        );

        setTimeout(() => {
          if (!this.isConnected && this.connectionPromise) {
            this.connectionPromise = null;
            reject(new Error('Admin WebSocket connection timeout'));
          }
        }, 10000);
      } catch (error) {
        logger.error('ADMIN_WEBSOCKET', 'Failed to initialize WebSocket', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Handle successful connection
   */
  onConnected(frame, resolve) {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2000;
    this.connectionPromise = null;
    this.resolveConnection = null;

    logger.info('ADMIN_WEBSOCKET', 'Connected to Admin WebSocket server');

    if (resolve) {
      resolve();
    }
  }

  /**
   * Handle connection errors
   */
  onConnectError(error, reject) {
    logger.warn('ADMIN_WEBSOCKET', `Connection error: ${error}`, error);

    if (reject && this.reconnectAttempts === 0) {
      reject(error);
    }

    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(
        'ADMIN_WEBSOCKET',
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    logger.info(
      'ADMIN_WEBSOCKET',
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        logger.warn('ADMIN_WEBSOCKET', 'Reconnection attempt failed', error);
      });
    }, delay);
  }

  /**
   * Subscribe to booking updates
   * @param {function} callback - Function to call when booking updates arrive
   * @returns {function} Unsubscribe function
   */
  subscribeToBookingUpdates(callback) {
    return this.subscribeTopic('/topic/admin/bookings', 'bookingUpdates', callback);
  }

  /**
   * Subscribe to driver updates
   * @param {function} callback - Function to call when driver updates arrive
   * @returns {function} Unsubscribe function
   */
  subscribeToDriverUpdates(callback) {
    return this.subscribeTopic('/topic/admin/drivers', 'driverUpdates', callback);
  }

  /**
   * Subscribe to user registration updates
   * @param {function} callback - Function to call when user registrations arrive
   * @returns {function} Unsubscribe function
   */
  subscribeToUserUpdates(callback) {
    return this.subscribeTopic('/topic/admin/users', 'userUpdates', callback);
  }

  /**
   * Subscribe to dashboard metrics updates
   * @param {function} callback - Function to call when metrics updates arrive
   * @returns {function} Unsubscribe function
   */
  subscribeToDashboardUpdates(callback) {
    return this.subscribeTopic('/topic/admin/dashboard', 'dashboardUpdates', callback);
  }

  /**
   * Generic subscription method
   * @private
   */
  subscribeTopic(topic, eventType, callback) {
    const performSubscription = () => {
      try {
        if (this.subscriptions.has(topic)) {
          logger.warn('ADMIN_WEBSOCKET', `Already subscribed to ${topic}`);
          return true;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
          try {
            if (!message.body) {
              logger.warn('ADMIN_WEBSOCKET', 'Received empty message body');
              return;
            }

            const data = JSON.parse(message.body);
            logger.logRequest('ADMIN_WEBSOCKET', topic);
            logger.logResponse('ADMIN_WEBSOCKET', topic, 200, data);

            // Call the callback
            callback(data);

            // Call any registered event handlers
            if (this.eventCallbacks.has(eventType)) {
              this.eventCallbacks.get(eventType).forEach((handler) => {
                try {
                  handler(data);
                } catch (error) {
                  logger.error('ADMIN_WEBSOCKET', `Error in event handler for ${eventType}`, error);
                }
              });
            }
          } catch (error) {
            logger.error('ADMIN_WEBSOCKET', 'Error parsing message', error);
          }
        });

        this.subscriptions.set(topic, subscription);
        logger.info('ADMIN_WEBSOCKET', `Successfully subscribed to ${topic}`);
        return true;
      } catch (error) {
        logger.error('ADMIN_WEBSOCKET', `Failed to subscribe to ${topic}`, error);
        return false;
      }
    };

    // If already connected, subscribe immediately
    if (this.isConnected) {
      performSubscription();
    } else {
      // Otherwise, ensure connection first then subscribe
      this.connect().then(() => {
        performSubscription();
      }).catch((error) => {
        logger.error('ADMIN_WEBSOCKET', `Failed to connect before subscribing to ${topic}`, error);
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeTopic(topic);
    };
  }

  /**
   * Unsubscribe from a topic
   * @private
   */
  unsubscribeTopic(topic) {
    if (this.subscriptions.has(topic)) {
      try {
        const subscription = this.subscriptions.get(topic);
        subscription.unsubscribe();
        this.subscriptions.delete(topic);
        logger.info('ADMIN_WEBSOCKET', `Unsubscribed from ${topic}`);
      } catch (error) {
        logger.error('ADMIN_WEBSOCKET', `Error unsubscribing from ${topic}`, error);
      }
    }
  }

  /**
   * Send notification to admin
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   */
  sendNotification(message, type = 'info') {
    const notification = {
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    if (this.isConnected) {
      try {
        this.stompClient.send('/app/admin/notify', {}, JSON.stringify(notification));
        logger.info('ADMIN_WEBSOCKET', 'Notification sent');
      } catch (error) {
        logger.error('ADMIN_WEBSOCKET', 'Failed to send notification', error);
      }
    }
  }

  /**
   * Register an event callback
   */
  addEventListener(eventType, handler) {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType).push(handler);

    // Return a function to remove this listener
    return () => {
      this.removeEventListener(eventType, handler);
    };
  }

  /**
   * Remove an event callback
   */
  removeEventListener(eventType, handler) {
    if (this.eventCallbacks.has(eventType)) {
      const handlers = this.eventCallbacks.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    // Unsubscribe from all topics
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        logger.warn('ADMIN_WEBSOCKET', 'Error unsubscribing', error);
      }
    });
    this.subscriptions.clear();

    // Clear all event callbacks
    this.eventCallbacks.clear();

    // Disconnect if connected
    if (this.stompClient && this.isConnected) {
      try {
        this.stompClient.disconnect(() => {
          this.isConnected = false;
          logger.info('ADMIN_WEBSOCKET', 'Disconnected from Admin WebSocket');
        });
      } catch (error) {
        logger.warn('ADMIN_WEBSOCKET', 'Error disconnecting', error);
        this.isConnected = false;
      }
    }

    this.connectionPromise = null;
    this.resolveConnection = null;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create and export singleton instance
export const adminWebsocketService = new AdminWebSocketService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    adminWebsocketService.disconnect();
  });
}

export default adminWebsocketService;
