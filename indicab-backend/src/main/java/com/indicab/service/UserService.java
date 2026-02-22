package com.indicab.service;

import com.indicab.dto.UserProfileDTO;
import com.indicab.dto.UserRegistrationDTO;
import com.indicab.entity.User;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for user-related operations
 */
public interface UserService {
    
    /**
     * Register a new user
     */
    User registerUser(UserRegistrationDTO registrationDTO);
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by ID
     */
    Optional<User> findById(Long id);
    
    /**
     * Get all users
     */
    List<User> getAllUsers();
    
    /**
     * Update user profile
     */
    User updateUserProfile(Long id, UserProfileDTO profileDTO);
    
    /**
     * Check if email exists
     */
    boolean emailExists(String email);
    
    /**
     * Get user by ID (throws exception if not found)
     */
    User getUserOrThrow(Long id);

    /**
     * Delete multiple users
     */
    void bulkDeleteUsers(List<Long> ids);

    /**
     * Update roles for multiple users
     */
    void bulkUpdateUsersRole(List<Long> ids, String role);
}
