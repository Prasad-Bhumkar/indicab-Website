package com.indicab.service.impl;

import com.indicab.dto.RideTrackingUpdate;
import com.indicab.service.RideTrackingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of RideTrackingService
 * 
 * Manages real-time ride tracking with in-memory storage
 * In production, consider using Redis or database for distributed tracking
 */
@Service
public class RideTrackingServiceImpl implements RideTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(RideTrackingServiceImpl.class);

    // In-memory storage of active ride tracking data
    // In production, move to Redis or database for multi-instance deployments
    private final Map<String, RideTrackingUpdate> activeRides = new ConcurrentHashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public RideTrackingUpdate getCurrentRideTracking(String rideId) {
        logger.debug("Fetching current tracking info for ride: {}", rideId);
        
        RideTrackingUpdate tracking = activeRides.get(rideId);
        
        if (tracking == null) {
            logger.warn("No active tracking found for ride: {}", rideId);
            return createDefaultTracking(rideId);
        }
        
        return tracking;
    }

    @Override
    public void updateRideLocation(String rideId, Double latitude, Double longitude) {
        logger.info("Updating location for ride: {} at coordinates: ({}, {})", rideId, latitude, longitude);
        
        RideTrackingUpdate tracking = activeRides.getOrDefault(rideId, createDefaultTracking(rideId));
        tracking.setLatitude(latitude);
        tracking.setLongitude(longitude);
        
        activeRides.put(rideId, tracking);
        broadcastUpdate(rideId, tracking);
    }

    @Override
    public void updateRideStatus(String rideId, String status) {
        logger.info("Updating status for ride: {} to: {}", rideId, status);
        
        RideTrackingUpdate tracking = activeRides.getOrDefault(rideId, createDefaultTracking(rideId));
        tracking.setRideStatus(status);
        
        activeRides.put(rideId, tracking);
        broadcastUpdate(rideId, tracking);
    }

    @Override
    public void simulateRideProgress(String rideId) {
        RideTrackingUpdate tracking = activeRides.getOrDefault(rideId, createDefaultTracking(rideId));
        
        // Increment progress
        Integer currentProgress = tracking.getProgressPercentage();
        if (currentProgress < 100) {
            tracking.setProgressPercentage(Math.min(100, currentProgress + 5));
            
            // Simulate location change (move towards destination)
            Double lat = tracking.getLatitude() + (Math.random() * 0.001 - 0.0005);
            Double lon = tracking.getLongitude() + (Math.random() * 0.001 - 0.0005);
            tracking.setLatitude(lat);
            tracking.setLongitude(lon);
            
            // Update ETA
            Integer eta = tracking.getEstimatedMinutesRemaining();
            if (eta > 1) {
                tracking.setEstimatedMinutesRemaining(eta - 1);
            }
            
            activeRides.put(rideId, tracking);
            broadcastUpdate(rideId, tracking);
            
            logger.debug("Simulated progress for ride: {} - Progress: {}%", rideId, tracking.getProgressPercentage());
        }
    }

    @Override
    public void startTracking(String rideId) {
        logger.info("Starting tracking for ride: {}", rideId);
        
        RideTrackingUpdate tracking = createDefaultTracking(rideId);
        activeRides.put(rideId, tracking);
        
        broadcastUpdate(rideId, tracking);
    }

    @Override
    public void stopTracking(String rideId) {
        logger.info("Stopping tracking for ride: {}", rideId);
        activeRides.remove(rideId);
    }

    @Override
    public boolean isRideBeingTracked(String rideId) {
        return activeRides.containsKey(rideId);
    }

    @Override
    public List<RideTrackingUpdate> getActiveRides() {
        logger.debug("Fetching list of {} active rides", activeRides.size());
        return new ArrayList<>(activeRides.values());
    }

    /**
     * Broadcast tracking update to WebSocket clients
     */
    private void broadcastUpdate(String rideId, RideTrackingUpdate tracking) {
        try {
            messagingTemplate.convertAndSend("/topic/ride/" + rideId, tracking);
            logger.debug("Broadcasted tracking update for ride: {}", rideId);
        } catch (Exception e) {
            logger.error("Failed to broadcast tracking update for ride: {}", rideId, e);
        }
    }

    /**
     * Create a default tracking object for a new ride
     */
    private RideTrackingUpdate createDefaultTracking(String rideId) {
        RideTrackingUpdate tracking = new RideTrackingUpdate();
        tracking.setRideId(rideId);
        
        // Set default location (e.g., center of a city)
        tracking.setLatitude(28.6139); // New Delhi coordinates
        tracking.setLongitude(77.2090);
        
        tracking.setProgressPercentage(0);
        tracking.setRideStatus("INITIATED");
        tracking.setEstimatedMinutesRemaining(15);
        tracking.setDistanceRemainingKm(12.5);
        tracking.setDriverName("Available Driver");
        tracking.setPickupAddress("Current Location");
        tracking.setDropoffAddress("Destination");
        
        return tracking;
    }

    /**
     * Clean up old tracking data (useful for scheduled cleanup)
     */
    public void cleanupOldRides() {
        logger.info("Cleaning up inactive rides. Current active rides: {}", activeRides.size());
        
        // In production, implement TTL-based cleanup
        // For now, just log the count
        logger.info("Active rides after cleanup: {}", activeRides.size());
    }

    /**
     * Get statistics about active tracking
     */
    public String getTrackingStatistics() {
        return String.format("Active Rides: %d", activeRides.size());
    }
}
