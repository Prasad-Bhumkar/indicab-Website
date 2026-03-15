import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../config/apiConfig';

const initialState = {
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/v1/notifications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnreadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/v1/notifications/unread');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/v1/notifications/unread-count');
      return response.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiClient.put(`/v1/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.put('/v1/notifications/mark-all-read');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/v1/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addNotification = createAsyncThunk(
  'notifications/addNotification',
  async (notification, { rejectWithValue }) => {
    // This is used by WebSocket to add real-time notifications
    return notification;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    receiveNotification: (state, action) => {
      // Called when WebSocket sends new notification
      state.unreadNotifications.unshift(action.payload);
      state.unreadCount += 1;
      if (state.notifications.length > 0) {
        state.notifications.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.content || [];
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadNotifications = action.payload;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch unread notifications';
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notifIndex = state.notifications.findIndex(n => n.id === action.payload);
        if (notifIndex !== -1) {
          state.notifications[notifIndex].isRead = true;
        }
        const unreadIndex = state.unreadNotifications.findIndex(n => n.id === action.payload);
        if (unreadIndex !== -1) {
          state.unreadNotifications.splice(unreadIndex, 1);
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => (n.isRead = true));
        state.unreadNotifications = [];
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.unreadNotifications = state.unreadNotifications.filter(n => n.id !== action.payload);
        if (!state.notifications.find(n => !n.isRead)) {
          state.unreadCount = 0;
        }
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.unreadNotifications.unshift(action.payload);
        state.unreadCount += 1;
      });
  },
});

export const { clearNotificationError, receiveNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
