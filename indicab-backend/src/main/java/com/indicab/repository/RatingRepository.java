package com.indicab.repository;

import com.indicab.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    /**
     * Find all ratings for a user
     */
    Page<Rating> findByUserId(Long userId, Pageable pageable);

    /**
     * Find all ratings for a booking
     */
    Optional<Rating> findByBookingId(Long bookingId);

    /**
     * Check if user has already rated a booking
     */
    boolean existsByBookingIdAndUserId(Long bookingId, Long userId);

    /**
     * Get average rating for a driver
     */
    Optional<Double> getAverageRatingByDriverName(String driverName);
}
