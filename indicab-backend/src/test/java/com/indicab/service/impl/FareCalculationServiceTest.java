package com.indicab.service.impl;

import com.indicab.dto.FareCalculationDTO;
import com.indicab.entity.Route;
import com.indicab.repository.RouteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FareCalculationService
 * Tests distance-based fares, popular routes, vehicle multipliers, and pricing calculations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("FareCalculationService Tests")
class FareCalculationServiceTest {

    @Mock
    private RouteRepository routeRepository;

    @InjectMocks
    private FareCalculationService fareCalculationService;

    private Route testRoute;

    @BeforeEach
    void setUp() {
        // Setup test route
        testRoute = new Route();
        testRoute.setId(1L);
        testRoute.setFromCity("Mumbai");
        testRoute.setToCity("Pune");
        testRoute.setFixedPrice(500.0);
        testRoute.setIsPopular(true);
    }

    // ==================== Distance-Based Calculation Tests ====================

    @Test
    @DisplayName("Should calculate fare for SEDAN vehicle using distance-based calculation")
    void testDistanceBasedFareCalculationSedan() {
        // Arrange
        String fromCity = "Mumbai";
        String toCity = "Bangalore";
        String vehicleType = "SEDAN";
        Double distance = 100.0;

        when(routeRepository.findByFromAndToCity(fromCity, toCity))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare(fromCity, toCity, vehicleType, distance);

        // Assert
        assertThat(fare).isNotNull();
        assertThat(fare.getFromCity()).isEqualTo(fromCity);
        assertThat(fare.getToCity()).isEqualTo(toCity);
        assertThat(fare.getVehicleType()).isEqualTo(vehicleType);
        assertThat(fare.getDistance()).isEqualTo(distance);
        assertThat(fare.getBaseFare()).isEqualTo(50.0);
        assertThat(fare.getDistanceCharge()).isEqualTo(1500.0); // 100 * 15 * 1.0
        assertThat(fare.getIsPopularRoute()).isFalse();
        assertThat(fare.getCalculationType()).isEqualTo("DISTANCE_BASED");
        assertThat(fare.getTotalFare()).isGreaterThan(fare.getBaseFare() + fare.getDistanceCharge());
        assertThat(fare.getServiceFee()).isGreaterThan(0);
        assertThat(fare.getTaxes()).isGreaterThan(0);
        verify(routeRepository).findByFromAndToCity(fromCity, toCity);
    }

    @Test
    @DisplayName("Should calculate fare for SUV vehicle with 1.5x multiplier")
    void testDistanceBasedFareSUV() {
        // Arrange
        String vehicleType = "SUV";
        Double distance = 50.0;

        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("City A", "City B", vehicleType, distance);

        // Assert
        assertThat(fare.getDistanceCharge()).isEqualTo(1125.0); // 50 * 15 * 1.5
        assertThat(fare.getVehicleMultiplier()).isEqualTo(1.5);
    }

    @Test
    @DisplayName("Should calculate fare for LUXURY vehicle with 2.0x multiplier")
    void testDistanceBasedFareLuxury() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("City A", "City B", "LUXURY", 75.0);

        // Assert
        assertThat(fare.getDistanceCharge()).isEqualTo(2250.0); // 75 * 15 * 2.0
        assertThat(fare.getVehicleMultiplier()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("Should calculate fare for ECONOMY vehicle with 0.8x multiplier")
    void testDistanceBasedFareEconomy() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("City A", "City B", "ECONOMY", 100.0);

        // Assert
        assertThat(fare.getDistanceCharge()).isEqualTo(1200.0); // 100 * 15 * 0.8
        assertThat(fare.getVehicleMultiplier()).isEqualTo(0.8);
    }

    @Test
    @DisplayName("Should calculate fare for XL vehicle with 2.5x multiplier")
    void testDistanceBasedFareXL() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("City A", "City B", "XL", 60.0);

        // Assert
        assertThat(fare.getDistanceCharge()).isEqualTo(2250.0); // 60 * 15 * 2.5
        assertThat(fare.getVehicleMultiplier()).isEqualTo(2.5);
    }

    // ==================== Popular Route Tests ====================

    @Test
    @DisplayName("Should use popular route fixed price when available")
    void testPopularRouteFareCalculation() {
        // Arrange
        String fromCity = "Mumbai";
        String toCity = "Pune";

        when(routeRepository.findByFromAndToCity(fromCity, toCity))
                .thenReturn(Optional.of(testRoute));

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare(fromCity, toCity, "SEDAN", 120.0);

        // Assert
        assertThat(fare.getIsPopularRoute()).isTrue();
        assertThat(fare.getCalculationType()).isEqualTo("POPULAR_ROUTE");
        assertThat(fare.getBaseFare()).isEqualTo(500.0); // Fixed price from route
        assertThat(fare.getDistanceCharge()).isEqualTo(0.0); // No distance charge for popular route
        assertThat(fare.getTotalFare()).isGreaterThan(500.0); // Total includes service fee and tax
        verify(routeRepository).findByFromAndToCity(fromCity, toCity);
    }

    @Test
    @DisplayName("Should apply vehicle multiplier even for popular routes")
    void testPopularRouteWithVehicleType() {
        // Arrange
        Route luxuryRoute = new Route();
        luxuryRoute.setId(2L);
        luxuryRoute.setFromCity("Delhi");
        luxuryRoute.setToCity("Agra");
        luxuryRoute.setFixedPrice(800.0);
        luxuryRoute.setIsPopular(true);

        when(routeRepository.findByFromAndToCity("Delhi", "Agra"))
                .thenReturn(Optional.of(luxuryRoute));

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("Delhi", "Agra", "LUXURY", 150.0);

        // Assert
        assertThat(fare.getIsPopularRoute()).isTrue();
        assertThat(fare.getBaseFare()).isEqualTo(800.0);
        assertThat(fare.getVehicleMultiplier()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("Should fall back to distance-based when popular route not found")
    void testFallbackToDiastanceBasedWhenRouteNotFound() {
        // Arrange
        when(routeRepository.findByFromAndToCity("Unknown", "Route"))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("Unknown", "Route", "SEDAN", 50.0);

        // Assert
        assertThat(fare.getIsPopularRoute()).isFalse();
        assertThat(fare.getCalculationType()).isEqualTo("DISTANCE_BASED");
        assertThat(fare.getDistanceCharge()).isEqualTo(750.0); // 50 * 15 * 1.0
    }

    // ==================== Tax & Service Fee Tests ====================

    @Test
    @DisplayName("Should calculate 10% service fee correctly")
    void testServiceFeeCalculation() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("A", "B", "SEDAN", 100.0);

        // Assert
        double subtotal = fare.getBaseFare() + fare.getDistanceCharge();
        double expectedServiceFee = subtotal * 0.10;
        assertThat(fare.getServiceFee()).isEqualTo(expectedServiceFee);
    }

    @Test
    @DisplayName("Should calculate 5% tax correctly")
    void testTaxCalculation() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("A", "B", "SEDAN", 100.0);

        // Assert
        double subtotal = fare.getBaseFare() + fare.getDistanceCharge();
        double expectedTax = subtotal * 0.05;
        assertThat(fare.getTaxes()).isEqualTo(expectedTax);
    }

    @Test
    @DisplayName("Should calculate total fare as base + distance + service fee + tax")
    void testTotalFareCalculation() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("A", "B", "SEDAN", 100.0);

        // Assert
        double subtotal = fare.getBaseFare() + fare.getDistanceCharge();
        double expectedTotal = subtotal + (subtotal * 0.10) + (subtotal * 0.05);
        assertThat(fare.getTotalFare()).isEqualTo(expectedTotal);
    }

    // ==================== Input Validation Tests ====================

    @Test
    @DisplayName("Should throw exception when distance is zero or negative")
    void testInvalidDistanceThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> 
            fareCalculationService.calculateFare("A", "B", "SEDAN", 0.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Distance must be greater than 0");

        assertThatThrownBy(() -> 
            fareCalculationService.calculateFare("A", "B", "SEDAN", -10.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Distance must be greater than 0");
    }

    @Test
    @DisplayName("Should throw exception when distance is null")
    void testNullDistanceThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> 
            fareCalculationService.calculateFare("A", "B", "SEDAN", null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Distance must be greater than 0");
    }

    @Test
    @DisplayName("Should throw exception when vehicle type is null")
    void testNullVehicleTypeThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> 
            fareCalculationService.calculateFare("A", "B", null, 100.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Vehicle type is required");
    }

    @Test
    @DisplayName("Should throw exception when vehicle type is empty")
    void testEmptyVehicleTypeThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> 
            fareCalculationService.calculateFare("A", "B", "", 100.0))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Vehicle type is required");
    }

    // ==================== Configuration Tests ====================

    @Test
    @DisplayName("Should return all available vehicle multipliers")
    void testGetVehicleMultipliers() {
        // Act
        Map<String, Double> multipliers = fareCalculationService.getVehicleMultipliers();

        // Assert
        assertThat(multipliers)
                .containsEntry("SEDAN", 1.0)
                .containsEntry("SUV", 1.5)
                .containsEntry("LUXURY", 2.0)
                .containsEntry("ECONOMY", 0.8)
                .containsEntry("PREMIUM", 1.8)
                .containsEntry("XL", 2.5);
    }

    @Test
    @DisplayName("Should return pricing configuration")
    void testGetPricingConfig() {
        // Act
        Map<String, Double> config = fareCalculationService.getPricingConfig();

        // Assert
        assertThat(config)
                .containsEntry("baseFare", 50.0)
                .containsEntry("pricePerKm", 15.0)
                .containsEntry("serviceFeePercentage", 0.10)
                .containsEntry("taxPercentage", 0.05);
    }

    // ==================== Edge Cases ====================

    @Test
    @DisplayName("Should handle very small distance (0.1 km)")
    void testVerySmallDistance() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("A", "B", "SEDAN", 0.1);

        // Assert
        assertThat(fare.getTotalFare()).isGreaterThan(0);
        assertThat(fare.getDistanceCharge()).isEqualTo(1.5); // 0.1 * 15 * 1.0
    }

    @Test
    @DisplayName("Should handle very large distance (1000 km)")
    void testVeryLargeDistance() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("A", "B", "SEDAN", 1000.0);

        // Assert
        assertThat(fare.getTotalFare()).isGreaterThan(0);
        assertThat(fare.getDistanceCharge()).isEqualTo(15000.0); // 1000 * 15 * 1.0
    }

    @Test
    @DisplayName("Should handle case-insensitive vehicle type")
    void testCaseInsensitiveVehicleType() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO sedanLower = fareCalculationService.calculateFare("A", "B", "sedan", 50.0);
        FareCalculationDTO sedanUpper = fareCalculationService.calculateFare("A", "B", "SEDAN", 50.0);
        FareCalculationDTO sedanMixed = fareCalculationService.calculateFare("A", "B", "SeDAn", 50.0);

        // Assert
        assertThat(sedanLower.getVehicleMultiplier()).isEqualTo(1.0);
        assertThat(sedanUpper.getVehicleMultiplier()).isEqualTo(1.0);
        assertThat(sedanMixed.getVehicleMultiplier()).isEqualTo(1.0);
    }

    @Test
    @DisplayName("Should return default multiplier for unknown vehicle type")
    void testUnknownVehicleTypeReturnsDefault() {
        // Arrange
        when(routeRepository.findByFromAndToCity(anyString(), anyString()))
                .thenReturn(Optional.empty());

        // Act
        FareCalculationDTO fare = fareCalculationService.calculateFare("A", "B", "UNKNOWN", 50.0);

        // Assert
        assertThat(fare.getVehicleMultiplier()).isEqualTo(1.0); // Default multiplier
    }
}
