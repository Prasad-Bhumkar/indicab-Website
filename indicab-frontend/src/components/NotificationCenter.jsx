import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from '../features/notifications/notificationsSlice';
import './NotificationCenter.css';
import { FaBell, FaTimesCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

function NotificationCenter({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { notifications, unreadCount, pagination, loading } = useSelector(
    (state) => state.notifications
  );
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUserNotifications({ page: 0, size: 10 }));
      dispatch(getUnreadCount());
    }
  }, [isOpen, dispatch]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    dispatch(fetchUserNotifications({ page, size: 10 }));
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return <FaCheckCircle className="notification-icon booking" />;
      case 'SYSTEM':
        return <FaInfoCircle className="notification-icon system" />;
      case 'DRIVER':
        return <FaCheckCircle className="notification-icon driver" />;
      case 'RATING':
        return <FaCheckCircle className="notification-icon rating" />;
      default:
        return <FaInfoCircle className="notification-icon system" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING':
        return 'notification-booking';
      case 'DRIVER':
        return 'notification-driver';
      case 'RATING':
        return 'notification-rating';
      case 'SYSTEM':
        return 'notification-system';
      default:
        return 'notification-system';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div
        className="notification-center-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notification-header">
          <div className="notification-title">
            <FaBell className="bell-icon" />
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <button
            type="button"
            className="notification-close"
            onClick={onClose}
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>

        <div className="notification-toolbar">
          {unreadCount > 0 && (
            <button
              className="btn-mark-all-read"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="notification-list">
          {loading && (
            <div className="notification-loading">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="notification-empty">
              <FaBell size={48} className="empty-icon" />
              <p>No notifications yet</p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.isRead ? 'unread' : ''
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title-text">
                      {notification.title}
                    </h4>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}{' '}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="btn-mark-read"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <FaCheckCircle size={16} />
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <FaTimesCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="notification-pagination">
            {Array.from({ length: pagination.totalPages }).map((_, index) => (
              <button
                key={index}
                className={`pagination-btn ${
                  index === currentPage ? 'active' : ''
                }`}
                onClick={() => handlePageChange(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;
