import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, apiCall } from '../../config/apiConfig';

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async () => {
  const result = await apiCall(
    () => apiClient.get('/v1/notifications'),
    []
  );

  return {
    data: result.data,
    isOffline: result.isOffline,
    error: result.error
  };
});

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id) => {
  await apiClient.put(`/v1/notifications/${id}/read`);
  return id;
});

export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async () => {
  await apiClient.put('/v1/notifications/mark-all-read');
  return;
});

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data?.content || action.payload.data || [];
        state.notifications = data;
        state.unreadCount = data.filter(n => !n.isRead).length;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
