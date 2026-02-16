package com.indicab.controller;

import com.indicab.dto.RideTrackingUpdate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

/**
 * WebSocket Controller for Real-Time Ride Tracking
 * 
 * Handles incoming ride tracking updates from drivers and broadcasts them to passengers
 * 
 * Message Flow:
 * 1. Driver app sends location update to /app/ride/track/{rideId}
 * 2. Server processes update and broadcasts to /topic/ride/{rideId}
 * 3. All connected clients subscribed to /topic/ride/{rideId} receive update
 */
@Controller
public class RideTrackingWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(RideTrackingWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Receive ride tracking update from driver and broadcast to passengers
     * 
     * Client sends message to: /app/ride/track/{rideId}
     * with RideTrackingUpdate payload
     * 
     * Server broadcasts to: /topic/ride/{rideId}
     */
    @MessageMapping("/ride/track/{rideId}")
    @SendTo("/topic/ride/{rideId}")
    public RideTrackingUpdate updateRideLocation(
            @DestinationVariable String rideId,
            RideTrackingUpdate update) {
        
        logger.debug("Received ride tracking update for ride: {} from driver: {}", 
                    rideId, update.getDriverId());
        
        // Ensure ride ID matches
        if (!rideId.equals(update.getRideId())) {
            update.setRideId(rideId);
        }
        
        // Set update timestamp
        update.setUpdatedAt(LocalDateTime.now());
        
        logger.info("Broadcasting ride tracking update: {}", update);
        return update;
    }

    /**
     * Receive ping/heartbeat from driver (for connection health check)
     */
    @MessageMapping("/ride/ping/{rideId}")
    @SendTo("/topic/ride/{rideId}/ping")
    public String handleRidePing(@DestinationVariable String rideId) {
        logger.debug("Received ping for ride: {}", rideId);
        return "pong-" + LocalDateTime.now().toString();
    }

    /**
     * Send direct message to passenger (not broadcast)
     * Useful for sending alerts, cancellations, etc.
     * 
     * Client sends message to: /app/ride/notify/{rideId}/{userId}
     */
    @MessageMapping("/ride/notify/{rideId}/{userId}")
    public void notifyUser(
            @DestinationVariable String rideId,
            @DestinationVariable String userId,
            String message) {
        
        logger.info("Sending notification to user: {} for ride: {}", userId, rideId);
        
        // Send to specific user's queue
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", 
            "Ride " + rideId + ": " + message);
    }

    /**
     * Broadcast status update to all passengers of a ride
     * Called when ride status changes (e.g., arrived, started, completed)
     */
    public void broadcastRideStatusUpdate(String rideId, String status, String message) {
        logger.info("Broadcasting status update for ride: {} status: {}", rideId, status);
        
        // Create a status update message
        String statusMessage = String.format("{\"rideId\": \"%s\", \"status\": \"%s\", \"message\": \"%s\", \"timestamp\": \"%s\"}", 
            rideId, status, message, LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/status", statusMessage);
    }

    /**
     * Broadcast active rides list
     * Useful for ride listing/discovery feature
     */
    public void broadcastActiveRides(String activeRidesJson) {
        logger.debug("Broadcasting active rides list");
        messagingTemplate.convertAndSend("/topic/rides/active", activeRidesJson);
    }
}
