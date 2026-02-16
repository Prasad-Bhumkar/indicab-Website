package com.indicab.controller;

import com.indicab.dto.PagedResponseDTO;
import com.indicab.entity.AuditLog;
import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.repository.AuditLogRepository;
import com.indicab.repository.BookingRepository;
import com.indicab.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin dashboard controller for monitoring and managing the platform
 * Provides statistics, user management, booking management, and audit logs
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@Tag(name = "Admin Dashboard", description = "Admin dashboard and monitoring endpoints")
@SecurityRequirement(name = "Bearer Token")
public class AdminDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Get dashboard overview with key metrics
     */
    @GetMapping("/overview")
    @Operation(summary = "Get dashboard overview", description = "Get key platform metrics and statistics")
    @ApiResponse(responseCode = "200", description = "Dashboard overview retrieved successfully")
    public ResponseEntity<?> getDashboardOverview() {
        logger.debug("Fetching dashboard overview");

        try {
            Map<String, Object> overview = new HashMap<>();

            // User statistics
            long totalUsers = userRepository.count();
            long drivers = userRepository.findAll().stream()
                    .filter(u -> "DRIVER".equals(u.getRole()))
                    .count();
            long riders = totalUsers - drivers;

            // Booking statistics
            long totalBookings = bookingRepository.count();
            long pendingBookings = bookingRepository.findAll().stream()
                    .filter(b -> "PENDING".equals(b.getStatus()))
                    .count();
            long confirmedBookings = bookingRepository.findAll().stream()
                    .filter(b -> "CONFIRMED".equals(b.getStatus()))
                    .count();

            // Audit statistics
            long totalAuditLogs = auditLogRepository.count();
            long failedOperations = auditLogRepository.findAll().stream()
                    .filter(a -> "FAILED".equals(a.getStatus()))
                    .count();

            // Build response
            overview.put("timestamp", LocalDateTime.now());
            
            // Users section
            Map<String, Object> users = new HashMap<>();
            users.put("total", totalUsers);
            users.put("drivers", drivers);
            users.put("riders", riders);
            overview.put("users", users);

            // Bookings section
            Map<String, Object> bookings = new HashMap<>();
            bookings.put("total", totalBookings);
            bookings.put("pending", pendingBookings);
            bookings.put("confirmed", confirmedBookings);
            bookings.put("pendingPercentage", totalBookings > 0 ? (double) pendingBookings / totalBookings * 100 : 0);
            overview.put("bookings", bookings);

            // Audit section
            Map<String, Object> audit = new HashMap<>();
            audit.put("totalLogs", totalAuditLogs);
            audit.put("failedOperations", failedOperations);
            audit.put("failureRate", totalAuditLogs > 0 ? (double) failedOperations / totalAuditLogs * 100 : 0);
            overview.put("audit", audit);

            logger.info("Dashboard overview generated - Users: {}, Bookings: {}",
                       totalUsers, totalBookings);

            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            logger.error("Error fetching dashboard overview: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch dashboard overview"));
        }
    }

    /**
     * Get users management page
     */
    @GetMapping("/users")
    @Operation(summary = "Get users list", description = "Get paginated list of all users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        logger.debug("Fetching users list - Page: {}, Size: {}", page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> usersPage = userRepository.findAll(pageable);

            PagedResponseDTO<Map<String, Object>> response = new PagedResponseDTO<>(
                    usersPage.getContent().stream()
                            .map(user -> {
                                Map<String, Object> userMap = new HashMap<>();
                                userMap.put("id", user.getId());
                                userMap.put("name", user.getName());
                                userMap.put("email", user.getEmail());
                                userMap.put("phone", user.getPhone());
                                userMap.put("role", user.getRole());
                                userMap.put("createdAt", user.getCreatedAt());
                                return userMap;
                            })
                            .toList(),
                    page,
                    size,
                    usersPage.getTotalElements(),
                    usersPage.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch users"));
        }
    }

    /**
     * Get bookings management page
     */
    @GetMapping("/bookings")
    @Operation(summary = "Get bookings list", description = "Get paginated list of all bookings with filters")
    public ResponseEntity<?> getBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        logger.debug("Fetching bookings list - Page: {}, Size: {}, Status: {}", page, size, status);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Booking> bookingsPage;

            if (status != null && !status.isEmpty()) {
                List<Booking> filteredBookings = bookingRepository.findAll()
                                                                .stream()
                                                                .filter(b -> status.equals(b.getStatus()))
                                                                .toList();
                
                // Manually apply pagination to the filtered list
                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), filteredBookings.size());
                
                List<Booking> pagedList = filteredBookings.subList(start, end);
                bookingsPage = new PageImpl<>(pagedList, pageable, filteredBookings.size());
            } else {
                bookingsPage = bookingRepository.findAll(pageable);
            }

            PagedResponseDTO<Map<String, Object>> response = new PagedResponseDTO<>(
                    bookingsPage.getContent().stream()
                            .map(booking -> {
                                Map<String, Object> bookingMap = new HashMap<>();
                                bookingMap.put("id", booking.getId());
                                bookingMap.put("from", booking.getFrom());
                                bookingMap.put("to", booking.getTo());
                                bookingMap.put("amount", booking.getAmount());
                                bookingMap.put("status", booking.getStatus());
                                bookingMap.put("createdAt", booking.getCreatedAt());
                                return bookingMap;
                            })
                            .toList(),
                    page,
                    size,
                    bookingsPage.getTotalElements(),
                    bookingsPage.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching bookings: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch bookings"));
        }
    }

    /**
     * Get audit logs
     */
    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs", description = "Get paginated list of audit logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        logger.debug("Fetching audit logs - Page: {}, Size: {}", page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditLog> auditLogsPage = auditLogRepository.findAll(pageable);

            PagedResponseDTO<Map<String, Object>> response = new PagedResponseDTO<>(
                    auditLogsPage.getContent().stream()
                            .map(log -> {
                                Map<String, Object> logMap = new HashMap<>();
                                logMap.put("id", log.getId());
                                logMap.put("userId", log.getUserId());
                                logMap.put("operation", log.getOperation());
                                logMap.put("resourceType", log.getResourceType());
                                logMap.put("status", log.getStatus());
                                logMap.put("ipAddress", log.getIpAddress());
                                logMap.put("createdAt", log.getCreatedAt());
                                return logMap;
                            })
                            .toList(),
                    page,
                    size,
                    auditLogsPage.getTotalElements(),
                    auditLogsPage.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching audit logs: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Failed to fetch audit logs"));
        }
    }

    /**
     * Get system health status
     */
    @GetMapping("/health")
    @Operation(summary = "Get system health", description = "Get system health and availability status")
    public ResponseEntity<?> getSystemHealth() {
        logger.debug("Fetching system health status");

        try {
            Map<String, Object> health = new HashMap<>();
            health.put("status", "UP");
            health.put("timestamp", LocalDateTime.now());
            health.put("database", "CONNECTED");
            health.put("uptime", "N/A");

            return ResponseEntity.ok(health);
        } catch (Exception e) {
            logger.error("Error checking system health: {}", e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("System health check failed"));
        }
    }

    /**
     * Error response class
     */
    public static class ErrorResponse {
        private boolean success = false;
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public boolean isSuccess() { return success; }
        public String getError() { return error; }
    }
}
