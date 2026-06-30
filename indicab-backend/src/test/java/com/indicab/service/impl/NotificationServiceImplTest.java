package com.indicab.service.impl;

import com.indicab.dto.NotificationResponseDTO;
import com.indicab.entity.Notification;
import com.indicab.entity.User;
import com.indicab.repository.NotificationRepository;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationServiceImpl Tests")
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");

        testNotification = new Notification(testUser, "Test Title", "Test Message", "SYSTEM");
        testNotification.setId(1L);
        testNotification.setStatus("SENT");
        testNotification.setIsRead(false);
        testNotification.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should create notification without booking ID")
    void testCreateNotificationWithoutBooking() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> {
            Notification n = i.getArgument(0);
            n.setId(1L);
            return n;
        });

        Notification result = notificationService.createNotification(testUser, "Test Title", "Test Message", "SYSTEM");

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Title");
        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate, times(2)).convertAndSendToUser(eq("1"), eq("/queue/notifications"), any(NotificationResponseDTO.class));
    }

    @Test
    @DisplayName("Should create notification with booking ID")
    void testCreateNotificationWithBooking() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> {
            Notification n = i.getArgument(0);
            n.setId(1L);
            return n;
        });

        Notification result = notificationService.createNotification(testUser, "Booking Title", "Booking Message", "BOOKING_CONFIRMED", 100L);

        assertThat(result).isNotNull();
        assertThat(result.getRelatedBookingId()).isEqualTo(100L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should get user notifications with pagination")
    void testGetUserNotifications() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Notification> notifList = new ArrayList<>();
        notifList.add(testNotification);
        Page<Notification> notifPage = new PageImpl<>(notifList, pageable, notifList.size());

        when(notificationRepository.findByUserId(1L, pageable)).thenReturn(notifPage);

        Page<NotificationResponseDTO> result = notificationService.getUserNotifications(1L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Test Title");
    }

    @Test
    @DisplayName("Should get unread count")
    void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        long result = notificationService.getUnreadCount(1L);

        assertThat(result).isEqualTo(5L);
    }

    @Test
    @DisplayName("Should get unread notifications")
    void testGetUnreadNotifications() {
        List<Notification> notifList = new ArrayList<>();
        notifList.add(testNotification);

        when(notificationRepository.findByUserIdAndIsReadFalse(1L)).thenReturn(notifList);

        List<NotificationResponseDTO> result = notificationService.getUnreadNotifications(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should mark notification as read")
    void testMarkAsRead() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.markAsRead(1L);

        assertThat(testNotification.getIsRead()).isTrue();
        assertThat(testNotification.getReadAt()).isNotNull();
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should not fail when marking non-existent notification as read")
    void testMarkAsReadNotFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        notificationService.markAsRead(999L);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should mark all notifications as read for user")
    void testMarkAllAsRead() {
        testNotification.setIsRead(false);
        List<Notification> notifList = new ArrayList<>();
        notifList.add(testNotification);

        when(notificationRepository.findByUserIdAndIsReadFalse(1L)).thenReturn(notifList);
        when(notificationRepository.saveAll(anyList())).thenReturn(notifList);

        notificationService.markAllAsRead(1L);

        assertThat(testNotification.getIsRead()).isTrue();
        verify(notificationRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Should delete notification")
    void testDeleteNotification() {
        notificationService.deleteNotification(1L);

        verify(notificationRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should send booking confirmation notification")
    void testSendBookingConfirmation() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.sendBookingConfirmation(1L, 100L, "City Center to Airport");

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should not create notification when user not found for booking confirmation")
    void testSendBookingConfirmationUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        notificationService.sendBookingConfirmation(999L, 100L, "Details");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should send booking cancellation notification")
    void testSendBookingCancellation() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.sendBookingCancellation(1L, 100L);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should not create notification when user not found for booking cancellation")
    void testSendBookingCancellationUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        notificationService.sendBookingCancellation(999L, 100L);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should send rating reminder notification")
    void testSendRatingReminder() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.sendRatingReminder(1L, 100L);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("Should not create notification when user not found for rating reminder")
    void testSendRatingReminderUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        notificationService.sendRatingReminder(999L, 100L);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should broadcast notification via WebSocket")
    void testBroadcastNotification() {
        NotificationResponseDTO dto = new NotificationResponseDTO(
                1L, "Test", "Message", "SYSTEM", "SENT",
                false, null, null, LocalDateTime.now(), null);

        notificationService.broadcastNotification(1L, dto);

        verify(messagingTemplate).convertAndSendToUser(eq("1"), eq("/queue/notifications"), eq(dto));
    }
}
