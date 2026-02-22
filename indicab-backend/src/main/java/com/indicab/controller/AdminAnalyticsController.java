package com.indicab.controller;

import com.indicab.entity.Booking;
import com.indicab.entity.User;
import com.indicab.entity.Vehicle;
import com.indicab.repository.BookingRepository;
import com.indicab.repository.UserRepository;
import com.indicab.repository.VehicleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin controller for analytics and reporting
 * Provides endpoints for platform analytics, metrics, and reporting
 * All endpoints require ADMIN role authorization
 */
@RestController
@RequestMapping("/api/v1/admin/analytics")
@Tag(name = "Admin Analytics", description = "Analytics and reporting endpoints")
@SecurityRequirement(name = "Bearer Token")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AdminAnalyticsController.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    /**
     * Get daily booking statistics
     */
    @GetMapping("/daily-bookings")
    @Operation(summary = "Get daily bookings", description = "Get daily booking statistics for the specified period")
    @ApiResponse(responseCode = "200", description = "Daily booking data retrieved successfully")
    public ResponseEntity<?> getDailyBookings(
            @Parameter(description = "Number of days to retrieve (7, 30, or 365)")
            @RequestParam(defaultValue = "7") int days) {
        logger.debug("Fetching daily bookings for {} days", days);

        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<Booking> bookings = bookingRepository.findAll();

            // Filter bookings by date range
            Map<String, Long> dailyBookings = bookings.stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startDate))
                    .collect(Collectors.groupingBy(
                            b -> b.getCreatedAt().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            // Fill in missing dates with 0
            Map<String, Long> sortedData = new LinkedHashMap<>();
            LocalDate current = LocalDate.now().minusDays(days - 1);
            LocalDate end = LocalDate.now();
            while (!current.isAfter(end)) {
                String dateStr = current.toString();
                sortedData.put(dateStr, dailyBookings.getOrDefault(dateStr, 0L));
                current = current.plusDays(1);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("data", sortedData);
            response.put("total", sortedData.values().stream().mapToLong(Long::longValue).sum());
            response.put("period", days + " days");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching daily bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve daily bookings"));
        }
    }

    /**
     * Get revenue trend
     */
    @GetMapping("/revenue-trend")
    @Operation(summary = "Get revenue trend", description = "Get revenue trend for the specified period")
    @ApiResponse(responseCode = "200", description = "Revenue trend data retrieved successfully")
    public ResponseEntity<?> getRevenueTrend(
            @Parameter(description = "Number of days to retrieve (7, 30, or 365)")
            @RequestParam(defaultValue = "7") int days) {
        logger.debug("Fetching revenue trend for {} days", days);

        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<Booking> bookings = bookingRepository.findAll();

            // Filter bookings by date range and status
            Map<String, Double> revenueByDate = bookings.stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(startDate) && 
                               "completed".equalsIgnoreCase(b.getStatus()))
                    .collect(Collectors.groupingBy(
                            b -> b.getCreatedAt().toLocalDate().toString(),
                            Collectors.summingDouble(b -> b.getAmount() != null ? b.getAmount() : 0)
                    ));

            // Fill in missing dates with 0
            Map<String, Double> sortedData = new LinkedHashMap<>();
            LocalDate current = LocalDate.now().minusDays(days - 1);
            LocalDate end = LocalDate.now();
            while (!current.isAfter(end)) {
                String dateStr = current.toString();
                sortedData.put(dateStr, revenueByDate.getOrDefault(dateStr, 0.0));
                current = current.plusDays(1);
            }

            double totalRevenue = sortedData.values().stream().mapToDouble(Double::doubleValue).sum();
            double averageRevenue = totalRevenue / sortedData.size();

            Map<String, Object> response = new HashMap<>();
            response.put("data", sortedData);
            response.put("totalRevenue", totalRevenue);
            response.put("averageRevenue", averageRevenue);
            response.put("period", days + " days");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching revenue trend", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve revenue trend"));
        }
    }

    /**
     * Get driver performance metrics
     */
    @GetMapping("/driver-performance")
    @Operation(summary = "Get driver performance", description = "Get driver performance metrics")
    @ApiResponse(responseCode = "200", description = "Driver performance data retrieved successfully")
    public ResponseEntity<?> getDriverPerformance(
            @Parameter(description = "Number of top drivers to retrieve")
            @RequestParam(defaultValue = "10") int limit) {
        logger.debug("Fetching driver performance metrics");

        try {
            List<Booking> bookings = bookingRepository.findAll();

            // Get driver performance by user ID (drivers are users)
            Map<Long, Map<String, Object>> driverMetrics = new HashMap<>();
            
            for (Booking booking : bookings) {
                if (booking.getUser() != null) {
                    Long userId = booking.getUser().getId();
                    if (!driverMetrics.containsKey(userId)) {
                        driverMetrics.put(userId, new HashMap<>());
                        driverMetrics.get(userId).put("userId", userId);
                        driverMetrics.get(userId).put("userName", booking.getUser().getName());
                        driverMetrics.get(userId).put("trips", 0);
                        driverMetrics.get(userId).put("revenue", 0.0);
                        driverMetrics.get(userId).put("completedTrips", 0);
                    }
                    
                    Map<String, Object> metrics = driverMetrics.get(userId);
                    metrics.put("trips", (int) metrics.get("trips") + 1);
                    metrics.put("revenue", (double) metrics.get("revenue") + (booking.getAmount() != null ? booking.getAmount() : 0));
                    
                    if ("completed".equalsIgnoreCase(booking.getStatus())) {
                        metrics.put("completedTrips", (int) metrics.get("completedTrips") + 1);
                    }
                }
            }

            // Sort by revenue and limit results
            List<Map<String, Object>> topDrivers = driverMetrics.values().stream()
                    .sorted((a, b) -> Double.compare((double) b.get("revenue"), (double) a.get("revenue")))
                    .limit(limit)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("drivers", topDrivers);
            response.put("totalDrivers", driverMetrics.size());
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching driver performance", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve driver performance"));
        }
    }

    /**
     * Get vehicle distribution
     */
    @GetMapping("/vehicle-distribution")
    @Operation(summary = "Get vehicle distribution", description = "Get distribution of vehicles by type")
    @ApiResponse(responseCode = "200", description = "Vehicle distribution data retrieved successfully")
    public ResponseEntity<?> getVehicleDistribution() {
        logger.debug("Fetching vehicle distribution");

        try {
            List<Vehicle> vehicles = vehicleRepository.findAll();

            // Group vehicles by type
            Map<String, Long> distribution = vehicles.stream()
                    .collect(Collectors.groupingBy(
                            v -> v.getType() != null ? v.getType() : "Unknown",
                            Collectors.counting()
                    ));

            Map<String, Object> response = new HashMap<>();
            response.put("distribution", distribution);
            response.put("totalVehicles", vehicles.size());
            response.put("activeVehicles", vehicles.stream().filter(v -> v.getIsActive() != null && v.getIsActive()).count());
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching vehicle distribution", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve vehicle distribution"));
        }
    }

    /**
     * Get analytics summary statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get analytics summary", description = "Get summary statistics for the dashboard")
    @ApiResponse(responseCode = "200", description = "Summary statistics retrieved successfully")
    public ResponseEntity<?> getAnalyticsSummary() {
        logger.debug("Fetching analytics summary");

        try {
            List<Booking> bookings = bookingRepository.findAll();
            List<User> users = userRepository.findAll();
            List<Vehicle> vehicles = vehicleRepository.findAll();

            // Calculate metrics
            long totalBookings = bookings.size();
            long completedBookings = bookings.stream()
                    .filter(b -> "completed".equalsIgnoreCase(b.getStatus()))
                    .count();
            long pendingBookings = bookings.stream()
                    .filter(b -> "pending".equalsIgnoreCase(b.getStatus()))
                    .count();
            long ongoingBookings = bookings.stream()
                    .filter(b -> "ongoing".equalsIgnoreCase(b.getStatus()) || "in-progress".equalsIgnoreCase(b.getStatus()))
                    .count();

            double totalRevenue = bookings.stream()
                    .filter(b -> b.getAmount() != null && "completed".equalsIgnoreCase(b.getStatus()))
                    .mapToDouble(Booking::getAmount)
                    .sum();

            double averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            long totalUsers = users.size();
            long activeUsers = users.stream()
                    .filter(u -> "active".equalsIgnoreCase(u.getRole()))
                    .count();

            long totalVehicles = vehicles.size();
            long activeVehicles = vehicles.stream()
                    .filter(v -> v.getIsActive() != null && v.getIsActive())
                    .count();

            // Calculate growth (simplified - comparing last 7 days with previous 7 days)
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime last7Days = now.minusDays(7);
            LocalDateTime previous7Days = now.minusDays(14);

            long bookingsLast7Days = bookings.stream()
                    .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(last7Days))
                    .count();
            long bookingsPrevious7Days = bookings.stream()
                    .filter(b -> b.getCreatedAt() != null && 
                               b.getCreatedAt().isAfter(previous7Days) && 
                               b.getCreatedAt().isBefore(last7Days))
                    .count();

            double bookingGrowth = bookingsPrevious7Days > 0 ? 
                    ((bookingsLast7Days - bookingsPrevious7Days) / (double) bookingsPrevious7Days * 100) : 0;

            Map<String, Object> response = new HashMap<>();
            response.put("totalBookings", totalBookings);
            response.put("completedBookings", completedBookings);
            response.put("pendingBookings", pendingBookings);
            response.put("ongoingBookings", ongoingBookings);
            response.put("totalRevenue", String.format("₹%.2f", totalRevenue));
            response.put("averageRevenue", String.format("₹%.2f", averageRevenue));
            response.put("totalUsers", totalUsers);
            response.put("activeUsers", activeUsers);
            response.put("totalVehicles", totalVehicles);
            response.put("activeVehicles", activeVehicles);
            response.put("bookingGrowth", String.format("%.2f%%", bookingGrowth));
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching analytics summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve analytics summary"));
        }
    }

    /**
     * Get booking status distribution
     */
    @GetMapping("/booking-status-distribution")
    @Operation(summary = "Get booking status distribution", description = "Get distribution of bookings by status")
    @ApiResponse(responseCode = "200", description = "Booking status distribution retrieved successfully")
    public ResponseEntity<?> getBookingStatusDistribution() {
        logger.debug("Fetching booking status distribution");

        try {
            List<Booking> bookings = bookingRepository.findAll();

            // Group bookings by status
            Map<String, Long> distribution = bookings.stream()
                    .collect(Collectors.groupingBy(
                            b -> b.getStatus() != null ? b.getStatus() : "Unknown",
                            Collectors.counting()
                    ));

            Map<String, Object> response = new HashMap<>();
            response.put("distribution", distribution);
            response.put("totalBookings", bookings.size());
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching booking status distribution", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve booking status distribution"));
        }
    }

    /**
     * Get user growth statistics
     */
    @GetMapping("/user-growth")
    @Operation(summary = "Get user growth", description = "Get user growth statistics for the specified period")
    @ApiResponse(responseCode = "200", description = "User growth data retrieved successfully")
    public ResponseEntity<?> getUserGrowth(
            @Parameter(description = "Number of days to retrieve (7, 30, or 365)")
            @RequestParam(defaultValue = "7") int days) {
        logger.debug("Fetching user growth for {} days", days);

        try {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<User> users = userRepository.findAll();

            // Filter users by creation date
            Map<String, Long> usersByDate = users.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startDate))
                    .collect(Collectors.groupingBy(
                            u -> u.getCreatedAt().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            // Calculate cumulative growth
            Map<String, Long> cumulativeGrowth = new LinkedHashMap<>();
            long cumulative = users.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isBefore(startDate))
                    .count();

            LocalDate current = LocalDate.now().minusDays(days - 1);
            LocalDate end = LocalDate.now();
            while (!current.isAfter(end)) {
                String dateStr = current.toString();
                cumulative += usersByDate.getOrDefault(dateStr, 0L);
                cumulativeGrowth.put(dateStr, cumulative);
                current = current.plusDays(1);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("data", cumulativeGrowth);
            response.put("totalUsers", users.size());
            response.put("period", days + " days");
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching user growth", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve user growth"));
        }
    }
}
