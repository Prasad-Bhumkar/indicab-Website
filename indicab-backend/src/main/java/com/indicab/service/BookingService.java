package com.indicab.service;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for booking-related operations
 */
public interface BookingService {
    
    /**
     * Create a new booking
     */
    Booking createBooking(BookingRequestDTO bookingDTO);
    
    /**
     * Get booking by ID
     */
    Optional<Booking> getBookingById(Long id);
    
    /**
     * Get all bookings
     */
    List<Booking> getAllBookings();
    
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
}
