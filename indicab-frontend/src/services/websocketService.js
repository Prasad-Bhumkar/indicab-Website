import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { logger } from '../utils/logger';

/**
 * WebSocket Service for Real-time Ride Tracking
 * Manages STOMP/SockJS connection and subscriptions
 */
class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // Start with 2 seconds
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.resolveConnection = null;
  }

  /**
   * Get the WebSocket URL based on environment
   */
  getWebSocketUrl() {
    if (import.meta.env.DEV) {
      // In development, connect through the API proxy
      return '/api/ws/ride';
    }
    // In production, use the environment variable or construct from window.location
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const wsProtocol = apiBaseUrl.includes('https') ? 'wss' : 'ws';
    const host = new URL(apiBaseUrl).host;
    return `${wsProtocol}://${host}/ws/ride`;
  }

  /**
   * Connect to WebSocket server
   * Returns a promise that resolves when connected
   */
  connect() {
    if (this.isConnected || this.connectionPromise) {
      return this.connectionPromise || Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;

      try {
        const url = this.getWebSocketUrl();
        logger.info('WEBSOCKET', `Attempting to connect to ${url}`);

        const socket = new SockJS(url);
        this.stompClient = Stomp.over(socket);

        // Disable default logging for cleaner console output
        this.stompClient.debug = () => {};

        this.stompClient.connect(
          {}, // headers (empty for public endpoint)
          (frame) => this.onConnected(frame, resolve),
          (error) => this.onConnectError(error, reject)
        );

        // Set a timeout for connection establishment
        setTimeout(() => {
          if (!this.isConnected && !this.connectionPromise) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      } catch (error) {
        logger.error('WEBSOCKET', 'Failed to initialize WebSocket', error);
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

    logger.info('WEBSOCKET', 'Connected to WebSocket server');
    console.log('✓ WebSocket connected:', frame.version);

    if (resolve) {
      resolve();
    }
    if (this.resolveConnection) {
      this.resolveConnection();
      this.resolveConnection = null;
    }

    this.connectionPromise = null;
  }

  /**
   * Handle connection errors
   */
  onConnectError(error, reject) {
    logger.warn('WEBSOCKET', `Connection error: ${error}`, error);

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
        'WEBSOCKET',
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
      'WEBSOCKET',
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        logger.warn('WEBSOCKET', 'Reconnection attempt failed', error);
      });
    }, delay);
  }

  /**
   * Subscribe to ride tracking updates
   * @param {string} rideId - The ride ID to track
   * @param {function} callback - Function to call when updates arrive
   * @returns {function} Unsubscribe function
   */
  subscribeToRideTracking(rideId, callback) {
    if (!rideId) {
      logger.error('WEBSOCKET', 'Ride ID is required for subscription');
      return () => {};
    }

    const subscriptionTopic = `/topic/ride/${rideId}`;
    logger.info('WEBSOCKET', `Subscribing to ${subscriptionTopic}`);

    const ensureConnected = () => {
      if (!this.isConnected) {
        this.connect().then(() => performSubscription());
        return;
      }
      performSubscription();
    };

    const performSubscription = () => {
      try {
        if (this.subscriptions.has(subscriptionTopic)) {
          logger.warn('WEBSOCKET', `Already subscribed to ${subscriptionTopic}`);
          return;
        }

        const subscription = this.stompClient.subscribe(subscriptionTopic, (message) => {
          try {
            const data = JSON.parse(message.body);
            logger.logRequest('WEBSOCKET', subscriptionTopic);
            logger.logResponse('WEBSOCKET', subscriptionTopic, 200, data);
            callback(data);
          } catch (error) {
            logger.error('WEBSOCKET', 'Error parsing message', error);
          }
        });

        this.subscriptions.set(subscriptionTopic, subscription);
        logger.info('WEBSOCKET', `Successfully subscribed to ${subscriptionTopic}`);
      } catch (error) {
        logger.error('WEBSOCKET', `Failed to subscribe to ${subscriptionTopic}`, error);
      }
    };

    ensureConnected();

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromRideTracking(rideId);
    };
  }

  /**
   * Unsubscribe from ride tracking
   */
  unsubscribeFromRideTracking(rideId) {
    const subscriptionTopic = `/topic/ride/${rideId}`;

    if (this.subscriptions.has(subscriptionTopic)) {
      try {
        const subscription = this.subscriptions.get(subscriptionTopic);
        subscription.unsubscribe();
        this.subscriptions.delete(subscriptionTopic);
        logger.info('WEBSOCKET', `Unsubscribed from ${subscriptionTopic}`);
      } catch (error) {
        logger.error('WEBSOCKET', `Error unsubscribing from ${subscriptionTopic}`, error);
      }
    }
  }

  /**
   * Send a message to a destination (for driver location updates)
   */
  sendMessage(destination, message) {
    if (!this.isConnected) {
      logger.warn('WEBSOCKET', 'Cannot send message - WebSocket not connected');
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      try {
        logger.logRequest('WEBSOCKET', destination);
        this.stompClient.send(
          destination,
          { 'content-type': 'application/json' },
          JSON.stringify(message)
        );
        logger.logResponse('WEBSOCKET', destination, 200, message);
        resolve();
      } catch (error) {
        logger.error('WEBSOCKET', `Error sending message to ${destination}`, error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.stompClient && this.isConnected) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          logger.warn('WEBSOCKET', 'Error unsubscribing', error);
        }
      });
      this.subscriptions.clear();

      // Disconnect
      this.stompClient.disconnect(() => {
        this.isConnected = false;
        logger.info('WEBSOCKET', 'Disconnected from WebSocket');
      });
    }

    this.connectionPromise = null;
    this.resolveConnection = null;
  }

  /**
   * Check if WebSocket is connected
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Add a message handler for a specific topic
   */
  addMessageHandler(topic, handler) {
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, []);
    }
    this.messageHandlers.get(topic).push(handler);
  }

  /**
   * Remove a message handler
   */
  removeMessageHandler(topic, handler) {
    if (this.messageHandlers.has(topic)) {
      const handlers = this.messageHandlers.get(topic);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// Create and export singleton instance
export const websocketService = new WebSocketService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    websocketService.disconnect();
  });
}

export default websocketService;
