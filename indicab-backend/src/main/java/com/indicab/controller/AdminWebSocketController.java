package com.indicab.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.*;

/**
 * WebSocket Controller for Admin Real-Time Updates
 *
 * Provides real-time updates for the admin dashboard including:
 * - New bookings
 * - User registrations
 * - Audit logs
 * - Dashboard metrics
 * - Bulk operation events
 *
 * All endpoints require ADMIN role for authorization
 */
@Controller
public class AdminWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(AdminWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Track connected admin sessions
    private final Set<String> connectedAdmins = Collections.synchronizedSet(new HashSet<>());

    /**
     * Handle admin connection to WebSocket
     */
    @SubscribeMapping("/admin/connect")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> handleAdminConnect(Authentication authentication) {
        String adminId = authentication.getName();
        connectedAdmins.add(adminId);
        logger.info("Admin connected: {}", adminId);

        Map<String, Object> response = new HashMap<>();
        response.put("type", "CONNECTION_ESTABLISHED");
        response.put("message", "Connected to admin dashboard");
        response.put("timestamp", LocalDateTime.now());
        response.put("connectedAdmins", connectedAdmins.size());

        return response;
    }

    /**
     * Admin heartbeat/ping to keep connection alive
     */
    @MessageMapping("/admin/ping")
    @SendTo("/topic/admin/pong")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> handleAdminPing() {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "PONG");
        response.put("timestamp", LocalDateTime.now());
        response.put("connectedAdmins", connectedAdmins.size());
        return response;
    }

    /**
     * Broadcast dashboard stats update to all connected admins
     */
    public void broadcastDashboardUpdate(Map<String, Object> stats) {
        logger.debug("Broadcasting dashboard stats update to {} admins", connectedAdmins.size());
        Map<String, Object> payload = new HashMap<>(stats);
        payload.put("type", "DASHBOARD_UPDATE");
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/dashboard", payload);
    }

    /**
     * Broadcast new booking notification
     */
    public void broadcastNewBooking(Object booking) {
        logger.info("Broadcasting new booking notification to {} admins", connectedAdmins.size());
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "NEW_BOOKING");
        payload.put("data", booking);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/bookings", payload);
    }

    /**
     * Broadcast booking status update
     */
    public void broadcastBookingStatusUpdate(Long bookingId, String status) {
        logger.info("Broadcasting booking status update for ID: {} to {}", bookingId, status);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BOOKING_STATUS_UPDATE");
        payload.put("bookingId", bookingId);
        payload.put("status", status);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/bookings", payload);
    }

    /**
     * Broadcast bulk booking status updates
     */
    public void broadcastBulkBookingStatusUpdate(List<Long> bookingIds, String status) {
        logger.info("Broadcasting bulk booking status update for {} bookings to status: {}", bookingIds.size(), status);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BULK_BOOKING_STATUS_UPDATE");
        payload.put("bookingIds", bookingIds);
        payload.put("status", status);
        payload.put("count", bookingIds.size());
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/bookings", payload);
    }

    /**
     * Broadcast new user registration
     */
    public void broadcastNewUser(Object user) {
        logger.info("Broadcasting new user registration notification to {} admins", connectedAdmins.size());
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "NEW_USER");
        payload.put("data", user);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/users", payload);
    }

    /**
     * Broadcast bulk user delete event
     */
    public void broadcastBulkUserDelete(List<Long> userIds) {
        logger.info("Broadcasting bulk user delete for {} users", userIds.size());
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BULK_USER_DELETE");
        payload.put("userIds", userIds);
        payload.put("count", userIds.size());
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/users", payload);
    }

    /**
     * Broadcast bulk user role update
     */
    public void broadcastBulkUserRoleUpdate(List<Long> userIds, String role) {
        logger.info("Broadcasting bulk user role update for {} users to role: {}", userIds.size(), role);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BULK_USER_ROLE_UPDATE");
        payload.put("userIds", userIds);
        payload.put("role", role);
        payload.put("count", userIds.size());
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/users", payload);
    }

    /**
     * Broadcast new audit log entry
     */
    public void broadcastNewAuditLog(Object auditLog) {
        logger.debug("Broadcasting new audit log entry");
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "NEW_AUDIT_LOG");
        payload.put("data", auditLog);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/audit-logs", payload);
    }

    /**
     * Broadcast bulk operation completion
     */
    public void broadcastBulkOperationComplete(String entityType, String operation, int count, boolean success, String message) {
        logger.info("Broadcasting bulk operation complete - Entity: {}, Operation: {}, Count: {}, Success: {}",
                   entityType, operation, count, success);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BULK_OPERATION_COMPLETE");
        payload.put("entityType", entityType);
        payload.put("operation", operation);
        payload.put("count", count);
        payload.put("success", success);
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/operations", payload);
    }

    /**
     * Broadcast bulk operation progress
     */
    public void broadcastBulkOperationProgress(String operationId, int progress, int total) {
        logger.debug("Broadcasting bulk operation progress - Operation: {}, Progress: {}/{}", operationId, progress, total);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BULK_OPERATION_PROGRESS");
        payload.put("operationId", operationId);
        payload.put("progress", progress);
        payload.put("total", total);
        payload.put("percentage", (int) ((progress * 100) / total));
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/operations", payload);
    }

    /**
     * Broadcast new driver registration
     */
    public void broadcastNewDriver(Object driver) {
        logger.info("Broadcasting new driver registration to {} admins", connectedAdmins.size());
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "NEW_DRIVER");
        payload.put("data", driver);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/drivers", payload);
    }

    /**
     * Broadcast driver status update
     */
    public void broadcastDriverStatusUpdate(Long driverId, String status) {
        logger.info("Broadcasting driver status update for ID: {} to {}", driverId, status);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "DRIVER_STATUS_UPDATE");
        payload.put("driverId", driverId);
        payload.put("status", status);
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/drivers", payload);
    }

    /**
     * Broadcast bulk driver status update
     */
    public void broadcastBulkDriverStatusUpdate(List<Long> driverIds, String status) {
        logger.info("Broadcasting bulk driver status update for {} drivers to status: {}", driverIds.size(), status);
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "BULK_DRIVER_STATUS_UPDATE");
        payload.put("driverIds", driverIds);
        payload.put("status", status);
        payload.put("count", driverIds.size());
        payload.put("timestamp", LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/admin/drivers", payload);
    }

    /**
     * Get connected admins count
     */
    public int getConnectedAdminsCount() {
        return connectedAdmins.size();
    }

    /**
     * Remove admin from connected set (called on disconnect)
     */
    public void removeAdmin(String adminId) {
        connectedAdmins.remove(adminId);
        logger.info("Admin disconnected: {}", adminId);
    }
}
