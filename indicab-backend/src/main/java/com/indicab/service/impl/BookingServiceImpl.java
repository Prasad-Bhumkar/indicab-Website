package com.indicab.service.impl;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;
import com.indicab.repository.BookingRepository;
import com.indicab.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of BookingService
 * Handles booking creation, updates, deletion, and queries
 */
@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired(required = false)
    private EmailService emailService;

    @Override
    public Booking createBooking(BookingRequestDTO bookingDTO) {
        logger.info("Creating new booking from {} to {} for {}",
            bookingDTO.getFrom(), bookingDTO.getTo(), bookingDTO.getFullName());

        Booking booking = new Booking(
            bookingDTO.getFrom(),
            bookingDTO.getTo(),
            bookingDTO.getDate(),
            bookingDTO.getVehicle(),
            bookingDTO.getAmount(),
            bookingDTO.getFullName(),
            bookingDTO.getEmail(),
            bookingDTO.getPhoneNumber(),
            bookingDTO.getLicense(),
            bookingDTO.getPickupAddress(),
            bookingDTO.getDropoffAddress(),
            bookingDTO.getPassengerCount(),
            bookingDTO.getSpecialRequirements(),
            bookingDTO.getContactPreference(),
            bookingDTO.getStatus() != null ? bookingDTO.getStatus() : "PENDING"
        );

        Booking savedBooking = bookingRepository.save(booking);
        logger.info("Booking created successfully with ID: {} - Amount: ${}", savedBooking.getId(), savedBooking.getAmount());

        // Send notification email to admin
        if (emailService != null) {
            emailService.sendBookingNotificationToAdmin(savedBooking);
        }

        return savedBooking;
    }

    /**
     * Confirm a booking and send confirmation email to customer
     */
    public Booking confirmBooking(Long bookingId) {
        logger.info("Confirming booking with ID: {}", bookingId);
        Booking booking = getBookingOrThrow(bookingId);

        booking.setStatus("CONFIRMED");
        Booking confirmedBooking = bookingRepository.save(booking);

        // Send confirmation email to customer
        if (emailService != null) {
            emailService.sendConfirmationEmailToCustomer(confirmedBooking);
        }

        logger.info("Booking confirmed successfully with ID: {}", bookingId);
        return confirmedBooking;
    }

    /**
     * Cancel a booking and send cancellation email to customer
     */
    public Booking cancelBooking(Long bookingId, String cancellationReason) {
        logger.info("Cancelling booking with ID: {}", bookingId);
        Booking booking = getBookingOrThrow(bookingId);

        booking.setStatus("CANCELLED");
        Booking cancelledBooking = bookingRepository.save(booking);

        // Send cancellation email to customer
        if (emailService != null) {
            emailService.sendCancellationEmailToCustomer(cancelledBooking, cancellationReason);
        }

        logger.info("Booking cancelled successfully with ID: {}", bookingId);
        return cancelledBooking;
    }

    @Override
    public Optional<Booking> getBookingById(Long id) {
        logger.debug("Fetching booking with ID: {}", id);
        return bookingRepository.findById(id);
    }

    @Override
    public List<Booking> getAllBookings() {
        logger.debug("Fetching all bookings");
        List<Booking> bookings = bookingRepository.findAll();
        logger.debug("Found {} bookings", bookings.size());
        return bookings;
    }

    @Override
    public Page<Booking> getAllBookingsPaged(Pageable pageable) {
        logger.debug("Fetching bookings with pagination - Page: {}, Size: {}",
                   pageable.getPageNumber(), pageable.getPageSize());
        Page<Booking> bookingsPage = bookingRepository.findAll(pageable);
        logger.debug("Found {} bookings on page {} of {}",
                   bookingsPage.getNumberOfElements(),
                   bookingsPage.getNumber(),
                   bookingsPage.getTotalPages());
        return bookingsPage;
    }

    @Override
    public Booking updateBooking(Long id, BookingRequestDTO bookingDTO) {
        logger.info("Updating booking with ID: {}", id);
        Booking booking = getBookingOrThrow(id);

        booking.setFrom(bookingDTO.getFrom());
        booking.setTo(bookingDTO.getTo());
        booking.setDate(bookingDTO.getDate());
        booking.setVehicle(bookingDTO.getVehicle());
        booking.setAmount(bookingDTO.getAmount());
        booking.setFullName(bookingDTO.getFullName());
        booking.setLicense(bookingDTO.getLicense());
        booking.setPhoneNumber(bookingDTO.getPhoneNumber());
        booking.setPickupAddress(bookingDTO.getPickupAddress());
        booking.setStatus(bookingDTO.getStatus());

        Booking updatedBooking = bookingRepository.save(booking);
        logger.info("Booking updated successfully with ID: {}", id);
        return updatedBooking;
    }

    @Override
    public void deleteBooking(Long id) {
        logger.info("Deleting booking with ID: {}", id);
        if (!bookingExists(id)) {
            logger.error("Cannot delete - booking not found with ID: {}", id);
            throw new IllegalArgumentException("Booking not found with ID: " + id);
        }
        bookingRepository.deleteById(id);
        logger.info("Booking deleted successfully with ID: {}", id);
    }

    @Override
    public boolean bookingExists(Long id) {
        boolean exists = bookingRepository.existsById(id);
        logger.debug("Booking existence check - ID: {}, exists: {}", id, exists);
        return exists;
    }

    @Override
    public Booking getBookingOrThrow(Long id) {
        logger.debug("Getting booking or throwing exception for ID: {}", id);
        return bookingRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Booking not found with ID: {}", id);
                    return new IllegalArgumentException("Booking not found with ID: " + id);
                });
    }
}
