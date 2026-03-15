package com.indicab.service.impl;

import com.indicab.dto.NotificationResponseDTO;
import com.indicab.entity.Notification;
import com.indicab.entity.User;
import com.indicab.repository.NotificationRepository;
import com.indicab.repository.UserRepository;
import com.indicab.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Override
    public Notification createNotification(User user, String title, String message, String type) {
        Notification notification = createNotification(user, title, message, type, null);
        broadcastNotification(user.getId(), toDto(notification));
        return notification;
    }

    @Override
    public Notification createNotification(User user, String title, String message, String type, Long bookingId) {
        Notification notification = new Notification(user, title, message, type);
        if (bookingId != null) {
            notification.setRelatedBookingId(bookingId);
        }
        notification.setStatus("SENT");
        Notification saved = notificationRepository.save(notification);
        broadcastNotification(user.getId(), toDto(saved));
        return saved;
    }

    @Override
    public Page<NotificationResponseDTO> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable)
                .map(this::toDto);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public List<NotificationResponseDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent()) {
            Notification n = notification.get();
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unreadNotifications.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public void broadcastNotification(Long userId, NotificationResponseDTO notification) {
        // Send to user-specific queue
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
        );
    }

    @Override
    public void sendBookingConfirmation(Long userId, Long bookingId, String bookingDetails) {
        String title = "Booking Confirmed!";
        String message = "Your booking from " + bookingDetails + " has been confirmed.";

        userRepository.findById(userId).ifPresent(user -> {
            createNotification(user, title, message, "BOOKING_CONFIRMED", bookingId);
        });
    }

    @Override
    public void sendBookingCancellation(Long userId, Long bookingId) {
        String title = "Booking Cancelled";
        String message = "Your booking #" + bookingId + " has been successfully cancelled.";

        userRepository.findById(userId).ifPresent(user -> {
            createNotification(user, title, message, "BOOKING_CANCELLED", bookingId);
        });
    }

    @Override
    public void sendRatingReminder(Long userId, Long bookingId) {
        String title = "Rate Your Trip";
        String message = "How was your recent trip? Please take a moment to rate your experience.";

        userRepository.findById(userId).ifPresent(user -> {
            createNotification(user, title, message, "RATING_REMINDER", bookingId);
        });
    }

    private NotificationResponseDTO toDto(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getStatus(),
                notification.getIsRead(),
                notification.getRelatedBookingId(),
                notification.getRelatedUserId(),
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
