package com.indicab.service.impl;

import com.indicab.dto.RatingRequestDTO;
import com.indicab.dto.RatingResponseDTO;
import com.indicab.entity.Booking;
import com.indicab.entity.Rating;
import com.indicab.entity.User;
import com.indicab.repository.BookingRepository;
import com.indicab.repository.RatingRepository;
import com.indicab.repository.UserRepository;
import com.indicab.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RatingServiceImpl implements RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Rating createRating(RatingRequestDTO ratingRequest, Long userId) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate booking exists and belongs to user
        Booking booking = bookingRepository.findById(ratingRequest.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getUser() == null || !booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("User did not make this booking");
        }

        // Check if user has already rated this booking
        if (ratingRepository.existsByBookingIdAndUserId(ratingRequest.getBookingId(), userId)) {
            throw new IllegalArgumentException("You have already rated this booking");
        }

        // Validate rating is between 1-5
        if (ratingRequest.getRating() < 1 || ratingRequest.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Create new rating
        Rating rating = new Rating(
                booking,
                user,
                ratingRequest.getRating(),
                ratingRequest.getReview(),
                ratingRequest.getDriverName()
        );

        return ratingRepository.save(rating);
    }

    @Override
    public Optional<Rating> getRatingById(Long id) {
        return ratingRepository.findById(id);
    }

    @Override
    public Page<RatingResponseDTO> getUserRatings(Long userId, Pageable pageable) {
        return ratingRepository.findByUserId(userId, pageable)
                .map(this::toDto);
    }

    @Override
    public Optional<RatingResponseDTO> getRatingByBookingId(Long bookingId) {
        return ratingRepository.findByBookingId(bookingId)
                .map(this::toDto);
    }

    @Override
    public boolean hasUserRatedBooking(Long bookingId, Long userId) {
        return ratingRepository.existsByBookingIdAndUserId(bookingId, userId);
    }

    @Override
    public void deleteRating(Long id) {
        ratingRepository.deleteById(id);
    }

    @Override
    public Rating updateRating(Long id, RatingRequestDTO ratingRequest, Long userId) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found"));

        // Verify user owns this rating
        if (!rating.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own ratings");
        }

        // Validate rating
        if (ratingRequest.getRating() < 1 || ratingRequest.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        rating.setRating(ratingRequest.getRating());
        rating.setReview(ratingRequest.getReview());
        rating.setDriverName(ratingRequest.getDriverName());

        return ratingRepository.save(rating);
    }

    private RatingResponseDTO toDto(Rating rating) {
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
    }
}
