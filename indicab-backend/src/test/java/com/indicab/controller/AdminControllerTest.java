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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AdminController
 * Tests admin endpoints with search, sort, and pagination
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:mysql://localhost:3306/indicab_website_test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("AdminController Tests")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private User createTestUser(String email, String name, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword("password123");
        user.setRole(role);
        user.setPhone("9876543210");
        user.setAddress("Test Address");
        return userRepository.save(user);
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Get all users without filters")
    @WithMockUser(roles = "ADMIN")
    void testGetAllUsersNoFilters() throws Exception {
        // Arrange
        createTestUser("user1@test.com", "User One", "USER");
        createTestUser("user2@test.com", "User Two", "DRIVER");
        createTestUser("user3@test.com", "User Three", "USER");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.size").value(10));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Search by email")
    @WithMockUser(roles = "ADMIN")
    void testGetUsersSearchByEmail() throws Exception {
        // Arrange
        createTestUser("john@test.com", "John Doe", "USER");
        createTestUser("jane@test.com", "Jane Doe", "USER");
        createTestUser("admin@test.com", "Admin User", "ADMIN");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("search", "john")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Filter by role")
    @WithMockUser(roles = "ADMIN")
    void testGetUsersFilterByRole() throws Exception {
        // Arrange
        createTestUser("user1@test.com", "User One", "USER");
        createTestUser("driver1@test.com", "Driver One", "DRIVER");
        createTestUser("driver2@test.com", "Driver Two", "DRIVER");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("role", "DRIVER")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetUsersPagination() throws Exception {
        // Arrange
        for (int i = 0; i < 25; i++) {
            createTestUser("user" + i + "@test.com", "User " + i, "USER");
        }

        // Act & Assert - First page
        mockMvc.perform(get("/api/v1/admin/users")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3));

        // Act & Assert - Second page
        mockMvc.perform(get("/api/v1/admin/users")
                .param("page", "1")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.number").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Sorting by email descending")
    @WithMockUser(roles = "ADMIN")
    void testGetUsersSorting() throws Exception {
        // Arrange
        createTestUser("aaa@test.com", "User A", "USER");
        createTestUser("zzz@test.com", "User Z", "USER");
        createTestUser("mmm@test.com", "User M", "USER");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("page", "0")
                .param("size", "10")
                .param("sort", "email,desc")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("zzz@test.com"))
                .andExpect(jsonPath("$.content[2].email").value("aaa@test.com"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Combined search and filter")
    @WithMockUser(roles = "ADMIN")
    void testGetUsersSearchAndFilter() throws Exception {
        // Arrange
        createTestUser("john.driver@test.com", "John Doe", "DRIVER");
        createTestUser("john.user@test.com", "John Smith", "USER");
        createTestUser("jane.driver@test.com", "Jane Doe", "DRIVER");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("search", "john")
                .param("role", "DRIVER")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].name").value("John Doe"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/user/{id} - Get user by ID")
    @WithMockUser(roles = "ADMIN")
    void testGetUserById() throws Exception {
        // Arrange
        User user = createTestUser("test@test.com", "Test User", "USER");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/user/" + user.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value("test@test.com"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/user/{id} - User not found")
    @WithMockUser(roles = "ADMIN")
    void testGetUserByIdNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/user/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/user/{id} - Delete user")
    @WithMockUser(roles = "ADMIN")
    void testDeleteUser() throws Exception {
        // Arrange
        User user = createTestUser("test@test.com", "Test User", "USER");

        // Act
        mockMvc.perform(delete("/api/v1/admin/user/" + user.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Assert
        assertThat(userRepository.existsById(user.getId())).isFalse();
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role")
    @WithMockUser(roles = "USER")
    void testGetUsersUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token")
    void testGetUsersUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/users")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
