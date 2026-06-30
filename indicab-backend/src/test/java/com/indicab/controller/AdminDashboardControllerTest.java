package com.indicab.controller;

import com.indicab.entity.AuditLog;
import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.repository.AuditLogRepository;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AdminDashboardController
 * Tests dashboard overview, user/booking/audit listings, and system health
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AdminDashboardController Tests")
class AdminDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        userRepository.deleteAll();
        auditLogRepository.deleteAll();
    }

    private User createTestUser(String email, String name, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword("password123");
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private Booking createTestBooking(User user, String status) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setStatus(status);
        booking.setPickupAddress("Location A");
        booking.setDropoffAddress("Location B");
        booking.setFullName("Test User");
        booking.setEmail("test@example.com");
        booking.setPhoneNumber("1234567890");
        booking.setFrom("from location");
        booking.setTo("to location");
        booking.setDate("2025-03-02");
        booking.setVehicle("Standard");
        booking.setAmount(50.0);
        booking.setPassengerCount(1);
        booking.setContactPreference("call");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    private AuditLog createAuditLog(String status) {
        AuditLog log = new AuditLog();
        log.setUserId(1L);
        log.setOperation("CREATE");
        log.setResourceType("User");
        log.setStatus(status);
        log.setIpAddress("192.168.1.1");
        log.setCreatedAt(LocalDateTime.now());
        return auditLogRepository.save(log);
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/overview - Get dashboard overview")
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardOverview() throws Exception {
        User driver = createTestUser("driver@test.com", "Driver One", "DRIVER");
        User rider = createTestUser("rider@test.com", "Rider One", "USER");
        createTestBooking(rider, "PENDING");
        createTestBooking(driver, "CONFIRMED");
        createAuditLog("SUCCESS");
        createAuditLog("FAILED");

        mockMvc.perform(get("/api/v1/admin/dashboard/overview")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.total").value(2))
                .andExpect(jsonPath("$.users.drivers").value(1))
                .andExpect(jsonPath("$.users.riders").value(1))
                .andExpect(jsonPath("$.bookings.total").value(2))
                .andExpect(jsonPath("$.audit.totalLogs").value(2))
                .andExpect(jsonPath("$.audit.failedOperations").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/users - Get users with pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardUsers() throws Exception {
        for (int i = 0; i < 3; i++) {
            createTestUser("user" + i + "@test.com", "User " + i, "USER");
        }

        mockMvc.perform(get("/api/v1/admin/dashboard/users")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/bookings - Get bookings with pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardBookings() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "USER");
        createTestBooking(user, "PENDING");
        createTestBooking(user, "CONFIRMED");

        mockMvc.perform(get("/api/v1/admin/dashboard/bookings")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/audit-logs - Get audit logs with pagination")
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardAuditLogs() throws Exception {
        createAuditLog("SUCCESS");
        createAuditLog("FAILED");

        mockMvc.perform(get("/api/v1/admin/dashboard/audit-logs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/health - Get system health")
    @WithMockUser(roles = "ADMIN")
    void testGetSystemHealth() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/health")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("CONNECTED"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/bookings - Filter by status")
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardBookingsFilteredByStatus() throws Exception {
        User user = createTestUser("user@test.com", "Test User", "USER");
        createTestBooking(user, "PENDING");
        createTestBooking(user, "PENDING");
        createTestBooking(user, "CONFIRMED");

        mockMvc.perform(get("/api/v1/admin/dashboard/bookings")
                .param("page", "0")
                .param("size", "10")
                .param("status", "PENDING")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("Unauthorized - Missing ADMIN role on dashboard endpoints")
    @WithMockUser(roles = "USER")
    void testGetDashboardOverviewUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/overview")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated - No token on dashboard endpoints")
    void testGetDashboardOverviewUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/overview")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
