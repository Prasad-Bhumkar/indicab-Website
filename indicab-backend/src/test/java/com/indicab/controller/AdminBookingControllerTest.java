package com.indicab.controller;

import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.repository.BookingRepository;
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

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AdminBookingController
 * Tests admin booking endpoints with search, sort, and pagination
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:mysql://localhost:3306/indicab_website_test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("AdminBookingController Tests")
class AdminBookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createTestUser(String email, String name) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword("password123");
        user.setRole("USER");
        return userRepository.save(user);
    }

    private Booking createTestBooking(User user, String status, String pickup, String dropoff) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setStatus(status);
        booking.setPickupAddress(pickup);
        booking.setDropoffAddress(dropoff);
        booking.setFullName("Test User");
        booking.setEmail("test@example.com");
        booking.setPhoneNumber("1234567890");
        booking.setFrom("from location");
        booking.setTo("to location");
        booking.setDate("2025-03-02");
        booking.setVehicle("Standard");
        booking.setAmount(50.0);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings - Get all bookings without filters")
    @WithMockUser(roles = "ADMIN")
    void testGetAllBookingsNoFilters() throws Exception {
        // Arrange
        User user1 = createTestUser("user1@test.com", "User One");
        createTestBooking(user1, "PENDING", "Location A", "Location B");
        createTestBooking(user1, "CONFIRMED", "Location C", "Location D");
        
        User user2 = createTestUser("user2@test.com", "User Two");
        createTestBooking(user2, "COMPLETED", "Location E", "Location F");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings - Filter by status")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingsFilterByStatus() throws Exception {
        // Arrange
        User user = createTestUser("user@test.com", "Test User");
        createTestBooking(user, "PENDING", "Location A", "Location B");
        createTestBooking(user, "PENDING", "Location C", "Location D");
        createTestBooking(user, "CONFIRMED", "Location E", "Location F");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("status", "PENDING")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings - Search by location")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingsSearchByLocation() throws Exception {
        // Arrange
        User user = createTestUser("user@test.com", "Test User");
        createTestBooking(user, "PENDING", "Bangalore", "Mysore");
        createTestBooking(user, "PENDING", "Delhi", "Noida");
        createTestBooking(user, "CONFIRMED", "Bangalore", "Chennai");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("search", "Bangalore")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings - Filter by user ID")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingsFilterByUserId() throws Exception {
        // Arrange
        User user1 = createTestUser("user1@test.com", "User One");
        User user2 = createTestUser("user2@test.com", "User Two");
        
        createTestBooking(user1, "PENDING", "Location A", "Location B");
        createTestBooking(user1, "CONFIRMED", "Location C", "Location D");
        createTestBooking(user2, "PENDING", "Location E", "Location F");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("userId", user1.getId().toString())
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings - Pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingsPagination() throws Exception {
        // Arrange
        User user = createTestUser("user@test.com", "Test User");
        for (int i = 0; i < 25; i++) {
            createTestBooking(user, "PENDING", "Location " + i, "Destination " + i);
        }

        // Act & Assert - First page
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(10))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3));

        // Act & Assert - Second page
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("page", "1")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(10));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings - Combined search, filter, and pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingsCombined() throws Exception {
        // Arrange
        User user1 = createTestUser("user1@test.com", "User One");
        User user2 = createTestUser("user2@test.com", "User Two");
        
        createTestBooking(user1, "PENDING", "Bangalore", "Mysore");
        createTestBooking(user1, "PENDING", "Bangalore", "Chennai");
        createTestBooking(user2, "CONFIRMED", "Bangalore", "Pune");
        createTestBooking(user2, "PENDING", "Delhi", "Noida");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("search", "Bangalore")
                .param("status", "PENDING")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings/{id} - Get booking by ID")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingById() throws Exception {
        // Arrange
        User user = createTestUser("user@test.com", "Test User");
        Booking booking = createTestBooking(user, "PENDING", "Location A", "Location B");

        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings/" + booking.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(booking.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings/{id} - Booking not found")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingByIdNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role")
    @WithMockUser(roles = "USER")
    void testGetBookingsUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token")
    void testGetBookingsUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/admin/bookings")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
