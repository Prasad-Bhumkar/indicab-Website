package com.indicab.service;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for booking-related operations
 */
public interface BookingService {

    /**
     * Create a new booking.
     * @param bookingDTO booking data
     * @param currentUserId ID of the authenticated user making the booking, or null for guest
     */
    Booking createBooking(BookingRequestDTO bookingDTO, Long currentUserId);

    /**
     * Get booking by ID
     */
    Optional<Booking> getBookingById(Long id);

    /**
     * Get all bookings
     */
    List<Booking> getAllBookings();

    /**
     * Get all bookings with pagination
     */
    Page<Booking> getAllBookingsPaged(Pageable pageable);

    /**
     * Update existing booking
     */
    Booking updateBooking(Long id, BookingRequestDTO bookingDTO);

    /**
     * Delete booking
     */
    void deleteBooking(Long id);

    /**
     * Check if booking exists
     */
    boolean bookingExists(Long id);

    /**
     * Get booking or throw exception
     */
    Booking getBookingOrThrow(Long id);

    /**
     * Get all bookings for a specific user with pagination
     */
    Page<Booking> getBookingsByUserId(Long userId, Pageable pageable);

    /**
     * Get all bookings for a specific user
     */
    List<Booking> getBookingsByUserId(Long userId);

    /**
     * Delete multiple bookings
     */
    void bulkDeleteBookings(List<Long> ids);

    /**
     * Update status of multiple bookings
     */
    void bulkUpdateBookingsStatus(List<Long> ids, String status);
}
