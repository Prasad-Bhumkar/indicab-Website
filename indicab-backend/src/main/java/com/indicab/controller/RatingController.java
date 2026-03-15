package com.indicab.controller;

import com.indicab.dto.RatingRequestDTO;
import com.indicab.dto.RatingResponseDTO;
import com.indicab.dto.PagedResponseDTO;
import com.indicab.entity.Rating;
import com.indicab.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
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
import com.indicab.service.UserService;
import com.indicab.entity.User;

/**
 * Rating controller handling rating-related API requests
 */
@RestController
@RequestMapping("/api/v1/ratings")
@Tag(name = "Ratings", description = "Rating and review management endpoints")
@SecurityRequirement(name = "Bearer Token")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private UserService userService;

    @PostMapping
    @Operation(summary = "Create a new rating", description = "Submit a rating and review for a completed booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Rating created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed or already rated"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<RatingResponseDTO> createRating(@Valid @RequestBody RatingRequestDTO ratingRequest) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Rating savedRating = ratingService.createRating(ratingRequest, currentUser.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ratingService.getRatingById(savedRating.getId()).map(rating -> {
                    return new RatingResponseDTO(
                            rating.getId(),
                            rating.getBooking().getId(),
                            rating.getUser().getId(),
                            rating.getUser().getName(),
                            rating.getRating(),
                            rating.getReview(),
                            rating.getDriverName(),
                            rating.getCreatedAt()
                    );
                }).orElse(null));
    }

    @GetMapping
    @Operation(summary = "Get user's ratings with pagination", description = "Retrieve paginated list of ratings submitted by the authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paginated list of ratings retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PagedResponseDTO<RatingResponseDTO>> getUserRatings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<RatingResponseDTO> ratingsPage = ratingService.getUserRatings(currentUser.getId(), pageable);

        PagedResponseDTO<RatingResponseDTO> response = new PagedResponseDTO<>(
                ratingsPage.getContent(),
                page,
                size,
                ratingsPage.getTotalElements(),
                ratingsPage.getTotalPages()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get rating for a booking", description = "Retrieve rating and review for a specific booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rating retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Rating not found")
    })
    public ResponseEntity<?> getRatingByBookingId(@PathVariable Long bookingId) {
        var rating = ratingService.getRatingByBookingId(bookingId);
        if (rating.isPresent()) {
            return ResponseEntity.ok(rating.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/booking/{bookingId}/has-rated")
    @Operation(summary = "Check if user has rated a booking", description = "Check if current user has already rated a specific booking")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rating status retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> hasUserRatedBooking(@PathVariable Long bookingId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean hasRated = ratingService.hasUserRatedBooking(bookingId, currentUser.getId());
        return ResponseEntity.ok().body(java.util.Map.of("hasRated", hasRated));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a rating", description = "Update your own rating and review")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rating updated successfully"),
        @ApiResponse(responseCode = "404", description = "Rating not found"),
        @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<?> updateRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequestDTO ratingRequest) {

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userService.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        try {
            Rating updatedRating = ratingService.updateRating(id, ratingRequest, currentUser.getId());
            return ResponseEntity.ok(new RatingResponseDTO(
                    updatedRating.getId(),
                    updatedRating.getBooking().getId(),
                    updatedRating.getUser().getId(),
                    updatedRating.getUser().getName(),
                    updatedRating.getRating(),
                    updatedRating.getReview(),
                    updatedRating.getDriverName(),
                    updatedRating.getCreatedAt()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a rating", description = "Delete your own rating")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Rating deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Rating not found")
    })
    public ResponseEntity<Void> deleteRating(@PathVariable Long id) {
        try {
            ratingService.deleteRating(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
