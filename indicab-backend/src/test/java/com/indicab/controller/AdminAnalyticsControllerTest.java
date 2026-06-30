package com.indicab.controller;

import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.entity.Vehicle;
import com.indicab.repository.BookingRepository;
import com.indicab.repository.UserRepository;
import com.indicab.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AdminAnalyticsController
 * Tests analytics and reporting endpoints
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AdminAnalyticsController Tests")
class AdminAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        userRepository.deleteAll();
        vehicleRepository.deleteAll();
    }

    private User createTestUser(String email, String name) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword("password123");
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private Booking createTestBooking(User user, String status, String from, String to, Double amount) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setStatus(status);
        booking.setFrom(from);
        booking.setTo(to);
        booking.setPickupAddress(from);
        booking.setDropoffAddress(to);
        booking.setFullName("Test User");
        booking.setEmail("test@example.com");
        booking.setPhoneNumber("1234567890");
        booking.setDate("2025-03-02");
        booking.setVehicle("Standard");
        booking.setAmount(amount);
        booking.setPassengerCount(1);
        booking.setContactPreference("call");
        booking.setCreatedAt(LocalDateTime.now().minusDays(1));
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    private Vehicle createTestVehicle(String name, String type, Boolean isActive) {
        Vehicle vehicle = new Vehicle();
        vehicle.setName(name);
        vehicle.setType(type);
        vehicle.setIsActive(isActive);
        vehicle.setSeatCapacity(4);
        vehicle.setPriceMultiplier(1.0);
        return vehicleRepository.save(vehicle);
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/daily-bookings - Get daily bookings")
    @WithMockUser(roles = "ADMIN")
    void testGetDailyBookings() throws Exception {
        User user = createTestUser("user@test.com", "Test User");
        createTestBooking(user, "completed", "A", "B", 100.0);
        createTestBooking(user, "pending", "C", "D", 50.0);

        mockMvc.perform(get("/api/v1/admin/analytics/daily-bookings")
                .param("days", "7")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isMap())
                .andExpect(jsonPath("$.total").isNumber())
                .andExpect(jsonPath("$.period").value("7 days"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/revenue-trend - Get revenue trend")
    @WithMockUser(roles = "ADMIN")
    void testGetRevenueTrend() throws Exception {
        User user = createTestUser("user@test.com", "Test User");
        createTestBooking(user, "completed", "A", "B", 100.0);
        createTestBooking(user, "completed", "C", "D", 50.0);

        mockMvc.perform(get("/api/v1/admin/analytics/revenue-trend")
                .param("days", "7")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isMap())
                .andExpect(jsonPath("$.totalRevenue").isNumber())
                .andExpect(jsonPath("$.period").value("7 days"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/driver-performance - Get driver performance")
    @WithMockUser(roles = "ADMIN")
    void testGetDriverPerformance() throws Exception {
        User driver = createTestUser("driver@test.com", "Driver One");
        createTestBooking(driver, "completed", "A", "B", 100.0);
        createTestBooking(driver, "completed", "C", "D", 75.0);

        mockMvc.perform(get("/api/v1/admin/analytics/driver-performance")
                .param("limit", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.drivers").isArray())
                .andExpect(jsonPath("$.totalDrivers").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/vehicle-distribution - Get vehicle distribution")
    @WithMockUser(roles = "ADMIN")
    void testGetVehicleDistribution() throws Exception {
        createTestVehicle("Sedan", "Sedan", true);
        createTestVehicle("SUV", "SUV", true);
        createTestVehicle("Hatchback", "Hatchback", false);

        mockMvc.perform(get("/api/v1/admin/analytics/vehicle-distribution")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distribution").isMap())
                .andExpect(jsonPath("$.totalVehicles").value(3))
                .andExpect(jsonPath("$.activeVehicles").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/stats - Get analytics summary")
    @WithMockUser(roles = "ADMIN")
    void testGetAnalyticsSummary() throws Exception {
        User user = createTestUser("user@test.com", "Test User");
        createTestBooking(user, "completed", "A", "B", 100.0);
        createTestBooking(user, "pending", "C", "D", 50.0);

        mockMvc.perform(get("/api/v1/admin/analytics/stats")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBookings").isNumber())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.totalRevenue").isString())
                .andExpect(jsonPath("$.bookingGrowth").isString());
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/booking-status-distribution - Get status distribution")
    @WithMockUser(roles = "ADMIN")
    void testGetBookingStatusDistribution() throws Exception {
        User user = createTestUser("user@test.com", "Test User");
        createTestBooking(user, "completed", "A", "B", 100.0);
        createTestBooking(user, "pending", "C", "D", 50.0);
        createTestBooking(user, "cancelled", "E", "F", 0.0);

        mockMvc.perform(get("/api/v1/admin/analytics/booking-status-distribution")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distribution").isMap())
                .andExpect(jsonPath("$.totalBookings").value(3));
    }

    @Test
    @DisplayName("GET /api/v1/admin/analytics/user-growth - Get user growth")
    @WithMockUser(roles = "ADMIN")
    void testGetUserGrowth() throws Exception {
        createTestUser("user1@test.com", "User One");
        createTestUser("user2@test.com", "User Two");

        mockMvc.perform(get("/api/v1/admin/analytics/user-growth")
                .param("days", "7")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isMap())
                .andExpect(jsonPath("$.totalUsers").value(2))
                .andExpect(jsonPath("$.period").value("7 days"));
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role on analytics endpoints")
    @WithMockUser(roles = "USER")
    void testGetDailyBookingsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/daily-bookings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token on analytics endpoints")
    void testGetDailyBookingsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/daily-bookings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
