package com.indicab.dto;

import java.time.LocalDateTime;

public class RatingResponseDTO {

    private Long id;
    private Long bookingId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String review;
    private String driverName;
    private LocalDateTime createdAt;

    public RatingResponseDTO() {}

    public RatingResponseDTO(Long id, Long bookingId, Long userId, String userName, Integer rating, 
                            String review, String driverName, LocalDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.review = review;
        this.driverName = driverName;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
