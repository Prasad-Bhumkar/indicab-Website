package com.indicab.service.impl;

import com.indicab.dto.RideTrackingUpdate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RideTrackingServiceImpl Tests")
class RideTrackingServiceImplTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private RideTrackingServiceImpl rideTrackingService;

    private static final String RIDE_ID = "RIDE-001";

    @BeforeEach
    void setUp() {
        // No mock setup needed; we interact with the in-memory ConcurrentHashMap directly
    }

    @Test
    @DisplayName("Should start tracking a ride")
    void testStartTracking() {
        rideTrackingService.startTracking(RIDE_ID);

        RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking(RIDE_ID);
        assertThat(tracking).isNotNull();
        assertThat(tracking.getRideId()).isEqualTo(RIDE_ID);
        assertThat(tracking.getRideStatus()).isEqualTo("INITIATED");
        assertThat(tracking.getProgressPercentage()).isZero();
        verify(messagingTemplate).convertAndSend(eq("/topic/ride/" + RIDE_ID), any(RideTrackingUpdate.class));
    }

    @Test
    @DisplayName("Should stop tracking a ride")
    void testStopTracking() {
        rideTrackingService.startTracking(RIDE_ID);
        assertThat(rideTrackingService.isRideBeingTracked(RIDE_ID)).isTrue();

        rideTrackingService.stopTracking(RIDE_ID);

        assertThat(rideTrackingService.isRideBeingTracked(RIDE_ID)).isFalse();
    }

    @Test
    @DisplayName("Should check if ride is being tracked")
    void testIsRideBeingTracked() {
        assertThat(rideTrackingService.isRideBeingTracked(RIDE_ID)).isFalse();

        rideTrackingService.startTracking(RIDE_ID);

        assertThat(rideTrackingService.isRideBeingTracked(RIDE_ID)).isTrue();
    }

    @Test
    @DisplayName("Should get current ride tracking")
    void testGetCurrentRideTracking() {
        rideTrackingService.startTracking(RIDE_ID);

        RideTrackingUpdate result = rideTrackingService.getCurrentRideTracking(RIDE_ID);

        assertThat(result).isNotNull();
        assertThat(result.getRideId()).isEqualTo(RIDE_ID);
    }

    @Test
    @DisplayName("Should return default tracking when ride not found")
    void testGetCurrentRideTrackingNotFound() {
        RideTrackingUpdate result = rideTrackingService.getCurrentRideTracking("NONEXISTENT");

        assertThat(result).isNotNull();
        assertThat(result.getRideId()).isEqualTo("NONEXISTENT");
        assertThat(result.getRideStatus()).isEqualTo("INITIATED");
    }

    @Test
    @DisplayName("Should update ride location")
    void testUpdateRideLocation() {
        rideTrackingService.startTracking(RIDE_ID);

        rideTrackingService.updateRideLocation(RIDE_ID, 28.7000, 77.1000);

        RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking(RIDE_ID);
        assertThat(tracking.getLatitude()).isEqualTo(28.7000);
        assertThat(tracking.getLongitude()).isEqualTo(77.1000);
        verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/ride/" + RIDE_ID), any(RideTrackingUpdate.class));
    }

    @Test
    @DisplayName("Should update ride status")
    void testUpdateRideStatus() {
        rideTrackingService.startTracking(RIDE_ID);

        rideTrackingService.updateRideStatus(RIDE_ID, "IN_PROGRESS");

        RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking(RIDE_ID);
        assertThat(tracking.getRideStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    @DisplayName("Should simulate ride progress")
    void testSimulateRideProgress() {
        rideTrackingService.startTracking(RIDE_ID);
        RideTrackingUpdate before = rideTrackingService.getCurrentRideTracking(RIDE_ID);
        int initialProgress = before.getProgressPercentage();

        rideTrackingService.simulateRideProgress(RIDE_ID);

        RideTrackingUpdate after = rideTrackingService.getCurrentRideTracking(RIDE_ID);
        assertThat(after.getProgressPercentage()).isGreaterThan(initialProgress);
    }

    @Test
    @DisplayName("Should not simulate progress beyond 100%")
    void testSimulateRideProgressMax() {
        rideTrackingService.startTracking(RIDE_ID);
        // Simulate many times to reach near 100
        for (int i = 0; i < 25; i++) {
            rideTrackingService.simulateRideProgress(RIDE_ID);
        }

        RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking(RIDE_ID);
        assertThat(tracking.getProgressPercentage()).isLessThanOrEqualTo(100);
    }

    @Test
    @DisplayName("Should get active rides")
    void testGetActiveRides() {
        rideTrackingService.startTracking(RIDE_ID);
        rideTrackingService.startTracking("RIDE-002");

        List<RideTrackingUpdate> activeRides = rideTrackingService.getActiveRides();

        assertThat(activeRides).hasSize(2);
    }

    @Test
    @DisplayName("Should get empty list when no active rides")
    void testGetActiveRidesEmpty() {
        List<RideTrackingUpdate> activeRides = rideTrackingService.getActiveRides();

        assertThat(activeRides).isEmpty();
    }

    @Test
    @DisplayName("Should broadcast tracking update")
    void testBroadcastTrackingUpdate() {
        rideTrackingService.startTracking(RIDE_ID);

        verify(messagingTemplate).convertAndSend(eq("/topic/ride/" + RIDE_ID), any(RideTrackingUpdate.class));
    }

    @Test
    @DisplayName("Should handle broadcast exception gracefully")
    void testBroadcastTrackingUpdateException() {
        doThrow(new RuntimeException("WebSocket error"))
                .when(messagingTemplate).convertAndSend(anyString(), any(RideTrackingUpdate.class));

        rideTrackingService.startTracking(RIDE_ID);

        // Should not throw; exception caught internally
        verify(messagingTemplate).convertAndSend(anyString(), any(RideTrackingUpdate.class));
    }

    @Test
    @DisplayName("Should cleanup old rides (no-op test)")
    void testCleanupOldRides() {
        rideTrackingService.startTracking(RIDE_ID);

        rideTrackingService.cleanupOldRides();

        assertThat(rideTrackingService.isRideBeingTracked(RIDE_ID)).isTrue();
    }

    @Test
    @DisplayName("Should get tracking statistics")
    void testGetTrackingStatistics() {
        rideTrackingService.startTracking(RIDE_ID);

        String stats = rideTrackingService.getTrackingStatistics();

        assertThat(stats).contains("Active Rides: 1");
    }

    @Test
    @DisplayName("Should create default tracking for unknown ride")
    void testUpdateRideLocationForUntrackedRide() {
        rideTrackingService.updateRideLocation("NEW-RIDE", 28.5000, 77.2000);

        RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking("NEW-RIDE");
        assertThat(tracking.getLatitude()).isEqualTo(28.5000);
        assertThat(tracking.getLongitude()).isEqualTo(77.2000);
    }

    @Test
    @DisplayName("Should update ride status for untracked ride")
    void testUpdateRideStatusForUntrackedRide() {
        rideTrackingService.updateRideStatus("NEW-RIDE", "WAITING");

        RideTrackingUpdate tracking = rideTrackingService.getCurrentRideTracking("NEW-RIDE");
        assertThat(tracking.getRideStatus()).isEqualTo("WAITING");
    }
}
