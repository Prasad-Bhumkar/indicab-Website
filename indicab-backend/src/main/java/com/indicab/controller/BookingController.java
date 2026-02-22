package com.indicab.controller;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.dto.BookingResponseDTO;
import com.indicab.dto.PagedResponseDTO;
import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.mapper.BookingMapper;
import com.indicab.service.BookingService;
import com.indicab.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Booking controller handling booking-related API requests
 * Uses response DTOs to avoid exposing entities directly
 * Supports pagination for efficient data retrieval
 */
@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings", description = "Ride booking management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Get user's bookings with pagination", description = "Retrieve paginated list of bookings for the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paginated list of user bookings retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
    })
    public ResponseEntity<PagedResponseDTO<BookingResponseDTO>> getUserBookings(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size) {

        // Get currently authenticated user
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Fetch bookings for current user only
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingsPage = bookingService.getBookingsByUserId(currentUser.getId(), pageable);

        List<BookingResponseDTO> content = bookingsPage.getContent().stream()
                .map(BookingMapper::toDto)
                .collect(Collectors.toList());

        PagedResponseDTO<BookingResponseDTO> response = new PagedResponseDTO<>(
                content,
                page,
                size,
                bookingsPage.getTotalElements(),
                bookingsPage.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/legacy")
    @Operation(summary = "Get all bookings (legacy)", description = "Retrieve all bookings without pagination (deprecated - use /api/bookings with page params)")
    @ApiResponse(responseCode = "200", description = "List of bookings retrieved successfully")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookingsLegacy() {
        List<Booking> bookings = bookingService.getAllBookings();
        List<BookingResponseDTO> response = bookings.stream()
                .map(BookingMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Retrieve booking details by booking ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(booking -> ResponseEntity.ok(BookingMapper.toDto(booking)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create new booking", description = "Create a new ride booking with customer details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Booking created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequest) {
        Long currentUserId = null;
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            currentUserId = userService.findByEmail(userEmail).map(User::getId).orElse(null);
        } catch (Exception ignored) {
            // unauthenticated or no user – book as guest
        }
        Booking savedBooking = bookingService.createBooking(bookingRequest, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(BookingMapper.toDto(savedBooking));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update booking", description = "Update details of an existing booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking updated successfully"),
        @ApiResponse(responseCode = "404", description = "Booking not found"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequestDTO bookingRequest) {
        try {
            Booking updatedBooking = bookingService.updateBooking(id, bookingRequest);
            return ResponseEntity.ok(BookingMapper.toDto(updatedBooking));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete booking", description = "Cancel and delete a booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Booking deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
