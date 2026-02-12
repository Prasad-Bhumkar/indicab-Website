package com.indicab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.indicab.dto.LoginRequestDTO;
import com.indicab.dto.UserRegistrationDTO;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController
 * Tests authentication endpoints with MockMvc
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:mysql://localhost:3306/indicab_website_test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private LoginRequestDTO loginRequest;
    private UserRegistrationDTO registrationRequest;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setPhone("9876543210");
        testUser.setAddress("123 Main St");
        testUser.setRole("USER");

        loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        registrationRequest = new UserRegistrationDTO();
        registrationRequest.setName("New User");
        registrationRequest.setEmail("newuser@example.com");
        registrationRequest.setPassword("password123");
        registrationRequest.setPhone("9876543211");
        registrationRequest.setAddress("456 Oak Ave");
    }

    @Test
    @DisplayName("POST /api/auth/login should authenticate user successfully")
    void testLoginSuccess() throws Exception {
        // Arrange
        userRepository.save(testUser);
        String loginJson = objectMapper.writeValueAsString(loginRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/auth/login should fail with invalid credentials")
    void testLoginInvalidCredentials() throws Exception {
        // Arrange
        userRepository.save(testUser);
        loginRequest.setPassword("wrongpassword");
        String loginJson = objectMapper.writeValueAsString(loginRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login should fail with non-existent email")
    void testLoginUserNotFound() throws Exception {
        // Arrange
        loginRequest.setEmail("nonexistent@example.com");
        String loginJson = objectMapper.writeValueAsString(loginRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login should validate email format")
    void testLoginValidationEmail() throws Exception {
        // Arrange
        loginRequest.setEmail("invalid-email");
        String loginJson = objectMapper.writeValueAsString(loginRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register should register user successfully")
    void testRegisterSuccess() throws Exception {
        // Arrange
        String registrationJson = objectMapper.writeValueAsString(registrationRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty());

        // Verify user was saved to database
        assertThat(userRepository.findByEmail(registrationRequest.getEmail())).isNotNull();
    }

    @Test
    @DisplayName("POST /api/auth/register should fail when email already exists")
    void testRegisterEmailAlreadyExists() throws Exception {
        // Arrange
        userRepository.save(testUser);
        registrationRequest.setEmail("test@example.com"); // Same as testUser
        String registrationJson = objectMapper.writeValueAsString(registrationRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/auth/register should validate required fields")
    void testRegisterValidation() throws Exception {
        // Arrange - missing name field
        registrationRequest.setName("");
        String registrationJson = objectMapper.writeValueAsString(registrationRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register should validate password length")
    void testRegisterPasswordValidation() throws Exception {
        // Arrange - password too short
        registrationRequest.setPassword("short");
        String registrationJson = objectMapper.writeValueAsString(registrationRequest);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/refresh-token should refresh access token")
    void testRefreshToken() throws Exception {
        // This would require a valid refresh token from previous login
        // Implementation depends on having a valid token
        // For now, this test shows the structure
    }
}
