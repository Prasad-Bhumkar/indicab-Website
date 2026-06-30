package com.indicab.mapper;

import com.indicab.dto.BookingPublicDTO;
import com.indicab.dto.BookingResponseDTO;
import com.indicab.entity.Booking;
import com.indicab.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class BookingMapperTest {

    private Booking createFullBooking(Long id, User user) {
        Booking booking = new Booking(
            "New York", "Boston", "2026-07-15", "Sedan", 250.0,
            "John Traveler", "john@example.com", "+1234567890",
            "LIC-12345", "123 Pickup St", "456 Dropoff Ave",
            2, "Window seat preferred", "email", "CONFIRMED"
        );
        booking.setId(id);
        booking.setUser(user);
        booking.setCreatedAt(LocalDateTime.of(2026, 6, 28, 10, 0, 0));
        return booking;
    }

    private User createUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setName("Test User");
        user.setEmail("test@example.com");
        return user;
    }

    // --- toDto (BookingResponseDTO) ---

    @Test
    @DisplayName("Should map all fields from Booking entity to BookingResponseDTO with user")
    void toDto_shouldMapAllFieldsWithUser() {
        User user = createUser(99L);
        Booking booking = createFullBooking(1L, user);

        BookingResponseDTO dto = BookingMapper.toDto(booking);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("New York", dto.getFrom());
        assertEquals("Boston", dto.getTo());
        assertEquals("2026-07-15", dto.getDate());
        assertEquals("Sedan", dto.getVehicle());
        assertEquals(250.0, dto.getAmount());
        assertEquals("John Traveler", dto.getFullName());
        assertEquals("LIC-12345", dto.getLicense());
        assertEquals("+1234567890", dto.getPhoneNumber());
        assertEquals("123 Pickup St", dto.getPickupAddress());
        assertEquals(99L, dto.getUserId());
        assertEquals("CONFIRMED", dto.getStatus());
    }

    @Test
    @DisplayName("Should set userId to null when Booking has no associated User")
    void toDto_shouldSetUserIdNullForGuestBooking() {
        Booking booking = createFullBooking(2L, null);

        BookingResponseDTO dto = BookingMapper.toDto(booking);

        assertNotNull(dto);
        assertEquals(2L, dto.getId());
        assertNull(dto.getUserId());
    }

    @Test
    @DisplayName("Should return null when Booking entity is null")
    void toDto_shouldReturnNullForNullBooking() {
        assertNull(BookingMapper.toDto(null));
    }

    @Test
    @DisplayName("Should handle Booking with minimal fields set")
    void toDto_shouldHandleMinimalBooking() {
        Booking booking = new Booking();
        booking.setId(3L);
        booking.setFrom("A");
        booking.setTo("B");
        booking.setDate("2026-08-01");
        booking.setVehicle("Bike");
        booking.setAmount(50.0);
        booking.setFullName("Minimal Rider");
        booking.setLicense(null);
        booking.setPhoneNumber("+0000000000");
        booking.setPickupAddress("Point A");
        booking.setStatus("PENDING");

        BookingResponseDTO dto = BookingMapper.toDto(booking);

        assertNotNull(dto);
        assertEquals(3L, dto.getId());
        assertEquals("A", dto.getFrom());
        assertEquals("B", dto.getTo());
        assertNull(dto.getUserId());
        assertEquals("PENDING", dto.getStatus());
    }

    // --- toPublicDto (BookingPublicDTO) ---

    @Test
    @DisplayName("Should map all fields from Booking entity to BookingPublicDTO")
    void toPublicDto_shouldMapAllFields() {
        User user = createUser(99L);
        Booking booking = createFullBooking(10L, user);

        BookingPublicDTO dto = BookingMapper.toPublicDto(booking);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("New York", dto.getFrom());
        assertEquals("Boston", dto.getTo());
        assertEquals("2026-07-15", dto.getDate());
        assertEquals(250.0, dto.getAmount());
        assertEquals("Sedan", dto.getVehicle());
        assertEquals("CONFIRMED", dto.getStatus());
        assertEquals(LocalDateTime.of(2026, 6, 28, 10, 0, 0), dto.getCreatedAt());
    }

    @Test
    @DisplayName("BookingPublicDTO should not expose personal information (no fullName, license, phone, userId)")
    void toPublicDto_shouldNotExposePersonalInfo() {
        User user = createUser(99L);
        Booking booking = createFullBooking(11L, user);

        BookingPublicDTO dto = BookingMapper.toPublicDto(booking);

        // Public DTO only exposes id, from, to, date, amount, vehicle, status, createdAt
        // Personal fields like fullName, license, phoneNumber, userId are structurally absent
        assertNotNull(dto);
        assertEquals(11L, dto.getId());
        assertEquals("New York", dto.getFrom());
        assertEquals("Boston", dto.getTo());
        assertEquals("2026-07-15", dto.getDate());
        assertEquals(250.0, dto.getAmount());
        assertEquals("Sedan", dto.getVehicle());
        assertEquals("CONFIRMED", dto.getStatus());
        assertEquals(LocalDateTime.of(2026, 6, 28, 10, 0, 0), dto.getCreatedAt());
        // Confirm: BookingPublicDTO has no getFullName(), getLicense(), getPhoneNumber(), getUserId() methods
    }

    @Test
    @DisplayName("Should return null when Booking entity is null for public DTO")
    void toPublicDto_shouldReturnNullForNullBooking() {
        assertNull(BookingMapper.toPublicDto(null));
    }

    @Test
    @DisplayName("Should handle guest booking in public DTO")
    void toPublicDto_shouldHandleGuestBooking() {
        Booking booking = new Booking();
        booking.setId(12L);
        booking.setFrom("City A");
        booking.setTo("City B");
        booking.setDate("2026-09-01");
        booking.setVehicle("SUV");
        booking.setAmount(300.0);
        booking.setStatus("COMPLETED");
        booking.setCreatedAt(LocalDateTime.of(2026, 6, 1, 8, 0, 0));

        BookingPublicDTO dto = BookingMapper.toPublicDto(booking);

        assertNotNull(dto);
        assertEquals(12L, dto.getId());
        assertEquals("City A", dto.getFrom());
        assertEquals("City B", dto.getTo());
        assertEquals(300.0, dto.getAmount());
        assertEquals("COMPLETED", dto.getStatus());
    }

    @Test
    @DisplayName("Should handle null createdAt in public DTO")
    void toPublicDto_shouldHandleNullCreatedAt() {
        Booking booking = new Booking();
        booking.setId(13L);
        booking.setFrom("X");
        booking.setTo("Y");
        booking.setDate("2026-10-10");
        booking.setVehicle("Van");
        booking.setAmount(150.0);
        booking.setStatus("CANCELLED");

        BookingPublicDTO dto = BookingMapper.toPublicDto(booking);

        assertNotNull(dto);
        assertNull(dto.getCreatedAt());
    }
}
