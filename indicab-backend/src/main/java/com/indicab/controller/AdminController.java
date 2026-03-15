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
     * Get all users with pagination, sorting, and search
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Retrieve paginated list of all system users with optional search, sort, and filters (ADMIN only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<Page<User>> getAllUsers(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String role) {

        logger.info("Fetching all users - Page: {}, Size: {}, Search: {}, Email: {}, Role: {}",
                   pageable.getPageNumber(), pageable.getPageSize(), search, email, role);

        com.indicab.util.SearchSpecification.SpecificationBuilder<User> builder =
            new com.indicab.util.SearchSpecification.SpecificationBuilder<>();

        if (search != null && !search.isEmpty()) {
            builder.with("name", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS)
                   .with("email", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS);
        }

        if (email != null && !email.isEmpty()) {
            builder.with("email", email, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
        }

        if (role != null && !role.isEmpty()) {
            builder.with("role", role, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
        }

        Page<User> users = userRepository.findAll(builder.build(), pageable);
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
    @Operation(summary = "Delete user", description = "Soft delete a user by ID (ADMIN only) - marks as deleted without removing from database")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "403", description = "User does not have admin role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid token")
    })
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("Soft deleting user with ID: {}", id);
        return userRepository.findById(id)
                .map(user -> {
                    user.softDelete();
                    userRepository.save(user);
                    logger.info("User soft deleted successfully - ID: {}", id);
                    return ResponseEntity.ok("User deleted successfully");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    /**
     * Delete multiple users
     */
    @DeleteMapping("/users/bulk")
    @Operation(summary = "Bulk delete users", description = "Soft delete multiple users by ID at once (ADMIN only) - marks as deleted without removing from database")
    @ApiResponse(responseCode = "204", description = "Users deleted successfully")
    public ResponseEntity<Void> bulkDeleteUsers(@RequestBody java.util.List<Long> ids, HttpServletRequest request) {
        logger.info("Admin performing bulk soft delete on users. Count: {}", ids.size());

        try {
            userService.bulkDeleteUsers(ids);

            // Log bulk operation
            Long adminId = getCurrentAdminId();
            String ipAddress = request.getRemoteAddr();
            auditLoggingService.logBulkOperation(adminId, "DELETE", "USER", ids, ipAddress,
                                                "Bulk soft deleted " + ids.size() + " users");

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error performing bulk soft delete on users: {}", e.getMessage());
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
            if (auth != null && auth.getPrincipal() instanceof com.indicab.config.CustomUserDetails) {
                com.indicab.config.CustomUserDetails userDetails = (com.indicab.config.CustomUserDetails) auth.getPrincipal();
                return userDetails.getId();
            }
        } catch (Exception e) {
            logger.debug("Could not get admin ID from security context: {}", e.getMessage());
        }
        return null;
    }
}
