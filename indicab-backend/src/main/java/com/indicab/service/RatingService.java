package com.indicab.service;

import com.indicab.dto.RatingRequestDTO;
import com.indicab.dto.RatingResponseDTO;
import com.indicab.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RatingService {

    /**
     * Create a new rating
     */
    Rating createRating(RatingRequestDTO ratingRequest, Long userId);

    /**
     * Get rating by ID
     */
    Optional<Rating> getRatingById(Long id);

    /**
     * Get all ratings for a user with pagination
     */
    Page<RatingResponseDTO> getUserRatings(Long userId, Pageable pageable);

    /**
     * Get rating for a specific booking
     */
    Optional<RatingResponseDTO> getRatingByBookingId(Long bookingId);

    /**
     * Check if user has already rated a booking
     */
    boolean hasUserRatedBooking(Long bookingId, Long userId);

    /**
     * Delete a rating
     */
    void deleteRating(Long id);

    /**
     * Update a rating
     */
    Rating updateRating(Long id, RatingRequestDTO ratingRequest, Long userId);
}
