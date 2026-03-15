package com.indicab.service.impl;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.entity.Booking;
import com.indicab.repository.BookingRepository;
import com.indicab.service.BookingService;
import com.indicab.service.UserService;
import com.indicab.util.MetricsHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private SimpMessagingTemplate messagingTemplate;

    @Autowired(required = false)
    private UserService userService;

    @Autowired(required = false)
    private EmailService emailService;

    @Autowired
    private MetricsHelper metricsHelper;

    @Override
    public Booking createBooking(BookingRequestDTO bookingDTO, Long currentUserId) {
        logger.info("Creating new booking: from='{}' to='{}' passenger='{}' amount=${} userId={}",
            bookingDTO.getFrom(), bookingDTO.getTo(), bookingDTO.getFullName(),
            bookingDTO.getAmount(), currentUserId);

        try {
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

            logger.debug("Booking object created - setting user and validating");
            if (currentUserId != null && userService != null) {
                userService.findById(currentUserId).ifPresent(user -> {
                    booking.setUser(user);
                    logger.debug("User assigned to booking - userId={}", currentUserId);
                });
            }

            // Validate referential integrity for authenticated bookings
            booking.validateReferentialIntegrity();
            logger.debug("Booking passed referential integrity validation");

            Booking savedBooking = bookingRepository.save(booking);
            logger.info("Booking created successfully: id={} amount=${} status={} userId={}",
                       savedBooking.getId(), savedBooking.getAmount(), savedBooking.getStatus(), currentUserId);

            broadcastNewBooking(savedBooking);
            if (emailService != null) {
                emailService.sendBookingNotificationToAdmin(savedBooking);
            }

            return savedBooking;
        } catch (Exception e) {
            logger.error("Failed to create booking: {}", e.getMessage(), e);
            metricsHelper.recordError("BookingService", e, "createBooking");
            throw e;
        }
    }

    private void broadcastNewBooking(Booking booking) {
        if (messagingTemplate == null) return;
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "NEW_BOOKING");
            payload.put("data", booking);
            payload.put("timestamp", LocalDateTime.now());
            messagingTemplate.convertAndSend("/topic/admin/bookings", payload);
        } catch (Exception e) {
            logger.warn("Failed to broadcast new booking: {}", e.getMessage());
        }
    }

    private void broadcastBookingStatusUpdate(Long bookingId, String status) {
        if (messagingTemplate == null) return;
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "BOOKING_STATUS_UPDATE");
            payload.put("bookingId", bookingId);
            payload.put("status", status);
            payload.put("timestamp", LocalDateTime.now());
            messagingTemplate.convertAndSend("/topic/admin/bookings", payload);
        } catch (Exception e) {
            logger.warn("Failed to broadcast booking status update: {}", e.getMessage());
        }
    }

    /**
     * Confirm a booking and send confirmation email to customer
     */
    public Booking confirmBooking(Long bookingId) {
        logger.info("Confirming booking: id={}", bookingId);
        try {
            Booking booking = getBookingOrThrow(bookingId);
            logger.debug("Retrieved booking for confirmation: id={} currentStatus={}", bookingId, booking.getStatus());

            booking.setStatus("CONFIRMED");
            Booking confirmedBooking = bookingRepository.save(booking);
            logger.info("Booking confirmed: id={} status=CONFIRMED customer={}", bookingId, confirmedBooking.getFullName());

            broadcastBookingStatusUpdate(bookingId, "CONFIRMED");
            logger.debug("Broadcast booking status update");

            // Send confirmation email to customer
            if (emailService != null) {
                emailService.sendConfirmationEmailToCustomer(confirmedBooking);
                logger.debug("Confirmation email sent to: {}", confirmedBooking.getEmail());
            }

            return confirmedBooking;
        } catch (Exception e) {
            logger.error("Failed to confirm booking id={}: {}", bookingId, e.getMessage(), e);
            metricsHelper.recordError("BookingService", e, "confirmBooking");
            throw e;
        }
    }

    /**
     * Cancel a booking and send cancellation email to customer
     */
    public Booking cancelBooking(Long bookingId, String cancellationReason) {
        logger.info("Cancelling booking: id={} reason={}", bookingId, cancellationReason);
        try {
            Booking booking = getBookingOrThrow(bookingId);
            logger.debug("Retrieved booking for cancellation: id={} currentStatus={}", bookingId, booking.getStatus());

            booking.setStatus("CANCELLED");
            Booking cancelledBooking = bookingRepository.save(booking);
            logger.info("Booking cancelled: id={} status=CANCELLED customer={} reason={}",
                       bookingId, cancelledBooking.getFullName(), cancellationReason);

            broadcastBookingStatusUpdate(bookingId, "CANCELLED");
            logger.debug("Broadcast booking status update");

            // Send cancellation email to customer
            if (emailService != null) {
                emailService.sendCancellationEmailToCustomer(cancelledBooking, cancellationReason);
                logger.debug("Cancellation email sent to: {}", cancelledBooking.getEmail());
            }

            return cancelledBooking;
        } catch (Exception e) {
            logger.error("Failed to cancel booking id={}: {}", bookingId, e.getMessage(), e);
            metricsHelper.recordError("BookingService", e, "cancelBooking");
            throw e;
        }
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

    /**
     * Get all bookings with pagination and search/filter specifications
     */
    public Page<Booking> getAllBookingsPaged(Pageable pageable, Specification<Booking> spec) {
        logger.debug("Fetching bookings with pagination and search - Page: {}, Size: {}",
                   pageable.getPageNumber(), pageable.getPageSize());
        Page<Booking> bookingsPage = bookingRepository.findAll(spec, pageable);
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

    @Override
    public Page<Booking> getBookingsByUserId(Long userId, Pageable pageable) {
        logger.info("Fetching bookings for user ID: {} with pagination", userId);
        return bookingRepository.findByUserId(userId, pageable);
    }

    @Override
    public List<Booking> getBookingsByUserId(Long userId) {
        logger.info("Fetching all bookings for user ID: {}", userId);
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public void bulkDeleteBookings(List<Long> ids) {
        logger.info("Bulk deleting {} bookings", ids.size());
        try {
            bookingRepository.deleteAllById(ids);
            logger.info("Bulk deletion completed for {} records", ids.size());
        } catch (Exception e) {
            logger.error("Failed to perform bulk deletion", e);
            metricsHelper.recordError("BookingService", e, "bulkDeleteBookings");
            throw new RuntimeException("Failed to delete multiple bookings");
        }
    }

    @Override
    public void bulkUpdateBookingsStatus(List<Long> ids, String status) {
        logger.info("Bulk updating status for {} bookings to {}", ids.size(), status);
        try {
            List<Booking> bookings = bookingRepository.findAllById(ids);
            for (Booking booking : bookings) {
                booking.setStatus(status);
            }
            bookingRepository.saveAll(bookings);
            logger.info("Bulk status update completed for {} records", ids.size());
        } catch (Exception e) {
            logger.error("Failed to perform bulk status update", e);
            metricsHelper.recordError("BookingService", e, "bulkUpdateBookingsStatus");
            throw new RuntimeException("Failed to update status for multiple bookings");
        }
    }
}
