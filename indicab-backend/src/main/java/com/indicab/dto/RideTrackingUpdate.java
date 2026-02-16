package com.indicab.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Real-time ride tracking update sent over WebSocket
 * Contains current position, status, and driver information
 */
public class RideTrackingUpdate implements Serializable {
    private String rideId;
    private Double latitude;
    private Double longitude;
    private String driverId;
    private String driverName;
    private String driverPhone;
    private Integer progressPercentage;  // 0-100
    private String rideStatus;  // IN_PROGRESS, WAITING, PAUSED, COMPLETED, CANCELLED
    private Integer estimatedMinutesRemaining;
    private Double distanceRemainingKm;
    private LocalDateTime updatedAt;
    private String pickupAddress;
    private String dropoffAddress;

    // Constructors
    public RideTrackingUpdate() {}

    public RideTrackingUpdate(String rideId, Double latitude, Double longitude, String driverId,
                              String driverName, Integer progressPercentage, String rideStatus,
                              Integer estimatedMinutesRemaining) {
        this.rideId = rideId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.driverId = driverId;
        this.driverName = driverName;
        this.progressPercentage = progressPercentage;
        this.rideStatus = rideStatus;
        this.estimatedMinutesRemaining = estimatedMinutesRemaining;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getRideId() {
        return rideId;
    }

    public void setRideId(String rideId) {
        this.rideId = rideId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getDriverId() {
        return driverId;
    }

    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getDriverPhone() {
        return driverPhone;
    }

    public void setDriverPhone(String driverPhone) {
        this.driverPhone = driverPhone;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getRideStatus() {
        return rideStatus;
    }

    public void setRideStatus(String rideStatus) {
        this.rideStatus = rideStatus;
    }

    public Integer getEstimatedMinutesRemaining() {
        return estimatedMinutesRemaining;
    }

    public void setEstimatedMinutesRemaining(Integer estimatedMinutesRemaining) {
        this.estimatedMinutesRemaining = estimatedMinutesRemaining;
    }

    public Double getDistanceRemainingKm() {
        return distanceRemainingKm;
    }

    public void setDistanceRemainingKm(Double distanceRemainingKm) {
        this.distanceRemainingKm = distanceRemainingKm;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDropoffAddress() {
        return dropoffAddress;
    }

    public void setDropoffAddress(String dropoffAddress) {
        this.dropoffAddress = dropoffAddress;
    }

    @Override
    public String toString() {
        return "RideTrackingUpdate{" +
                "rideId='" + rideId + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", driverName='" + driverName + '\'' +
                ", progressPercentage=" + progressPercentage +
                ", rideStatus='" + rideStatus + '\'' +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
