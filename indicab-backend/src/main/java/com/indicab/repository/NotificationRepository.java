package com.indicab.repository;

import com.indicab.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a user with pagination
     */
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    /**
     * Find all unread notifications for a user
     */
    List<Notification> findByUserIdAndIsReadFalse(Long userId);

    /**
     * Count unread notifications for a user
     */
    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * Find notifications by type for a user
     */
    Page<Notification> findByUserIdAndType(Long userId, String type, Pageable pageable);

    /**
     * Find all pending notifications for a user
     */
    List<Notification> findByUserIdAndStatusAndIsReadFalse(Long userId, String status);

    /**
     * Delete old notifications
     */
    void deleteByUserIdAndIsReadTrue(Long userId);
}
