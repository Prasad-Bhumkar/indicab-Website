package com.indicab.service.impl;

import com.indicab.controller.AdminWebSocketController;
import com.indicab.dto.UserProfileDTO;
import com.indicab.dto.UserRegistrationDTO;
import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import com.indicab.service.UserService;
import com.indicab.util.MetricsHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of UserService
 * Handles user registration, profile management, and queries
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminWebSocketController adminWebSocketController;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MetricsHelper metricsHelper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User registerUser(UserRegistrationDTO registrationDTO) {
        logger.info("Attempting to register user with email: {}", registrationDTO.getEmail());

        if (emailExists(registrationDTO.getEmail())) {
            logger.warn("Registration failed - email already exists: {}", registrationDTO.getEmail());
            throw new IllegalArgumentException("User with this email already exists");
        }

        User newUser = new User();
        newUser.setName(registrationDTO.getName());
        newUser.setEmail(registrationDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        newUser.setPhone(registrationDTO.getPhone());
        newUser.setAddress(registrationDTO.getAddress());
        newUser.setRole("USER");

        User savedUser = userRepository.save(newUser);
        logger.info("User registered successfully with ID: {}", savedUser.getId());

        // Notify admin via WebSocket (non-critical; log and continue on failure)
        try {
            adminWebSocketController.broadcastNewUser(savedUser);
        } catch (Exception e) {
            logger.warn("Failed to broadcast new user via WebSocket: {}", e.getMessage());
        }

        return savedUser;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        logger.debug("Finding user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findById(Long id) {
        logger.debug("Finding user by ID: {}", id);
        return userRepository.findById(id);
    }

    @Override
    public List<User> getAllUsers() {
        logger.debug("Fetching all users");
        return userRepository.findAll();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User updateUserProfile(Long id, UserProfileDTO profileDTO) {
        logger.info("Updating user profile for ID: {}", id);
        User user = getUserOrThrow(id);

        user.setName(profileDTO.getName());
        user.setEmail(profileDTO.getEmail());
        user.setPhone(profileDTO.getPhone());
        user.setAddress(profileDTO.getAddress());

        User updatedUser = userRepository.save(user);
        logger.info("User profile updated successfully for ID: {}", id);
        return updatedUser;
    }

    @Override
    public boolean emailExists(String email) {
        boolean exists = userRepository.findByEmail(email).isPresent();
        logger.debug("Email existence check - email: {}, exists: {}", email, exists);
        return exists;
    }

    @Override
    public User getUserOrThrow(Long id) {
        logger.debug("Getting user or throwing exception for ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new IllegalArgumentException("User not found with ID: " + id);
                });
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void bulkDeleteUsers(List<Long> ids) {
        logger.info("Bulk soft deleting {} users", ids.size());
        try {
            List<User> users = userRepository.findAllById(ids);
            for (User user : users) {
                user.softDelete();
            }
            userRepository.saveAll(users);
            logger.info("Bulk soft deletion completed for {} users", ids.size());
        } catch (Exception e) {
            logger.error("Failed to perform bulk soft deletion for users", e);
            metricsHelper.recordError("UserService", e, "bulkDeleteUsers");
            throw new RuntimeException("Failed to delete multiple users");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void bulkUpdateUsersRole(List<Long> ids, String role) {
        logger.info("Bulk updating role to {} for {} users", role, ids.size());
        try {
            List<User> users = userRepository.findAllById(ids);
            for (User user : users) {
                user.setRole(role);
            }
            userRepository.saveAll(users);
            logger.info("Bulk role update completed for {} users", ids.size());
        } catch (Exception e) {
            logger.error("Failed to perform bulk role update", e);
            metricsHelper.recordError("UserService", e, "bulkUpdateUsersRole");
            throw new RuntimeException("Failed to update role for multiple users");
        }
    }
}
