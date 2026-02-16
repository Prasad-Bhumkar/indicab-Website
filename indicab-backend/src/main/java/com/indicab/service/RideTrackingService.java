package com.indicab.service;

import com.indicab.dto.RideTrackingUpdate;

/**
 * Service interface for ride tracking operations
 */
public interface RideTrackingService {
    
    /**
     * Get current tracking information for a ride
     */
    RideTrackingUpdate getCurrentRideTracking(String rideId);
    
    /**
     * Update ride location (called by driver app)
     */
    void updateRideLocation(String rideId, Double latitude, Double longitude);
    
    /**
     * Update ride status
     */
    void updateRideStatus(String rideId, String status);
    
    /**
     * Simulate ride progress (for testing/demo)
     * Increments position and progress percentage
     */
    void simulateRideProgress(String rideId);
    
    /**
     * Start tracking a ride
     */
    void startTracking(String rideId);
    
    /**
     * Stop tracking a ride
     */
    void stopTracking(String rideId);
    
    /**
     * Check if a ride is currently being tracked
     */
    boolean isRideBeingTracked(String rideId);
    
    /**
     * Get all actively tracked rides
     */
    java.util.List<RideTrackingUpdate> getActiveRides();
}
