package com.indicab.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for RideController
 * Tests ride tracking endpoints (public - no auth required)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser
@DisplayName("RideController Tests")
class RideControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        // RideTrackingService uses in-memory storage; no DB cleanup needed
    }

    private void startRide(String rideId) throws Exception {
        mockMvc.perform(post("/api/v1/ride/start/" + rideId)
                .contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/v1/ride/active - Get active rides")
    void testGetActiveRides() throws Exception {
        startRide("RIDE-001");

        mockMvc.perform(get("/api/v1/ride/active")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").isNumber())
                .andExpect(jsonPath("$.rides").isArray());
    }

    @Test
    @DisplayName("GET /api/v1/ride/stats - Get tracking stats")
    void testGetTrackingStats() throws Exception {
        startRide("RIDE-STATS-001");

        mockMvc.perform(get("/api/v1/ride/stats")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeRidesCount").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/ride/track/{rideId} - Track a ride that exists")
    void testTrackRide() throws Exception {
        startRide("RIDE-TRACK-001");

        mockMvc.perform(get("/api/v1/ride/track/RIDE-TRACK-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideId").value("RIDE-TRACK-001"))
                .andExpect(jsonPath("$.latitude").isNumber())
                .andExpect(jsonPath("$.longitude").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/ride/start/{rideId} - Start tracking")
    void testStartTracking() throws Exception {
        mockMvc.perform(post("/api/v1/ride/start/RIDE-START-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tracking started for ride: RIDE-START-001"))
                .andExpect(jsonPath("$.rideId").value("RIDE-START-001"))
                .andExpect(jsonPath("$.wsUrl").value("/ws/ride"));
    }

    @Test
    @DisplayName("POST /api/v1/ride/stop/{rideId} - Stop tracking")
    void testStopTracking() throws Exception {
        startRide("RIDE-STOP-001");

        mockMvc.perform(post("/api/v1/ride/stop/RIDE-STOP-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tracking stopped for ride: RIDE-STOP-001"))
                .andExpect(jsonPath("$.rideId").value("RIDE-STOP-001"));
    }

    @Test
    @DisplayName("POST /api/v1/ride/simulate/{rideId} - Simulate ride progress")
    void testSimulateRideProgress() throws Exception {
        startRide("RIDE-SIM-001");

        mockMvc.perform(post("/api/v1/ride/simulate/RIDE-SIM-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideId").value("RIDE-SIM-001"))
                .andExpect(jsonPath("$.progressPercentage").isNumber());
    }

    @Test
    @DisplayName("GET /api/v1/ride/is-tracking/{rideId} - Check tracking status - being tracked")
    void testIsRideBeingTrackedTrue() throws Exception {
        startRide("RIDE-CHECK-001");

        mockMvc.perform(get("/api/v1/ride/is-tracking/RIDE-CHECK-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideId").value("RIDE-CHECK-001"))
                .andExpect(jsonPath("$.isBeingTracked").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/ride/is-tracking/{rideId} - Check tracking status - not tracked")
    void testIsRideBeingTrackedFalse() throws Exception {
        mockMvc.perform(get("/api/v1/ride/is-tracking/RIDE-NOTRACK-001")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideId").value("RIDE-NOTRACK-001"))
                .andExpect(jsonPath("$.isBeingTracked").value(false));
    }

    @Test
    @DisplayName("GET /api/v1/ride/track/{rideId} - Track a non-existent ride returns default")
    void testTrackNonExistentRide() throws Exception {
        mockMvc.perform(get("/api/v1/ride/track/nonexistent-ride")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rideId").value("nonexistent-ride"))
                .andExpect(jsonPath("$.latitude").isNumber())
                .andExpect(jsonPath("$.longitude").isNumber())
                .andExpect(jsonPath("$.rideStatus").value("INITIATED"));
    }
}
