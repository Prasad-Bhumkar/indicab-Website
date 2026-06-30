import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockGetConnectionStatus = vi.fn();
const mockSubscribeToBookingUpdates = vi.fn();
const mockSubscribeToDriverUpdates = vi.fn();
const mockSubscribeToUserUpdates = vi.fn();
const mockSubscribeToDashboardUpdates = vi.fn();

vi.mock('../../services/adminWebsocketService', () => ({
  adminWebsocketService: {
    connect: (...args) => mockConnect(...args),
    disconnect: (...args) => mockDisconnect(...args),
    getConnectionStatus: (...args) => mockGetConnectionStatus(...args),
    subscribeToBookingUpdates: (...args) => mockSubscribeToBookingUpdates(...args),
    subscribeToDriverUpdates: (...args) => mockSubscribeToDriverUpdates(...args),
    subscribeToUserUpdates: (...args) => mockSubscribeToUserUpdates(...args),
    subscribeToDashboardUpdates: (...args) => mockSubscribeToDashboardUpdates(...args),
  },
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowInfo = vi.fn();

vi.mock('../../components/ToastContainer', () => ({
  useToast: () => ({
    showSuccess: (...args) => mockShowSuccess(...args),
    showError: (...args) => mockShowError(...args),
    showInfo: (...args) => mockShowInfo(...args),
  }),
  ToastContainer: () => null,
}));

import { useAdminWebSocket } from '../../hooks/useAdminWebSocket';

describe('useAdminWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockResolvedValue();
    mockSubscribeToBookingUpdates.mockReturnValue(vi.fn());
    mockSubscribeToDriverUpdates.mockReturnValue(vi.fn());
    mockSubscribeToUserUpdates.mockReturnValue(vi.fn());
    mockSubscribeToDashboardUpdates.mockReturnValue(vi.fn());
    mockGetConnectionStatus.mockReturnValue({
      isConnected: false,
      subscriptionCount: 0,
      reconnectAttempts: 0,
    });
  });

  it('should return all expected functions', () => {
    const { result } = renderHook(() => useAdminWebSocket());
    expect(result.current).toHaveProperty('initializeWebSocket');
    expect(result.current).toHaveProperty('subscribeToBookingUpdates');
    expect(result.current).toHaveProperty('subscribeToDriverUpdates');
    expect(result.current).toHaveProperty('subscribeToUserUpdates');
    expect(result.current).toHaveProperty('subscribeToDashboardUpdates');
    expect(result.current).toHaveProperty('getConnectionStatus');
    expect(result.current).toHaveProperty('disconnect');
  });

  describe('initializeWebSocket', () => {
    it('should call connect on service and show success toast', async () => {
      const { result } = renderHook(() => useAdminWebSocket());
      await act(async () => {
        await result.current.initializeWebSocket();
      });
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockShowSuccess).toHaveBeenCalledWith('Connected to real-time updates');
    });

    it('should show error toast when connection fails', async () => {
      mockConnect.mockRejectedValue(new Error('Connection refused'));
      const { result } = renderHook(() => useAdminWebSocket());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await act(async () => {
        await result.current.initializeWebSocket();
      });
      expect(mockShowError).toHaveBeenCalledWith('Failed to connect to real-time updates');
      consoleSpy.mockRestore();
    });
  });

  describe('subscribeToBookingUpdates', () => {
    it('should call service subscribeToBookingUpdates with callback', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      const userCallback = vi.fn();
      const data = { id: 101, status: 'PENDING' };
      result.current.subscribeToBookingUpdates(userCallback);
      expect(mockSubscribeToBookingUpdates).toHaveBeenCalledTimes(1);
      const serviceCallback = mockSubscribeToBookingUpdates.mock.calls[0][0];
      serviceCallback(data);
      expect(mockShowInfo).toHaveBeenCalledWith('New booking: 101');
      expect(userCallback).toHaveBeenCalledWith(data);
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = vi.fn();
      mockSubscribeToBookingUpdates.mockReturnValue(unsubscribe);
      const { result } = renderHook(() => useAdminWebSocket());
      const returned = result.current.subscribeToBookingUpdates(vi.fn());
      expect(returned).toBe(unsubscribe);
    });
  });

  describe('subscribeToDriverUpdates', () => {
    it('should call service subscribeToDriverUpdates with callback', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      const userCallback = vi.fn();
      const data = { id: 5, name: 'Ravi' };
      result.current.subscribeToDriverUpdates(userCallback);
      expect(mockSubscribeToDriverUpdates).toHaveBeenCalledTimes(1);
      const serviceCallback = mockSubscribeToDriverUpdates.mock.calls[0][0];
      serviceCallback(data);
      expect(mockShowInfo).toHaveBeenCalledWith('Driver update: Ravi');
      expect(userCallback).toHaveBeenCalledWith(data);
    });
  });

  describe('subscribeToUserUpdates', () => {
    it('should call service subscribeToUserUpdates with callback', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      const userCallback = vi.fn();
      const data = { id: 10, name: 'Priya' };
      result.current.subscribeToUserUpdates(userCallback);
      expect(mockSubscribeToUserUpdates).toHaveBeenCalledTimes(1);
      const serviceCallback = mockSubscribeToUserUpdates.mock.calls[0][0];
      serviceCallback(data);
      expect(mockShowInfo).toHaveBeenCalledWith('New user registered: Priya');
      expect(userCallback).toHaveBeenCalledWith(data);
    });
  });

  describe('subscribeToDashboardUpdates', () => {
    it('should call service subscribeToDashboardUpdates with callback', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      const userCallback = vi.fn();
      const data = { metric: 'bookingCount', value: 42 };
      result.current.subscribeToDashboardUpdates(userCallback);
      expect(mockSubscribeToDashboardUpdates).toHaveBeenCalledTimes(1);
      const serviceCallback = mockSubscribeToDashboardUpdates.mock.calls[0][0];
      serviceCallback(data);
      expect(userCallback).toHaveBeenCalledWith(data);
    });

    it('should NOT show toast for dashboard updates', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      result.current.subscribeToDashboardUpdates(vi.fn());
      const serviceCallback = mockSubscribeToDashboardUpdates.mock.calls[0][0];
      serviceCallback({ value: 100 });
      expect(mockShowInfo).not.toHaveBeenCalled();
    });
  });

  describe('getConnectionStatus', () => {
    it('should delegate to service', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      const status = result.current.getConnectionStatus();
      expect(mockGetConnectionStatus).toHaveBeenCalledTimes(1);
      expect(status).toEqual({
        isConnected: false,
        subscriptionCount: 0,
        reconnectAttempts: 0,
      });
    });
  });

  describe('disconnect', () => {
    it('should delegate to service disconnect', () => {
      const { result } = renderHook(() => useAdminWebSocket());
      result.current.disconnect();
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });
});
