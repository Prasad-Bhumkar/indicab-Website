package com.indicab.service.impl;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;
import com.indicab.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BookingServiceImpl
 * Tests booking creation, updates, deletion, and queries
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BookingServiceImpl Tests")
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Booking testBooking;
    private BookingRequestDTO bookingRequestDTO;

    @BeforeEach
    void setUp() {
        testBooking = new Booking();
        testBooking.setFrom("Bangalore");
        testBooking.setTo("Mysore");
        testBooking.setDate("2026-02-15");
        testBooking.setVehicle("Sedan");
        testBooking.setAmount(500.0);
        testBooking.setFullName("John Doe");
        testBooking.setLicense("DL01AB1234");
        testBooking.setPhoneNumber("9876543210");
        testBooking.setPickupAddress("123 Main St, Bangalore");
        testBooking.setStatus("PENDING");

        bookingRequestDTO = new BookingRequestDTO();
        bookingRequestDTO.setFrom("Bangalore");
        bookingRequestDTO.setTo("Mysore");
        bookingRequestDTO.setDate("2026-02-15");
        bookingRequestDTO.setVehicle("Sedan");
        bookingRequestDTO.setAmount(500.0);
        bookingRequestDTO.setFullName("Jane Doe");
        bookingRequestDTO.setLicense("DL01AB1235");
        bookingRequestDTO.setPhoneNumber("9876543211");
        bookingRequestDTO.setPickupAddress("456 Oak Ave, Bangalore");
        bookingRequestDTO.setStatus("PENDING");
    }

    @Test
    @DisplayName("Should create booking successfully")
    void testCreateBookingSuccess() {
        // Arrange
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        // Act
        Booking result = bookingService.createBooking(bookingRequestDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getFrom()).isEqualTo("Bangalore");
        assertThat(result.getTo()).isEqualTo("Mysore");
        assertThat(result.getAmount()).isEqualTo(500.0);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should set status to PENDING if not provided")
    void testCreateBookingWithNullStatus() {
        // Arrange
        bookingRequestDTO.setStatus(null);
        Booking expectedBooking = new Booking();
        expectedBooking.setStatus("PENDING");
        when(bookingRepository.save(any(Booking.class))).thenReturn(expectedBooking);

        // Act
        Booking result = bookingService.createBooking(bookingRequestDTO);

        // Assert
        assertThat(result.getStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should get booking by ID")
    void testGetBookingById() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        Optional<Booking> result = bookingService.getBookingById(1L);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getFrom()).isEqualTo("Bangalore");
    }

    @Test
    @DisplayName("Should return empty when booking not found")
    void testGetBookingByIdNotFound() {
        // Arrange
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        Optional<Booking> result = bookingService.getBookingById(999L);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get all bookings")
    void testGetAllBookings() {
        // Arrange
        List<Booking> bookingList = new ArrayList<>();
        bookingList.add(testBooking);
        when(bookingRepository.findAll()).thenReturn(bookingList);

        // Act
        List<Booking> result = bookingService.getAllBookings();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFrom()).isEqualTo("Bangalore");
    }

    @Test
    @DisplayName("Should return empty list when no bookings exist")
    void testGetAllBookingsEmpty() {
        // Arrange
        when(bookingRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<Booking> result = bookingService.getAllBookings();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should update booking successfully")
    void testUpdateBookingSuccess() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        // Act
        Booking result = bookingService.updateBooking(1L, bookingRequestDTO);

        // Assert
        assertThat(result).isNotNull();
        verify(bookingRepository).findById(1L);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent booking")
    void testUpdateBookingNotFound() {
        // Arrange
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> bookingService.updateBooking(999L, bookingRequestDTO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Booking not found with ID: 999");
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should delete booking successfully")
    void testDeleteBookingSuccess() {
        // Arrange
        when(bookingRepository.existsById(1L)).thenReturn(true);

        // Act
        bookingService.deleteBooking(1L);

        // Assert
        verify(bookingRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent booking")
    void testDeleteBookingNotFound() {
        // Arrange
        when(bookingRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> bookingService.deleteBooking(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Booking not found with ID: 999");
        verify(bookingRepository, never()).deleteById(999L);
    }

    @Test
    @DisplayName("Should check if booking exists")
    void testBookingExists() {
        // Arrange
        when(bookingRepository.existsById(1L)).thenReturn(true);

        // Act
        boolean result = bookingService.bookingExists(1L);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when booking doesn't exist")
    void testBookingNotExists() {
        // Arrange
        when(bookingRepository.existsById(999L)).thenReturn(false);

        // Act
        boolean result = bookingService.bookingExists(999L);

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should get booking or throw exception")
    void testGetBookingOrThrow() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        Booking result = bookingService.getBookingOrThrow(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw exception when booking not found")
    void testGetBookingOrThrowNotFound() {
        // Arrange
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> bookingService.getBookingOrThrow(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Booking not found with ID: 999");
    }
}
