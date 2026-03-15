package com.indicab.service;

import com.indicab.dto.NotificationResponseDTO;
import com.indicab.entity.Notification;
import com.indicab.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    /**
     * Create and send notification to a user
     */
    Notification createNotification(User user, String title, String message, String type);

    /**
     * Create notification with related booking ID
     */
    Notification createNotification(User user, String title, String message, String type, Long bookingId);

    /**
     * Get all notifications for a user with pagination
     */
    Page<NotificationResponseDTO> getUserNotifications(Long userId, Pageable pageable);

    /**
     * Get unread notification count for a user
     */
    long getUnreadCount(Long userId);

    /**
     * Get all unread notifications for a user
     */
    List<NotificationResponseDTO> getUnreadNotifications(Long userId);

    /**
     * Mark notification as read
     */
    void markAsRead(Long notificationId);

    /**
     * Mark all notifications as read for a user
     */
    void markAllAsRead(Long userId);

    /**
     * Delete a notification
     */
    void deleteNotification(Long id);

    /**
     * Broadcast notification to connected WebSocket clients
     */
    void broadcastNotification(Long userId, NotificationResponseDTO notification);

    /**
     * Send booking confirmation notification
     */
    void sendBookingConfirmation(Long userId, Long bookingId, String bookingDetails);

    /**
     * Send booking cancellation notification
     */
    void sendBookingCancellation(Long userId, Long bookingId);

    /**
     * Send rating reminder notification
     */
    void sendRatingReminder(Long userId, Long bookingId);
}
