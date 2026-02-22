package com.indicab.controller;

import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import com.indicab.service.AuditLoggingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Admin controller handling admin-specific operations
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Management", description = "Admin-only endpoints for system management")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")  // All endpoints in this controller require ADMIN role
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.indicab.service.UserService userService;

    @Autowired
    private AuditLoggingService auditLoggingService;

    /**
     * Get all users with pagination and sorting
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Retrieve paginated list of all system users (ADMIN only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        logger.info("Fetching all users with pagination - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<User> users = userRepository.findAll(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/user/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by ID (ADMIN only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        logger.info("Fetching user with ID: {}", id);
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Delete user by ID
     */
    @DeleteMapping("/user/{id}")
    @Operation(summary = "Delete user", description = "Delete a user by ID (ADMIN only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        userRepository.deleteById(id);
        logger.info("User deleted successfully - ID: {}", id);
        return ResponseEntity.ok("User deleted successfully");
    }

    /**
     * Delete multiple users
     */
    @DeleteMapping("/users/bulk")
    @Operation(summary = "Bulk delete users", description = "Delete multiple users by ID at once (ADMIN only)")
    @ApiResponse(responseCode = "204", description = "Users deleted successfully")
    public ResponseEntity<Void> bulkDeleteUsers(@RequestBody java.util.List<Long> ids, HttpServletRequest request) {
        logger.info("Admin performing bulk delete on users. Count: {}", ids.size());

        try {
            userService.bulkDeleteUsers(ids);

            // Log bulk operation
            Long adminId = getCurrentAdminId();
            String ipAddress = request.getRemoteAddr();
            auditLoggingService.logBulkOperation(adminId, "DELETE", "USER", ids, ipAddress,
                                                "Bulk deleted " + ids.size() + " users");

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error performing bulk delete on users: {}", e.getMessage());
            Long adminId = getCurrentAdminId();
            String ipAddress = request.getRemoteAddr();
            auditLoggingService.logFailedBulkOperation(adminId, "DELETE", "USER", ids, ipAddress, e.getMessage());
            throw e;
        }
    }

    /**
     * Bulk update users role
     */
    @PutMapping("/users/bulk/role")
    @Operation(summary = "Bulk update users role", description = "Update role for multiple users at once (ADMIN only)")
    @ApiResponse(responseCode = "200", description = "Users role updated successfully")
    public ResponseEntity<Void> bulkUpdateUsersRole(
            @RequestBody java.util.List<Long> ids,
            @RequestParam String role,
            HttpServletRequest request) {

        logger.info("Admin performing bulk role update to: {} for {} users", role, ids.size());

        try {
            userService.bulkUpdateUsersRole(ids, role);

            // Log bulk operation
            Long adminId = getCurrentAdminId();
            String ipAddress = request.getRemoteAddr();
            auditLoggingService.logBulkOperation(adminId, "UPDATE_ROLE", "USER", ids, ipAddress,
                                                "Bulk updated role to " + role + " for " + ids.size() + " users");

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error performing bulk role update: {}", e.getMessage());
            Long adminId = getCurrentAdminId();
            String ipAddress = request.getRemoteAddr();
            auditLoggingService.logFailedBulkOperation(adminId, "UPDATE_ROLE", "USER", ids, ipAddress, e.getMessage());
            throw e;
        }
    }

    /**
     * Helper method to get current admin user ID from security context
     */
    private Long getCurrentAdminId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
                // In a real implementation, you would get the actual user ID from the UserDetails
                // For now, we'll return a placeholder that should be customized
                return 1L; // This should be replaced with actual admin ID from user details
            }
        } catch (Exception e) {
            logger.debug("Could not get admin ID from security context: {}", e.getMessage());
        }
        return null;
    }
}
