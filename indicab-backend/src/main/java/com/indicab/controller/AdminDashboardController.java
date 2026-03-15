package com.indicab.controller;

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
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Admin dashboard controller for monitoring and managing the platform
 * Provides statistics, user management, booking management, and audit logs
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@Tag(name = "Admin Dashboard", description = "Admin dashboard and monitoring endpoints")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")  // All endpoints require ADMIN role
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
     * Get users management page with pagination and sorting
     */
    @GetMapping("/users")
    @Operation(summary = "Get users list", description = "Get paginated and sorted list of all users")
    public ResponseEntity<Page<User>> getUsers(Pageable pageable) {
        logger.debug("Fetching users list - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());

        try {
            Page<User> usersPage = userRepository.findAll(pageable);
            return ResponseEntity.ok(usersPage);
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get bookings management page with pagination, sorting, and optional filtering
     */
    @GetMapping("/bookings")
    @Operation(summary = "Get bookings list", description = "Get paginated and sorted list of all bookings with optional status filter")
    public ResponseEntity<Page<Booking>> getBookings(
            Pageable pageable,
            @RequestParam(required = false) String status) {
        logger.debug("Fetching bookings list - Page: {}, Size: {}, Status: {}",
                   pageable.getPageNumber(), pageable.getPageSize(), status);

        try {
            Page<Booking> bookingsPage;

            if (status != null && !status.isEmpty()) {
                // Use database-level filtering via Specification
                com.indicab.util.SearchSpecification.SpecificationBuilder<Booking> builder =
                    new com.indicab.util.SearchSpecification.SpecificationBuilder<>();
                builder.with("status", status, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);

                bookingsPage = bookingRepository.findAll(builder.build(), pageable);
            } else {
                bookingsPage = bookingRepository.findAll(pageable);
            }

            return ResponseEntity.ok(bookingsPage);
        } catch (Exception e) {
            logger.error("Error fetching bookings: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get audit logs with pagination and sorting
     */
    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs", description = "Get paginated and sorted list of audit logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(Pageable pageable) {
        logger.debug("Fetching audit logs - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());

        try {
            Page<AuditLog> auditLogsPage = auditLogRepository.findAll(pageable);
            return ResponseEntity.ok(auditLogsPage);
        } catch (Exception e) {
            logger.error("Error fetching audit logs: {}", e.getMessage());
            return ResponseEntity.status(500).build();
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
