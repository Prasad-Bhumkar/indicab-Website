package com.indicab.controller;

import com.indicab.entity.User;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserController
 * Tests user profile management endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("UserController Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private User createTestUser(String email, String name, String password) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone("1234567890");
        user.setAddress("Test Address");
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Test
    @DisplayName("GET /api/v1/users/profile - Get current user profile")
    @WithMockUser(username = "john@test.com")
    void testGetCurrentUserProfile() throws Exception {
        createTestUser("john@test.com", "John Doe", "password123");

        mockMvc.perform(get("/api/v1/users/profile")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@test.com"))
                .andExpect(jsonPath("$.phone").value("1234567890"));
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - Get user by ID")
    @WithMockUser(username = "user@test.com")
    void testGetUserById() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "password123");

        mockMvc.perform(get("/api/v1/users/" + user.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("user@test.com"));
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - User not found")
    @WithMockUser(username = "user@test.com")
    void testGetUserByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/users/{id}/profile - Get user profile by ID")
    @WithMockUser(username = "user@test.com")
    void testGetUserProfileById() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "password123");

        mockMvc.perform(get("/api/v1/users/" + user.getId() + "/profile")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("user@test.com"));
    }

    @Test
    @DisplayName("PUT /api/v1/users/{id}/profile - Update user profile")
    @WithMockUser(username = "user@test.com")
    void testUpdateUserProfile() throws Exception {
        User user = createTestUser("user@test.com", "Old Name", "password123");

        mockMvc.perform(put("/api/v1/users/" + user.getId() + "/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Updated Name\", \"email\": \"user@test.com\", " +
                         "\"phone\": \"9876543210\", \"address\": \"New Address\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.phone").value("9876543210"));
    }

    @Test
    @DisplayName("POST /api/v1/users/{id}/password - Change user password")
    @WithMockUser(username = "user@test.com")
    void testChangePassword() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "oldPassword123");

        mockMvc.perform(post("/api/v1/users/" + user.getId() + "/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\": \"oldPassword123\", " +
                         "\"newPassword\": \"newPassword456\", " +
                         "\"confirmPassword\": \"newPassword456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));
    }

    @Test
    @DisplayName("POST /api/v1/users/{id}/password - Invalid current password")
    @WithMockUser(username = "user@test.com")
    void testChangePasswordInvalidCurrent() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "correctPassword");

        mockMvc.perform(post("/api/v1/users/" + user.getId() + "/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\": \"wrongPassword\", " +
                         "\"newPassword\": \"newPassword456\", " +
                         "\"confirmPassword\": \"newPassword456\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Current password is incorrect"));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/{id}/account - Delete account without password")
    @WithMockUser(username = "user@test.com")
    void testDeleteAccountWithoutPassword() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "password123");

        mockMvc.perform(delete("/api/v1/users/" + user.getId() + "/account")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account deletion initiated. Your data will be permanently deleted."));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/{id}/account - Delete account with valid password")
    @WithMockUser(username = "user@test.com")
    void testDeleteAccountWithPassword() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "password123");

        mockMvc.perform(delete("/api/v1/users/" + user.getId() + "/account")
                .param("password", "password123")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Account deletion initiated. Your data will be permanently deleted."));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/{id}/account - Invalid password")
    @WithMockUser(username = "user@test.com")
    void testDeleteAccountWithWrongPassword() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "correctPass");

        mockMvc.perform(delete("/api/v1/users/" + user.getId() + "/account")
                .param("password", "wrongPass")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid password for account deletion"));
    }

    @Test
    @DisplayName("GET /api/v1/users/{id} - Non-existent user")
    @WithMockUser(username = "user@test.com")
    void testGetNonExistentUser() throws Exception {
        mockMvc.perform(get("/api/v1/users/99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
