package com.indicab.mapper;

import com.indicab.dto.BookingPublicDTO;
import com.indicab.dto.BookingResponseDTO;
import com.indicab.entity.Booking;

/**
 * Mapper utility for converting between Booking entity and DTOs
 */
public class BookingMapper {

    private BookingMapper() {
        // Private constructor to prevent instantiation
    }

    /**
     * Convert Booking entity to BookingResponseDTO
     */
    public static BookingResponseDTO toDto(Booking booking) {
        if (booking == null) {
            return null;
        }
        return new BookingResponseDTO(
            booking.getId(),
            booking.getFrom(),
            booking.getTo(),
            booking.getDate(),
            booking.getVehicle(),
            booking.getAmount(),
            booking.getFullName(),
            booking.getLicense(),
            booking.getPhoneNumber(),
            booking.getPickupAddress(),
            booking.getUser() != null ? booking.getUser().getId() : null,
            booking.getStatus()
        );
    }

    /**
     * Convert Booking entity to BookingPublicDTO (guest-safe view with no personal data)
     */
    public static BookingPublicDTO toPublicDto(Booking booking) {
        if (booking == null) {
            return null;
        }
        return new BookingPublicDTO(
            booking.getId(),
            booking.getFrom(),
            booking.getTo(),
            booking.getDate(),
            booking.getAmount(),
            booking.getVehicle(),
            booking.getStatus(),
            booking.getCreatedAt()
        );
    }
}
