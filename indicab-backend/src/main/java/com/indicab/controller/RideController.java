package com.indicab.controller;

import com.indicab.dto.RideTrackingUpdate;
import com.indicab.service.RideTrackingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST API Controller for Ride Operations
 *
 * For real-time tracking, use WebSocket endpoint: /ws/ride
 * This controller provides REST endpoints for:
 * - Getting current tracking info
 * - Starting/stopping tracking
 * - Checking active rides
 */
@RestController
@RequestMapping("/api/v1/ride")
public class RideController {

    private static final Logger logger = LoggerFactory.getLogger(RideController.class);

    @Autowired
    private RideTrackingService rideTrackingService;

    /**
     * Get current tracking information for a ride
     * Real-time updates available via WebSocket subscription
     *
     * @param rideId the ID of the ride to track
     * @return RideTrackingUpdate with current position and status
     */
    @GetMapping("/track/{rideId}")
    public ResponseEntity<RideTrackingUpdate> trackRide(@PathVariable String rideId) {
        logger.info("Received tracking request for ride: {}", rideId);

        try {
            RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking(rideId);
            return ResponseEntity.ok(tracking);
        } catch (Exception e) {
            logger.error("Error fetching tracking info for ride: {}", rideId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Simulate ride progress (for testing/demo)
     * Increments progress percentage and updates location
     *
     * @param rideId the ID of the ride
     * @return Updated RideTrackingUpdate
     */
    @PostMapping("/simulate/{rideId}")
    public ResponseEntity<RideTrackingUpdate> simulateRideProgress(@PathVariable String rideId) {
        logger.info("Simulating progress for ride: {}", rideId);

        try {
            rideTrackingService.simulateRideProgress(rideId);
            RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking(rideId);
            return ResponseEntity.ok(tracking);
        } catch (Exception e) {
            logger.error("Error simulating ride progress for: {}", rideId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Start tracking a ride
     *
     * @param rideId the ID of the ride to start tracking
     * @return Success response
     */
    @PostMapping("/start/{rideId}")
    public ResponseEntity<Map<String, Object>> startTracking(@PathVariable String rideId) {
        logger.info("Starting tracking for ride: {}", rideId);

        try {
            rideTrackingService.startTracking(rideId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tracking started for ride: " + rideId);
            response.put("rideId", rideId);
            response.put("wsUrl", "/ws/ride");
            response.put("subscribeTopic", "/topic/ride/" + rideId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error starting tracking for ride: {}", rideId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Stop tracking a ride
     *
     * @param rideId the ID of the ride to stop tracking
     * @return Success response
     */
    @PostMapping("/stop/{rideId}")
    public ResponseEntity<Map<String, String>> stopTracking(@PathVariable String rideId) {
        logger.info("Stopping tracking for ride: {}", rideId);

        try {
            rideTrackingService.stopTracking(rideId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Tracking stopped for ride: " + rideId);
            response.put("rideId", rideId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error stopping tracking for ride: {}", rideId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get list of all active rides being tracked
     *
     * @return List of active RideTrackingUpdate objects
     */
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveRides() {
        logger.info("Fetching list of active rides");

        try {
            var activeRides = rideTrackingService.getActiveRides();

            Map<String, Object> response = new HashMap<>();
            response.put("count", activeRides.size());
            response.put("rides", activeRides);
            response.put("wsUrl", "/ws/ride");
            response.put("subscribeTopic", "/topic/rides/active");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching active rides", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check if a specific ride is being tracked
     *
     * @param rideId the ID of the ride to check
     * @return True if ride is being tracked, false otherwise
     */
    @GetMapping("/is-tracking/{rideId}")
    public ResponseEntity<Map<String, Object>> isRideTracking(@PathVariable String rideId) {
        logger.debug("Checking tracking status for ride: {}", rideId);

        boolean isTracking = rideTrackingService.isRideBeingTracked(rideId);

        Map<String, Object> response = new HashMap<>();
        response.put("rideId", rideId);
        response.put("isBeingTracked", isTracking);

        return ResponseEntity.ok(response);
    }

    /**
     * Get tracking statistics
     *
     * @return Statistics about active tracking
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTrackingStats() {
        logger.debug("Fetching tracking statistics");

        Map<String, Object> response = new HashMap<>();
        response.put("activeRidesCount", rideTrackingService.getActiveRides().size());

        return ResponseEntity.ok(response);
    }
}
