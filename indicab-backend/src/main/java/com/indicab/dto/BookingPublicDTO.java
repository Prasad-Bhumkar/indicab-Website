package com.indicab.dto;

import java.time.LocalDateTime;

/**
 * DTO for public booking status lookup
 * Contains only non-sensitive booking information visible to guests
 * No user personal data is exposed
 */
public class BookingPublicDTO {
    private Long id;
    private String from;
    private String to;
    private String date;
    private Double amount;
    private String vehicle;
    private String status;
    private LocalDateTime createdAt;

    public BookingPublicDTO() {}

    public BookingPublicDTO(Long id, String from, String to, String date, Double amount,
                           String vehicle, String status, LocalDateTime createdAt) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.date = date;
        this.amount = amount;
        this.vehicle = vehicle;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
