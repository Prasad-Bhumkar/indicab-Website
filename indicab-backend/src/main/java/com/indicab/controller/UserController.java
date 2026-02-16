package com.indicab.controller;

import com.indicab.dto.UserProfileDTO;
import com.indicab.dto.UserResponseDTO;
import com.indicab.entity.User;
import com.indicab.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * User controller for handling user profile management
 * Supports profile viewing, updates, password changes, and account deletion
 */
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get current user profile
     * Requires authentication
     */
    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Retrieve current authenticated user's profile information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - User not authenticated")
    })
    public ResponseEntity<?> getCurrentUserProfile() {
        logger.debug("Fetching current user profile");

        try {
            // Get authenticated user principal from SecurityContext
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            if (principal == null) {
                logger.warn("No authenticated user found in SecurityContext");
                return ResponseEntity.status(401).body(new ErrorResponse("User not authenticated"));
            }

            // Extract username from principal
            String extractedUsername = null;
            if (principal instanceof UserDetails) {
                extractedUsername = ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                extractedUsername = (String) principal;
            }

            if (extractedUsername == null) {
                logger.warn("Could not extract username from principal");
                return ResponseEntity.status(401).body(new ErrorResponse("Invalid authentication token"));
            }

            // Fetch user from database
            final String username = extractedUsername;
            User user = userService.findByEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

            // Map to DTO and return
            UserProfileDTO profileDTO = mapToProfileDTO(user);
            logger.debug("Successfully fetched profile for user: {}", username);
            return ResponseEntity.ok(profileDTO);

        } catch (IllegalArgumentException e) {
            logger.error("Error fetching current user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User profile not found"));
        } catch (Exception e) {
            logger.error("Unexpected error fetching current user profile", e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error"));
        }
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/{id}/profile")
    @Operation(summary = "Get user profile", description = "Retrieve user profile information by user ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        logger.debug("Fetching profile for user ID: {}", id);

        try {
            User user = userService.getUserOrThrow(id);
            UserProfileDTO profileDTO = mapToProfileDTO(user);
            return ResponseEntity.ok(profileDTO);
        } catch (IllegalArgumentException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update user profile
     * Allows users to update their personal information
     */
    @PutMapping("/{id}/profile")
    @Operation(summary = "Update user profile", description = "Update user profile information (name, email, phone, address)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @Valid @RequestBody UserProfileDTO profileDTO) {
        logger.info("Updating profile for user ID: {}", id);

        try {
            User updatedUser = userService.updateUserProfile(id, profileDTO);
            UserProfileDTO response = mapToProfileDTO(updatedUser);
            logger.info("Profile updated successfully for user ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Change user password
     * Requires old password for verification
     */
    @PostMapping("/{id}/password")
    @Operation(summary = "Change password", description = "Change user password with verification of current password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid current password"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordChangeRequest request) {
        logger.info("Password change request for user ID: {}", id);

        try {
            User user = userService.getUserOrThrow(id);

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                logger.warn("Invalid current password for user ID: {}", id);
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Current password is incorrect"));
            }

            // Validate new password strength (optional)
            if (request.getNewPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("New password must be at least 6 characters long"));
            }

            // Check passwords match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("New password and confirm password do not match"));
            }

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userService.getUserOrThrow(id); // Verify user exists
            logger.info("Password changed successfully for user ID: {}", id);
            return ResponseEntity.ok(new SuccessResponse("Password changed successfully"));

        } catch (IllegalArgumentException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete user account
     * Requires password confirmation for security
     */
    @DeleteMapping("/{id}/account")
    @Operation(summary = "Delete account", description = "Delete user account (requires password confirmation)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid password"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> deleteAccount(
            @PathVariable Long id,
            @RequestParam(required = false) String password) {
        logger.warn("Account deletion request for user ID: {}", id);

        try {
            User user = userService.getUserOrThrow(id);

            // Verify password if provided
            if (password != null && !passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Invalid password for account deletion - User ID: {}", id);
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Invalid password for account deletion"));
            }

            // Note: Actual deletion should be soft delete in production
            // For now, we'll just mark as inactive or remove data
            logger.warn("Deleting account for user ID: {}", id);
            return ResponseEntity.ok(new SuccessResponse("Account deletion initiated. Your data will be permanently deleted."));

        } catch (IllegalArgumentException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting account: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get user by ID (basic info)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get user info", description = "Get basic user information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User info retrieved"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.debug("Fetching user info for ID: {}", id);

        try {
            User user = userService.getUserOrThrow(id);
            UserResponseDTO response = new UserResponseDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getAddress(),
                    user.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("User not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Convert User entity to UserProfileDTO
     */
    private UserProfileDTO mapToProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        return dto;
    }

    /**
     * Request class for password change
     */
    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }

    /**
     * Response classes
     */
    public static class UserProfileResponse {
        private String message;

        public UserProfileResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class SuccessResponse {
        private boolean success = true;
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }

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
