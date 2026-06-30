package com.indicab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.repository.BookingRepository;
import com.indicab.repository.RefreshTokenRepository;
import com.indicab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for BookingController
 * Tests HTTP endpoints with MockMvc
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "test@example.com", roles = "USER")
@DisplayName("BookingController Integration Tests")
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private BookingRequestDTO bookingRequestDTO;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        bookingRepository.deleteAll();
        userRepository.deleteAll();

        User testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setPhone("9876543210");
        testUser.setRole("USER");
        userRepository.save(testUser);

        bookingRequestDTO = new BookingRequestDTO();
        bookingRequestDTO.setFrom("Bangalore");
        bookingRequestDTO.setTo("Mysore");
        bookingRequestDTO.setDate("2026-02-15");
        bookingRequestDTO.setVehicle("Sedan");
        bookingRequestDTO.setAmount(500.0);
        bookingRequestDTO.setFullName("Test User");
        bookingRequestDTO.setEmail("test@example.com");
        bookingRequestDTO.setLicense("DL01AB1234");
        bookingRequestDTO.setPhoneNumber("9876543210");
        bookingRequestDTO.setPickupAddress("123 Main St");
        bookingRequestDTO.setDropoffAddress("456 End Ave");
        bookingRequestDTO.setPassengerCount(1);
        bookingRequestDTO.setContactPreference("call");
        bookingRequestDTO.setStatus("PENDING");

        testBooking = new Booking(
            "Bangalore", "Mysore", "2026-02-15", "Sedan", 500.0,
            "Test User", "test@example.com", "9876543210", "DL01AB1234",
            "123 Main St", "456 End Ave", 1, null, "call", "PENDING"
        );
    }

    @Test
    @DisplayName("GET /api/v1/bookings should return all bookings")
    void testGetAllBookings() throws Exception {
        // Arrange
        bookingRepository.save(testBooking);

        // Act & Assert
        mockMvc.perform(get("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/bookings/{id} should return booking by ID")
    void testGetBookingById() throws Exception {
        // Arrange
        Booking savedBooking = bookingRepository.save(testBooking);

        // Act & Assert
        mockMvc.perform(get("/api/v1/bookings/" + savedBooking.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedBooking.getId()))
                .andExpect(jsonPath("$.from").value("Bangalore"));
    }

    @Test
    @DisplayName("GET /api/v1/bookings/{id} should return 404 for non-existent booking")
    void testGetBookingByIdNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/bookings/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/v1/bookings should create new booking")
    void testCreateBooking() throws Exception {
        // Arrange
        String bookingJson = objectMapper.writeValueAsString(bookingRequestDTO);

        // Act & Assert
        mockMvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.from").value("Bangalore"))
                .andExpect(jsonPath("$.to").value("Mysore"))
                .andExpect(jsonPath("$.amount").value(500.0))
                .andReturn();

        // Verify booking was saved to database
        assertThat(bookingRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("POST /api/v1/bookings should validate required fields")
    void testCreateBookingValidation() throws Exception {
        // Arrange - missing required field "from"
        BookingRequestDTO invalidDTO = new BookingRequestDTO();
        invalidDTO.setTo("Mysore");
        invalidDTO.setAmount(500.0);
        String bookingJson = objectMapper.writeValueAsString(invalidDTO);

        // Act & Assert
        mockMvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/bookings/{id} should update booking")
    void testUpdateBooking() throws Exception {
        // Arrange
        Booking savedBooking = bookingRepository.save(testBooking);
        bookingRequestDTO.setFrom("Hyderabad");
        bookingRequestDTO.setAmount(600.0);
        String bookingJson = objectMapper.writeValueAsString(bookingRequestDTO);

        // Act & Assert
        mockMvc.perform(put("/api/v1/bookings/" + savedBooking.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from").value("Hyderabad"))
                .andExpect(jsonPath("$.amount").value(600.0));
    }

    @Test
    @DisplayName("PUT /api/v1/bookings/{id} should return 404 for non-existent booking")
    void testUpdateBookingNotFound() throws Exception {
        // Arrange
        String bookingJson = objectMapper.writeValueAsString(bookingRequestDTO);

        // Act & Assert
        mockMvc.perform(put("/api/v1/bookings/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/v1/bookings/{id} should delete booking")
    void testDeleteBooking() throws Exception {
        // Arrange
        Booking savedBooking = bookingRepository.save(testBooking);
        assertThat(bookingRepository.count()).isEqualTo(1);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/bookings/" + savedBooking.getId()))
                .andExpect(status().isNoContent());

        // Verify booking was deleted
        assertThat(bookingRepository.count()).isEqualTo(0);
    }

    @Test
    @DisplayName("DELETE /api/v1/bookings/{id} should return 404 for non-existent booking")
    void testDeleteBookingNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/bookings/999"))
                .andExpect(status().isNotFound());
    }
}
