import { useEffect } from 'react';
import { adminWebsocketService } from '../services/adminWebsocketService';
import { useToast } from '../components/ToastContainer';

/**
 * Custom hook for integrating admin WebSocket functionality
 * Handles connection, subscription, and notification display
 */
export const useAdminWebSocket = () => {
  const toast = useToast();

  /**
   * Initialize WebSocket connection
   */
  const initializeWebSocket = async () => {
    try {
      await adminWebsocketService.connect();
      toast.showSuccess('Connected to real-time updates');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      toast.showError('Failed to connect to real-time updates');
    }
  };

  /**
   * Subscribe to booking updates
   */
  const subscribeToBookingUpdates = (callback) => {
    return adminWebsocketService.subscribeToBookingUpdates((data) => {
      toast.showInfo(`New booking: ${data.id}`);
      callback(data);
    });
  };

  /**
   * Subscribe to driver updates
   */
  const subscribeToDriverUpdates = (callback) => {
    return adminWebsocketService.subscribeToDriverUpdates((data) => {
      toast.showInfo(`Driver update: ${data.name}`);
      callback(data);
    });
  };

  /**
   * Subscribe to user registration updates
   */
  const subscribeToUserUpdates = (callback) => {
    return adminWebsocketService.subscribeToUserUpdates((data) => {
      toast.showInfo(`New user registered: ${data.name}`);
      callback(data);
    });
  };

  /**
   * Subscribe to dashboard metrics updates
   */
  const subscribeToDashboardUpdates = (callback) => {
    return adminWebsocketService.subscribeToDashboardUpdates((data) => {
      callback(data);
    });
  };

  /**
   * Check connection status
   */
  const getConnectionStatus = () => {
    return adminWebsocketService.getConnectionStatus();
  };

  /**
   * Disconnect from WebSocket
   */
  const disconnect = () => {
    adminWebsocketService.disconnect();
  };

  return {
    initializeWebSocket,
    subscribeToBookingUpdates,
    subscribeToDriverUpdates,
    subscribeToUserUpdates,
    subscribeToDashboardUpdates,
    getConnectionStatus,
    disconnect,
  };
};

export default useAdminWebSocket;
