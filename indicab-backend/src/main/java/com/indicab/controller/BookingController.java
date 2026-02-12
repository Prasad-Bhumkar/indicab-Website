package com.indicab.controller;

import com.indicab.dto.BookingRequestDTO;
import com.indicab.dto.BookingResponseDTO;
import com.indicab.entity.Booking;
import com.indicab.mapper.BookingMapper;
import com.indicab.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Booking controller handling booking-related API requests
 * Uses response DTOs to avoid exposing entities directly
 */
@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Ride booking management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get all bookings", description = "Retrieve list of all bookings")
    @ApiResponse(responseCode = "200", description = "List of bookings retrieved successfully")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
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
        Booking savedBooking = bookingService.createBooking(bookingRequest);
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
