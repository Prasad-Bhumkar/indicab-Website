package com.indicab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;
import com.indicab.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for BookingController
 * Tests HTTP endpoints with MockMvc
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:mysql://localhost:3306/indicab_website_test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@DisplayName("BookingController Integration Tests")
class BookingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    private BookingRequestDTO bookingRequestDTO;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();

        bookingRequestDTO = new BookingRequestDTO();
        bookingRequestDTO.setFrom("Bangalore");
        bookingRequestDTO.setTo("Mysore");
        bookingRequestDTO.setDate("2026-02-15");
        bookingRequestDTO.setVehicle("Sedan");
        bookingRequestDTO.setAmount(500.0);
        bookingRequestDTO.setFullName("Test User");
        bookingRequestDTO.setLicense("DL01AB1234");
        bookingRequestDTO.setPaymentMethod("Card");
        bookingRequestDTO.setPhoneNumber("9876543210");
        bookingRequestDTO.setPickupAddress("123 Main St");
        bookingRequestDTO.setStatus("PENDING");

        testBooking = new Booking(
            "Bangalore", "Mysore", "2026-02-15", "Sedan", 500.0,
            "Test User", "DL01AB1234", "Card", "9876543210",
            "123 Main St", "PENDING"
        );
    }

    @Test
    @DisplayName("GET /api/bookings should return all bookings")
    void testGetAllBookings() throws Exception {
        // Arrange
        bookingRepository.save(testBooking);

        // Act & Assert
        mockMvc.perform(get("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/bookings/{id} should return booking by ID")
    void testGetBookingById() throws Exception {
        // Arrange
        Booking savedBooking = bookingRepository.save(testBooking);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/" + savedBooking.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedBooking.getId()))
                .andExpect(jsonPath("$.from").value("Bangalore"));
    }

    @Test
    @DisplayName("GET /api/bookings/{id} should return 404 for non-existent booking")
    void testGetBookingByIdNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/bookings/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/bookings should create new booking")
    void testCreateBooking() throws Exception {
        // Arrange
        String bookingJson = objectMapper.writeValueAsString(bookingRequestDTO);

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
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
    @DisplayName("POST /api/bookings should validate required fields")
    void testCreateBookingValidation() throws Exception {
        // Arrange - missing required field "from"
        BookingRequestDTO invalidDTO = new BookingRequestDTO();
        invalidDTO.setTo("Mysore");
        invalidDTO.setAmount(500.0);
        String bookingJson = objectMapper.writeValueAsString(invalidDTO);

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/bookings/{id} should update booking")
    void testUpdateBooking() throws Exception {
        // Arrange
        Booking savedBooking = bookingRepository.save(testBooking);
        bookingRequestDTO.setFrom("Hyderabad");
        bookingRequestDTO.setAmount(600.0);
        String bookingJson = objectMapper.writeValueAsString(bookingRequestDTO);

        // Act & Assert
        mockMvc.perform(put("/api/bookings/" + savedBooking.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from").value("Hyderabad"))
                .andExpect(jsonPath("$.amount").value(600.0));
    }

    @Test
    @DisplayName("PUT /api/bookings/{id} should return 404 for non-existent booking")
    void testUpdateBookingNotFound() throws Exception {
        // Arrange
        String bookingJson = objectMapper.writeValueAsString(bookingRequestDTO);

        // Act & Assert
        mockMvc.perform(put("/api/bookings/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/bookings/{id} should delete booking")
    void testDeleteBooking() throws Exception {
        // Arrange
        Booking savedBooking = bookingRepository.save(testBooking);
        assertThat(bookingRepository.count()).isEqualTo(1);

        // Act & Assert
        mockMvc.perform(delete("/api/bookings/" + savedBooking.getId()))
                .andExpect(status().isNoContent());

        // Verify booking was deleted
        assertThat(bookingRepository.count()).isEqualTo(0);
    }

    @Test
    @DisplayName("DELETE /api/bookings/{id} should return 404 for non-existent booking")
    void testDeleteBookingNotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/bookings/999"))
                .andExpect(status().isNotFound());
    }
}
