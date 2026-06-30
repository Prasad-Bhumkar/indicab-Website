package com.indicab.controller;

import com.indicab.entity.Booking;
import com.indicab.service.impl.BookingServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin controller for managing bookings
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin/bookings")
@Tag(name = "Admin - Bookings", description = "Admin booking management endpoints")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")  // All endpoints require ADMIN role
public class AdminBookingController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminBookingController.class);
    
    @Autowired
    private BookingServiceImpl bookingService;
    
    /**
     * Get all bookings with pagination, sorting, and search
     */
    @GetMapping
    @Operation(summary = "Get all bookings", description = "Retrieve all bookings with pagination, sorting, and search filters including date range filtering")
    @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully")
    public ResponseEntity<Page<Booking>> getAllBookings(
            Pageable pageable,
            @Parameter(description = "Search in pickup and dropoff locations")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filter by booking status")
            @RequestParam(required = false) String status,
            @Parameter(description = "Filter by user ID")
            @RequestParam(required = false) String userId,
            @Parameter(description = "Filter from date (ISO format: yyyy-MM-dd or yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @Parameter(description = "Filter to date (ISO format: yyyy-MM-dd or yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {

        logger.info("Fetching all bookings - Page: {}, Size: {}, Status: {}, UserId: {}, fromDate: {}, toDate: {}",
                   pageable.getPageNumber(), pageable.getPageSize(), status, userId, fromDate, toDate);

        com.indicab.util.SearchSpecification.SpecificationBuilder<Booking> builder =
            new com.indicab.util.SearchSpecification.SpecificationBuilder<>();

        if (search != null && !search.isEmpty()) {
            // Search in pickup and dropoff addresses
            builder.with("pickupAddress", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS)
                   .or().with("dropoffAddress", search, com.indicab.util.SearchSpecification.SearchOperator.CONTAINS);
        }

        if (status != null && !status.isEmpty()) {
            builder.with("status", status, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
        }

        if (userId != null && !userId.isEmpty()) {
            builder.with("user.id", userId, com.indicab.util.SearchSpecification.SearchOperator.EQUALS);
        }

        // Add date range filtering
        if (fromDate != null) {
            builder.with("createdAt", fromDate, com.indicab.util.SearchSpecification.SearchOperator.GREATER_THAN_EQUAL);
            logger.debug("Filtering bookings from date: {}", fromDate);
        }

        if (toDate != null) {
            builder.with("createdAt", toDate, com.indicab.util.SearchSpecification.SearchOperator.LESS_THAN_EQUAL);
            logger.debug("Filtering bookings to date: {}", toDate);
        }

        Page<Booking> bookings = bookingService.getAllBookingsPaged(pageable, builder.build());
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Get booking by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get booking details", description = "Retrieve detailed information about a specific booking")
    @ApiResponse(responseCode = "200", description = "Booking retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        logger.info("Fetching booking with ID: {}", id);
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Confirm a booking - sends confirmation email to customer
     */
    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirm booking", 
               description = "Confirm a booking and send confirmation email to customer")
    @ApiResponse(responseCode = "200", description = "Booking confirmed successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    public ResponseEntity<Booking> confirmBooking(@PathVariable Long id) {
        logger.info("Admin confirming booking with ID: {}", id);
        
        try {
            Booking confirmedBooking = bookingService.confirmBooking(id);
            return ResponseEntity.ok(confirmedBooking);
        } catch (IllegalArgumentException e) {
            logger.error("Booking not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Cancel a booking - sends cancellation email to customer
     */
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel booking", 
               description = "Cancel a booking and send cancellation email to customer")
    @ApiResponse(responseCode = "200", description = "Booking cancelled successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        
        logger.info("Admin cancelling booking with ID: {} - Reason: {}", id, reason);
        
        try {
            Booking cancelledBooking = bookingService.cancelBooking(id, reason);
            return ResponseEntity.ok(cancelledBooking);
        } catch (IllegalArgumentException e) {
            logger.error("Booking not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a booking record
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete booking", description = "Delete a booking record permanently")
    @ApiResponse(responseCode = "204", description = "Booking deleted successfully")
    @ApiResponse(responseCode = "404", description = "Booking not found")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        logger.info("Admin deleting booking with ID: {}", id);
        
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Booking not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete multiple bookings
     */
    @DeleteMapping("/bulk")
    @Operation(summary = "Bulk delete bookings", description = "Delete multiple bookings records at once")
    @ApiResponse(responseCode = "204", description = "Bookings deleted successfully")
    public ResponseEntity<Void> bulkDeleteBookings(@RequestBody List<Long> ids) {
        logger.info("Admin performing bulk delete on bookings. Count: {}", ids.size());
        bookingService.bulkDeleteBookings(ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Bulk update bookings status
     */
    @PutMapping("/bulk/status")
    @Operation(summary = "Bulk update booking status", description = "Update status for multiple bookings at once")
    @ApiResponse(responseCode = "200", description = "Bookings updated successfully")
    public ResponseEntity<Void> bulkUpdateBookingsStatus(
            @RequestBody List<Long> ids,
            @RequestParam String status) {

        logger.info("Admin performing bulk status update to: {} for {} bookings", status, ids.size());
        bookingService.bulkUpdateBookingsStatus(ids, status);
        return ResponseEntity.ok().build();
    }

    /**
     * Get booking statistics
     */
    @GetMapping("/stats/overview")
    @Operation(summary = "Get booking statistics", description = "Get overview of booking statistics")
    @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    public ResponseEntity<Map<String, Object>> getBookingStats() {
        logger.info("Fetching booking statistics");
        
        try {
            Map<String, Object> stats = new HashMap<>();
            Page<Booking> allBookings = bookingService.getAllBookingsPaged(Pageable.unpaged());
            
            long total = allBookings.getTotalElements();
            long pending = allBookings.getContent().stream()
                    .filter(b -> "PENDING".equals(b.getStatus()))
                    .count();
            long confirmed = allBookings.getContent().stream()
                    .filter(b -> "CONFIRMED".equals(b.getStatus()))
                    .count();
            long cancelled = allBookings.getContent().stream()
                    .filter(b -> "CANCELLED".equals(b.getStatus()))
                    .count();
            
            double totalRevenue = allBookings.getContent().stream()
                    .mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0)
                    .sum();
            
            stats.put("totalBookings", total);
            stats.put("pendingBookings", pending);
            stats.put("confirmedBookings", confirmed);
            stats.put("cancelledBookings", cancelled);
            stats.put("totalRevenue", totalRevenue);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching booking statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}
