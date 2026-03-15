package com.indicab.controller;

import com.indicab.dto.NotificationResponseDTO;
import com.indicab.dto.PagedResponseDTO;
import com.indicab.service.NotificationService;
import com.indicab.service.UserService;
import com.indicab.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Notification controller handling notification-related API requests
 */
@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app notification management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get user's notifications with pagination", description = "Retrieve paginated list of notifications for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paginated list of notifications retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PagedResponseDTO<NotificationResponseDTO>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponseDTO> notificationsPage = notificationService.getUserNotifications(currentUser.getId(), pageable);

        PagedResponseDTO<NotificationResponseDTO> response = new PagedResponseDTO<>(
                notificationsPage.getContent(),
                page,
                size,
                notificationsPage.getTotalElements(),
                notificationsPage.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieve all unread notifications for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unread notifications retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<NotificationResponseDTO>> getUnreadNotifications() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<NotificationResponseDTO> unreadNotifications = notificationService.getUnreadNotifications(currentUser.getId());
        return ResponseEntity.ok(unreadNotifications);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count", description = "Get the number of unread notifications for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Unread count retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        long unreadCount = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification marked as read"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications as read for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications marked as read"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAllAsRead() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification", description = "Delete a specific notification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Notification deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
