package com.indicab.dto;

import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Long id;
    private String title;
    private String message;
    private String type;
    private String status;
    private Boolean isRead;
    private Long relatedBookingId;
    private Long relatedUserId;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public NotificationResponseDTO() {}

    public NotificationResponseDTO(Long id, String title, String message, String type, String status,
                                   Boolean isRead, Long relatedBookingId, Long relatedUserId,
                                   LocalDateTime createdAt, LocalDateTime readAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.status = status;
        this.isRead = isRead;
        this.relatedBookingId = relatedBookingId;
        this.relatedUserId = relatedUserId;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Long getRelatedBookingId() {
        return relatedBookingId;
    }

    public void setRelatedBookingId(Long relatedBookingId) {
        this.relatedBookingId = relatedBookingId;
    }

    public Long getRelatedUserId() {
        return relatedUserId;
    }

    public void setRelatedUserId(Long relatedUserId) {
        this.relatedUserId = relatedUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
}
